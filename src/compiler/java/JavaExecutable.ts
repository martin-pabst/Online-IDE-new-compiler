import { ExceptionTree } from "./codegenerator/ExceptionTree.ts";
import { JCM } from "./language/JavaCompilerMessages.ts";
import { JavaModuleManager } from "./module/JavaModuleManager.ts";
import { JavaLibraryModuleManager } from "./module/libraries/JavaLibraryModuleManager.ts";
import { JavaClass } from "./types/JavaClass.ts";
import { JavaMethod } from "./types/JavaMethod.ts";
import { NonPrimitiveType } from "./types/NonPrimitiveType.ts";
import { Error } from "../common/Error.ts";
import { KlassObjectRegistry } from "../common/interpreter/StepFunction.ts";
import { EmptyRange } from "../common/range/Range.ts";
import { Executable } from "../common/Executable.ts";


export class JavaExecutable extends Executable {
    
    
    #testClassToTestMethodMap?: Map<JavaClass, JavaMethod[]>
    
    constructor(public classObjectRegistry: KlassObjectRegistry,
        public moduleManager: JavaModuleManager,
        public libraryModuleManager: JavaLibraryModuleManager,
        public globalErrors: Error[],
        public exceptionTree: ExceptionTree
    ) {
        super(classObjectRegistry, globalErrors, exceptionTree);
        this.#setupStaticInitializationSequence(globalErrors);
        this.#setupDIInitializationSequence();
    }
    
    public getModuleManager(): JavaModuleManager {
        return this.moduleManager;
    }

    #setupStaticInitializationSequence(errors: Error[]) {
        const classesToInitialize: NonPrimitiveType[] = [];

        this.staticInitializationSequence = [];

        for (const module of this.moduleManager.getModules().filter(m => !m.hasErrors())) {
            if (!module.ast) continue;
            for (const cdef of module.ast.innerTypes) {
                if (cdef.resolvedType)
                    classesToInitialize.push(cdef.resolvedType);
            }
        }

        let done: boolean = false;
        while (!done && classesToInitialize.length > 0) {
            done = true;

            for (let i = 0; i < classesToInitialize.length; i++) {
                const cti = classesToInitialize[i];

                // does class depend on other class whose static initializer hasn't run yet?
                let dependsOnOthers: boolean = false;
                for (const cti1 of classesToInitialize) {
                    if (cti1 != cti && cti.staticConstructorsDependOn.get(cti1)) {
                        dependsOnOthers = true;
                        break;
                    }
                }

                if (!dependsOnOthers) {
                    if (cti.staticInitializer && cti.staticInitializer.stepsSingle.length > 0) {
                        this.staticInitializationSequence.push({
                            klass: cti.runtimeClass,
                            program: cti.staticInitializer
                        })
                    }
                    const index = classesToInitialize.indexOf(cti);
                    if (index >= 0) classesToInitialize.splice(index, 1);
                    i--;    // i++ follows immediately (end of for-loop)
                    done = false;
                }
            }
        }

        if (classesToInitialize.length > 0) {
            // cyclic references! => stop with error message
            const errorWithId = JCM.cyclicReferencesAmongStaticVariables(classesToInitialize.map(c => c.identifier).join(", "));
            errors.push({ message: errorWithId.message, id: errorWithId.id, level: "error", range: EmptyRange.instance });
        }
    }

    #setupDIInitializationSequence() {
        const diTypes: NonPrimitiveType[] = [];

        for (const module of this.moduleManager.getModules().filter(m => !m.hasErrors())) {
            if (!module.ast) continue;
            for (const cdef of module.ast.innerTypes) {
                const type = cdef.resolvedType;
                if (type && type.diInitializer && type.diInitializer.stepsSingle.length > 0) {
                    diTypes.push(type);
                }
            }
        }

        // topological sort based on @Inject dependencies among @Instance classes
        const sorted = this.#topologicalSortDITypes(diTypes);

        for (const type of sorted) {
            this.staticInitializationSequence.push({
                klass: type.runtimeClass!,
                program: type.diInitializer!
            });
        }
    }

    #topologicalSortDITypes(diTypes: NonPrimitiveType[]): NonPrimitiveType[] {
        const nameToType = new Map<string, NonPrimitiveType>();
        for (const type of diTypes) {
            if (type.diInstanceName) nameToType.set(type.diInstanceName, type);
        }

        const sorted: NonPrimitiveType[] = [];
        const visited = new Set<string>();

        const visit = (type: NonPrimitiveType) => {
            if (!type.diInstanceName || visited.has(type.diInstanceName)) return;
            visited.add(type.diInstanceName);

            const module = this.moduleManager.getModules().find(m => m.types.includes(type));
            if (module?.ast) {
                const cdef = module.ast.innerTypes.find(c => c.resolvedType === type);
                if (cdef) {
                    for (const fieldOrInit of (cdef as any).fieldsOrInstanceInitializers ?? []) {
                        const injectAnnotation = fieldOrInit.annotations?.find((a: any) => a.identifier === "Inject");
                        if (injectAnnotation?.parameter) {
                            const dep = nameToType.get(injectAnnotation.parameter);
                            if (dep) visit(dep);
                        }
                    }
                }
            }

            sorted.push(type);
        };

        for (const type of diTypes) visit(type);
        return sorted;
    }

    hasTests(): boolean {
        if(!this.#testClassToTestMethodMap) this.getTestMethods();
        return this.#testClassToTestMethodMap.size > 0;
    }

    getTestMethods(): Map<JavaClass, JavaMethod[]> {
        if (this.#testClassToTestMethodMap) return this.#testClassToTestMethodMap;
        this.#testClassToTestMethodMap = new Map();
        for (const module of this.moduleManager.getModules()) {
            for (const type of module.types) {
                if (type instanceof JavaClass) {
                    const testMethods2 = type.getOwnMethods()
                        .filter(m => !m.isConstructor && m.hasAnnotation("Test") && m.returnParameterType?.identifier == "void" && m.parameters.length == 0);

                    if(testMethods2.length == 0) continue;

                    let list = this.#testClassToTestMethodMap.get(type);
                    if(!list){
                        list = [];
                        this.#testClassToTestMethodMap.set(type, list);
                    }
                    list.push(...testMethods2);
                }
            }
        }

        return this.#testClassToTestMethodMap;
    }

}