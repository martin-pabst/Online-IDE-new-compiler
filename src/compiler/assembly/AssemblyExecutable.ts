import { Error } from "../common/Error";
import { Executable } from "../common/Executable";
import { ModuleManager } from "../common/module/ModuleManager";
import { ExceptionTree } from "../java/codegenerator/ExceptionTree";
import { AssemblyModuleManager as AssemblyModuleManager } from "./AssemblyModuleManager";

export class AssemblyExecutable extends Executable {

    constructor(public moduleManager: AssemblyModuleManager) {
        super({}, [], new ExceptionTree());
    }

    public getModuleManager(): ModuleManager {
        return this.moduleManager;
    }

    public hasTests(): boolean {
        return false;
    }



}