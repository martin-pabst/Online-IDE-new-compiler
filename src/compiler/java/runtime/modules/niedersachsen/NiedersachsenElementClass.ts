import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";


export class NiedersachsenElementClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Element", comment: NiedersachsenLang.ElementClassComment },

        { type: "method", signature: "Element()", native: NiedersachsenElementClass.prototype._constructorEmpty },
        { type: "method", signature: "Element(Object inhalt, Element next)", native: NiedersachsenElementClass.prototype._constructorFull },

        { type: "method", signature: "String toString()", java: NiedersachsenElementClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
        { type: "field", signature: "Object inhalt", nativeIdentifier: "inhalt" },
        { type: "field", signature: "Element next", nativeIdentifier: "next" }
    ]

    static type: NonPrimitiveType;

    inhalt: ObjectClassOrNull = null;
    next: NiedersachsenElementClass = null;


    constructor() {
        super();
    }

    _constructorEmpty() {
        return this;
    }

    _constructorFull(inhalt: ObjectClassOrNull, next: NiedersachsenElementClass) {
        this.inhalt = inhalt;
        this.next = next;
        return this;
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {

        if (this.inhalt == null) {
            t.s.push(new StringClass("null"));
            if (callback) callback();
            return;
        }

        this.inhalt._mj$toString$String$(t, () => {
            let inhaltString = t.s.pop();
            let resultString = new StringClass("Element[inhalt=" + inhaltString.value + "]");
            t.s.push(resultString);
            if (callback) callback();
        });
    }


}