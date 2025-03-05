import { CallbackFunction } from "../../../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../javalang/ObjectClassStringClass";
import { IPrimitiveTypeWrapper } from "./IPrimitiveTypeWrapper";
import { NumberClass } from "./NumberClass";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Boolean.html
 */
export class CharacterClass extends ObjectClass implements IPrimitiveTypeWrapper {

    static isPrimitiveTypeWrapper: boolean = true;
    static letters: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZöÖäÄß";
    static lowercase: string = "abcdefghijklmnopqrstuvwxyzäöß";
    static uppercase: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZÖÄ";
    static digits: string = "0123456789";

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Character extends Object implements Comparable<Character>" },

        { type: "method", signature: "Character(char value)", native: CharacterClass.prototype._constructor1 },
        { type: "method", signature: "public final char charValue()", template: "§1.value" },
        { type: "method", signature: "public int compareTo(Character otherCharacter)", native: CharacterClass.prototype._compareTo },
        { type: "method", signature: "public static Character valueOf(char c)", native: CharacterClass._valueOf },
        { type: "method", signature: "public static boolean isLetter(char c)", native: CharacterClass._isLetter },
        { type: "method", signature: "public static boolean isLetterOrDigit(char c)", native: CharacterClass._isLetterOrDigit },
        { type: "method", signature: "public static boolean isDigit(char c)", native: CharacterClass._isDigit },
        { type: "method", signature: "public static boolean isLowerCase(char c)", native: CharacterClass._isLowerCase },
        { type: "method", signature: "public static boolean isUpperCase(char c)", native: CharacterClass._isUpperCase },
        { type: "method", signature: "public static char toUpperCase(char c)", native: CharacterClass._toUpperCase },
        { type: "method", signature: "public static char toLowerCase(char c)", native: CharacterClass._toLowerCase },



        { type: "method", signature: "public String toString()", native: CharacterClass.prototype._toString },
    ]

    static type: NonPrimitiveType;


    constructor(public value: string) {
        super();
    }

    debugOutput(): string {
        return "'" + this.value + "'";
    }

    static _valueOf(c: string) {
        return new CharacterClass(c);
    }

    _constructor1() {
        return this;
    }

    __internalHashCode(): any {
        return this.value;
    }

    _compareTo(otherValue: CharacterClass) {
        return this == otherValue ? 0 : 1;
    }

    _toString() {
        return new StringClass(this.value);
    }

    _mj$equals$boolean$Object(t: Thread, callback: CallbackFunction, otherCharacter: CharacterClass) {
        t.s.push(otherCharacter != null && otherCharacter.value == this.value);
        if (callback) callback();
    }

    static _isLetter(c: string){
        return this.letters.indexOf(c) >= 0;
    }

    static _isDigit(c: string){
        return this.digits.indexOf(c) >= 0;
    }

    static _isLetterOrDigit(c: string){
        return this.digits.indexOf(c) >= 0 || this.letters.indexOf(c) >= 0;
    }

    static _isLowerCase(c: string){
        return this.lowercase.indexOf(c) >= 0;
    }

    static _isUpperCase(c: string){
        return this.uppercase.indexOf(c) >= 0;
    }

    static _toUpperCase(c: string){
        return c.toLocaleUpperCase();
    }

    static _toLowerCase(c: string){
        return c.toLocaleLowerCase();
    }

}