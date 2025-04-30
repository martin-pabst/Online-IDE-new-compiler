import { FileTypeManager } from "../common/module/FileTypeManager.ts";
import { BaseType } from "../common/BaseType.ts";
import { Compiler, CompilerEvents } from "../common/Compiler.ts";
import { Error, ErrorLevel } from "../common/Error.ts";
import { Executable } from "../common/Executable.ts";
import { IMain } from "../common/IMain.ts";
import { EventManager } from "../common/interpreter/EventManager.ts";
import { KlassObjectRegistry } from "../common/interpreter/StepFunction.ts";
import { CompilerFile } from "../common/module/CompilerFile";
import { Module } from "../common/module/Module.ts";
import { ErrorMarker } from "../common/monacoproviders/ErrorMarker.ts";
import { Range } from "../common/range/Range.ts";
import { TypeResolver } from "./TypeResolver/TypeResolver";
import { CodeGenerator } from "./codegenerator/CodeGenerator";
import { ExceptionTree } from "./codegenerator/ExceptionTree.ts";
import { LabelCodeSnippet } from "./codegenerator/LabelManager.ts";
import { Lexer } from "./lexer/Lexer";
import { JavaCompiledModule } from "./module/JavaCompiledModule.ts";
import { JavaModuleManager } from "./module/JavaModuleManager";
import { JavaLibraryModuleManager } from "./module/libraries/JavaLibraryModuleManager";
import { Parser } from "./parser/Parser";
import { CompilingProgressManager, CompilingProgressManagerException } from "./CompilingProgressManager.ts";
import { JavaLibraryModule } from "./module/libraries/JavaLibraryModule.ts";



const compileTimeout = 800

/**
 * The JavaCompiler takes a bundle of files and tries to compile them into
 * a runnable java program.
 *
 * If it is invoked with files it already knows it may reuse code from
 * a former compilation run.
 */
export class JavaCompiler implements Compiler {

    moduleManager: JavaModuleManager;
    libraryModuleManager: JavaLibraryModuleManager;

    #errors: Error[] = [];

    #lastCompiledExecutable?: Executable;

    #files: CompilerFile[] = [];

    eventManager: EventManager<CompilerEvents> = new EventManager();

    #progressManager = new CompilingProgressManager();

    #compileTimer: number;
    lastTimeCompilationStarted: number = 0;

    constructor(public main?: IMain, private errorMarker?: ErrorMarker) {
        this.libraryModuleManager = new JavaLibraryModuleManager();
        this.moduleManager = new JavaModuleManager();
    }

    setAdditionalModules(...modules: JavaLibraryModule[]) {
        this.libraryModuleManager = new JavaLibraryModuleManager(...modules);
    }

    getType(identifier: string): BaseType | undefined {
        return this.libraryModuleManager.typestore.getType(identifier);
    }

