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
            description: 'Scratch-artige Klassenbibliothek (Stage, Sprite, Costumes) — Port von org.openpatch.scratch',
            id: 'scratch'
        },
        {
            identifier: 'Scratch for Java (NRW)',
            description: 'Scratch for Java zusammen mit den Abiturklassen Nordrhein-Westfalen: getAll, find und getTouchingSprites liefern die List des Zentralabiturs',
            id: 'scratch-nrw'
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

        // scratch-nrw is Scratch plus the NRW classes, so it stands in for either of them
        // when they are chosen as well: each module may be loaded only once.
        let scratchNrw = this.libraryIds.indexOf("scratch-nrw") >= 0;

        for (let lib of this.libraryIds) {
            switch (lib) {
                case "gng": additionalModules.push(new GNGModule());
                    break;
                case "nrw": if (!scratchNrw) additionalModules.push(new NRWModule());
                    break;
                case "niedersachsen": additionalModules.push(new NiedersachsenModule());
                    break;
                case "scratch": if (!scratchNrw) additionalModules.push(new ScratchModule());
                    break;
                case "scratch-nrw": additionalModules.push(new NRWModule(), new ScratchModule(true));
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