import { Helpers } from "../../../../common/interpreter/RuntimeConstants";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "./ObjectClassStringClass";

export class PrimitiveStringClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class string extends Object"},
        {type: "method", signature: "public final int length()", template: "§1.length", constantFoldingFunction: (str) => str.length},
        {type: "method", signature: "public final int indexOf(string str)", template: "§1.indexOf(§2)", constantFoldingFunction: (obj, str) => obj.indexOf(str)},
        {type: "method", signature: "public final int indexOf(string str, int fromIndex)", template: "§1.indexOf(§2, §3)", constantFoldingFunction: (obj, str, index) => obj.indexOf(str, index)},
        {type: "method", signature: "public final int indexOf(char c)", template: "§1.indexOf(§2)", constantFoldingFunction: (obj, str) => obj.indexOf(str)},
        {type: "method", signature: "public final int indexOf(char c, int fromIndex)", template: "§1.indexOf(§2, §3)", constantFoldingFunction: (obj, str, index) => obj.indexOf(str, index)},
        {type: "method", signature: "public final char charAt(int index)", template: "§1.charAt(§2)", constantFoldingFunction: (obj, index) => obj.charAt(index)},
        {type: "method", signature: "public final int compareTo(string otherString)", template: "§1.localeCompare(§2)", constantFoldingFunction: (obj, otherString) => obj.localeCompare(otherString)},
        {type: "method", signature: "public final int compareToIgnoreCase(string otherString)", template: "§1.localeCompare(§2, undefined, { sensitivity: 'accent' })", constantFoldingFunction: (obj, otherString) => obj.localeCompare(otherString, undefined, { sensitivity: 'accent' })},
        {type: "method", signature: "public final string concat(string otherString)", template: "§1.concat(§2)", constantFoldingFunction: (obj, otherString) => obj.concat(otherString)},
        {type: "method", signature: "public final boolean contains(string otherString)", template: "(§1.indexOf(§2) >= 0)", constantFoldingFunction: (obj, otherString) => obj.indexOf(otherString) >= 0},
        {type: "method", signature: "public final boolean endsWith(string otherString)", template: "§1.endsWith(§2)", constantFoldingFunction: (obj, otherString) => obj.endsWith(otherString)},
        {type: "method", signature: "public final boolean startsWith(string otherString)", template: "§1.startsWith(§2)", constantFoldingFunction: (obj, otherString) => obj.startsWith(otherString)},
        {type: "method", signature: "public final boolean equals(string otherString)", template: "§1 == §2", constantFoldingFunction: (obj, otherString) => obj == otherString},
        {type: "method", signature: "public final boolean equalsIgnoreCase(string otherString)", template: "§1.toLocaleUpperCase() == §2.toLocaleUpperCase()", constantFoldingFunction: (obj, otherString) => obj.toLocaleUpperCase() == otherString.toLocaleUpperCase()},
        {type: "method", signature: "public final boolean isEmpty()", template: "(§1.length == 0)", constantFoldingFunction: (obj) => obj.length == 0},
        {type: "method", signature: "public final int lastIndexOf(string str)", template: "§1.lastIndexOf(§2)", constantFoldingFunction: (obj, str) => obj.lastIndexOf(str)},
        {type: "method", signature: "public final int lastIndexOf(string str, int fromIndex)", template: "§1.lastIndexOf(§2, §3)", constantFoldingFunction: (obj, str, index) => obj.lastIndexOf(str, index)},
        {type: "method", signature: "public final int lastIndexOf(char c)", template: "§1.lastIndexOf(§2)", constantFoldingFunction: (obj, str) => obj.lastIndexOf(str)},
        {type: "method", signature: "public final int lastIndexOf(char c, int fromIndex)", template: "§1.lastIndexOf(§2, §3)", constantFoldingFunction: (obj, str, index) => obj.lastIndexOf(str, index)},
        {type: "method", signature: "public final string toLowerCase()", template: "§1.toLocaleLowerCase()", constantFoldingFunction: (obj) => obj.toLocaleLowerCase()},
        {type: "method", signature: "public final string toUpperCase()", template: "§1.toLocaleUpperCase()", constantFoldingFunction: (obj) => obj.toLocaleUpperCase()},
        {type: "method", signature: "public final string substring(int beginIndex)", template: "§1.substring(§2)", constantFoldingFunction: (obj, index) => obj.substring(index)},
        {type: "method", signature: "public final string substring(int beginIndex, int endIndex)", template: "§1.substring(§2, §3)", constantFoldingFunction: (obj, beginIndex, endIndex) => obj.substring(beginIndex, endIndex)},
        {type: "method", signature: "public final string trim()", template: "§1.trim()", constantFoldingFunction: (obj) => obj.trim()},
        {type: "method", signature: "public final string replace(string target, string replacement)", template: "§1.replace(§2, () => §3)", constantFoldingFunction: (obj, target, replacement) => obj.replace(target, replacement)},
        {type: "method", signature: "public final string replaceAll(string regex, string replacement)", template: "§1.replace(new RegExp(§2, 'g'), () => §3)", constantFoldingFunction: (obj, target, replacement) => obj.replace(new RegExp(target, 'g'), replacement)},
        {type: "method", signature: "public final boolean matches(string regex)", template: "(§1.match(new RegExp(§2, 'g')) != null)", constantFoldingFunction: (obj, target) => (obj.match(new RegExp(target, 'g')) != null)},
        {type: "method", signature: "public final string replaceFirst(string regex, string replacement)", template: "§1.replace(new RegExp(§2, ''), () => §3)", constantFoldingFunction: (obj, target, replacement) => obj.replace(new RegExp(target, ''), replacement)},
        {type: "method", signature: "public final string[] split(string regex)", template: `§1.split(new RegExp(§2, ''))` /*.map((s) => new ${Helpers.classes}['String'](s))` */ },
        {type: "method", signature: "public final int hashCode()", template: `Array.from(§1).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)`, constantFoldingFunction: (obj: string) => {return Array.from(obj).reduce((s: number, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)}},
        {type: "method", signature: "public final char[] toCharArray()", template: `Array.from(§1)`, constantFoldingFunction: (obj: string) => {return Array.from(obj)}},
        {type: "method", signature: "public final string toString()", template: `§1`, constantFoldingFunction: (obj: string) => obj}
    ]

    static type: NonPrimitiveType;

    constructor(){
        super();
    }


}