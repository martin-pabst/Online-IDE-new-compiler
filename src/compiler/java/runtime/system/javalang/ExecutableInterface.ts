import type { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import type { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import type { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import type { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { InterfaceClass } from "./InterfaceClass";

export class ExecutableInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Executable" , comment: JRC.executableInterfaceComment},
        {type: "method", signature: "void execute()", java: ExecutableInterface.prototype._mj$execute$void$ , comment: JRC.comparableCompareToComment},
    ]

    static type: NonPrimitiveType;

    _mj$execute$void$(t: Thread, callback: CallbackFunction){}

}