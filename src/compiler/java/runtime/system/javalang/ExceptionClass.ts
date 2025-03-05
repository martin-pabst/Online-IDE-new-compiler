import { IThrowable, Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, StringClass } from "./ObjectClassStringClass.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class ExceptionClass extends ThrowableClass implements IThrowable {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Exception extends Throwable"},
        {type: "method", signature: "public Exception()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public Exception(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public Exception(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public Exception(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]


    static type: NonPrimitiveType;

    constructor(message?: string, public cause?: ThrowableClass){
        super();
    }



}