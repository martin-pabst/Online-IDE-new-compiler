import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { StringClass } from "../../javalang/ObjectClassStringClass";
import { NumberClass } from "./NumberClass";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Short.html
 */
export class ShortClass extends NumberClass {

    static isPrimitiveTypeWrapper: boolean = true;

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Short extends Number implements Comparable<Short>"},
        {type: "field", signature: "static final int MAX_VALUE", constantValue: 0x8000 - 1},
        {type: "field", signature: "static final int MIN_VALUE", constantValue: -0x8000},
        // for doubleValue(), floatValue(), intValue() and longValue() there are methods (if called for a Number variable containing an Integer value) and templates
        // (if called fo Integer variable). Offering templates to the compiler is only possible because the methods are final.

        {type: "method", signature: "public Short(short d)", native: ShortClass.prototype._constructorShort},
        {type: "method", signature: "public final double doubleValue()", native: ShortClass.prototype.doubleValue, template: "§1.value"},
        {type: "method", signature: "public final float floatValue()", native: ShortClass.prototype.floatValue, template: "§1.value"},
        {type: "method", signature: "public final int intValue()", native: ShortClass.prototype.intValue, template: "§1.value"},
        {type: "method", signature: "public final long longValue()", native: ShortClass.prototype.longValue, template: "§1.value"},
        {type: "method", signature: "public int compareTo(Short otherShort)", java: ShortClass.prototype._mj$compareTo$int$T},
        {type: "method", signature: "public static short parseShort(String s)", native: ShortClass.parseShort},
        {type: "method", signature: "public static short parseShort(String sr, int radix)", native: ShortClass.parseShort},
        {type: "method", signature: "public static Short valueOf(short i)", native: ShortClass.valueOf},
        {type: "method", signature: "public static Short valueOf(String s)", native: ShortClass.valueOfString},
        {type: "method", signature: "public static Short valueOf(String s, short radix)", native: ShortClass.valueOfString},
    ]

    static type: NonPrimitiveType;

    constructor(i: number){
        super(i);
    }

    _constructorShort(d: number) {
        this.value = d;
        return this;
    }

    _mj$compareTo$int$T(t: Thread, callback: CallableFunction, otherValue: ShortClass){
        t.s.push(this.value - otherValue.value);
        if(callback) callback();
        return;
    }

    static parseShort(s: StringClass, radix: number = 10){
        return (Number.parseInt(s.value, radix) + 0x8000) % 0x10000 - 0x8000;
    }

    intValue(){
        return this.value;
    }

    longValue(){
        return this.value;
    }

    floatValue(){
        return this.value;
    }

    doubleValue(){
        return this.value;
    }

    static valueOf(i: number){
        return new ShortClass(i);
    }

    static valueOfString(s: string, radix: number): ShortClass {
        return new ShortClass(Number.parseInt(s, radix) % 0x10000 - 0x8000);
    }

}