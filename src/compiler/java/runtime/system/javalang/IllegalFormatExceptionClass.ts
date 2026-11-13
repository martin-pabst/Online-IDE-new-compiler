import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "./ExceptionClass.ts";
import { IllegalArgumentExceptionClass } from "./IllegalArgumentException.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

/**
 * Thrown by String.format, String.formatted and PrintStream.printf when a format string
 * contains illegal syntax or a format specifier that is incompatible with the given arguments.
 * Java has many subclasses (MissingFormatArgumentException, UnknownFormatConversionException, ...);
 * here the name of the java subclass is part of the message instead.
 */
export class IllegalFormatExceptionClass extends IllegalArgumentExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class IllegalFormatException extends IllegalArgumentException", comment: JRC.IllegalFormatExceptionClassComment},
        {type: "method", signature: "public IllegalFormatException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public IllegalFormatException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public IllegalFormatException(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public IllegalFormatException(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]

    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }

}
