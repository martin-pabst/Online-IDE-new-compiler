import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { IWorld } from "../IWorld.ts";
import { IGNGEventListener } from "./IGNGEventListener.ts";

export class GNGEreignisbehandlung extends ObjectClass implements IGNGEventListener {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Ereignisbehandlung extends Object", comment: "Zugriff auf Ereignisse einschließlich Taktgeber (Graphics'n Games-Bibliothek (Cornelsen-Verlag))" },
        { type: "method", signature: "Ereignisbehandlung()", java: GNGEreignisbehandlung.prototype._cj$_constructor_$Ereignisbehandlung$, comment: "Instanziert ein neues Ereignisbehandlungs-Objekt." },

        { type: "method", signature: "void Starten()", native: GNGEreignisbehandlung.prototype._Starten, comment: "Zeitgeber starten." },
        { type: "method", signature: "void Anhalten()", native: GNGEreignisbehandlung.prototype._Anhalten, comment: "Zeitgeber anhalten." },
        { type: "method", signature: "void TaktdauerSetzen(int dauer)", native: GNGEreignisbehandlung.prototype._TaktdauerSetzen, comment: "Setzt die Taktdauer des Zeitgebers in Millisekunden." },

        // events:
        { type: "method", signature: "void TaktImpulsAusführen()", java: GNGEreignisbehandlung.prototype._mj$TaktImpulsAusführen$void$, comment: "Diese Methode wird vom Taktgeber aufgerufen." },
        { type: "method", signature: "void TasteGedrückt(char taste)", java: GNGEreignisbehandlung.prototype._mj$TasteGedrückt$void$char, comment: "Wird aufgerufen, wenn eine Taste gedrückt wird." },
        { type: "method", signature: "void SonderTasteGedrückt(int sondertaste)", java: GNGEreignisbehandlung.prototype._mj$SonderTasteGedrückt$void$int, comment: "Wird aufgerufen, wenn eine SonderTaste gedrückt wird." },
        { type: "method", signature: "void MausGeklickt(int x, int y, int anzahl)", java: GNGEreignisbehandlung.prototype._mj$MausGeklickt$void$int$int$int, comment: "Wird aufgerufen, wenn eine die linke Maustaste gedrückt wird." },

    ];

    static type: NonPrimitiveType;

    world!: IWorld;

    _cj$_constructor_$Ereignisbehandlung$(t: Thread, callback: CallbackFunction) {
        t.s.push(this);

        this.world = t.scheduler.interpreter.retrieveObject("WorldClass");
        if(!this.world){
            new t.classes["World"]()._cj$_constructor_$World$(t, () => {
                this.world = t.s.pop();
                this.constructorHelper(t);
                if(callback) callback();
            });
        } else {
            this.constructorHelper(t);
            if(callback) callback();
        }

    }

    constructorHelper(t: Thread){
        if(this._mj$TaktImpulsAusführen$void$ != GNGEreignisbehandlung.prototype._mj$TaktImpulsAusführen$void$){
            this.world.registerGNGEventListener(this, "taktImpulsAusführen");
        }

        if(this._mj$TasteGedrückt$void$char != GNGEreignisbehandlung.prototype._mj$TasteGedrückt$void$char){
            this.world.registerGNGEventListener(this, "tasteGedrückt");
        }

        if(this._mj$SonderTasteGedrückt$void$int != GNGEreignisbehandlung.prototype._mj$SonderTasteGedrückt$void$int){
            this.world.registerGNGEventListener(this, "sondertasteGedrückt");
        }

        if(this._mj$MausGeklickt$void$int$int$int != GNGEreignisbehandlung.prototype._mj$MausGeklickt$void$int$int$int){
            this.world.registerGNGEventListener(this, "mausGeklickt");
        }

    }



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

    _Starten(){
        this.world.gngEventlistenerManager.startTimer();
    }

    _Anhalten(){
        this.world.gngEventlistenerManager.stopTimer();
    }

    _TaktdauerSetzen(dauer: number){
        this.world.gngEventlistenerManager.taktdauer = dauer;
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