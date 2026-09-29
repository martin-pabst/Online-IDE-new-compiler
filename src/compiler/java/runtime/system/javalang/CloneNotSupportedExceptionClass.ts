import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "./ExceptionClass.ts";
import { RuntimeExceptionClass } from "./RuntimeException.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class CloneNotSupportedExceptionClass extends RuntimeExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class CloneNotSupportedException extends Exception"},
        {type: "method", signature: "public CloneNotSupportedException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public CloneNotSupportedException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public CloneNotSupportedException(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public CloneNotSupportedException(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]


    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }



}