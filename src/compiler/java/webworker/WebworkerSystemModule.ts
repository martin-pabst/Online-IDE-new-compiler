import type { CodeFragment } from "../../common/disassembler/CodeFragment";
import { Klass } from "../../common/interpreter/StepFunction";
import { LibraryDeclarations } from "../module/libraries/DeclareType";
import { JavaLibraryModule, LibraryKlassType } from "../module/libraries/JavaLibraryModule";
import { NonPrimitiveType } from "../types/NonPrimitiveType";


export type SerializedLibraryClass = {
    __javaDeclarations: LibraryDeclarations;
}


export class WebworkerSystemModule extends JavaLibraryModule {

    public primitiveStringClass: Klass & LibraryKlassType;

    constructor(serializedLibraryClasses: SerializedLibraryClass[], serializedPrimitiveStringClass: SerializedLibraryClass) {
        super();
        for (let slc of serializedLibraryClasses) {
            let klass = class {
                static __javaDeclarations = slc.__javaDeclarations;
                static type: NonPrimitiveType;
            }
            this.classesInterfacesEnums.push(klass);
        }

        this.primitiveStringClass = class {
            static __javaDeclarations = serializedPrimitiveStringClass.__javaDeclarations;
            static type: NonPrimitiveType;
        }
    }

    isReplModule(): boolean {
        return false;
    }

    getCodeFragments(): CodeFragment[] {
        return [];
    }

}