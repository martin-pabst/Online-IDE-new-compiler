import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";

export class RunnableInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Runnable" , comment: JRC.RunnableInterfaceComment},
        {type: "method", signature: "void run()", java: RunnableInterface.prototype._mj$run$void$ , comment: JRC.runnableRunComment},
    ]

    static type: NonPrimitiveType;

    _mj$run$void$(t: Thread, callback: CallbackFunction){}


}