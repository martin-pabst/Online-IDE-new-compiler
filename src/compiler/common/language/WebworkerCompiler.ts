export interface WebworkerCompiler {
    triggerCompile(): void;
    startableMainModuleExists(): boolean;
}