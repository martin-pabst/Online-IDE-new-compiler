import { CompilerFile } from "../../common/module/CompilerFile";
import { JavaTypeStore } from "./JavaTypeStore";
import { JavaCompiledModule as JavaCompiledModule } from "./JavaCompiledModule";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import { CompilerWorkspace } from "../../common/module/CompilerWorkspace";
import type * as monaco from 'monaco-editor'


/**
 * A JavaModuleManager includes all Modules of a Java Workspace together with all library
 * Modules and thus represents a "Java Program".
 */
export class JavaCompiledModuleManager {

    modules: JavaCompiledModule[] = [];
    typestore: JavaTypeStore;

    overriddenOrImplementedMethodPaths: Record<string, boolean> = {};

    constructor(public workspace?: CompilerWorkspace){
        this.typestore = new JavaTypeStore();
    }

    copy(excludeTypesOfModule?: JavaCompiledModule): JavaCompiledModuleManager {
        let mm = new JavaCompiledModuleManager(this.workspace);
        mm.modules = this.modules.slice();
        mm.typestore = this.typestore.copy(excludeTypesOfModule);

        return mm;
    }

    addModule(module: JavaCompiledModule){
        this.modules.push(module);
    }

    getModuleFromFile(file: CompilerFile){
        return this.modules.find(m => m.file == file);
    }

    setupModulesBeforeCompiliation(files: CompilerFile[]){

        // only for webworker-compiler: replace old file objects by new ones
        let uniqueIDToNewFileMap: Map<number, CompilerFile> = new Map();
        for(let file of files){ uniqueIDToNewFileMap.set(file.uniqueID, file)};

        for(let module of this.modules){
            let newFile = uniqueIDToNewFileMap.get(module.file.uniqueID);
            if(newFile) module.file = newFile;
        }

        this.removeUnusedModulesAndMarkDependentModulesDirty(files);
        this.createNewModules(files);
    }

    emptyTypeStore() {
        this.typestore.empty();
    }

    setDependsOnModuleWithErrorsFlag(){
        this.modules.forEach(m => m.dependsOnModuleWithErrorsFlag = m.hasErrors());

        let done: boolean = false;
        while(!done){
            done = true;
            for(let module of this.modules){
                if(module.dependsOnModuleWithErrorsFlag) continue;
                // does module depend on dirty other module?
                if(module.dependsOnModuleWithErrors()){
                    module.dependsOnModuleWithErrorsFlag = true;
                    done = false;
                    break;
                }
            }
        }

    }

    iterativelySetDirtyFlags(){

        for(let module of this.modules){
            if(module.hasErrors()) module.setDirty(true);
        }

        let done: boolean = false;
        while(!done){
            done = true;
            for(let module of this.modules){
                if(module.isDirty()) continue;
                // does module depend on dirty other module?
                if(module.dependsOnOtherDirtyModule()){
                    module.setDirty(true);
                    done = false;
                    break;
                }
            }
        }

        for(let module of this.modules){
            if(module.isDirty()){
                module.resetBeforeCompilation();
            }
        }

    }

    createNewModules(files: CompilerFile[]){
        for(let file of files){
            if(!this.getModuleFromFile(file)){
                let newModule = new JavaCompiledModule(file, this);
                this.addModule(newModule);
            }
        }
    }

    removeUnusedModulesAndMarkDependentModulesDirty(files: CompilerFile[]){
        let unusedModules = this.modules.filter(m => files.indexOf(m.file) < 0);
        this.modules = this.modules.filter(m => files.indexOf(m.file) >= 0);

        for(let unusedModule of unusedModules){
            for(let usedModule of this.modules){
                if(usedModule.dependsOnModule(unusedModule)){
                    usedModule.setDirty(true);
                }
            }
        }
    }

    getNewOrDirtyModules(log: boolean = false): JavaCompiledModule[] {
//        if(log) console.log("Module-versions: " + this.modules.map(m => m.file.name + ": " + m.getLastCompiledMonacoVersion()).join(", "));

        return this.modules.filter(
            m => m.isDirty()
        );
    }

    getUnChangedModules(): JavaCompiledModule[] {
        return this.modules.filter(m => !m.isDirty());
    }

    compileModulesToJavascript(): boolean {
        for(let module of this.modules){
            if(!module.hasErrors()){
                for(let program of module.programsToCompileToFunctions){
                    if(!program.compileToJavascriptFunctions()) return false;
                }
            }
        }
        return true;
    }


    findModuleByFile(file: CompilerFile){
        return this.modules.find(m => m.file == file);
    }

    getTypeCompletionItems(module: JavaCompiledModule, rangeToReplace: monaco.IRange, classContext: NonPrimitiveType | StaticNonPrimitiveType| undefined): monaco.languages.CompletionItem[] {
        return this.typestore.getTypeCompletionItems(classContext, rangeToReplace, false, false);
    }

}