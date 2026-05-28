import { Memory } from "../Memory";

export class AbiBayernMemory extends Memory {
    private memory: number[] = [];     // signed 16-bit integers

    constructor(size: number) {
        super();
        this.memory = new Array(size).fill(0);
    }

    read(address: number): number {
        if (address < 0 || address >= this.memory.length) {
            throw new Error(`Memory read error: Address ${address} out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        return this.memory[address];
    }

    write(address: number, value: number): void {
        if (address < 0 || address >= this.memory.length) {
            throw new Error(`Memory write error: Address ${address} out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        this.memory[address] = (Math.floor(value) + 0x8000) & 0x10000 - 0x8000; // Ensure value is a signed 16-bit integer
    }

    dump(): number[] {
        return this.memory;
    }

    size(): number {
        return this.memory.length;
    }

    clear(): void {
        this.memory.fill(0);
    }

}