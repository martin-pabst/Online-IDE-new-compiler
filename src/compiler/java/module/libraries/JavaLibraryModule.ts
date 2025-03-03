import { Klass } from "../../../common/interpreter/StepFunction.ts";
import { CompilerFile } from "../../../common/module/CompilerFile";
import type { SystemModule } from "../../runtime/system/SystemModule.ts";
import { JavaType } from "../../types/JavaType";
import { SerializedLibraryClass, WebworkerSystemModule } from "../../webworker/WebworkerSystemModule.ts";
import { JavaBaseModule } from "../JavaBaseModule";
import { LibraryDeclarations } from "./DeclareType.ts";

export type LibraryKlassType = {

    __javaDeclarations: LibraryDeclarations;

}

export type JavaTypeMap = { [identifier: string]: JavaType };

export abstract class JavaLibraryModule extends JavaBaseModule {
    
    prepareSystemModule(systemModule: SystemModule | WebworkerSystemModule) {
    }

    classesInterfacesEnums: (Klass & LibraryKlassType)[] = [];

    constructor() {
        super(new CompilerFile("Library file"), true);
        this.setDirty(false);
    }

    getName(klass: Klass & LibraryKlassType): string {
        let declaration = klass.__javaDeclarations.find(jd => jd.type == 'declaration');
        if(!declaration) return '';
        let signature = declaration.signature;
        let match = signature.match(/^(class|enum|interface)\s([\wöäüßÖÄÜ]*)[<\s].*$/);
        if(match && match[2]){
            return match[2];
        }

        return '';
    }

    getSerializedLibraryClasses(): SerializedLibraryClass[] {
        return this.classesInterfacesEnums.map(cie => {
            let ld = cie.__javaDeclarations.slice();
            for(let ld1 of ld){
                if(typeof ld1.comment == "function") ld1.comment = ld1.comment();
            }
            return {
                __javaDeclarations: cie.__javaDeclarations
            }
        })
    }
}