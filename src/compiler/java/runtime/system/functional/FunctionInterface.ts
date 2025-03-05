import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass.ts";

export class FunctionInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Function<E,F>"},
        {type: "method", signature: "F apply(E e)", java: FunctionInterface.prototype._mj$apply$F$E},
    ]

    static type: NonPrimitiveType;

    _mj$apply$F$E(t: Thread, callback: CallbackFunction, element: ObjectClass){}

}