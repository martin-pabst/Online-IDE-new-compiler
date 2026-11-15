import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "./ExceptionClass.ts";
import { IllegalArgumentExceptionClass } from "./IllegalArgumentException.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class NumberFormatExceptionClass extends IllegalArgumentExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class NumberFormatException extends IllegalArgumentException", comment: JRC.NumberFormatExceptionClassComment},
        {type: "method", signature: "public NumberFormatException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public NumberFormatException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]

    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }

}
