import { Module } from "./Module";

export abstract class ModuleManager {

    abstract getModules(): Module[];

    compileModulesToJavascript(): boolean {
        for (let module of this.getModules()) {
            if (!module.hasErrors()) {
                for (let program of module.programsToCompileToFunctions) {
                    let error = program.compileToJavascriptFunctions();
                    if (error != null) {
                        module.errors.push(error)
                        return false;
                    }
                }
            }
        }
        return true;
    }

}