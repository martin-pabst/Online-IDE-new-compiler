import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../../system/javalang/InterfaceClass.ts";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";

export class ChangeListenerInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [

        { type: "declaration", signature: "interface GuiChangeListener", comment: JRC.ChangeListenerInterfaceComment },

        { type: "method", signature: "void onChange(Object changedObject, String newValue)", java: ChangeListenerInterface.prototype._mj$onChange$void$Object$String, comment: JRC.ChangeListenerOnChangeComment },
    ]

    static type: NonPrimitiveType;

    _mj$onChange$void$Object$String(t: Thread, callback: CallbackParameter, changedObject: ObjectClass, newValue: StringClass){

    }


}