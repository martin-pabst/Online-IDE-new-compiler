import { Klass } from "../../../common/interpreter/RuntimeConstants";
import type { SystemModule } from "../../runtime/system/SystemModule";
import { GenericTypeParameter } from "../../types/GenericTypeParameter";
import { JavaType } from "../../types/JavaType";
import { SerializedLibraryModuleManager } from "../../webworker/WebworkerJavaLibraryModuleManager";
import type { WebworkerSystemModule } from "../../webworker/WebworkerSystemModule";
import { JavaTypeStore } from "../JavaTypeStore";
import { getSerializableCopyOfLibraryDeclarations } from "./LibraryTypeDeclaration";
import { JavaLibraryModule } from "./JavaLibraryModule";
import { LibraryDeclarationParser } from "./LibraryDeclarationParser";
import type * as monaco from 'monaco-editor'


export class JavaLibraryModuleManager {

    private libraryModules: JavaLibraryModule[] = [];
    javaTypes: JavaType[] = [];
    typestore: JavaTypeStore;

    constructor(private additionalModules: JavaLibraryModule[], 
        private systemModule: SystemModule | WebworkerSystemModule){

            this.libraryModules.push(this.systemModule)
        if(additionalModules){
            this.libraryModules.push(...additionalModules);
        }

        for(let additionalModule of additionalModules){
            additionalModule.prepareSystemModule(this.systemModule);
        }

        this.typestore = new JavaTypeStore();
        this.compileClassesToTypes();

        let ldp: LibraryDeclarationParser = new LibraryDeclarationParser(this.systemModule);
        ldp.parseClassOrEnumOrInterfaceDeclarationWithoutGenerics(this.systemModule.primitiveStringClass, this.systemModule);
        ldp.parseClassOrInterfaceDeclarationGenericsAndExtendsImplements(this.systemModule.primitiveStringClass, this.typestore, this.systemModule);
        ldp.parseFieldsAndMethods(this.systemModule.primitiveStringClass, this.typestore, this.systemModule);

        this.typestore.initFastExtendsImplementsLookup();

    }

    compileClassesToTypes(){
        let ldp: LibraryDeclarationParser = new LibraryDeclarationParser(this.systemModule);
        this.typestore.empty;
        this.javaTypes = [];

        ldp.currentTypeStore = this.typestore;

        for(let module of this.libraryModules){
            for (let klass of module.classesInterfacesEnums) {
                let npt = ldp.parseClassOrEnumOrInterfaceDeclarationWithoutGenerics(klass, module);
                this.typestore.addType(npt);
                this.javaTypes.push(npt);
            }

            for(let type of module.types){
                this.typestore.addType(type);
                this.javaTypes.push(type);
            }

        }

        let classToGenericTypeParameterMap: Map<Klass, Record<string, GenericTypeParameter>> = new Map();

        for(let module of this.libraryModules){
            for(let klass of module.classesInterfacesEnums){
                let genericTypeParameterMap: Record<string, GenericTypeParameter> = {};
                classToGenericTypeParameterMap.set(klass, genericTypeParameterMap);
                ldp.genericParameterMapStack.push(genericTypeParameterMap);
                ldp.parseClassOrInterfaceDeclarationGenericsAndExtendsImplements(klass, this.typestore, module);
                ldp.genericParameterMapStack.pop();
            }
        }

        for(let module of this.libraryModules){
            for(let klass of module.classesInterfacesEnums){
                ldp.genericParameterMapStack.push(classToGenericTypeParameterMap.get(klass)!);
                ldp.parseFieldsAndMethods(klass, this.typestore, module);
                ldp.genericParameterMapStack.pop();
            }
        }

        for(let javaClass of this.typestore.getClasses()){
            javaClass.checkIfInterfacesAreImplementedAndSupplementDefaultMethods();
        }
    }

    getTypeCompletionItems(rangeToReplace: monaco.IRange): monaco.languages.CompletionItem[] {
        return this.typestore.getTypeCompletionItems(undefined, rangeToReplace, false, true);
    }

    getSerializedLibraryModuleManager(): SerializedLibraryModuleManager {
        let jd = this.systemModule.primitiveStringClass.__javaDeclarations.slice();
        for(let jd1 of jd){
            if(typeof jd1.comment == 'function') jd1.comment = jd1.comment();
        }

        let slmm: SerializedLibraryModuleManager = {
            additionalSerializedLibraryModules: this.additionalModules.map(am => am.getSerializedLibraryClasses()),
            serializedSystemClasses: this.systemModule.getSerializedLibraryClasses(),

            serializedPrimitiveStringClass: {
                __javaDeclarations: getSerializableCopyOfLibraryDeclarations(this.systemModule.primitiveStringClass.__javaDeclarations)
            }
        }

        return slmm;
    }

}