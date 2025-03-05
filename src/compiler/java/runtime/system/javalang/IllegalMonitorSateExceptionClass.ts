import { IThrowable, Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ExceptionClass } from "./ExceptionClass.ts";
import { ObjectClass, StringClass } from "./ObjectClassStringClass.ts";
import { RuntimeExceptionClass } from "./RuntimeException.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class IllegalMonitorStateExceptionClass extends RuntimeExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class IllegalMonitorStateException extends RuntimeException"},
    ]


    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }



}