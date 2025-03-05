import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";

export class ComparatorInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Comparator<T>" , comment: JRC.comparatorInterfaceComment},
        {type: "method", signature: "int compare(T object1, T object2)", java: ComparatorInterface.prototype._mj$compare$int$T$T , comment: JRC.compataratorCompareComment},
    ]

    static type: NonPrimitiveType;

    _mj$compare$int$T$T(t: Thread, callback: CallbackFunction, object1: ObjectClassOrNull, object2: ObjectClassOrNull){}

}