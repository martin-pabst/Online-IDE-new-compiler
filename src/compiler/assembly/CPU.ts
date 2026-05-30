import { Error } from "../common/Error";
import { IMain } from "../common/IMain";
import { Thread } from "../common/interpreter/Thread";
import { ThreadState } from "../common/interpreter/ThreadState";
import { CompilerFile } from "../common/module/CompilerFile";
import { IRange } from "../common/range/Range";
import { AssemblyParserResult } from "./AssemblyParser";
import { AssemblyTokenType } from "./AssemblyTokens";
import { Memory } from "./Memory";

export type AssemblyArgumentType = "Address" | "Immediate" | "Register";

export type AssemblyInstruction = {
    type: AssemblyTokenType;
    argumentTypes: AssemblyArgumentType[];
    jumpType?: "branch" | "jump";
    compiled: string;
}

export type AssemblyBreakpoint = {
    programCounter: number;
    isOneTime: boolean;
}

export var _cpu: string = "__t.cpu.";

export abstract class CPU {

    abstract name: string;
    abstract description: string;

    abstract flagNames: string[];
    abstract flagNamesShort: string[];
    abstract getFlags(): { [flagName: string]: boolean };

    abstract registerNames: string[];
    abstract registerNamesShort: string[];

    breakpointAddresses: Map<number, AssemblyBreakpoint> = new Map();

    abstract getRegisterValues(): { [registerName: string]: number };

    abstract getProgramCounter(): number;
    abstract getStatementLengthAtProgramCounter(): number;
    abstract getAddressOperandLocationOfCurrentStatement(): { location: number | undefined; indirectLocation: number | undefined; };
    
    getProgramLocation(): { from: number, to: number } {
        return {
            from: this.assemblyParserResult.startAddress,
            to: this.assemblyParserResult.startAddress + this.assemblyParserResult.compiledInMemory.length - 1
        }
    };

    abstract getMemory(): Memory;

    abstract reset(): void;

    // returns true on program end
    abstract executeNextStep(thread: Thread): boolean;

    constructor(protected assemblyParserResult: AssemblyParserResult, protected main: IMain) {
    }

    getErrors(): Error[] {
        return this.assemblyParserResult ? this.assemblyParserResult.errors : [];
    }

    hasMainProgram(): boolean {
        return typeof this.assemblyParserResult.startAddress === "number";
    }

    getCurrentPosition(): {programOrmoduleOrFile: CompilerFile, range: IRange} | undefined {
        let pc = this.getProgramCounter();
        let sourceMapEntry = this.assemblyParserResult.sourceMap.get(pc);
        if(!sourceMapEntry) return undefined;
        return {
            programOrmoduleOrFile: this.assemblyParserResult.file,
            range: {
                startLineNumber: sourceMapEntry.lineNumber,
                startColumn: sourceMapEntry.column,
                endLineNumber: sourceMapEntry.lineNumber,
                endColumn: sourceMapEntry.column + 1
            }
        }
    }

    setBreakpoint(address: number, isOneTime: boolean) {
        this.breakpointAddresses.set(address, { isOneTime: isOneTime, programCounter: address });
    }

    removeBreakpoint(address: number) {
        this.breakpointAddresses.delete(address);
    }

    setBreakpointAtFirstProgramStatement(isOneTime: boolean) {
        let firstAddress = this.assemblyParserResult.startAddress;
        if(typeof firstAddress === "number") {
            this.setBreakpoint(firstAddress, isOneTime);
        }
    }

    setBreakpointAtLine(lineNumber: number, isOneTime: boolean) {
        this.assemblyParserResult.sourceMap.forEach((value, address) => {
            if(value.lineNumber === lineNumber) {
                this.setBreakpoint(address, isOneTime);
                return;
            }
        });
    }

    clearBreakpointAtLine(lineNumber: number) {
        this.assemblyParserResult.sourceMap.forEach((value, address) => {
            if(value.lineNumber === lineNumber) {
                this.removeBreakpoint(address);
            }
        });
    }

    breakpointReachedShouldIExecute(breakpoint: AssemblyBreakpoint, thread: Thread): boolean {
        if(thread.haltAtNextBreakpoint) {
            thread.state = ThreadState.stoppedAtBreakpoint;
            if(breakpoint.isOneTime) {
                this.removeBreakpoint(breakpoint.programCounter);
            } else {
                thread.haltAtNextBreakpoint = false;
            }
            return false;
        } else {
            thread.haltAtNextBreakpoint = true;
            return true;
        }
    }

}