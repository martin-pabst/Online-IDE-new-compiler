export abstract class Memory {
    abstract size(): number;
    abstract dump(): number[];
    abstract clear(): void;
}