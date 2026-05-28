import { Error } from "../common/Error";
import { IMain } from "../common/IMain";
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

export var _cpu: string = "__t.cpu.";

export abstract class CPU {

    abstract name: string;
    abstract description: string;

    abstract flagNames: string[];
    abstract flagNamesShort: string[];
    abstract getFlags(): { [flagName: string]: boolean };

    abstract registerNames: string[];
    abstract registerNamesShort: string[];
    abstract getRegisterValues(): { [registerName: string]: number };

    abstract getProgramCounter(): number;

    abstract getMemory(): Memory;

    abstract reset(): void;

    // returns true on program end
    abstract executeNextStep(): boolean;

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
        let sourceMapEntry = this.assemblyParserResult.sourceMap[pc];
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

}