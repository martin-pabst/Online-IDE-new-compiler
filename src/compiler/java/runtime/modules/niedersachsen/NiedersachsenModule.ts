import { N } from "vitest/dist/chunks/reporters.nr4dxCkA";
import { CodeFragment } from "../../../../common/disassembler/CodeFragment";
import { JavaLibraryModule } from "../../../module/libraries/JavaLibraryModule";
import { SystemModule } from "../../system/SystemModule";
import { NiedersachsenElementClass } from "./NiedersachsenElementClass";
import { NiedersachsenDynArrayClass } from "./NiedersachsenDynArrayClass";
import { NiedersachsenBinTreeClass } from "./NiedersachsenBinTreeClass";
import { NiedersachsenStackClass } from "./NiedersachsenStackClass";
import { NiedersachsenQueueClass } from "./NiedersachsenQueueClass";



export class NiedersachsenModule extends JavaLibraryModule {


    constructor() {
        super();
        this.classesInterfacesEnums.push(
            NiedersachsenElementClass, NiedersachsenDynArrayClass, 
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
        let classesToRemove: string[] = ['List', 'ArrayList', 'LinkedList', 'Vector', 'Stack', 'Queue', 'Deque', 'CopyOnWriteArrayList', 'Collections'];
        systemModule.classesInterfacesEnums = systemModule.classesInterfacesEnums.filter(c => classesToRemove.indexOf(this.getName(c)) < 0);
    }

}