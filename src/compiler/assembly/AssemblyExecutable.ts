import { Executable } from "../common/Executable";
import { ModuleManager } from "../common/module/ModuleManager";
import { AssemblyModuleManager as AssemblyModuleManager } from "./AssemblyModuleManager";

export class AssemblyExecutable extends Executable {

    moduleManager: AssemblyModuleManager = new AssemblyModuleManager();

    public getModuleManager(): ModuleManager {
        return this.moduleManager;
    }

    public hasTests(): boolean {
        return false;
    }



}