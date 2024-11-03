import { Editor } from "../../../client/main/gui/Editor";
import { Executable } from "../Executable";
import { Interpreter } from "./Interpreter";
import type * as monaco from 'monaco-editor'
import { SchedulerState } from "./SchedulerState";
import { Program } from "./Program";


// for every currently running method: the amount of editor lines the instruction pointer must be moved
let lineAdj: Record<string, {
    // addLines: number,
    changesBefore: boolean,
    changesAfter: boolean
}> = {}


export function hotCodeRecordEdits(ed: Editor, ev: monaco.editor.IModelContentChangedEvent) {
    const i = ed.main.getInterpreter()

    if (i.scheduler.state !== SchedulerState.paused) {
        lineAdj = {}
        return
    }

    const module = ed.main.getCurrentWorkspace()?.getCurrentlyEditedModule()
    ;
    [
        ...i.scheduler.runningThreads,
        ...i.scheduler.suspendedThreads,
        ...i.scheduler.storedThreads ?? []
    ]
    .flatMap(t => t.programStack)
    .filter(ps => ps.program.module === module)
    .forEach(ps => {
        // TODO getter dafür
        const currStepR = ps.currentStepList[ps.stepIndex].range

        const la = lineAdj[ps.program.methodIdentifierWithClass] ??= {
            // addLines: 0,
            changesBefore: false,
            changesAfter: false
        }

        ev.changes.forEach(c => {
            // With "instruction pointer" I mean the point BEFORE the next statement, i. e. currStepR.start{Line, Column}.

            // change is before instruction pointer: take care:
            if (c.range.endLineNumber < currStepR.startLineNumber
                || c.range.endLineNumber === currStepR.startLineNumber && c.range.endColumn <= currStepR.startColumn
            ) {
                la.changesBefore = true

                // const adj = (c.text.match(/\n/g) ?? []).length // count LFs in newly inserted text
                //     - (c.range.endLineNumber - c.range.startLineNumber)

                // if (adj !== 0) {
                //     lineAdj[ps.program.methodIdentifierWithClass].addLines += adj
                // }
                return
            }

            // change is after instruction pointer: ignore.
            if (c.range.startLineNumber > currStepR.startLineNumber
                || c.range.startLineNumber === currStepR.startLineNumber && c.range.startColumn >= currStepR.startColumn
            ) {
                la.changesAfter = true
                return
            }

            const res = prompt('HotCodeReplacement: Programm wird zurückgesetzt. Fortfahren (j/n)?', 'j')
            switch (res) {
                case 'j':
                    i.setState(SchedulerState.stopped)
                    break;
                case 'n':
                    ed.editor.trigger('ev_src_hcr', 'undo', undefined)
                    break;
                default:
                    throw new Error()
            }
        })
    })
}

function _throw(msg: string): never {
    throw new Error(msg)
}

export function hotCodeReplaceLookupProgram(e: Executable, methodIdentifierWithClass): Program {
    return e.moduleManager.modules
        .flatMap(m => m.programsToCompileToFunctions)
        .find(p => p.methodIdentifierWithClass === methodIdentifierWithClass)
        ?? _throw('Program not found.')
}

