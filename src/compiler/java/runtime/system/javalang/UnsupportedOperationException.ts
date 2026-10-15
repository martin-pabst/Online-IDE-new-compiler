import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "./ExceptionClass.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class UnsupportedOperationExceptionClass extends ExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class UnsupportedOperationException extends RuntimeException"},
        {type: "method", signature: "public UnsupportedOperationException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public UnsupportedOperationException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public UnsupportedOperationException(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public UnsupportedOperationException(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]


    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }



}