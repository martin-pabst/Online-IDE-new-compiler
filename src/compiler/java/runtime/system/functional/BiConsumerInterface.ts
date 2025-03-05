import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";

export class BiConsumerInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface BiConsumer<T, U>"},
        {type: "method", signature: "void accept(T t, U u)", java: BiConsumerInterface.prototype._mj$accept$void$T$U},
    ]

    static type: NonPrimitiveType;

    _mj$accept$void$T$U(t: Thread, callback: CallbackFunction, tElement: ObjectClassOrNull, uElement: ObjectClassOrNull){}

}