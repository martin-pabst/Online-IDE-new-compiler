import { Error } from "../common/Error";
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

    constructor(protected assemblyParserResult: AssemblyParserResult) {
    }

    getErrors(): Error[] {
        return this.assemblyParserResult ? this.assemblyParserResult.errors : [];
    }

    hasMainProgram(): boolean {
        return typeof this.assemblyParserResult.startAddress === "number";
    }

}