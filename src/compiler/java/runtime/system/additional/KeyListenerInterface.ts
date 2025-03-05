import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { StringClass } from "../javalang/ObjectClassStringClass.ts";

export class KeyListenerInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface KeyListener" },
        { type: "method", signature: "void onKeyTyped(String key)", java: KeyListenerInterface.prototype._mj$onKeyTyped$void$String, comment: JRC.KeyListenerOnKeyTypedComment },
    ]

    static type: NonPrimitiveType;

    _mj$onKeyTyped$void$String(t: Thread, callback: CallbackFunction, key: StringClass) { };

}