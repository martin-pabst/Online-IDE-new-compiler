export class CompilingProgressManagerException {

}

export class CompilingProgressManager {

    #doLogging: boolean = false;

    #timeStarted: number = 0;
    #lastInterruptionTime: number = 0;
    #numberOfInterruptions: number = 0;
    #interruptAndRestartFlag: boolean = false;
    #newOrDirtyModules: string = "";
    #isInsideCompilationRun: boolean = false;

    #interruptForMs: 5;


    #nextRunWithoutInterruptions: boolean = false;

    constructor(private interruptAtLeastEveryMs: number = 30){

    }

    get isInsideCompilationRun(): boolean {
        return this.#isInsideCompilationRun;
    }

    initBeforeCompiling() {
        this.#timeStarted = this.#lastInterruptionTime = performance.now();
        this.#interruptAndRestartFlag = false;
        this.#numberOfInterruptions = 0;
        if (this.#nextRunWithoutInterruptions) this.#lastInterruptionTime += 1e6;
        this.#nextRunWithoutInterruptions = false;
        this.#newOrDirtyModules = "---";
        this.#isInsideCompilationRun = true;
    }

    afterCompiling(exception?: string) {
        this.#isInsideCompilationRun = false;
        const dt = performance.now() - this.#timeStarted;
        if (this.#doLogging && this.#newOrDirtyModules != '---') {
            const withException: string = exception ? " with Exception " : "";
            console.log("Compiled modules [" + this.#newOrDirtyModules + "]" + withException + "; Compilation run took "
                + Math.round(dt) + " ms and was " + this.#numberOfInterruptions + " times interrupted.");
        }
    }

    async interruptIfNeeded(): Promise<void> {
        if(this.interruptAtLeastEveryMs < 1){
            return;
        }

        const dt = performance.now() - this.#lastInterruptionTime;
        if (dt >= this.interruptAtLeastEveryMs) {
            if (this.#doLogging) {
                console.log("Compiler was interrupted by CompilingProgressManger.");
            }
            this.#numberOfInterruptions++;
            await this.#delay(this.#interruptForMs);
            this.#lastInterruptionTime = performance.now();
            if (this.#interruptAndRestartFlag) throw new CompilingProgressManagerException();
        }
    }

    async #delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    interruptCompilerIfRunning(nextRunWithoutInterruptions: boolean) {
        if (this.#doLogging) console.log("Request to interrupt compiler by JavaCompletionItemProvider");
        this.#interruptAndRestartFlag = true;
        this.#nextRunWithoutInterruptions = nextRunWithoutInterruptions;
    }

    restartNecessary() {
        return this.#interruptAndRestartFlag;
    }

    setNewOrDirtyModules(newOrDirtyModules: string) {
        this.#newOrDirtyModules = newOrDirtyModules;
    }
}