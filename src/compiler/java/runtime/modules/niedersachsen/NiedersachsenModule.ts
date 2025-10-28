import { CodeFragment } from "../../../../common/disassembler/CodeFragment";
import { JavaLibraryModule } from "../../../module/libraries/JavaLibraryModule";
import { SystemModule } from "../../system/SystemModule";
import { NiedersachsenDynArrayClass } from "./NiedersachsenDynArrayClass";
import { NiedersachsenBinTreeClass } from "./NiedersachsenBinTreeClass";
import { NiedersachsenStackClass } from "./NiedersachsenStackClass";
import { NiedersachsenQueueClass } from "./NiedersachsenQueueClass";



export class NiedersachsenModule extends JavaLibraryModule {


    constructor() {
        super();
        this.classesInterfacesEnums.push(
            NiedersachsenDynArrayClass, 
            NiedersachsenBinTreeClass, NiedersachsenStackClass,
            NiedersachsenQueueClass    
        )
    }


    isReplModule(): boolean {
        return false;
    }
    
    getCodeFragments(): CodeFragment[] {
        return [];
    }

    prepareSystemModule(systemModule: SystemModule): void {
        let classesToRemove: string[] = ['Stack', 'Queue', 'Deque', 'LinkedList', 'ArrayList', 'Vector'];
        systemModule.classesInterfacesEnums = systemModule.classesInterfacesEnums.filter(c => classesToRemove.indexOf(this.getName(c)) < 0);
    }
}