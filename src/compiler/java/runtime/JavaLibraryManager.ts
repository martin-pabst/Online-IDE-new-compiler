import { DatabaseModule } from "../../../client/libraries/java/database/DatabaseModule";
import { Compiler } from "../../common/Compiler";
import { LibraryData, LibraryManager } from "../../common/programminglanguage/LibraryManager";
import { JavaCompiler } from "../JavaCompiler";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule";
import { GNGModule } from "./graphics/gng/GNGModule";
import { NiedersachsenModule } from "./modules/niedersachsen/NiedersachsenModule";
import { NRWModule } from "./modules/nrw/NRWModule";


export class JavaLibraryManager implements LibraryManager {

    private static libraries: LibraryData[] = [
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

    addLibrariesToCompiler(compiler: Compiler) {
        (<JavaCompiler>compiler).setAdditionalModules(...this.getAdditionalModules());
    }

    private getAdditionalModules(): JavaLibraryModule[] {
        let additionalModules: JavaLibraryModule[] = [
            new DatabaseModule()
        ]

        for (let lib of this.libraryIds) {
            switch (lib) {
                case "gng": additionalModules.push(new GNGModule());
                    break;
                case "nrw": additionalModules.push(new NRWModule());
                    break;
                case "niedersachsen": additionalModules.push(new NiedersachsenModule());
                    break;
            }
        }

        return additionalModules;
    }

    addLibraries(...libraryIds) {
        for (let libId of libraryIds) {
            if (this.libraryIds.indexOf(libId) < 0) {
                this.libraryIds.push(libId);
            }
        }
    }

    getLibrariesData(): LibraryData[] {
        return JavaLibraryManager.libraries;
    }

}