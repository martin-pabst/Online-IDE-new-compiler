import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { IWorld } from "../IWorld";
import { GNGAktionsempfaenger } from "./GNGAktionsempfaengerInterface";
import { GNGEventListenerType, GNGEventListenerTypes } from "./IGNGEventListener";


export class GNGZeichenfensterClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Zeichenfenster extends Object", comment: "Grafische Zeichenfläche mit Koordinatensystem"},

        {type: "method", signature: "static int MalflächenBreiteGeben()", java: GNGZeichenfensterClass._mj$MalflächenBreiteGeben$int$, comment: "Gibt die Breite des Zeichenbereichs in Pixeln zurück."},
        {type: "method", signature: "static int MalflächenHöheGeben()", java: GNGZeichenfensterClass._mj$MalflächenHöheGeben$int$, comment: "Gibt die Höhe des Zeichenbereichs in Pixeln zurück."},
        {type: "method", signature: "static void AktionsEmpfängerEintragen(Aktionsempfaenger aktionsempfaenger)", java: GNGZeichenfensterClass._mj$AktionsEmpfängerEintragen$void$Aktionsempfaenger, comment: "Trägt einen neuen Aktionsempfänger ein."},
        {type: "method", signature: "static void AktionsEmpfängerEntfernen(Aktionsempfaenger aktionsempfaenger)", java: GNGZeichenfensterClass._mj$AktionsEmpfängerEntfernen$void$Aktionsempfaenger, comment: "Entfernt einen Aktionsempfänger."},
        {type: "method", signature: "static void TaktgeberStarten()", java: GNGZeichenfensterClass._mj$TaktgeberStarten$void$, comment: "Startet den Taktgeber."},
        {type: "method", signature: "static void TaktgeberStoppen()", java: GNGZeichenfensterClass._mj$TaktgeberStoppen$void$, comment: "Stoppt den Taktgeber."},
        {type: "method", signature: "static void TaktdauerSetzen(int dauer)", java: GNGZeichenfensterClass._mj$TaktdauerSetzen$void$int, comment: "Setzt die Taktdauer des Zeitgebers in Millisekunden."},
    ];

    static type: NonPrimitiveType;

    static getWorld(t: Thread, callback: (world: IWorld) => void){
        let world = t.scheduler.interpreter.retrieveObject("WorldClass") as IWorld;
        if(!world){
            new t.classes["World"]()._cj$_constructor_$World$(t, () => {
                world = t.s.pop();
                if(callback) callback(world);
            });
        } else {
            if(callback) callback(world);
        }

    }

    static _mj$MalflächenBreiteGeben$int$(t: Thread){
        let world = t.scheduler.interpreter.retrieveObject("WorldClass") as IWorld;
        if(world){
            return world.currentWidth;
        } else {
            return 800;
        }
    }

    static _mj$MalflächenHöheGeben$int$(t: Thread){
        let world = t.scheduler.interpreter.retrieveObject("WorldClass") as IWorld;
        if(world){
            return world.currentHeight;
        } else {
            return 600;
        }
    }

    static _mj$AktionsEmpfängerEintragen$void$Aktionsempfaenger(t: Thread, aktionsempfaenger: GNGAktionsempfaenger){
        GNGZeichenfensterClass.getWorld(t, (world) => {
                let types: GNGEventListenerType[] = ["ausführen", "taste", "sondertaste", "geklickt"];
                for(let type of types){
                    world.gngEventlistenerManager.registerEventlistener(aktionsempfaenger, type);
                }
        })
    }

    static _mj$AktionsEmpfängerEntfernen$void$Aktionsempfaenger(t: Thread, aktionsempfaenger: GNGAktionsempfaenger){
        GNGZeichenfensterClass.getWorld(t, (world) => {
                let types: GNGEventListenerType[] = ["ausführen", "taste", "sondertaste", "geklickt"];
                for(let type of types){
                    world.gngEventlistenerManager.removeEventlistener(aktionsempfaenger, type);
                }
        })
    }

    static _mj$TaktgeberStarten$void$(t: Thread){
        GNGZeichenfensterClass.getWorld(t, (world) => {
            world.gngEventlistenerManager.startTimer();
        })
    }

    static _mj$TaktgeberStoppen$void$(t: Thread){
        GNGZeichenfensterClass.getWorld(t, (world) => {
            world.gngEventlistenerManager.stopTimer();
        })
    }

    static _mj$TaktdauerSetzen$void$int(t: Thread, dauer: number){
        GNGZeichenfensterClass.getWorld(t, (world) => {
            world.gngEventlistenerManager.taktdauer = dauer;
        })
    }



}
