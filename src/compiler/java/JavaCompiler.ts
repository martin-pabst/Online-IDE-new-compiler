/**
 * The JavaCompiler takes a bundle of files and tries to compile them into
 * a runnable java program.
 *
 * If it is invoked with files it already knows it may reuse code from
 * a former compilation run.
 */

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


enum CompilerState {
    compilingPeriodically, stopped
}

export class JavaCompiler implements Compiler {

    public moduleManager: JavaModuleManager;
    lastOpenedFile?: CompilerFile;
    public libraryModuleManager: JavaLibraryModuleManager;

    private errors: Error[] = [];

    public lastCompiledExecutable?: Executable;

    public files: CompilerFile[] = [];

    public state: CompilerState = CompilerState.stopped;
    private maxMsBetweenRuns: number = 500;

    public eventManager: EventManager<CompilerEvents> = new EventManager();

    private endOfLastCompilationRunMs = performance.now();

    private progressManager = new CompilingProgressManager();

    constructor(public main?: IMain, private errorMarker?: ErrorMarker) {
        this.libraryModuleManager = new JavaLibraryModuleManager();
        this.moduleManager = new JavaModuleManager();
    }

    setAdditionalModules(...modules: JavaLibraryModule[]){
        this.libraryModuleManager = new JavaLibraryModuleManager(...modules);
    }

    getType(identifier: string): BaseType | undefined {
        return this.libraryModuleManager.typestore.getType(identifier);
    }

    setFiles(files: CompilerFile[]) {
        this.files = files;
    }

    public async compileIfDirty(): Promise<Executable | undefined> {


        if (this.lastCompiledExecutable) {
            this.lastCompiledExecutable.findMainModule(false, this.lastOpenedFile, this.main?.getCurrentWorkspace()?.getCurrentlyEditedModule());
        }

        // if we're not in test mode:
        if (this.main) {
//FJFTODO            if (this.main.getInterpreter().isRunningOrPaused()) return;
            let currentWorkspace = this.main?.getCurrentWorkspace();
            if (!currentWorkspace) return;
            this.moduleManager.workspace = currentWorkspace;
            this.files = currentWorkspace.getFiles().filter(file => FileTypeManager.filenameToFileType(file.name).language == 'myJava');
        }

        this.moduleManager.setupModulesBeforeCompiliation(this.files);

        // we call moduleManager.getNewOrDirtyModules before iterativelySetDirtyFlags
        // to check if ANY file has changed/is new since last compilation run:
        let newOrDirtyModules = this.moduleManager.getNewOrDirtyModules(true);

        /**
         * if no module has changed, return as fast as possible
        */
       if (newOrDirtyModules.length == 0) return this.lastCompiledExecutable;

       // now we extend set of dirty modules to
       //  - modules which had errors in last compilation run
       //  - modules that are (indirectly) dependent on other dirty modules
       this.moduleManager.iterativelySetDirtyFlags();


       newOrDirtyModules = this.moduleManager.getNewOrDirtyModules();

       this.progressManager.setNewOrDirtyModules(newOrDirtyModules.map(m => m.file.name).join(", "));  // only for console.log later

       if (newOrDirtyModules.length == 0) return this.lastCompiledExecutable;

        this.errors = [];

        this.moduleManager.emptyTypeStore();

        LabelCodeSnippet.resetCount();

        let cleanModules = this.moduleManager.getUnChangedModules();
        cleanModules.forEach(cm => cm.registerTypesAtTypestore(this.moduleManager.typestore))

        for (let module of newOrDirtyModules) {

            module.resetBeforeCompilation();

            let lexerOutput = new Lexer().lex(module.file.getText());
            module.setLexerOutput(lexerOutput);
            this.progressManager.interruptIfNeeded();

            let parser = new Parser(module);
            parser.parse();
            this.progressManager.interruptIfNeeded();
        }

        let typeResolver = new TypeResolver(this.moduleManager, this.libraryModuleManager);

        let exceptionTree = new ExceptionTree(this.libraryModuleManager.typestore, this.moduleManager.typestore);

        // resolve returns false if cyclic references are found. In this case we don't continue compiling.
        if (typeResolver.resolve()) {
            this.moduleManager.typestore.initFastExtendsImplementsLookup();


            for (let module of newOrDirtyModules) {
                let codegenerator = new CodeGenerator(module, this.libraryModuleManager.typestore,
                    this.moduleManager.typestore, exceptionTree, this.progressManager);
                await codegenerator.start();
                module.setDirty(false);
                this.progressManager.interruptIfNeeded();
            }

        }


        this.eventManager.fire("typesReadyForCodeCompletion");

        await this.progressManager.interruptIfNeeded();

        let klassObjectRegistry: KlassObjectRegistry = {};

        this.libraryModuleManager.typestore.populateClassObjectRegistry(klassObjectRegistry);

        this.moduleManager.typestore.populateClassObjectRegistry(klassObjectRegistry);

        this.moduleManager.setDependsOnModuleWithErrorsFlag();

        let executable = new Executable(klassObjectRegistry,
            this.moduleManager, this.libraryModuleManager,
            this.errors, exceptionTree,
            this.lastOpenedFile, this.main?.getCurrentWorkspace()?.getCurrentlyEditedModule());

        if (executable.mainModule) {
            this.lastOpenedFile = executable.mainModule.file;
        }

        this.lastCompiledExecutable = executable;

        this.eventManager.fire("compilationFinished", this.lastCompiledExecutable);

        if (this.lastCompiledExecutable) {
            for (let module of this.lastCompiledExecutable.moduleManager.modules) {
                this.errorMarker?.markErrorsOfModule(module);
            }

        }

        // console.log(Math.round(performance.now() - time) + " ms: Done compiling!");

        this.endOfLastCompilationRunMs = performance.now();

        return executable;

    }

