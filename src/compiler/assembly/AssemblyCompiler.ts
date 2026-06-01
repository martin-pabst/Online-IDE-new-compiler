import { BaseType } from "../common/BaseType";
import { Compiler, CompilerEvents } from "../common/Compiler";
import { Error } from "../common/Error";
import { IMain } from "../common/IMain";
import { EventManager } from "../common/interpreter/EventManager";
import { CompilerFile } from "../common/module/CompilerFile";
import { FileTypeManager } from "../common/module/FileTypeManager";
import { Module } from "../common/module/Module";
import { ErrorMarker } from "../common/monacoproviders/ErrorMarker";
import { AbiBayernCPU, AbiBayernParser } from "./abibayern/AbiBayernCPU";
import { AssemblyExecutable } from "./AssemblyExecutable";
import { AssemblyLexer } from "./AssemblyLexer";
import { AssemblyModule } from "./AssemblyModule";
import { AssemblyModuleManager } from "./AssemblyModuleManager";

const compileTimeout = 800

export class AssemblyCompiler implements Compiler {
    eventManager: EventManager<CompilerEvents> = new EventManager<CompilerEvents>();

    #files: CompilerFile[] = [];
    #moduleManager: AssemblyModuleManager = new AssemblyModuleManager();

    #compileTimer: number;
    lastTimeCompilationStarted: number = 0;


    constructor(public main?: IMain, private errorMarker?: ErrorMarker) {

    }

    setFiles(files: CompilerFile[]): void {
        this.#files = files;

        for (const file of files) {
            const module = this.#moduleManager.getModule(file);
            if (!module) {
                const newModule = new AssemblyModule(file);
                this.#moduleManager.addModule(newModule);
            }
        }

        for (const module of this.#moduleManager.getModules()) {
            if (!files.includes(module.file)) {
                this.#moduleManager.removeModule(module);
            }
        }

    }

    setLibraries(libraryIds: string[]): void {
    }

    updateSingleModuleForCodeCompletion(module: Module): Promise<"success" | "completeCompilingNecessary"> {
        return new Promise<"completeCompilingNecessary">(resolve => resolve("completeCompilingNecessary"));
    }

    findModuleByFile(file: CompilerFile): Module | undefined {
        return this.#moduleManager.getModule(file);
    }

    getAllModules(): Module[] {
        return this.#moduleManager.getModules();
    }

    setFileDirty(file: CompilerFile): void {
        const module = this.findModuleByFile(file);
        if (module) {
            module.setDirty(true);
        }
    }

    getSortedAndFilteredErrors(file: CompilerFile): Error[] {
        const module = this.findModuleByFile(file);
        return module ? module.getSortedAndFilteredErrors() : [];
    }

    getType(identifier: string): BaseType | undefined {
        return undefined;
    }

    compileIfDirty(): void {

        // if we're not in test mode
        if (this.main) {
            if (this.main.getInterpreter().isRunningOrPaused()) return;
            const currentWorkspace = this.main?.getCurrentWorkspace();
            if (!currentWorkspace) return;
            let files = currentWorkspace.getFiles()
                .filter(file => FileTypeManager.filenameToFileType(file.name, this.main.getCurrentProgrammingLanguage()).language == 'myAssembly'
                    && !file.isFolder);
            this.setFiles(files);
        }

        if (this.#files.length === 0) return;

        let lexer = new AssemblyLexer();
        let parser = new AbiBayernParser();

        let atLeastOneModuleCompiled = false;

        for (const file of this.#files) {

            let module = this.#moduleManager.getModule(file);
            if (!module.isDirty()) continue;

            let text: string = file.getText();

            let tokens = lexer.tokenize(text, parser.getKeywordTokens());
            let parserResult = parser.parse(tokens.tokens, file);
            parserResult.errors = [...tokens.errors, ...parserResult.errors];
            parserResult.commentRanges = tokens.commentRanges;

            const cpu = new AbiBayernCPU(parserResult, this.main!);
            module.cpu = cpu;
            module.setDirty(false);
            atLeastOneModuleCompiled = true;
        }

        this.eventManager.fire("compilationFinished");
        if (!atLeastOneModuleCompiled) return;

        let executable = new AssemblyExecutable(this.#moduleManager);
        this.eventManager.fire("compilationFinishedWithNewExecutable", executable);

        setTimeout(() => {
            // this doesn't hurry, so give browser's main thread time to do its chores            
            for (const module of this.#moduleManager.getModules()) {
                this.errorMarker?.markErrorsOfModule(module);
            }
        }, 10);

        // console.log(parserResult);

        // lexer.debugOutputTokens();
        // console.log("Errors:", ret.errors);
    }

    forceRecompilation(): void {
        this.#moduleManager.getModules().forEach(m => m.setDirty(true));
        this.compileIfDirty();
    }

    interruptAndStartOverAgain(onlyForCodeCompletion: boolean): Promise<void> {
        return new Promise<void>(resolve => resolve());
    }

    waitTillCompilationFinished(): Promise<void> {
        return new Promise<void>(resolve => resolve());
    }

    /**
     * Schedules a compilation in the near future and returns.
     * Cancels a previously scheduled compilation.
     */
    triggerCompile() {
        if (this.#compileTimer) {
            clearTimeout(this.#compileTimer)
        }

        // ensure that there's at least compileTimeout ms between two compilation runs
        let timeout: number = compileTimeout - (performance.now() - this.lastTimeCompilationStarted);
        if (timeout < 0) timeout = 0;


        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.#compileTimer = window.setTimeout(async () => {
            try {
                this.lastTimeCompilationStarted = performance.now();
                this.compileIfDirty();
            } catch (exception) {
                console.log(exception);
            }
        }, timeout)
    }

}