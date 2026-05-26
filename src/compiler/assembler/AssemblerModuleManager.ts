import { ModuleManager } from "../common/module/ModuleManager";
import { AssemblerModule } from "./AssemblerModule";

export class AssemblerModuleManager extends ModuleManager {
    
    private modules: AssemblerModule[] = [];
    
    getModules(): AssemblerModule[] {
        return this.modules;
    }

    addModule(module: AssemblerModule) {
        this.modules.push(module);
    }  

}