import { Klass } from "../../../common/interpreter/RuntimeConstants.ts";
import { CompilerFile } from "../../../common/module/CompilerFile";
import { EnumClass } from "../../runtime/system/javalang/EnumClass.ts";
import type { SystemModule } from "../../runtime/system/SystemModule.ts";
import { JavaEnum } from "../../types/JavaEnum.ts";
import { JavaType } from "../../types/JavaType";
import { SerializedLibraryClass, WebworkerSystemModule } from "../../webworker/WebworkerSystemModule.ts";
import { JavaBaseModule } from "../JavaBaseModule";
import { getSerializableCopyOfLibraryDeclarations, LibraryDeclarations } from "./LibraryTypeDeclaration.ts";

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

            let slc: SerializedLibraryClass = {
                __javaDeclarations: getSerializableCopyOfLibraryDeclarations(cie.__javaDeclarations)
            }
            if(Array.isArray(cie["values"])){
                slc.enumValues = cie.values.map((v: EnumClass) => v.name)
            }
            return slc;
        })
    }
}