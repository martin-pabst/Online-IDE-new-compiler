import { BaseType } from "../common/BaseType";
import { Compiler, CompilerEvents } from "../common/Compiler";
import { Error } from "../common/Error";
import { EventManager } from "../common/interpreter/EventManager";
import { CompilerFile } from "../common/module/CompilerFile";
import { Module } from "../common/module/Module";
import { JavaLibraryModule } from "../java/module/libraries/JavaLibraryModule";

export class AssemblerCompiler implements Compiler {
    eventManager: EventManager<CompilerEvents> = new EventManager<CompilerEvents>();

    setFiles(files: CompilerFile[]): void {
    }
    setLibraries(libraryIds: string[]): void {
    }
    updateSingleModuleForCodeCompletion(module: Module): Promise<"success" | "completeCompilingNecessary"> {
        return new Promise<"success" | "completeCompilingNecessary">(resolve => resolve("success"));
    }
    findModuleByFile(file: CompilerFile): Module | undefined {
        return undefined;
    }
    getAllModules(): Module[] {
        return [];
    }
    setFileDirty(file: CompilerFile): void {
    }
    getSortedAndFilteredErrors(file: CompilerFile): Error[] {
        return [];
    }
    getType(identifier: string): BaseType | undefined {
        return undefined;
    }
    triggerCompile(): void {
    }
    forceRecompilation(): void {
    }
    interruptAndStartOverAgain(onlyForCodeCompletion: boolean): Promise<void> {
        return new Promise<void>(resolve => resolve());
    }
    setAdditionalModules(...modules: JavaLibraryModule[]): void {
    }
    waitTillCompilationFinished(): Promise<void> {
        return new Promise<void>(resolve => resolve());
    }
}