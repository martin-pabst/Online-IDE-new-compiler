import { BaseSymbolTable } from "../common/BaseSymbolTable";
import { CodeFragment } from "../common/disassembler/CodeFragment";
import { Program } from "../common/interpreter/Program";
import { Step } from "../common/interpreter/Step";
import { Helpers, StepParams } from "../common/interpreter/StepFunction";
import { Thread } from "../common/interpreter/Thread";
import { CompilerFile } from "../common/module/CompilerFile";
import { Module } from "../common/module/Module";
import { CPU } from "./CPU";

export class AssemblyModule extends Module {

    private _cpu: CPU;

    constructor(file: CompilerFile) {
        super(file, false);
    }

    get cpu(): CPU {
        return this._cpu;
    }

    set cpu(cpu: CPU) {
        this._cpu = cpu;
        this.errors = cpu.getErrors();
    }

    hasMainProgram(): boolean {
        if (!this.cpu) return false;
        return this._cpu.hasMainProgram();
    }

    startMainProgram(thread: Thread, setOneTimeBreakpointAtFirstVisibleLine: boolean): boolean {
        let codeAsString =
            `if(${Helpers.cpu}.executeNextStep()) {
    ${Helpers.return}(0);
}
return 0; // infinite loop`;

        let program = new Program(this, undefined, "Main.main");
        program.addStep(codeAsString);
        program.compileToJavascriptFunctions();

        thread.__cpu = this._cpu;
        this._cpu.reset();

        thread.pushProgram(program);

        if (setOneTimeBreakpointAtFirstVisibleLine) {
            let programState = thread.programStack[thread.programStack.length - 1];
            if (programState) {
                let firstVisibleStep = programState.currentStepList.find(s => s.range.startLineNumber >= 0);
                if (firstVisibleStep) {
                    firstVisibleStep.setBreakpoint(true);
                }
            }
        }

        return true;
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }

}