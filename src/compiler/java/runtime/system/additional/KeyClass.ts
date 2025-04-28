import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { ObjectClass } from "../javalang/ObjectClassStringClass";

export class KeyClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Key extends Object"},
        {type: "field", signature: "public static final string ArrowUp", template: '"ArrowUp"', constantValue: "ArrowUp"},
        {type: "field", signature: "public static final string ArrowDown", template: '"ArrowDown"', constantValue: "ArrowDown"},
        {type: "field", signature: "public static final string ArrowLeft", template: '"ArrowLeft"', constantValue: "ArrowLeft"},
        {type: "field", signature: "public static final string ArrowRight", template: '"ArrowRight"', constantValue: "ArrowRight"},
        {type: "field", signature: "public static final string Enter", template: '"Enter"', constantValue: "Enter"},
        {type: "field", signature: "public static final string Space", template: '" "', constantValue: " "},
        {type: "field", signature: "public static final string Shift", template: '"Shift"', constantValue: "Shift"},
        {type: "field", signature: "public static final string Alt", template: '"Alt"', constantValue: "Alt"},
        {type: "field", signature: "public static final string Strg", template: '"Strg"', constantValue: "Strg"},
        {type: "field", signature: "public static final string PageUp", template: '"PageUp"', constantValue: "PageUp"},
        {type: "field", signature: "public static final string PageDown", template: '"PageDown"', constantValue: "PageDown"},
        {type: "field", signature: "public static final string Backspace", template: '"Backspace"', constantValue: "Backspace"},
        {type: "field", signature: "public static final string Escape", template: '"Escape"', constantValue: "Escape"},
        {type: "field", signature: "public static final string Entf", template: '"Entf"', constantValue: "Entf"},
        {type: "field", signature: "public static final string Einf", template: '"Einf"', constantValue: "Einf"},
        {type: "field", signature: "public static final string Ende", template: '"Ende"', constantValue: "Ende"}
    ]
    }