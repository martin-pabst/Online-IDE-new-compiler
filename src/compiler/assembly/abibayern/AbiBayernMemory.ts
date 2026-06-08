import { AssemblyCompiledCodePart } from "../AssemblyParser";
import { Memory } from "../Memory";


export class AbiBayernMemory extends Memory {
    private memory: number[] = [];     // signed 16-bit integers

    // 0x100000 = 1 MB
    constructor(size: number, private maximumSize: number = 0x100000) {
        super();
        this.memory = new Array(size).fill(0);
    }

    read(address: number): number {
        if (address < 0 || address >= this.memory.length) {
            throw new Error(`Memory read error: Address ${address} out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        return this.memory[address];
    }

    readIndirect(address: number): number {
        if (address < 0 || address >= this.memory.length) {
            throw new Error(`Memory read error: Address ${address} out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        let address2 = this.memory[address];
        if (address2 < 0 || address2 >= this.memory.length) {
            throw new Error(`Memory read error: Indirect address ${address2} (from address ${address}) out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        return this.memory[address2];
    }

    writeIndirect(address: number, value: number): void {
        if (address < 0 || address >= this.memory.length) {
            throw new Error(`Memory write error: Address ${address} out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        let address2 = this.memory[address];
        if (address2 < 0 || address2 >= this.memory.length) {
            throw new Error(`Memory write error: Indirect address ${address2} (from address ${address}) out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        this.memory[address2] = (Math.floor(value) + 0x8000) % 0x10000 - 0x8000; // Ensure value is a signed 16-bit integer
    }


    write(address: number, value: number): void {
        if (address < 0 || address >= this.memory.length) {
            throw new Error(`Memory write error: Address ${address} out of bounds (valid adresses: 0-${this.memory.length - 1})`);
        }
        this.memory[address] = (Math.floor(value) + 0x8000) % 0x10000 - 0x8000; // Ensure value is a signed 16-bit integer
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

    loadProgram(codeParts: AssemblyCompiledCodePart[]): void {
        let sizeNeeded = 0;
        for (let codePart of codeParts) {
            sizeNeeded = Math.max(sizeNeeded, codePart.offset + codePart.code.length);
        }
        if (sizeNeeded > this.maximumSize) {
            throw new Error(`Program load error: Program size (${sizeNeeded} words) exceeds maximum memory size (0x${this.maximumSize.toString(16)}) words).`);
        }
        if (sizeNeeded > this.memory.length) {
            this.memory = new Array(sizeNeeded);
        }
        
        this.memory.fill(0);

        for (let codePart of codeParts) {
            for (let i = 0; i < codePart.code.length; i++) {
                this.memory[codePart.offset + i] = codePart.code[i];
            }
        }
    }


}