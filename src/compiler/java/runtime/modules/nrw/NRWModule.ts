import { CodeFragment } from "../../../../common/disassembler/CodeFragment";
import { JavaLibraryModule } from "../../../module/libraries/JavaLibraryModule";
import { SystemModule } from "../../system/SystemModule";
import { NRWBinarySearchTreeClass } from "./NRWBinarySearchTreeClass";
import { NRWBinaryTreeClass } from "./NRWBinaryTreeClass";
import { NRWComparableContentInterface } from "./NRWComparableContentInterface";
import { NRWDatabaseConnectorClass } from "./NRWDatabaseConnectorClass";
import { NRWEdgeClass } from "./NRWEdgeClass";
import { NRWGraphClass } from "./NRWGraphClass";
import { NRWListClass } from "./NRWListClass";
import { NRWQueryResultClass } from "./NRWQueryResultClass";
import { NRWQueueClass } from "./NRWQueueClass";
import { NRWStackClass } from "./NRWStackClass";
import { NRWVertexClass } from "./NRWVertexClass";


export class NRWModule extends JavaLibraryModule {


    constructor() {
        super();
        this.classesInterfacesEnums.push(
            NRWListClass, NRWQueueClass, NRWStackClass,   // 01 lineare Datenstrukturen
            NRWComparableContentInterface, NRWBinaryTreeClass, NRWBinarySearchTreeClass,  // 02 Baum            
            NRWVertexClass, NRWEdgeClass, NRWGraphClass, // 03 Graph
            NRWQueryResultClass, NRWDatabaseConnectorClass // 04 Database
        )
    }


    isReplModule(): boolean {
        return false;
    }
    
    getCodeFragments(): CodeFragment[] {
        return [];
    }

    prepareSystemModule(systemModule: SystemModule): void {
        // let classesToRemove: string[] = ['List', 'ArrayList', 'LinkedList', 'Vector', 'Stack', 'Queue', 'Deque', 'CopyOnWriteArrayList'];
        // systemModule.classesInterfacesEnums = systemModule.classesInterfacesEnums.filter(c => classesToRemove.indexOf(this.getName(c)) < 0);
    }

    getStandardImports(): string[][] {
        return [["nrw", "*"]];
    }

}