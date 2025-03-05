import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { StringClass } from "../../javalang/ObjectClassStringClass";
import { NumberClass } from "./NumberClass";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Short.html
 */
export class ByteClass extends NumberClass {

    static isPrimitiveTypeWrapper: boolean = true;

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Byte extends Number implements Comparable<Byte>"},
        {type: "field", signature: "static final int MAX_VALUE", constantValue: 0x80 - 1},
        {type: "field", signature: "static final int MIN_VALUE", constantValue: -0x80},
        // for doubleValue(), floatValue(), intValue() and longValue() there are methods (if called for a Number variable containing an Integer value) and templates
        // (if called fo Integer variable). Offering templates to the compiler is only possible because the methods are final.

        {type: "method", signature: "public Byte(byte d)", native: ByteClass.prototype._constructorByte},
        {type: "method", signature: "public final double doubleValue()", native: ByteClass.prototype.doubleValue, template: "§1.value"},
        {type: "method", signature: "public final float floatValue()", native: ByteClass.prototype.floatValue, template: "§1.value"},
        {type: "method", signature: "public final int intValue()", native: ByteClass.prototype.intValue, template: "§1.value"},
        {type: "method", signature: "public final long longValue()", native: ByteClass.prototype.longValue, template: "§1.value"},
        {type: "method", signature: "public int compareTo(Short otherShort)", java: ByteClass.prototype._mj$compareTo$int$T},
        {type: "method", signature: "public static byte parseByte(String s)", native: ByteClass.parseByte},
        {type: "method", signature: "public static byte parseByte(String sr, int radix)", native: ByteClass.parseByte},
        {type: "method", signature: "public static Byte valueOf(byte i)", native: ByteClass.valueOf},
        {type: "method", signature: "public static Byte valueOf(String s)", native: ByteClass.valueOfString},
        {type: "method", signature: "public static Byte valueOf(String s, byte radix)", native: ByteClass.valueOfString},
    ]

    static type: NonPrimitiveType;

    constructor(i: number){
        super(i);
    }

    _mj$compareTo$int$T(t: Thread, callback: CallableFunction, otherValue: ByteClass){
        t.s.push(this.value - otherValue.value);
        if(callback) callback();
        return;
    }

    _constructorByte(d: number) {
        this.value = d;
        return this;
    }


    static parseByte(s: StringClass, radix: number = 10){
        return (Number.parseInt(s.value, radix) + 0x80) % 0x100 - 0x80;
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
        return new ByteClass(i);
    }

    static valueOfString(s: string, radix: number): ByteClass {
        return new ByteClass(Number.parseInt(s, radix) % 0x100 - 0x80);
    }

}