import { CompilerFile } from "../common/module/CompilerFile";
import { ModuleManager } from "../common/module/ModuleManager";
import { AssemblyModule } from "./AssemblyModule";

export class AssemblyModuleManager extends ModuleManager {

    private modules: AssemblyModule[] = [];

    getModules(): AssemblyModule[] {
        return this.modules;
    }

    addModule(module: AssemblyModule) {
        this.modules.push(module);
    }

    getModule(file: CompilerFile): AssemblyModule | undefined {
        return this.modules.find(m => m.file === file);
    }

    removeModule(module: AssemblyModule) {
        this.modules.splice(this.modules.indexOf(module), 1);
    }

}