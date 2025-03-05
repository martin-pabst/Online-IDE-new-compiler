import type { CodeFragment } from "../../common/disassembler/CodeFragment";
import { deserializeLibraryDeclarations, LibraryDeclarations } from "../module/libraries/LibraryTypeDeclaration";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule";
import { SerializedLibraryClass } from "./WebworkerSystemModule";


export class WebworkerJavaLibraryModule extends JavaLibraryModule {

    constructor(serializedLibraryClasses: SerializedLibraryClass[]) {
        super();
        for (let slc of serializedLibraryClasses) {
            let klass = class {
                static __javaDeclarations = [];
            }
            deserializeLibraryDeclarations(slc.__javaDeclarations, klass);
            if (slc.enumValues) {
                let a = [];
                for (let ordinal = 0; ordinal < slc.enumValues.length; ordinal++) {
                    let enumValue = new klass();
                    enumValue["name"] = slc.enumValues[ordinal];
                    enumValue["ordinal"] = ordinal;
                }
                klass["values"] = a;
            }
            this.classesInterfacesEnums.push(klass);
        }
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }

}