import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../../system/javalang/InterfaceClass.ts";
import { ObjectClassOrNull } from "../../system/javalang/ObjectClassStringClass.ts";
import { NRWLang } from "./NRWLang.ts";


export class NRWComparableContentInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface ComparableContent<ContentType>", comment: NRWLang.comparableContentInterfaceComment },

        { type: "method", signature: "boolean isGreater(ContentType pContent)", java: NRWComparableContentInterface.prototype._mj$isGreater$boolean$ContentType, comment: NRWLang.comparableContentIsGreaterComment },
        { type: "method", signature: "boolean isLess(ContentType pContent)", java: NRWComparableContentInterface.prototype._mj$isLess$boolean$ContentType, comment: NRWLang.comparableContentIsLessComment },
        { type: "method", signature: "boolean isEqual(ContentType pContent)", java: NRWComparableContentInterface.prototype._mj$isEqual$boolean$ContentType, comment: NRWLang.comparableContentIsEqualComment },
        //
    ]

    static type: NonPrimitiveType;

    _mj$isGreater$boolean$ContentType(t: Thread, callback: CallbackFunction, otherObject: NRWComparableContentInterface){
        
    }

    _mj$isLess$boolean$ContentType(t: Thread, callback: CallbackFunction, otherObject: NRWComparableContentInterface){

    }

    _mj$isEqual$boolean$ContentType(t: Thread, callback: CallbackFunction, otherObject: NRWComparableContentInterface){

    }

}