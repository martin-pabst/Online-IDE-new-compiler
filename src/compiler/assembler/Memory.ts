export class Memory {
    private memory: number[] = [];

    constructor(public size: number) {
        this.memory = new Array(size).fill(0);
    }

    read(address: number): number {
        if (address < 0 || address >= this.size) {
            throw new Error(`Memory read error: Address ${address} out of bounds`);
        }
        return this.memory[address];
    }

    write(address: number, value: number): void {
        if (address < 0 || address >= this.size) {
            throw new Error(`Memory write error: Address ${address} out of bounds`);
        }
        this.memory[address] = value;
    }
    
}