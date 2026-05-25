import { Memory } from "./Memory";

export class CPU {
    accumulator: number = 0;
    programCounter: number = 0;
    flags: { [key: string]: boolean } = {};

    memory: Memory;

    constructor(memory: Memory) {
        this.memory = memory;
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