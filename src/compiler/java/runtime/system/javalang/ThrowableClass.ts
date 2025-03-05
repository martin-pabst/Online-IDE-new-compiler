import { Exception } from "../../../../common/interpreter/ExceptionInfo.ts";
import { IThrowable, Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { IRange } from "../../../../common/range/Range.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, StringClass } from "./ObjectClassStringClass.ts";

export class ThrowableClass extends ObjectClass implements IThrowable, Exception {

    stacktrace: Stacktrace = [];
    range?: IRange;
    file?: any;
    thread: any;


    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Throwable extends Object" },
        { type: "method", signature: "public Throwable()", native: ThrowableClass.prototype._constructor },
        { type: "method", signature: "public Throwable(String message)", native: ThrowableClass.prototype._constructor_m },
        { type: "method", signature: "public Throwable(Throwable cause)", native: ThrowableClass.prototype._constructor_c },
        { type: "method", signature: "public Throwable(String message, Throwable cause)", native: ThrowableClass.prototype._constructor_m_c },
        { type: "method", signature: "public String toString()", native: ThrowableClass.prototype._toString },
        { type: "method", signature: "public String getMessage()", native: ThrowableClass.prototype._getMessage },
    ]


    static type: NonPrimitiveType;

    constructor(public message?: string, public cause?: ThrowableClass) {
        super();
        this.message = this.message || "";
    }

    getThread() {
        return this.thread;
    }
    getFile() {
        return this.file;
    }

    getIdentifier(): string {
        return this.getClassName();
    }
    getExtendedImplementedIdentifiers(): string[] {
        return ThrowableClass.type.getExtendedImplementedIdentifiers();
    }

    getMessage(): string {
        return this.message || "";
    }

    _constructor_m(message: StringClass): ThrowableClass {
        this.message = message.value;
        return this;
    }

    _constructor_c(cause: ThrowableClass): ThrowableClass {
        this.cause = cause;
        return this;
    }

    _constructor_m_c(message: StringClass, cause: ThrowableClass): ThrowableClass {
        this.message = message.value;
        this.cause = cause;
        return this;
    }


    _toString() {
        return new StringClass(this.getClassName() + ": " + this.message ? this.message : "");
    }

    _getMessage() {
        return new StringClass(this.message ? this.message : "");
    }



}