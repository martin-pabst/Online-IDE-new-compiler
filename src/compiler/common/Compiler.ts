import type { JavaLibraryModuleManager } from "../java/module/libraries/JavaLibraryModuleManager";
import type { BaseType } from "./BaseType";
import type { Error } from "./Error";
import type { EventManager } from "./interpreter/EventManager";
import type { CompilerFile } from "./module/CompilerFile";
import type { Module } from "./module/Module";

export type CompilerEvents = "typesReadyForCodeCompletion" | "compilationFinishedWithNewExecutable" | "compilationFinished";

export interface Compiler {
    setFiles(files: CompilerFile[]): void;
    updateSingleModuleForCodeCompletion(module: Module): "success" | "completeCompilingNecessary";
    findModuleByFile(file: CompilerFile): Module | undefined;
    getAllModules(): Module[];
    setFileDirty(file: CompilerFile): void;
    getSortedAndFilteredErrors(file: CompilerFile): Error[];
    getType(identifier: string): BaseType | undefined;
    triggerCompile(isWebworker: boolean): void;
    interruptAndStartOverAgain(onlyForCodeCompletion: boolean): Promise<void>;

    setLibraryModuleManager(lmm: JavaLibraryModuleManager);

    eventManager: EventManager<CompilerEvents>;

}