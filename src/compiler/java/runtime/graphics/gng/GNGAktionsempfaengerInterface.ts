import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../../system/javalang/InterfaceClass.ts";
import { IGNGEventListener } from "./IGNGEventListener.ts";

export class GNGAktionsempfaenger extends InterfaceClass implements IGNGEventListener {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface Aktionsempfaenger", comment: "GNG: Interface für die Aktionsausführung" },
        // events:
        { type: "method", signature: "void Ausführen()", java: GNGAktionsempfaenger.prototype._mj$Ausführen$void$, comment: "Diese Methode wird vom Taktgeber aufgerufen." },
        { type: "method", signature: "void Taste(char taste)", java: GNGAktionsempfaenger.prototype._mj$Taste$void$char, comment: "Wird aufgerufen, wenn eine Taste gedrückt wird." },
        { type: "method", signature: "void SonderTaste(int sondertaste)", java: GNGAktionsempfaenger.prototype._mj$SonderTaste$void$int, comment: "Wird aufgerufen, wenn eine SonderTaste gedrückt wird." },
        { type: "method", signature: "void Geklickt(int x, int y, int anzahl)", java: GNGAktionsempfaenger.prototype._mj$Geklickt$void$int$int$int, comment: "Wird aufgerufen, wenn eine die linke Maustaste gedrückt wird." },

    ];

    static type: NonPrimitiveType;




    // Eventlistener-dummies:
    _mj$AktionAusführen$void$(t: Thread, callback: () => void | undefined): void {
        throw new Error("Method not implemented.");
    }
    _mj$TasteGedrückt$void$char(t: Thread, callback: () => void | undefined, key: string): void {
        throw new Error("Method not implemented.");
    }
    _mj$SonderTasteGedrückt$void$int(t: Thread, callback: () => void | undefined, key: number): void {
        throw new Error("Method not implemented.");
    }
    _mj$MausGeklickt$void$int$int$int(t: Thread, callback: () => void | undefined, x: number, y: number, anzahl: number): void {
        throw new Error("Method not implemented.");
    }

    _mj$TaktImpulsAusführen$void$(t: Thread, callback: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }

    _mj$Ausführen$void$(t: Thread, callback: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }
    _mj$Taste$void$char(t: Thread, callback: (() => void) | undefined, key: string): void {
        throw new Error("Method not implemented.");
    }
    _mj$SonderTaste$void$int(t: Thread, callback: (() => void) | undefined, key: number): void {
        throw new Error("Method not implemented.");
    }
    _mj$Geklickt$void$int$int$int(t: Thread, callback: (() => void) | undefined, x: number, y: number, anzahl: number): void {
        throw new Error("Method not implemented.");
    }


}