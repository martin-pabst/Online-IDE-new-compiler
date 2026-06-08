import type { AbiBayernMemory } from "./AbiBayernMemory";




export abstract class AbiBayernArchitecture {

    constructor(public name: string, public bitsPerCell: number, public signed: boolean, public valueRangeMin: number, public valueRangeMax: number) {
    }

    abstract sanitizeValue(value: number): number;
    abstract loadAddressOperand(pc: number, memory: number[]): number;

    /**
     * returns the number of memory cells used by the address operand (e.g. 1 for 16-bit architectures, 2 for 8-bit architectures)
     */
    abstract storeAddressOperand(pc: number, memory: number[], value: number): number;

    valueIsInsideRange(value: number): boolean {
        return value >= this.valueRangeMin && value <= this.valueRangeMax;
    }

    static getArchitectureByName(name: string): AbiBayernArchitecture {
        return this.getArchitectures().find(arch => arch.name === name) ?? this.getArchitectures()[0];
    }

    static getArchitectures(): AbiBayernArchitecture[] {
        return [
            new AbiBayernArchitecture16BitSigned(),
            new AbiBayernArchitecture16BitUnsigned(),
            new AbiBayernArchitecture8BitSigned(),
            new AbiBayernArchitecture8BitUnsigned()
        ];
    }

    add(value1: number, value2: number, flags: { n: boolean, v: boolean, z: boolean, c: boolean }): number {
        let sum = value1 + value2;
        flags.n = sum < 0;
        flags.z = sum === 0;
        if (sum > this.valueRangeMax) {
            flags.c = true;
            flags.v = true;
            sum = this.valueRangeMin + (sum - this.valueRangeMax - 1);
        }
        else if (sum < this.valueRangeMin) {
            flags.c = true;
            flags.v = true;
            sum = this.valueRangeMax + (sum - this.valueRangeMin + 1);
        }
        return sum;
    }

    sub(value1: number, value2: number, flags: { n: boolean, v: boolean, z: boolean, c: boolean }): number {
        let diff = value1 - value2;
        flags.n = diff < 0;
        flags.z = diff === 0;
        if (diff > this.valueRangeMax) {
            flags.c = true;
            flags.v = true;
            diff = this.valueRangeMin + (diff - this.valueRangeMax - 1);
        }
        else if (diff < this.valueRangeMin) {
            flags.c = true;
            flags.v = true;
            diff = this.valueRangeMax + (diff - this.valueRangeMin + 1);
        }
        return diff;
    }

    mul(value1: number, value2: number, flags: { n: boolean, v: boolean, z: boolean, c: boolean }): number {
        let product = value1 * value2;
        flags.n = product < 0;
        flags.z = product === 0;
        if (product > this.valueRangeMax) {
            flags.c = true;
            flags.v = true;
            product = this.valueRangeMin + (product - this.valueRangeMax - 1);
        }
        return product;
    }

    div(value1: number, value2: number, flags: { n: boolean, v: boolean, z: boolean, c: boolean }): number {
        let quotient = Math.trunc(value1 / value2);
        flags.n = quotient < 0;
        flags.z = quotient === 0;
        return quotient;
    }
}

class AbiBayernArchitecture16BitSigned extends AbiBayernArchitecture {
    constructor() {
        super("16-bit signed", 16, true, -0x8000, 0x7FFF);
    }

    sanitizeValue(value: number): number {
        return (Math.floor(value) + 0x8000) % 0x10000 - 0x8000; // Ensure value is a signed 16-bit integer
    }

    loadAddressOperand(pc: number, memory: number[]): number {
        if (pc < 0 || pc >= memory.length) {
            throw new Error(`Memory read error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 1})`);
        }
        return memory[pc];
    }

    storeAddressOperand(pc: number, memory: number[], value: number): number {
        if (pc < 0 || pc >= memory.length) {
            throw new Error(`Memory write error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 1})`);
        }
        memory[pc] = value;
        return 1; // 1 memory cell used for address operand
    }

}

class AbiBayernArchitecture16BitUnsigned extends AbiBayernArchitecture {
    constructor() {
        super("16-bit unsigned", 16, false, 0, 0xFFFF);
    }

    sanitizeValue(value: number): number {
        return Math.floor(Math.abs(value)) % 0x10000; // Ensure value is an unsigned 16-bit integer
    }

    loadAddressOperand(pc: number, memory: number[]): number {
        if (pc < 0 || pc >= memory.length) {
            throw new Error(`Memory read error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 1})`);
        }
        return memory[pc]; // Ensure value is treated as unsigned
    }

    storeAddressOperand(pc: number, memory: number[], value: number): number {
        if (pc < 0 || pc >= memory.length) {
            throw new Error(`Memory write error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 1})`);
        }
        memory[pc] = value;
        return 1; // 1 memory cell used for address operand
    }

}

class AbiBayernArchitecture8BitUnsigned extends AbiBayernArchitecture {
    constructor() {
        super("8-bit unsigned", 8, false, 0, 0xFF);
    }

    sanitizeValue(value: number): number {
        return Math.floor(Math.abs(value)) % 0x100; // Ensure value is an unsigned 8-bit integer
    }

    loadAddressOperand(pc: number, memory: number[]): number {
        if (pc < 0 || pc > memory.length - 2) {
            throw new Error(`Memory read error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 2})`);
        }
        return memory[pc] * 0x100 + memory[pc + 1]; // Ensure value is treated as unsigned
    }

    storeAddressOperand(pc: number, memory: number[], value: number): number {
        if (pc < 0 || pc > memory.length - 2) {
            throw new Error(`Memory write error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 2})`);
        }
        memory[pc] = Math.floor(value / 0x100);
        memory[pc + 1] = value % 0x100;
        return 2; // 2 memory cells used for address operand
    }

}

class AbiBayernArchitecture8BitSigned extends AbiBayernArchitecture {
    constructor() {
        super("8-bit signed", 8, true, -0x80, 0x7F);
    }

    sanitizeValue(value: number): number {
        return (Math.floor(value) + 0x80) % 0x100 - 0x80; // Ensure value is a signed 8-bit integer
    }

    loadAddressOperand(pc: number, memory: number[]): number {
        if (pc < 0 || pc > memory.length - 2) {
            throw new Error(`Memory read error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 2})`);
        }
        return memory[pc] * 0x100 + memory[pc + 1]; // Address operands are unsigned even in signed architecture
    }

    storeAddressOperand(pc: number, memory: number[], value: number): number {
        if (pc < 0 || pc > memory.length - 2) {
            throw new Error(`Memory write error: PC ${pc} out of bounds (valid adresses: 0-${memory.length - 2})`);
        }
        memory[pc] = Math.floor(value / 0x100);
        memory[pc + 1] = value % 0x100;
        return 2; // 2 memory cells used for address operand
    }
}
