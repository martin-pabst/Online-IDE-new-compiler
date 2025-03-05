import { CallbackFunction } from "../../../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../javalang/ObjectClassStringClass";
import { IPrimitiveTypeWrapper } from "./IPrimitiveTypeWrapper";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Integer.html
 */
export class NumberClass extends ObjectClass implements IPrimitiveTypeWrapper {

    value: number = 0;

    static isPrimitiveTypeWrapper: boolean = true;

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "abstract class Number extends Object"},
        {type: "method", signature: "public byte byteValue()", native: NumberClass.prototype.byteValue},
        {type: "method", signature: "public short shortValue()", native: NumberClass.prototype.shortValue},
        {type: "method", signature: "abstract public double doubleValue()"},
        {type: "method", signature: "abstract public float floatValue()"},
        {type: "method", signature: "abstract public int intValue()"},
        {type: "method", signature: "abstract public long longValue()"},
        {type: "method", signature: "public String toString()", native: NumberClass.prototype.toString, java: NumberClass.prototype._mj$toString$String$}
    ]

    static type: NonPrimitiveType;

    constructor(n: number){
        super();
        this.value = n;
    }

    debugOutput(): string {
        return "" + this.value;
    }

    __internalHashCode(): any {
        return this.value;
    }

    byteValue(){
        return (Math.trunc(this.value) + 0x80) % 0x100 - 0x80;
    }

    shortValue(){
        return (Math.trunc(this.value) + 0x8000) % 0x10000 - 0x8000;
    }

    toString(): StringClass {
        return new StringClass("" + this.value);
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        t.s.push(new StringClass("" + this.value));
        if(callback) callback();
    }

    _mj$equals$boolean$Object(t: Thread, callback: CallbackFunction, otherNumber: NumberClass){
        t.s.push(otherNumber != null && otherNumber.value == this.value);
        if(callback) callback();
    }
}