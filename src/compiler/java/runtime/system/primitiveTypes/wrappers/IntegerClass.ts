import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { NumberFormatExceptionClass } from "../../javalang/NumberFormatExceptionClass";
import { StringClass } from "../../javalang/ObjectClassStringClass";
import { NumberClass } from "./NumberClass";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Integer.html
 */
export class IntegerClass extends NumberClass {

    static isPrimitiveTypeWrapper: boolean = true;

    static readonly MIN_VALUE = -0x80000000;
    static readonly MAX_VALUE = 0x80000000 - 1;
    static readonly MIN_RADIX = 2;
    static readonly MAX_RADIX = 36;

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Integer extends Number implements Comparable<Integer>"},
        {type: "field", signature: "static final int MAX_VALUE", constantValue: 0x80000000 - 1},
        {type: "field", signature: "static final int MIN_VALUE", constantValue: -0x80000000},
        // for doubleValue(), floatValue(), intValue() and longValue() there are methods (if called for a Number variable containing an Integer value) and templates
        // (if called fo Integer variable). Offering templates to the compiler is only possible because the methods are final.
        {type: "method", signature: "public Integer(int value)", native: IntegerClass.prototype._constructorInt},
        {type: "method", signature: "public Integer(string value)", native: IntegerClass.prototype._constructorString},
        {type: "method", signature: "public final double doubleValue()", native: IntegerClass.prototype.doubleValue, template: "§1.value"},
        {type: "method", signature: "public final float floatValue()", native: IntegerClass.prototype.floatValue, template: "§1.value"},
        {type: "method", signature: "public final int intValue()", native: IntegerClass.prototype.intValue, template: "§1.value"},
        {type: "method", signature: "public final long longValue()", native: IntegerClass.prototype.longValue, template: "§1.value"},
        {type: "method", signature: "public int compareTo(Integer anotherInteger)", java: IntegerClass.prototype._mj$compareTo$int$T},
        {type: "method", signature: "public static int parseInt(String s)", native: IntegerClass.parseInt},
        {type: "method", signature: "public static int parseInt(String s, int radix)", native: IntegerClass.parseInt},
        {type: "method", signature: "public static Integer valueOf(int i)", native: IntegerClass.valueOf},
        {type: "method", signature: "public static Integer valueOf(string s)", native: IntegerClass.valueOfString},
        {type: "method", signature: "public static Integer valueOf(string s, int radix)", native: IntegerClass.valueOfString},
        {type: "method", signature: "public static string toBinary(int number)", native: IntegerClass.toBinary},
        {type: "method", signature: "public static string toHex(int number)", native: IntegerClass.toHex},
        {type: "method", signature: "public static string toOctal(int number)", native: IntegerClass.toOctal},
        {type: "method", signature: "public static string toString(int number, int radix)", native: IntegerClass.toStringRadix},
        {type: "method", signature: "public static string toString(int number)", native: IntegerClass.toString},
    ]

    static type: NonPrimitiveType;

    constructor(i: number){
        super(i || 0);
    }

    _constructorInt(value: number){
        this.value = value;
        return this;
    }

    _constructorString(value: string){
        this.value = IntegerClass.parseIntString(value, 10);
        return this;
    }

    _mj$compareTo$int$T(t: Thread, callback: CallableFunction, otherValue: IntegerClass){
        t.s.push(NumberClass.compareIntegral(this.value, otherValue.value));
        if(callback) callback();
        return;
    }

    private static digit(charCode: number, radix: number): number {
        let digit = -1;
        if (charCode >= 48 && charCode <= 57) {
            digit = charCode - 48;
        } else if (charCode >= 65 && charCode <= 90) {
            digit = charCode - 65 + 10;
        } else if (charCode >= 97 && charCode <= 122) {
            digit = charCode - 97 + 10;
        }
        return digit < radix ? digit : -1;
    }

    static parseIntString(s: string | null | undefined, radix: number = 10): number {
        if (s == null) {
            throw new NumberFormatExceptionClass("Cannot parse null string");
        }
        if (radix < IntegerClass.MIN_RADIX) {
            throw new NumberFormatExceptionClass(`radix ${radix} less than Character.MIN_RADIX`);
        }
        if (radix > IntegerClass.MAX_RADIX) {
            throw new NumberFormatExceptionClass(`radix ${radix} greater than Character.MAX_RADIX`);
        }

        const len = s.length;
        if (len === 0) {
            throw new NumberFormatExceptionClass(`For input string: "${s}"`);
        }

        let i = 0;
        let negative = false;
        let limit = -IntegerClass.MAX_VALUE;

        const firstChar = s.charCodeAt(0);
        if (firstChar < 48) { // Possible leading "+" or "-"
            if (firstChar === 45) { // '-'
                negative = true;
                limit = IntegerClass.MIN_VALUE;
            } else if (firstChar !== 43) { // '+'
                throw new NumberFormatExceptionClass(`For input string: "${s}"`);
            }
            if (len === 1) { // Cannot have lone "+" or "-"
                throw new NumberFormatExceptionClass(`For input string: "${s}"`);
            }
            i++;
        }

        // Accumulate as negative so Integer.MIN_VALUE (-2147483648) does not overflow
        const multmin = Math.trunc(limit / radix);
        let result = 0;

        while (i < len) {
            const digit = IntegerClass.digit(s.charCodeAt(i++), radix);
            if (digit < 0 || result < multmin) {
                throw new NumberFormatExceptionClass(`For input string: "${s}"`);
            }
            result *= radix;
            if (result < limit + digit) {
                throw new NumberFormatExceptionClass(`For input string: "${s}"`);
            }
            result -= digit;
        }

        if (result === 0) return 0;
        return negative ? result : -result;
    }

    static parseInt(s: StringClass | string | null, radix: number = 10): number {
        const str = s == null ? null : (typeof s === "string" ? s : s.value);
        return IntegerClass.parseIntString(str, radix);
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
        return new IntegerClass(i);
    }

    static valueOfString(s: string, radix: number = 10): IntegerClass {
        return new IntegerClass(IntegerClass.parseIntString(s, radix));
    }

    static toBinary(number: number): string {
        return Math.round(number).toString(2);
    }

    static toHex(number: number): string {
        return Math.round(number).toString(16);
    }

    static toOctal(number: number): string {
        return Math.round(number).toString(8);
    }   

    static toStringRadix(number: number, radix: number): string {
        return Math.round(number).toString(radix);
    }
       
    static toString(number: number): string {
        return Math.round(number).toString(10);
    }   

}