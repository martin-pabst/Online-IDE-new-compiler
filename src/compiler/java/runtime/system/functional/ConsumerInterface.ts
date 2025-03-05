import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";

export class ConsumerInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Consumer<T>"},
        {type: "method", signature: "void accept(T t)", java: ConsumerInterface.prototype._mj$accept$void$T},
    ]

    static type: NonPrimitiveType;

    _mj$accept$void$T(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull){}

}