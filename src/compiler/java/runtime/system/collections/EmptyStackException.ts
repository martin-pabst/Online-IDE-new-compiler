import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "../javalang/ExceptionClass.ts";
import { RuntimeExceptionClass } from "../javalang/RuntimeException.ts";
import { ThrowableClass } from "../javalang/ThrowableClass.ts";

export class EmptyStackExceptionClass extends RuntimeExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class EmptyStackException extends RuntimeException"},
        {type: "method", signature: "public EmptyStackException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public EmptyStackException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public EmptyStackException(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public EmptyStackException(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]


    static type: NonPrimitiveType;

    constructor(){
        super(JRC.emptyStackException());
    }



}