    /**
     * If user presses . or <ctrl> + <space> then we assume that only
     * currently edited file is dirty, therefore it suffices to compile only this module.
     */
    updateSingleModuleForCodeCompletion(module: JavaCompiledModule): "success" | "completeCompilingNecessary" {
        if (!module) return "completeCompilingNecessary";

        if (!module.isDirty()) return "success";

        let moduleManagerCopy = this.moduleManager.copy(module);

        module.compiledSymbolsUsageTracker.clear();
        module.systemSymbolsUsageTracker.clear();

        module.resetBeforeCompilation();

        let lexerOutput = new Lexer().lex(module.file.getText());
        module.setLexerOutput(lexerOutput);

        let parser = new Parser(module);
        parser.parse();

        let typeResolver = new TypeResolver(moduleManagerCopy, this.libraryModuleManager);

        // resolve returns false if cyclic references are found. In this case we don't continue compiling.
        if (!typeResolver.resolve()) {
            return "completeCompilingNecessary";
        }

        // this.moduleManager.typestore.initFastExtendsImplementsLookup();

        let exceptionTree = new ExceptionTree(this.libraryModuleManager.typestore, this.moduleManager.typestore);

        let codegenerator = new CodeGenerator(module, this.libraryModuleManager.typestore,
            this.moduleManager.typestore, exceptionTree, this.progressManager);
        codegenerator.start();

        /**
         * The compilation run we did is not sufficient to produce a up to date executable,
         * so we mark module as dirty to force new compilation
         */
        module.setDirty(true);

        return "success";

    }

    startCompilingPeriodically(maxMsBetweenRuns?: number) {
        if (maxMsBetweenRuns) this.maxMsBetweenRuns = maxMsBetweenRuns;
        if (this.state == CompilerState.compilingPeriodically) return;

        this.state = CompilerState.compilingPeriodically;

        let f = () => {

            // if compileIfDirty() had been called from outside between two invocations of f, then
            // we don't need to compile this early:
            let plannedNextCompilationTime = this.endOfLastCompilationRunMs + this.maxMsBetweenRuns;
            if (performance.now() < plannedNextCompilationTime - 30) {
                setTimeout(f, plannedNextCompilationTime - performance.now());
                return;
            }

            if (this.state == CompilerState.compilingPeriodically) {
                do {
                    try {
                        this.progressManager.initBeforeCompiling();
                        this.compileIfDirty();
                        this.progressManager.afterCompiling();

                    } catch (exception) {
                        this.progressManager.afterCompiling(exception.toString());
                        if (!(exception instanceof CompilingProgressManagerException)) {
                            break;   // if this.progressManager.restartNecessary then we would get an infinite loop if we wouldn't break
                        }
                    }
                } while (this.progressManager.restartNecessary())
                setTimeout(f, this.maxMsBetweenRuns);
            }
        }

        f();
    }

    stopCompilingPeriodically() {
        this.state = CompilerState.stopped;
    }

    findModuleByFile(file: CompilerFile): Module | undefined {
        return this.moduleManager.findModuleByFile(file);
    }

    getAllModules(): Module[] {
        return this.moduleManager.modules;
    }

    setFileDirty(file: CompilerFile): void {
        let module = this.findModuleByFile(file);
        module?.setDirty(true);
    }

    getSortedAndFilteredErrors(file: CompilerFile): Error[] {
        let module = this.findModuleByFile(file);
        if (!module) return [];

        let list: Error[] = module.errors.slice();

        list.sort((a, b) => {
            return Range.compareRangesUsingStarts(a.range, b.range);
        });

        for (let i = 0; i < list.length - 1; i++) {
            let e1 = list[i];
            let e2 = list[i + 1];
            if (e1.range.startLineNumber == e2.range.startLineNumber && e1.range.startColumn + 10 > e2.range.startColumn) {
                if (this.errorLevelCompare(e1.level, e2.level) == 1) {
                    list.splice(i + 1, 1);
                } else {
                    list.splice(i, 1);
                }
                i--;
            }
        }

        return list;



    }

    errorLevelCompare(level1: ErrorLevel, level2: ErrorLevel): number {
        if (level1 == "error") return 1;
        if (level2 == "error") return -1;
        if (level1 == "warning") return 1;
        if (level2 == "warning") return -1;
        return 1;
    }

    async interruptAndStartOverAgain(): Promise<void> {

        if (this.progressManager.isInsideCompilationRun) {
            this.progressManager.interruptCompilerIfRunning(false);
        } else {
            this.progressManager.initBeforeCompiling();
            this.compileIfDirty();
            this.progressManager.afterCompiling();
        }

        return new Promise(resolve => {
            this.eventManager.once("typesReadyForCodeCompletion", resolve);
        })
    }

}