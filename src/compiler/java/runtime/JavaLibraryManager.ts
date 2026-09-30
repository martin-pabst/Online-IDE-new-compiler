import { DatabaseModule } from "../../../client/libraries/java/database/DatabaseModule";
import { Compiler } from "../../common/Compiler";
import { LibraryData, LibraryManager } from "../../common/programminglanguage/LibraryManager";
import { JavaCompiler } from "../JavaCompiler";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule";
import { GNGModule } from "./graphics/gng/GNGModule";
import { ScratchModule } from "./graphics/scratch/ScratchModule";
import { NiedersachsenModule } from "./modules/niedersachsen/NiedersachsenModule";
import { NRWModule } from "./modules/nrw/NRWModule";


export class JavaLibraryManager implements LibraryManager {

    static libraries: LibraryData[] = [
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
        {
            identifier: 'Scratch for Java',
            description: 'Scratch-artige Klassenbibliothek (Stage, Sprite, Costumes) — Port von org.openpatch.scratch. Zusammen mit den Abiturklassen NRW liefern getAll, find und getTouchingSprites deren List',
            id: 'scratch'
        },
    ];

    libraryIds: string[] = [];

    addLibrariesToCompiler(compiler: Compiler) {
        (<JavaCompiler>compiler).setAdditionalModules(...this.getAdditionalModules());
    }

    public getAdditionalModules(): JavaLibraryModule[] {
        let additionalModules: JavaLibraryModule[] = [
            new DatabaseModule()
        ]

        // Scratch next to the NRW classes is the NRW build of Scratch for Java: nrw.* makes
        // a student's List the nrw List, so getAll, find and getTouchingSprites hand out
        // that List too; with java.util.List they could not be used together at all.
        let nrwLists = this.libraryIds.indexOf("nrw") >= 0;

        for (let lib of this.libraryIds) {
            switch (lib) {
                case "gng": additionalModules.push(new GNGModule());
                    break;
                case "nrw": additionalModules.push(new NRWModule());
                    break;
                case "niedersachsen": additionalModules.push(new NiedersachsenModule());
                    break;
                case "scratch": additionalModules.push(new ScratchModule(nrwLists));
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