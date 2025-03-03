import { DatabaseModule } from "../../../client/libraries/java/database/DatabaseModule";
import { CheckboxState } from "../../../client/main/gui/Dialog";
import { Compiler } from "../../common/Compiler";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule";
import { JavaLibraryModuleManager } from "../module/libraries/JavaLibraryModuleManager";
import { GNGModule } from "./graphics/gng/GNGModule";
import { NRWModule } from "./modules/nrw/NRWModule";
import { PrimitiveStringClass } from "./system/javalang/PrimitiveStringClass";
import { SystemModule } from "./system/SystemModule";

export type LibraryData = {
    identifier: string,
    description: string,
    id: string,
    checkboxState?: CheckboxState
}

export class JavaLibraryManager {

    libraries: LibraryData[] = [
        {
            identifier: 'Graphics and Games Library',
            description: 'Graphische Klassenbibliothek für die bayerischen Informatikbücher des Cornelsen-Verlages',
            id: 'gng'
        },
        {
            identifier: 'Abiturklassen Nordrhein-Westfalen',
            description: 'Klassenbibliothek zur Verwendung im Zentralabitur Nordrhein-Westfalen',
            id: 'nrw'
        }
    ];

    libraryIds: string[] = [];

    addLibrariesToCompiler(compiler: Compiler){
        let additionalModules: JavaLibraryModule[] = [
            new DatabaseModule()
        ]

        for(let lib of this.libraryIds){
            switch(lib){
                case "gng": additionalModules.push(new GNGModule());
                break;
                case "nrw": additionalModules.push(new NRWModule());
                break;
            }
        }

        compiler.setLibraryModuleManager(new JavaLibraryModuleManager(additionalModules, new SystemModule(PrimitiveStringClass)));
    }

    addLibraries(...libraryIds){
        for(let libId of libraryIds){
            if(this.libraryIds.indexOf(libId) < 0){
                this.libraryIds.push(libId);
            }
        }
    }

}