import { AbiBayernMemory } from "./AbiBayernMemory";
import { CPU } from "./CPU";
import { AbiBayernLanguage } from "./language/AbiBayernLanguage";
import { Memory } from "./Memory";

export class AbiBayernCPU extends CPU {

    name = AbiBayernLanguage.AbiBayernCPUName();
    description = AbiBayernLanguage.AbiBayernCPUDescription();

    accumulator: number = 0;
    programCounter: number = 0;

    flagNames = ['zero', 'negative', 'overflow'];
    flagNamesShort = ['Z', 'N', 'V'];

    registerNames = ['Accumulator', 'Program Counter'];
    registerNamesShort = ['A', 'PC'];

    flags: {
        zero: boolean;
        negative: boolean;
        overflow: boolean;
    }

    memory: AbiBayernMemory;

    constructor() {
        super();
        this.memory = new AbiBayernMemory(0x10000); // 64 * 2 KB of memory
    }

    getMemory(): Memory {
        return this.memory;
    }

    getFlags(): { [flagName: string]: boolean; } {
        return this.flags;
    }

    getRegisters(): { [registerName: string]: number; } {
        return {
            'Accumulator': this.accumulator,
            'Program Counter': this.programCounter
        };
    }

    getProgramCounter(): number {
        return this.programCounter;
    }

    reset(): void {
        this.accumulator = 0;
        this.programCounter = 0;
        this.flags = {
            'zero': false,
            'negative': false,
            'overflow': false
        };
    }


    load(address: number): void {
        this.accumulator = this.memory.read(address);
        this.programCounter += 2;
    }

    addi(value: number): void {
        this.accumulator += value;
        this.programCounter += 2;
    }

    store(address: number): void {
        this.memory.write(address, this.accumulator);
        this.programCounter += 2;
    }

    cmpi(value: number): void {
        this.flags['zero'] = (this.accumulator === value);
        this.flags['negative'] = (this.accumulator < value);
        this.programCounter += 2;
    }

    jlt(indexIfTrue: number, indexIfFalse: number): void {
        if (this.flags['negative']) {
            this.programCounter = indexIfTrue;
        } else {
            this.programCounter = indexIfFalse;
        }
    }

}