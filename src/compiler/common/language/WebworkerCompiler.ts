export interface WebworkerCompiler {
    triggerCompile(callback?: () => void): void;
}