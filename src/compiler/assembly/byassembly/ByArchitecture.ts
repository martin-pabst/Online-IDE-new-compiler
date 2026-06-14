import type { TranslatedText } from "../../../tools/language/LanguageManager";
import { ByAssemblyMessages } from "./ByAssemblyMessages";

export abstract class ByArchitecture {

    constructor(public identifier: string, public bitsPerCell: number, public signed: boolean,
        public valueRangeMin: number, public valueRangeMax: number, public cellsPerAddressOperand: number) {
    }

    abstract sanitizeValue(value: number): number;
    abstract loadAddressOperand(pc: number, memory: number[]): number;

    /**
     * returns the number of memory cells used by the address operand (e.g. 1 for 16-bit architectures, 2 for 8-bit architectures)
     */
    abstract addressOperandToMemoryCellValues(address: number): number[];

    abstract getLocalizedName(): TranslatedText;

    isValidValue(value: number): boolean {
        return value >= this.valueRangeMin && value <= this.valueRangeMax;
    }

    isValidAddress(address: number): boolean {
        return address >= 0 && address <= 0x10000;
    }

    static getArchitectureByName(name: string): ByArchitecture {
        return this.getArchitectures().find(arch => arch.identifier === name) ?? this.getArchitectures()[0];
    }

    static getArchitectures(): ByArchitecture[] {
        return [
            new AbiBayernArchitecture16BitSigned(),
            new AbiBayernArchitecture16BitUnsigned(),
            new AbiBayernArchitecture8BitSigned(),
            new AbiBayernArchitecture8BitUnsigned()
        ];
    }

}

class AbiBayernArchitecture16BitSigned extends ByArchitecture {
    constructor() {
        super("16-bit signed", 16, true, -0x8000, 0x7FFF, 1);
    }

    getLocalizedName(): TranslatedText {
        return ByAssemblyMessages.Architecture16BitSigned;
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

    addressOperandToMemoryCellValues(value: number): number[] {
        return [value]; // 1 memory cell used for address operand
    }

}

class AbiBayernArchitecture16BitUnsigned extends ByArchitecture {
    constructor() {
        super("16-bit unsigned", 16, false, 0, 0xFFFF, 1);
    }

    getLocalizedName(): TranslatedText {
        return ByAssemblyMessages.Architecture16BitUnsigned;
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

    addressOperandToMemoryCellValues(value: number): number[] {
        return [value]; // 1 memory cell used for address operand
    }

}

class AbiBayernArchitecture8BitUnsigned extends ByArchitecture {
    constructor() {
        super("8-bit unsigned", 8, false, 0, 0xFF, 2);
    }

    getLocalizedName(): TranslatedText {
        return ByAssemblyMessages.Architecture8BitUnsigned;
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

    addressOperandToMemoryCellValues(value: number): number[] {
        return [Math.floor(value / 0x100), value % 0x100]; // 2 memory cells used for address operand
    }


}

class AbiBayernArchitecture8BitSigned extends ByArchitecture {
    constructor() {
        super("8-bit signed", 8, true, -0x80, 0x7F, 2);
    }

    getLocalizedName(): TranslatedText {
        return ByAssemblyMessages.Architecture8BitSigned;
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

    addressOperandToMemoryCellValues(value: number): number[] {
        return [Math.floor(value / 0x100), value % 0x100]; // 2 memory cells used for address operand
    }
}
