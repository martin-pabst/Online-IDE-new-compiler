import { Klass } from "../../../common/interpreter/StepFunction.ts";
import { CompilerFile } from "../../../common/module/CompilerFile";
import type { SystemModule } from "../../runtime/system/SystemModule.ts";
import { JavaType } from "../../types/JavaType";
import { JavaBaseModule } from "../JavaBaseModule";
import { LibraryDeclarations } from "./DeclareType.ts";

export type LibraryKlassType = {

    __javaDeclarations: LibraryDeclarations;

}

export type JavaTypeMap = { [identifier: string]: JavaType };

export abstract class JavaLibraryModule extends JavaBaseModule {
    
    prepareSystemModule(systemModule: SystemModule) {
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

    clearAllBreakpoints(): void {
        // Nothing to do   
    }
}