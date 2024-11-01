import { ExceptionTree } from "../java/codegenerator/ExceptionTree.ts";
import { JCM } from "../java/language/JavaCompilerMessages.ts";
import { JavaModuleManager } from "../java/module/JavaModuleManager";
import { JavaLibraryModuleManager } from "../java/module/libraries/JavaLibraryModuleManager.ts";
import { JavaClass } from "../java/types/JavaClass.ts";
import { JavaMethod } from "../java/types/JavaMethod.ts";
import { NonPrimitiveType } from "../java/types/NonPrimitiveType";
import { Error } from "./Error";
import { Program } from "./interpreter/Program";
import { Klass, KlassObjectRegistry } from "./interpreter/StepFunction";
import { CompilerFile } from "./module/CompilerFile";
import { Module } from "./module/Module";
import { EmptyRange } from "./range/Range";

type StaticInitializationStep = {
    klass: Klass,
    program: Program
}

export class Executable {

    staticInitializationSequence: StaticInitializationStep[] = [];

    mainModule?: Module;
    testModule?: Module;

    testClassToTestMethodMap?: Map<JavaClass, JavaMethod[]>

    isCompiledToJavascript: boolean = false;

    constructor(public classObjectRegistry: KlassObjectRegistry,
        public moduleManager: JavaModuleManager,
        public libraryModuleManager: JavaLibraryModuleManager,
        public globalErrors: Error[],
        public exceptionTree: ExceptionTree,
        lastOpenedFile?: CompilerFile, currentlyOpenedModule?: Module) {

        this.findMainModule(false, lastOpenedFile, currentlyOpenedModule);

        this.#setupStaticInitializationSequence(globalErrors);

    }

    compileToJavascript() {
        if (!this.isCompiledToJavascript) {
            if (this.moduleManager.compileModulesToJavascript()) {
                this.isCompiledToJavascript = true;
            }
        }
    }

    #setupStaticInitializationSequence(errors: Error[]) {
        let classesToInitialize: NonPrimitiveType[] = [];

        this.staticInitializationSequence = [];

        for (let module of this.moduleManager.modules) {
            if (!module.ast) continue;
            for (let cdef of module.ast.innerTypes) {
                if (cdef.resolvedType)
                    classesToInitialize.push(cdef.resolvedType);
            }
        }

        let done: boolean = false;
        while (!done && classesToInitialize.length > 0) {
            done = true;

            for (let i = 0; i < classesToInitialize.length; i++) {
                let cti = classesToInitialize[i];

                // does class depend on other class whose static initializer hasn't run yet?
                let dependsOnOthers: boolean = false;
                for (let cti1 of classesToInitialize) {
                    if (cti1 != cti && cti.staticConstructorsDependOn.get(cti1)) {
                        dependsOnOthers = true;
                        break;
                    }
                }

                if (!dependsOnOthers) {
                    if (cti.staticInitializer && cti.staticInitializer.stepsSingle.length > 0) {
                        this.staticInitializationSequence.push({
                            klass: cti.runtimeClass!,
                            program: cti.staticInitializer
                        })
                    }
                    let index = classesToInitialize.indexOf(cti);
                    if (index >= 0) classesToInitialize.splice(index, 1);
                    i--;    // i++ follows immediately (end of for-loop)
                    done = false;
                }

            }

        }

        if (classesToInitialize.length > 0) {
            // cyclic references! => stop with error message
            let errorWithId = JCM.cyclicReferencesAmongStaticVariables(classesToInitialize.map(c => c.identifier).join(", "));
            errors.push({ message: errorWithId.message, id: errorWithId.id, level: "error", range: EmptyRange.instance });
        }


    }

    hasTests(): boolean {
        if(!this.testClassToTestMethodMap) this.getTestMethods();
        return this.testClassToTestMethodMap!.size > 0;
    }

    getTestMethods(): Map<JavaClass, JavaMethod[]> {
        if(this.testClassToTestMethodMap) return this.testClassToTestMethodMap;
        this.testClassToTestMethodMap = new Map();
        for (let module of this.moduleManager.modules) {
            for (let type of module.types) {
                if (type instanceof JavaClass) {
                    let testMethods2 = type.getOwnMethods()
                        .filter(m => !m.isConstructor && m.hasAnnotation("Test") && m.returnParameterType?.identifier == "void" && m.parameters.length == 0);

                    if(testMethods2.length == 0) continue;

                    let list = this.testClassToTestMethodMap.get(type);
                    if(!list){
                        list = [];
                        this.testClassToTestMethodMap.set(type, list);
                    }
                    list.push(...testMethods2);
                }
            }
        }

        return this.testClassToTestMethodMap;
    }

    findMainModule(unitTestMode: boolean, lastOpenedFile?: CompilerFile, currentlyOpenedModule?: Module) {
        if (unitTestMode) {
            this.mainModule = this.moduleManager.modules.find(m => m.isStartable());
        }

        if(currentlyOpenedModule){
            if (currentlyOpenedModule.isStartable()) {
                this.mainModule = currentlyOpenedModule;
            } else if(!currentlyOpenedModule.hasErrors()) {
                let lastOpenedModule = this.findModuleByFile(lastOpenedFile);
                if (lastOpenedModule?.isStartable()) {
                    this.mainModule = lastOpenedModule;
                } else {
                    // find first startable module...
                    this.mainModule = this.moduleManager.modules.find(m => m.isStartable());
                }
            }
        }

    }

    findModuleByFile(file?: CompilerFile): Module | undefined {
        if (!file) return undefined;
        return this.moduleManager.modules.find(m => m.file == file);
    }

    getAllErrors(): Error[] {

        let errors: Error[] = this.globalErrors;

        for (let module of this.moduleManager.modules) {
            errors = errors.concat(module.errors);
        }

        return errors;

    }

}