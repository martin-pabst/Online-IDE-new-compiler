import { AssemblyKeywordList as AssemblyKeywordMap, AssemblyTokenType } from "./AssemblyTokens";
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

    keywordMap: { [keyword: string]: AssemblyTokenType } = {};

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

    constructor() {
    }

    initializeKeywordMap(keywords: string[]): void {
        for (let keyword of keywords) {
            this.keywordMap[keyword] = AssemblyKeywordMap[keyword];
        }
    }
}