    setFiles(files: CompilerFile[]) {
        this.#files = files;
        this.moduleManager.setupModulesBeforeCompiliation(this.#files);
    }

    async compileIfDirty(onlyForCodeCompletion: boolean = false): Promise<Executable | undefined> {
        // if we're not in test mode:
        if (this.main) {
            if (this.main.getInterpreter().isRunningOrPaused()) return;
            const currentWorkspace = this.main?.getCurrentWorkspace();
            if (!currentWorkspace) return;
            this.moduleManager.workspace = currentWorkspace;
            this.#files = currentWorkspace.getFiles().filter(file => FileTypeManager.filenameToFileType(file.name).language == 'myJava');
        }

        this.moduleManager.setupModulesBeforeCompiliation(this.#files);

        // we call moduleManager.getNewOrDirtyModules before iterativelySetDirtyFlags
        // to check if ANY file has changed/is new since last compilation run:
        let newOrDirtyModules = this.moduleManager.getNewOrDirtyModules();

        /**
         * if no module has changed, return as fast as possible
        */
        if (newOrDirtyModules.length == 0) return this.#lastCompiledExecutable;

        // now we extend set of dirty modules to
        //  - modules which had errors in last compilation run
        //  - modules that are (indirectly) dependent on other dirty modules
        this.moduleManager.iterativelySetDirtyFlags();


        newOrDirtyModules = this.moduleManager.getNewOrDirtyModules();

        this.#progressManager.setNewOrDirtyModules(newOrDirtyModules.map(m => m.file.name).join(", "));  // only for console.log later

        if (newOrDirtyModules.length == 0) return this.#lastCompiledExecutable;

        this.#errors = [];

        this.moduleManager.emptyTypeStore();

        LabelCodeSnippet.resetCount();

        const cleanModules = this.moduleManager.getUnChangedModules();
        cleanModules.forEach(cm => cm.registerTypesAtTypestore(this.moduleManager.typestore))

        for (const module of newOrDirtyModules) {

            module.resetBeforeCompilation();

            const lexerOutput = new Lexer().lex(module.file.getText());
            module.storeLexerOutput(lexerOutput);
            await this.#progressManager.interruptIfNeeded();

            const parser = new Parser(module);
            parser.parse();
            await this.#progressManager.interruptIfNeeded();
        }

        const typeResolver = new TypeResolver(this.moduleManager, this.libraryModuleManager);

        const exceptionTree = new ExceptionTree(this.libraryModuleManager.typestore, this.moduleManager.typestore);

        // resolve returns false if cyclic references are found. In this case we don't continue compiling.
        if (typeResolver.resolve()) {

            // this.moduleManager.typestore.initFastExtendsImplementsLookup();


            for (const module of newOrDirtyModules) {
                const codegenerator = new CodeGenerator(module, this.libraryModuleManager.typestore,
                    this.moduleManager.typestore, exceptionTree, this.#progressManager);
                await codegenerator.start();
                await this.#progressManager.interruptIfNeeded();
            }

            if (onlyForCodeCompletion) return;

            for (const module of newOrDirtyModules) {
                module.setDirty(false);
            }

        }


        await this.#progressManager.interruptIfNeeded();

        const klassObjectRegistry: KlassObjectRegistry = {};

        this.libraryModuleManager.typestore.populateClassObjectRegistry(klassObjectRegistry);

        this.moduleManager.typestore.populateClassObjectRegistry(klassObjectRegistry);

        this.moduleManager.setDependsOnModuleWithErrorsFlag();

        const executable = new Executable(
            klassObjectRegistry,
            this.moduleManager,
            this.libraryModuleManager,
            this.#errors, exceptionTree
        );

        this.#lastCompiledExecutable = executable;

        this.eventManager.fire("compilationFinishedWithNewExecutable", this.#lastCompiledExecutable);

        for (const module of this.#lastCompiledExecutable.moduleManager.modules) {
            this.errorMarker?.markErrorsOfModule(module);
        }

        return executable;
    }

    /**
     * If user presses . or <ctrl> + <space> then we assume that only
     * currently edited file is dirty, therefore it suffices to compile only this module.
     */
    async updateSingleModuleForCodeCompletion(module: JavaCompiledModule): Promise<"success" | "completeCompilingNecessary"> {
        if (!module) return "completeCompilingNecessary";

        if (!module.isDirty()) return "success";

        const moduleManagerCopy = this.moduleManager.copy(module);

        module.compiledSymbolsUsageTracker.clear();
        module.systemSymbolsUsageTracker.clear();

        module.resetBeforeCompilation();

        const lexerOutput = new Lexer().lex(module.file.getText());
        module.storeLexerOutput(lexerOutput);

        const parser = new Parser(module);
        parser.parse();

        const typeResolver = new TypeResolver(moduleManagerCopy, this.libraryModuleManager);

        // resolve returns false if cyclic references are found. In this case we don't continue compiling.
        if (!typeResolver.resolve()) {
            return "completeCompilingNecessary";
        }

        // this.moduleManager.typestore.initFastExtendsImplementsLookup();

        const exceptionTree = new ExceptionTree(this.libraryModuleManager.typestore, this.moduleManager.typestore);

        const codegenerator = new CodeGenerator(module, this.libraryModuleManager.typestore,
            this.moduleManager.typestore, exceptionTree, this.#progressManager);
        await codegenerator.start();

        /**
         * The compilation run we did is not sufficient to produce a up to date executable,
         * so we mark module as dirty to force new compilation
         */
        module.setDirty(true);

        return "success";
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
            do {
                try {
                    this.lastTimeCompilationStarted = performance.now();
                    this.#progressManager.initBeforeCompiling();
                    await this.compileIfDirty();
                    this.#progressManager.afterCompiling();
                    this.eventManager.fire("compilationFinished");
                } catch (exception) {
                    this.#progressManager.afterCompiling(exception.toString());
                    if (!(exception instanceof CompilingProgressManagerException)) {
                        break;   // if this.progressManager.restartNecessary then we would get an infinite loop if we wouldn't break
                    }
                }
            } while (this.#progressManager.restartNecessary())
        }, timeout)
    }

    findModuleByFile(file: CompilerFile): Module | undefined {
        return this.moduleManager.findModuleByFile(file);
    }

    getAllModules(): Module[] {
        return this.moduleManager.modules;
    }

    setFileDirty(file: CompilerFile): void {
        const module = this.findModuleByFile(file);
        module?.setDirty(true);
    }

    getSortedAndFilteredErrors(file: CompilerFile): Error[] {
        const module = this.findModuleByFile(file);
        if (!module) return [];

        const list: Error[] = module.errors.slice();

        list.sort((a, b) => {
            return Range.compareRangesUsingStarts(a.range, b.range);
        });

        for (let i = 0; i < list.length - 1; i++) {
            const e1 = list[i];
            const e2 = list[i + 1];
            if (e1.range.startLineNumber == e2.range.startLineNumber && e1.range.startColumn + 10 > e2.range.startColumn) {
                if (this.#errorLevelCompare(e1.level, e2.level) == 1) {
                    list.splice(i + 1, 1);
                } else {
                    list.splice(i, 1);
                }
                i--;
            }
        }

        return list;
    }

    #errorLevelCompare(level1: ErrorLevel, level2: ErrorLevel): number {
        if (level1 == "error") return 1;
        if (level2 == "error") return -1;
        if (level1 == "warning") return 1;
        if (level2 == "warning") return -1;
        return 1;
    }

    async interruptAndStartOverAgain(onlyForCodeCompletion: boolean): Promise<void> {
        if (this.#progressManager.isInsideCompilationRun) {
            this.#progressManager.interruptCompilerIfRunning(false);
        }
        this.#progressManager.initBeforeCompiling();
        await this.compileIfDirty(onlyForCodeCompletion);
        this.#progressManager.afterCompiling();

    }

}