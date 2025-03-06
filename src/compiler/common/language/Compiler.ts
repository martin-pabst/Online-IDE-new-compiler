import type { JavaLibraryModuleManager } from "../../java/module/libraries/JavaLibraryModuleManager";
import type { BaseType } from "../BaseType";
import type { Error } from "../Error";
import type { EventManager } from "../interpreter/EventManager";
import type { CompilerFile } from "../module/CompilerFile";
import type { Module } from "../module/Module";
import { WebworkerCompiler } from "./WebworkerCompiler";

export interface Compiler extends WebworkerCompiler {
    setFiles(files: CompilerFile[]): void;
    updateSingleModuleForCodeCompletion(module: Module): "success" | "completeCompilingNecessary";
    findModuleByFile(file: CompilerFile): Module | undefined;
    getAllModules(): Module[];
    setFileDirty(file: CompilerFile): void;
    getType(identifier: string): BaseType | undefined;
    interruptAndStartOverAgain(onlyForCodeCompletion: boolean): Promise<void>;

    setLibraryModuleManager(lmm: JavaLibraryModuleManager);

}