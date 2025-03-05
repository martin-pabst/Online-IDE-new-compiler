import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "./ExceptionClass.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class FileNotFoundExceptionClass extends ExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class FileNotFoundException extends Exception"},
        {type: "method", signature: "public FileNotFoundException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public FileNotFoundException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public FileNotFoundException(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public FileNotFoundException(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]


    static type: NonPrimitiveType;

    constructor(public filename: string, public cause?: ThrowableClass){
        super(JRC.FileNotFoundExceptionComment(filename), cause);
    }



}