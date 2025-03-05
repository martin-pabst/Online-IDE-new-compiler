import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass.ts";

export class ComparableInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Comparable<T>" , comment: JRC.comparableInterfaceComment},
        {type: "method", signature: "int compareTo(T object)", java: ComparableInterface.prototype._mj$compareTo$int$T , comment: JRC.comparableCompareToComment},
    ]

    static type: NonPrimitiveType;

    _mj$compareTo$int$T(t: Thread, callback: CallbackFunction, otherObject: ObjectClass){}

}