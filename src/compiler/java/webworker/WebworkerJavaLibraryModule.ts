import type { CodeFragment } from "../../common/disassembler/CodeFragment";
import { LibraryDeclarations } from "../module/libraries/DeclareType";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule";


type SerializedLibraryClass = {
    __javaDeclarations: LibraryDeclarations;
}


export class WebworkerJavaLibraryModule extends JavaLibraryModule {

        constructor(serializedLibraryClasses: SerializedLibraryClass[]){
            super();
            for(let slc of serializedLibraryClasses){
                let klass = class {
                    static __javaDeclarations = slc.__javaDeclarations;
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