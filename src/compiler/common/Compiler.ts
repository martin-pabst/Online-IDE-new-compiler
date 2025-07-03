import { JavaLibraryModule } from "../java/module/libraries/JavaLibraryModule";
import { BaseType } from "./BaseType";
import { Error } from "./Error";
import { EventManager } from "./interpreter/EventManager";
import { CompilerFile } from "./module/CompilerFile";
import { Module } from "./module/Module";

export type CompilerEvents = "typesReadyForCodeCompletion" | "compilationFinishedWithNewExecutable" | "compilationFinished";

export interface Compiler {
    setFiles(files: CompilerFile[]): void;
    updateSingleModuleForCodeCompletion(module: Module): Promise<"success" | "completeCompilingNecessary">;
    findModuleByFile(file: CompilerFile): Module | undefined;
    getAllModules(): Module[];
    setFileDirty(file: CompilerFile): void;
    getSortedAndFilteredErrors(file: CompilerFile): Error[];
    getType(identifier: string): BaseType | undefined;
    triggerCompile(): void;
    interruptAndStartOverAgain(onlyForCodeCompletion: boolean): Promise<void>;

    setAdditionalModules(...modules: JavaLibraryModule[]): void;

    waitTillCompilationFinished(): Promise<void>;

    eventManager: EventManager<CompilerEvents>;

}