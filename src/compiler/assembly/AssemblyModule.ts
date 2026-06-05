import { BaseSymbolTable } from "../common/BaseSymbolTable";
import { CodeFragment } from "../common/disassembler/CodeFragment";
import { Program } from "../common/interpreter/Program";
import { Step } from "../common/interpreter/Step";
import { Helpers, StepParams } from "../common/interpreter/StepFunction";
import { Thread } from "../common/interpreter/Thread";
import { CompilerFile } from "../common/module/CompilerFile";
import { Module } from "../common/module/Module";
import { CPU } from "./CPU";

export class AssemblyStep extends Step {
    constructor(index: number, module: Module, public codeAsString: string) {
        super(index, module);
    }
    setBreakpoint(lineNumber: number, clearBreakpointAfterReached: boolean = false) {
        let m = <AssemblyModule>this.module;
        m.cpu.setBreakpointAtLine(lineNumber, clearBreakpointAfterReached);
    }
    clearBreakpoint(lineNumber: number) {
        let m = <AssemblyModule>this.module;
        m.cpu.clearBreakpointAtLine(lineNumber);
    }
    carriesFakeLineNumbers(): boolean {
        return true; 
    }
}


export class AssemblyModule extends Module {

    private _cpu: CPU;
    private steps: AssemblyStep[] = [];

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
        let codeAsString1 =
            `if(${Helpers.cpu}.executeNextStep(${StepParams.thread})) {
    ${Helpers.return}(0);
}
return 1; // infinite loop`;
        let codeAsString2 =
            `if(${Helpers.cpu}.executeNextStep(${StepParams.thread})) {
    ${Helpers.return}(0);
}
return 0; // infinite loop`;

        let program = new Program(this, undefined, "Main.main");
        this.steps = [
                new AssemblyStep(0, this, codeAsString1),
                new AssemblyStep(1, this, codeAsString2)
        ];
        program.addStep(this.steps[0]);
        program.addStep(this.steps[1]);

        this.steps[0].range = {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        };
        this.steps[1].range = {
            startLineNumber: 2,
            startColumn: 2,
            endLineNumber: 2,
            endColumn: 2
        };
        program.compileToJavascriptFunctions();

        thread.__cpu = this._cpu;
        this._cpu.reset();

        thread.pushProgram(program);

        if (setOneTimeBreakpointAtFirstVisibleLine) {
            this._cpu.setBreakpointAtFirstProgramStatement(true);
        }


        return true;
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }

    clearAllBreakpoints(): void {
        this._cpu.breakpointAddresses.clear();
    }

    findStep(lineNumber: number): Step | undefined {
        if(this.steps[0]) return this.steps[0];
        return undefined;
    }
}