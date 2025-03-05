import { Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { RuntimeExceptionClass } from "./RuntimeException.ts";
import { ThrowableClass } from "./ThrowableClass.ts";

export class MethodOfDestroyedGOExceptionClass extends RuntimeExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class MethodOfDestroyedObjectCalledException extends RuntimeException"},
    ]


    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }



}