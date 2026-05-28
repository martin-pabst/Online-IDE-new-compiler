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

}