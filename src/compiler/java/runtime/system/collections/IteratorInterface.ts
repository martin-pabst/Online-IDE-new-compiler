import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";

export class IteratorInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Iterator<E>" , comment: JRC.iteratorInterfaceComment},
        {type: "method", signature: "boolean hasNext()", java: IteratorInterface.prototype._mj$hasNext$boolean$ , comment: JRC.iteratorHasNextComment},
        {type: "method", signature: "E next()", java: IteratorInterface.prototype._mj$next$E$ , comment: JRC.iteratorNextComment},
    ]

    static type: NonPrimitiveType;

    _mj$hasNext$boolean$(t: Thread, callback: CallbackFunction){

    }

    _mj$next$E$(t: Thread, callback: CallbackFunction){

    }

}