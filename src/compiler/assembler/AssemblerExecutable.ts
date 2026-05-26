import { Executable } from "../common/Executable";
import { ModuleManager } from "../common/module/ModuleManager";
import { AssemblerModuleManager } from "./AssemblerModuleManager";

export class AssemblerExecutable extends Executable {

    moduleManager: AssemblerModuleManager = new AssemblerModuleManager();

    public getModuleManager(): ModuleManager {
        return this.moduleManager;
    }

    public hasTests(): boolean {
        return false;
    }



}