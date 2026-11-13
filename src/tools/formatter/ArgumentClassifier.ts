import { ValueRenderer } from "../../compiler/common/debugger/ValueRenderer";
import { ObjectClass, StringClass } from "../../compiler/java/runtime/system/javalang/ObjectClassStringClass";
import { BooleanClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/BooleanClass";
import { ByteClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/ByteClass";
import { CharacterClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/CharacterClass";
import { DoubleClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/DoubleClass";
import { FloatClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/FloatClass";
import { IntegerClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/IntegerClass";
import { LongClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/LongClass";
import { NumberClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/NumberClass";
import { ShortClass } from "../../compiler/java/runtime/system/primitiveTypes/wrappers/ShortClass";

/**
 * A format argument reduced to what the conversions need to know about it.
 *  - "integral"/"floating": boxed java numbers whose exact java type is known
 *  - "number": a raw JS number; its java type is unknown, so integer-valued numbers are
 *    accepted by the integral conversions (%d, %o, %x, %c) and all numbers by the floating ones.
 */
export type ClassifiedArgument =
    | { kind: "null"; javaType: string }
    | { kind: "string"; value: string; javaType: string }
    | { kind: "boolean"; value: boolean; javaType: string }
    | { kind: "char"; value: string; javaType: string }
    | { kind: "integral"; value: number; bits: number; javaType: string }
    | { kind: "floating"; value: number; isFloat: boolean; javaType: string }
    | { kind: "number"; value: number; javaType: string }
    | { kind: "object"; value: ObjectClass; text: string; javaType: string };

export class ArgumentClassifier {

    private static identityHashCodes: WeakMap<object, number> = new WeakMap();
    private static identityHashCounter: number = 0x1b873593;

    static classify(arg: any): ClassifiedArgument {
        if (arg == null) return { kind: "null", javaType: "null" };

        switch (typeof arg) {
            case "string": return { kind: "string", value: arg, javaType: "java.lang.String" };
            case "boolean": return { kind: "boolean", value: arg, javaType: "java.lang.Boolean" };
            case "number": return { kind: "number", value: arg, javaType: Number.isInteger(arg) ? "java.lang.Integer" : "java.lang.Double" };
            case "bigint": return { kind: "integral", value: Number(arg), bits: 64, javaType: "java.lang.Long" };
        }

        if (arg instanceof StringClass) return { kind: "string", value: arg.value, javaType: "java.lang.String" };
        if (arg instanceof BooleanClass) return { kind: "boolean", value: arg.value, javaType: "java.lang.Boolean" };
        if (arg instanceof CharacterClass) return { kind: "char", value: arg.value, javaType: "java.lang.Character" };
        if (arg instanceof IntegerClass) return { kind: "integral", value: arg.value, bits: 32, javaType: "java.lang.Integer" };
        if (arg instanceof LongClass) return { kind: "integral", value: arg.value, bits: 64, javaType: "java.lang.Long" };
        if (arg instanceof ShortClass) return { kind: "integral", value: arg.value, bits: 16, javaType: "java.lang.Short" };
        if (arg instanceof ByteClass) return { kind: "integral", value: arg.value, bits: 8, javaType: "java.lang.Byte" };
        if (arg instanceof DoubleClass) return { kind: "floating", value: arg.value, isFloat: false, javaType: "java.lang.Double" };
        if (arg instanceof FloatClass) return { kind: "floating", value: arg.value, isFloat: true, javaType: "java.lang.Float" };
        if (arg instanceof NumberClass) return { kind: "number", value: arg.value, javaType: "java.lang.Number" };

        if (arg instanceof ObjectClass) {
            return { kind: "object", value: arg, text: ArgumentClassifier.objectToString(arg), javaType: ArgumentClassifier.classNameOf(arg) };
        }

        // anything else (plain JS values) is rendered as string
        return { kind: "string", value: String(arg), javaType: "java.lang.Object" };
    }

    /**
     * Synchronous string representation of a library object. The step-aware toString() of
     * user-defined java classes can't be called here; callers which have a Thread at hand
     * (see StringFormatHelper) resolve those beforehand.
     */
    static objectToString(obj: ObjectClass): string {
        let toString = (<any>obj).toString;
        if (typeof toString === "function" && toString !== Object.prototype.toString) {
            try {
                let result = toString.call(obj);
                if (result instanceof StringClass) return result.value;
                if (typeof result === "string") return result;
            } catch (e) { /* fall through */ }
        }

        // same renderer as ObjectClass._mj$toString$String$
        try {
            let rendered = ValueRenderer.renderValue(obj, 200);
            if (typeof rendered === "string") return rendered;
        } catch (e) { /* fall through */ }

        return ArgumentClassifier.classNameOf(obj) + "@" + (ArgumentClassifier.identityHashCode(obj) >>> 0).toString(16);
    }

    static classNameOf(obj: ObjectClass): string {
        try {
            let name = obj.getClassName();
            if (name) return name;
        } catch (e) { /* fall through */ }
        return obj?.constructor?.name || "Object";
    }

    static identityHashCode(obj: object): number {
        let hash = ArgumentClassifier.identityHashCodes.get(obj);
        if (hash === undefined) {
            ArgumentClassifier.identityHashCounter = (Math.imul(ArgumentClassifier.identityHashCounter, 0x9E3779B1) + 0x7F4A7C15) | 0;
            hash = ArgumentClassifier.identityHashCounter & 0x7fffffff;
            ArgumentClassifier.identityHashCodes.set(obj, hash);
        }
        return hash;
    }

    /** java.lang.String.hashCode */
    static stringHashCode(s: string): number {
        let h = 0;
        for (let i = 0; i < s.length; i++) {
            h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
        }
        return h;
    }

    /** hashCode() as the corresponding java class would compute it */
    static hashCode(arg: ClassifiedArgument): number {
        switch (arg.kind) {
            case "null": return 0;
            case "string": return ArgumentClassifier.stringHashCode(arg.value);
            case "boolean": return arg.value ? 1231 : 1237;
            case "char": return arg.value.charCodeAt(0) | 0;
            case "integral":
                if (arg.bits === 64) return ArgumentClassifier.longHashCode(arg.value);
                return arg.value | 0;
            case "floating":
                return arg.isFloat ? ArgumentClassifier.floatHashCode(arg.value) : ArgumentClassifier.doubleHashCode(arg.value);
            case "number":
                if (Number.isInteger(arg.value) && arg.value >= -0x80000000 && arg.value <= 0x7fffffff) return arg.value | 0;
                return ArgumentClassifier.doubleHashCode(arg.value);
            case "object":
                let internal = (<any>arg.value).__internalHashCode;
                if (typeof internal === "function") {
                    let h = internal.call(arg.value);
                    if (typeof h === "number") return h | 0;
                    if (typeof h === "string") return ArgumentClassifier.stringHashCode(h);
                    if (typeof h === "boolean") return h ? 1231 : 1237;
                }
                return ArgumentClassifier.identityHashCode(arg.value);
        }
    }

    private static longHashCode(value: number): number {
        let bits = BigInt.asUintN(64, BigInt(Math.trunc(value)));
        return Number(BigInt.asIntN(32, bits ^ (bits >> 32n)));
    }

    private static doubleHashCode(value: number): number {
        let view = new DataView(new ArrayBuffer(8));
        view.setFloat64(0, Number.isNaN(value) ? Number.NaN : value);
        return (view.getInt32(0) ^ view.getInt32(4)) | 0;
    }

    private static floatHashCode(value: number): number {
        let view = new DataView(new ArrayBuffer(4));
        view.setFloat32(0, value);
        return view.getInt32(0);
    }

}
