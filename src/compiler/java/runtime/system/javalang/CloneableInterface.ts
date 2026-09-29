import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "./InterfaceClass.ts";

export class CloneableInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Cloneable" , comment: JRC.CloneableInterfaceComment}
    ]

    static type: NonPrimitiveType;

    _mj$run$void$(t: Thread, callback: CallbackFunction){}


}