export function hotCodeCompileAndReplace(i: Interpreter, e: Executable) {
    e.compileToJavascript()
    if (!e.isCompiledToJavascript) {
        return
    }

    // TODO create a method scheduler.getAllThreads ?
    [
        ...i.scheduler.runningThreads,
        ...i.scheduler.suspendedThreads,
        ...i.scheduler.storedThreads ?? []
    ].forEach(t => {
        let newStackBase = 0

        t.programStack.forEach(ps => {

            /**
             * Save data about old compilation
             */
            // const step = ps.currentStepList[ps.stepIndex]
            // const oldLineNo = step.range.startLineNumber
            //
            // const indexInOldStepsWithSameLineNo = ps.currentStepList
            //     .filter(s => s.range.startLineNumber === oldLineNo)
            //     .findIndex(s => s === step)


            /*
             * Replace code in running thread
             */
            const methodIdentifierWithClass = ps.program.methodIdentifierWithClass // TODO Program should have class and method reference

            const newProgram = hotCodeReplaceLookupProgram(e, methodIdentifierWithClass)

            if (!newProgram) {
                throw new Error(`HotCodeReplacement: Method ${methodIdentifierWithClass} not found any more.`)
            }

            const oldProgram = ps.program
            // const oldStepCode = ps.currentStepList[ps.stepIndex].codeAsString
            ps.program = newProgram
            ps.currentStepList = ps.program.stepsSingle


            /*
             * Adjust stackframe using symbol table
             */
            if (oldProgram.numberOfParameters !== newProgram.numberOfParameters) {
                throw new Error('Unsupported: Number of params changed.')
            }
            if (oldProgram.numberOfThisObjects !== newProgram.numberOfThisObjects) {
                throw new Error('Unsupported: Number of this objects changed.')
            }

            const [oldSymbols, newSymbols] = [oldProgram, newProgram].map(p =>
                Object.fromEntries(Object.entries(p.symbolTable.stackframe.positionToSymbolMap)
                    .map(([pos, s]) => [s.identifier, pos]))
            )

            ps.stackBase = newStackBase

            const newLocalVarsStackFrame = Array(newProgram.numberOfLocalVariables)
            Object.entries(newProgram.symbolTable.stackframe.positionToSymbolMap)
                .filter(([pos, _s]) => parseInt(pos) >= newProgram.numberOfThisObjects + newProgram.numberOfParameters)
                .forEach(([pos, s]) => {
                    newLocalVarsStackFrame[parseInt(pos) - newProgram.numberOfParameters - newProgram.numberOfThisObjects]
                        = t.s[ps.stackBase + parseInt(oldSymbols[s.identifier])] // really? Ohne numberOfThisObjects hier?
                })

            t.s.splice(ps.stackBase + newProgram.numberOfThisObjects + newProgram.numberOfParameters, oldProgram.numberOfLocalVariables, ...newLocalVarsStackFrame)

            // ^^^ TODO das -1 - hängt das mit calling convention zusammen?

            // calculate stackBase for the next stackframe:
            newStackBase = ps.stackBase + newProgram.numberOfThisObjects + newProgram.numberOfParameters + newProgram.numberOfLocalVariables


            /*
             * Adjust stepIndex.
             */
            const la = lineAdj[ps.program.methodIdentifierWithClass]
            if (la) {
                delete lineAdj[ps.program.methodIdentifierWithClass]

                if (la.changesAfter && la.changesBefore) {
                    throw new Error('Unsupported: Modifications both before and after the current instruction pointer.')
                }

                if (la.changesBefore && !la.changesAfter) {
                    // DER Trick: Es gibt zwar vielleicht neue Steps VOR stepIndex, aber nicht danach.
                    // Der Abstand program.length - stepIndex soll also konstant bleiben:
                    ps.stepIndex += newProgram.stepsSingle.length - oldProgram.stepsSingle.length
                }
            }

            // if (lineAdj[ps.program.methodIdentifierWithClass].addLines) {
            //     const newLineNo = oldLineNo + lineAdj[ps.program.methodIdentifierWithClass].addLines

            //     const newStepIndex = ps.currentStepList
            //         .findIndex(s => s.range.startLineNumber === newLineNo)
            //         + indexInOldStepsWithSameLineNo

            //     if (newStepIndex === -1 || ps.currentStepList[newStepIndex].range.startLineNumber !== newLineNo) {
            //         throw new Error('Invariant failed.')
            //     }

            //     ps.stepIndex = newStepIndex
            //     delete lineAdj[ps.program.methodIdentifierWithClass]
            // }

            // while (true) {
            //     const newStepCode = ps.currentStepList[ps.stepIndex].codeAsString
            //     const [osc, nsc] = [oldStepCode, newStepCode].map(c => c.match(/^(.*)\nreturn [0-9]+;$/)[1])

            //     if (osc === nsc) {
            //         break
            //     }

            //     ps.stepIndex++

            //     if (ps.stepIndex >= ps.currentStepList.length) {
            //         throw new Error('not found')
            //     }
            // }
            // if (nsc !== osc) {
            //     throw new Error('Did not expect a change of the next statement, i. e. the yellow line.')
            // }
        })

        t.classes = e.classObjectRegistry
    })

    i.breakpointManager.writeAllBreakpointsIntoPrograms()

    i.scheduler.classObjectRegistry = e.classObjectRegistry
}


// Bug?: Program can run empty on compile error
// Problem: green vs yellow line

// Kompilieren on Errors !?

// Name mangling for methodIdentifierWithClass ...

// TODO worker threads increase


/*

class Person2 {
   public String fname;
   public String vname;

   Person2(String f, String v) {
      fname = f;
      vname = v;
   }

   public String toString() {
      return fname + ", " + vname;
   }
}

void f(int  ii) {
   int  d = 58;
   int  e = 59;
   print ln("seppX:" + ii + " " + d);
   print ln(new Person2("H", "S"));
}

int  a = 42;
int  b = 43;
for (int  i = 2; i < 5; i++) {
   print ln("i : " + i);
   f(i);
}

*/