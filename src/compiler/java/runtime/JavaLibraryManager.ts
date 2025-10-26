import { DatabaseModule } from "../../../client/libraries/java/database/DatabaseModule";
import { CheckboxState } from "../../../client/main/gui/Dialog";
import { Compiler } from "../../common/Compiler";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule";
import { GNGModule } from "./graphics/gng/GNGModule";
import { NiedersachsenModule } from "./modules/niedersachsen/NiedersachsenModule";
import { NRWModule } from "./modules/nrw/NRWModule";

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
        },
        {
            identifier: 'Abiturklassen Niedersachsen',
            description: 'Klassenbibliothek zur Verwendung im Abitur Niedersachsen',
            id: 'niedersachsen'
        },
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
                case "niedersachsen": additionalModules.push(new NiedersachsenModule());
                break;
            }
        }

        compiler.setAdditionalModules(...additionalModules);
    }

    addLibraries(...libraryIds){
        for(let libId of libraryIds){
            if(this.libraryIds.indexOf(libId) < 0){
                this.libraryIds.push(libId);
            }
        }
    }

}