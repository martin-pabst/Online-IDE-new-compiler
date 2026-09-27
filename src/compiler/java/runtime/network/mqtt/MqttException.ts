import type { Stacktrace } from "../../../../common/interpreter/ThrowableType";
import type { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import type { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ExceptionClass } from "../../system/javalang/ExceptionClass";
import { ThrowableClass } from "../../system/javalang/ThrowableClass";

export class MqttExceptionClass extends ExceptionClass {

    stacktrace: Stacktrace = [];

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", package: "mqtt", signature: "class MqttException extends Exception"},
        {type: "method", signature: "public MqttException()", native: ExceptionClass.prototype._constructor},
        {type: "method", signature: "public MqttException(String message)", native: ThrowableClass.prototype._constructor_m},
        {type: "method", signature: "public MqttException(Throwable cause)", native: ThrowableClass.prototype._constructor_c},
        {type: "method", signature: "public MqttException(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c},
        {type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString}
    ]


    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass){
        super();
    }



}