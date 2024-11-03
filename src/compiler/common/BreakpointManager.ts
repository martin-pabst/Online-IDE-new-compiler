import { IMain } from "./IMain";
import { Interpreter } from "./interpreter/Interpreter";
import { Step } from "./interpreter/Program";
import { Module } from "./module/Module";
import * as monaco from 'monaco-editor'

type Breakpoint = {
    lineNumber: number,
    step?: Step
}

class BreakpointInfoForModule {
    breakpoints: Breakpoint[] = [];
    breakpointDecorators: string[] = [];
    decoratorIdToBreakpointMap: { [id: string]: Breakpoint } = {};

    constructor(public module: Module) {

    }
}

export class BreakpointManager {

    #moduleToBreakpointInfoForModuleMap: Map<Module, BreakpointInfoForModule> = new Map();

    constructor(public main: IMain) {
        let editor = main.getMainEditor();
        editor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
            if (e.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN &&
                e.target.type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
                return;
            }
            this.toggleBreakpoint(e.target.position.lineNumber);
            return;
        });

        editor.onDidChangeModel(() => {
            this.#renderBreakpointDecorators();
        })

    }

    attachToInterpreter(interpreter: Interpreter){

        interpreter.eventManager.on("resetRuntime", () => {
            this.writeAllBreakpointsIntoPrograms();
        })

    }

    toggleBreakpoint(lineNumber: number) {
        const breakpointInfoForModule = this.#getBreakpointInfoForModule();
        if (!breakpointInfoForModule) return;

        this.#toggleBreakpoint(lineNumber, breakpointInfoForModule);
        this.#renderBreakpointDecorators();
    }


    #renderBreakpointDecorators() {

        let breakpointInfoForModule = this.#getBreakpointInfoForModule();
        if (!breakpointInfoForModule) return;

        this.#getBreakpointPositionsFromEditor(breakpointInfoForModule);

        let decorations: monaco.editor.IModelDeltaDecoration[] = [];

        for (let breakpoint of breakpointInfoForModule.breakpoints) {
            let isActive = breakpoint.step ? true : false;
            decorations.push({
                range: { startLineNumber: breakpoint.lineNumber, endLineNumber: breakpoint.lineNumber, startColumn: 1, endColumn: 1 },
                options: {
                    isWholeLine: true, className: isActive ? "jo_decorate_breakpoint" : "jo_decorate_breakpoint_inactive",
                    overviewRuler: {
                        color: "#580000",
                        position: monaco.editor.OverviewRulerLane.Left
                    },
                    minimap: {
                        color: "#580000",
                        position: monaco.editor.MinimapPosition.Inline
                    },
                    marginClassName: isActive ? "jo_margin_breakpoint" : "jo_margin_breakpoint_inactive",
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                },
                //@ts-ignore
                breakpoint: breakpoint
            });
        }

        breakpointInfoForModule.breakpointDecorators = breakpointInfoForModule.module.file.getMonacoModel()!
            .deltaDecorations(breakpointInfoForModule.breakpointDecorators, decorations);

        breakpointInfoForModule.decoratorIdToBreakpointMap = {};
        for (let i = 0; i < breakpointInfoForModule.breakpointDecorators.length; i++) {
            breakpointInfoForModule.decoratorIdToBreakpointMap[breakpointInfoForModule.breakpointDecorators[i]] = breakpointInfoForModule.breakpoints[i];
        }


    }

    #getBreakpointPositionsFromEditor(breakpointInfoForModule: BreakpointInfoForModule) {
        let monacoEditorModel = breakpointInfoForModule.module.file.getMonacoModel();
        if (!monacoEditorModel) return;
        for (let decoration of monacoEditorModel.getAllDecorations()) {
            let marginClassName = decoration.options.marginClassName;

            if (marginClassName && ["jo_margin_breakpoint", "jo_margin_breakpoint_inactive"].indexOf(marginClassName) >= 0) {
                let breakpoint = breakpointInfoForModule.decoratorIdToBreakpointMap[decoration.id];
                if (breakpoint != null) {
                    breakpoint.lineNumber = decoration.range.startLineNumber;
                }
            }
        }
    }

    #toggleBreakpoint(lineNumber: number, breakpointInfoForModule: BreakpointInfoForModule) {

        this.#getBreakpointPositionsFromEditor(breakpointInfoForModule);
        if (!this.#getAndRemoveBreakpoint(lineNumber, breakpointInfoForModule)) {
            this.#setBreakpoint(lineNumber, breakpointInfoForModule);
        }
    }

    #setBreakpoint(line: number, breakpointInfoForModule: BreakpointInfoForModule): Breakpoint {

        let breakpoint: Breakpoint = {
            lineNumber: line,
            step: breakpointInfoForModule.module.findStep(line)
        }

        breakpointInfoForModule.breakpoints.push(breakpoint);

        breakpoint.step?.setBreakpoint();

        return breakpoint;

    }


    #getAndRemoveBreakpoint(lineNumber: number, breakpointInfoForModule: BreakpointInfoForModule): Breakpoint | undefined {

        for (let i = 0; i < breakpointInfoForModule.breakpoints.length; i++) {
            let b = breakpointInfoForModule.breakpoints[i];
            if (b.lineNumber == lineNumber) {
                breakpointInfoForModule.breakpoints.splice(i, 1);
                b.step?.clearBreakpoint();
                return b;
            }
        }

        return;

    }

    #getBreakpointInfoForModule(module?: Module): BreakpointInfoForModule | undefined {
        module = module || this.main.getCurrentWorkspace()?.getCurrentlyEditedModule();
        if (!module) return undefined;

        let breakpointInfoForModule = this.#moduleToBreakpointInfoForModuleMap.get(module);
        if (!breakpointInfoForModule) {
            breakpointInfoForModule = new BreakpointInfoForModule(module);
            this.#moduleToBreakpointInfoForModuleMap.set(module, breakpointInfoForModule);
        }

        return breakpointInfoForModule;
    }

    writeAllBreakpointsIntoPrograms() {
        let executable = this.main.getInterpreter().executable;
        if (!executable) return;

        for (let module of executable.moduleManager.modules) {
            if (!module) continue;
            let breakpointInfoForModule = this.#getBreakpointInfoForModule(module);
            if (!breakpointInfoForModule) continue;
            for (let program of module.programsToCompileToFunctions) {
                for (let step of program.stepsSingle) {
                    step.clearBreakpoint();
                }
            }

            this.#getBreakpointPositionsFromEditor(breakpointInfoForModule);

            for (let breakpoint of breakpointInfoForModule.breakpoints) {
                let step = module.findStep(breakpoint.lineNumber);
                if(step){
                    breakpoint.lineNumber = step.range.startLineNumber!;
                    breakpoint.step = step;
                    step.setBreakpoint();
                }
            }
        }
    }


}