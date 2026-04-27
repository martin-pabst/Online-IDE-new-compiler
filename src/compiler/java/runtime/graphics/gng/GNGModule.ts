import { CodeFragment } from "../../../../common/disassembler/CodeFragment.ts";
import { JavaLibraryModule } from "../../../module/libraries/JavaLibraryModule.ts";
import { GNGAktionsempfaenger } from "./GNGAktionsempfaengerInterface.ts";
import { GNGBaseFigur } from "./GNGBaseFigur.ts";
import { GNGDreieck } from "./GNGDreieck.ts";
import { GNGEreignisbehandlung } from "./GNGEreignisbehandlung.ts";
import { GNGFigur } from "./GNGFigur.ts";
import { GNGKreis } from "./GNGKreis.ts";
import { GNGRechteck } from "./GNGRechteck.ts";
import { GNGText } from "./GNGText.ts";
import { GNGTurtle } from "./GNGTurtle.ts";
import { GNGZeichenfensterClass } from "./GNGZeichenfenster.ts";

export class GNGModule extends JavaLibraryModule {


    constructor() {
        super();
        this.classesInterfacesEnums.push(
            // Graphics'n'Games (GNG)
            GNGBaseFigur, GNGKreis, GNGRechteck, GNGDreieck, GNGText, GNGFigur,
            GNGAktionsempfaenger, GNGZeichenfensterClass, GNGTurtle, GNGEreignisbehandlung
        )
    }


    isReplModule(): boolean {
        return false;
    }
    getCodeFragments(): CodeFragment[] {
        return [];
    }





}