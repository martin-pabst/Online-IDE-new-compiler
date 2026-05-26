import { Memory } from "./Memory";

export abstract class CPU {

    abstract name: string;
    abstract description: string;

    abstract flagNames: string[];
    abstract flagNamesShort: string[];
    abstract getFlags(): { [flagName: string]: boolean };

    abstract registerNames: string[];
    abstract registerNamesShort: string[];
    abstract getRegisters(): { [registerName: string]: number };

    abstract getProgramCounter(): number;

    abstract getMemory(): Memory;

    abstract reset(): void;

}