import { ExceptionTree } from "../java/codegenerator/ExceptionTree.ts";
import { JavaTypeWithInstanceInitializer } from "../java/types/JavaTypeWithInstanceInitializer.ts";
import { Error } from "./Error";
import { Program } from "./interpreter/Program";
import { Klass, KlassObjectRegistry } from "./interpreter/StepFunction";
import { Module } from "./module/Module";
import { ModuleManager } from "./module/ModuleManager.ts";

type StaticInitializationStep = {
    klass: Klass,
    program: Program
}

export abstract class Executable {

    staticInitializationSequence: StaticInitializationStep[] = [];

    isCompiledToJavascript: boolean = false;

    protected constructor(
        public classObjectRegistry: KlassObjectRegistry,
        public globalErrors: Error[],
        public exceptionTree: ExceptionTree
    ) {
    }

    public abstract getModuleManager(): ModuleManager;

    public abstract hasTests(): boolean;

    compileToJavascript() {
        if (!this.isCompiledToJavascript) {
            if (this.getModuleManager().compileModulesToJavascript()) {
                this.isCompiledToJavascript = true;
            }
        }
    }

    initializeClassObjects(){
        for(const [name, object] of Object.entries(this.classObjectRegistry)){
            let type = object.type;
            if(type instanceof JavaTypeWithInstanceInitializer){
                type.initClassObject();
            }
        }
    }

    findStartableModule(suggestedModule?: Module) {
        if (suggestedModule?.isStartable()) {
            return suggestedModule
        } else if (!suggestedModule?.hasErrors()) {
            // if there is exactly one startable module, use that
            const startableModules = this.getModuleManager().getModules().filter(m => m.isStartable())
            if (startableModules.length === 1) {
                return startableModules[0]
            }
        }

        return null
    }

    getAllErrors(): Error[] {
        let errors: Error[] = this.globalErrors;

        for (const module of this.getModuleManager().getModules()) {
            errors = errors.concat(module.errors);
        }

        return errors;
    }
}