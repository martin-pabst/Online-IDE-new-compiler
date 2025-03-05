import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { StringClass } from "../../javalang/ObjectClassStringClass";
import { NumberClass } from "./NumberClass";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Float.html
 */
export class FloatClass extends NumberClass {

    static isPrimitiveTypeWrapper: boolean = true;

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Float extends Number implements Comparable<Float>"},
        {type: "field", signature: "static final int MAX_VALUE", constantValue: Number.MAX_VALUE},
        {type: "field", signature: "static final int MIN_VALUE", constantValue: Number.MIN_VALUE},
        {type: "field", signature: "static final int POSITIVE_INFINITY", constantValue: Number.POSITIVE_INFINITY},
        {type: "field", signature: "static final int NEGATIVE_INFINITY", constantValue: Number.NEGATIVE_INFINITY},
        // for doubleValue(), floatValue(), intValue() and longValue() there are methods (if called for a Number variable containing an Long value) and templates
        // (if called fo Long variable). Offering templates to the compiler is only possible because the methods are final.

        {type: "method", signature: "public Float(float d)", native: FloatClass.prototype._constructorFloat},
        {type: "method", signature: "public final double doubleValue()", native: FloatClass.prototype.doubleValue, template: "§1.value"},
        {type: "method", signature: "public final float floatValue()", native: FloatClass.prototype.floatValue, template: "§1.value"},
        {type: "method", signature: "public final int intValue()", native: FloatClass.prototype.intValue, template: "(Math.trunc(§1.value) % 0x100000000 - 0x80000000)"},
        {type: "method", signature: "public final long longValue()", native: FloatClass.prototype.longValue, template: "Math.trunc(§1.value)"},
        {type: "method", signature: "public int compareTo(Float otherValue)", java: FloatClass.prototype._mj$compareTo$int$T},
        {type: "method", signature: "public static float parseFloat(String s)", native: FloatClass.parseFloat},
        {type: "method", signature: "public static Float valueOf(float f)", native: FloatClass.valueOf},
        {type: "method", signature: "public static Float valueOf(String s)", native: FloatClass.valueOfString},
    ]

    static type: NonPrimitiveType;

    constructor(i: number){
        super(i || 0);
    }

    _constructorFloat(d: number) {
        this.value = d;
        return this;
    }

    _mj$compareTo$int$T(t: Thread, callback: CallableFunction, otherValue: FloatClass){
        t.s.push(this.value - otherValue.value);
        if(callback) callback();
        return;
    }

    static parseFloat(s: StringClass){
        return Math.fround(Number.parseFloat(s.value));
    }

    intValue(){
        return Math.trunc(this.value) % 0x100000000 - 0x80000000;
    }

    longValue(){
        return Math.trunc(this.value);
    }

    floatValue(){
        return this.value;
    }

    doubleValue(){
        return this.value;
    }

    static valueOf(i: number){
        return new FloatClass(Math.fround(i));
    }

    static valueOfString(s: string): FloatClass {
        return new FloatClass(Math.fround(Number.parseFloat(s)));
    }

}