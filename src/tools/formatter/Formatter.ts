import { IllegalFormatExceptionClass } from "../../compiler/java/runtime/system/javalang/IllegalFormatExceptionClass";
import { NullPointerExceptionClass } from "../../compiler/java/runtime/system/javalang/NullPointerExceptionClass";
import { ArgumentClassifier, ClassifiedArgument } from "./ArgumentClassifier";
import { FormatStringParser } from "./FormatStringParser";
import { ENGLISH_LOCALE, FormatSpecifier, FormatterLocale } from "./FormatterTypes";
import { HexFloat } from "./HexFloat";
import { NumberFormatting } from "./NumberFormatting";

/**
 * Formats strings like java.util.Formatter (String.format, printf):
 *   %[argument_index$][flags][width][.precision]conversion
 *
 * Supported conversions: %b %B %h %H %s %S %c %C %d %o %x %X %e %E %f %g %G %a %A %% %n
 * Date/time conversions (%t, %T) are not supported because there is no date argument type.
 *
 * Arguments may be JS strings, numbers, booleans, null, String objects, the wrapper classes
 * (Boolean, Integer, Long, Short, Byte, Double, Float, Character) or any other ObjectClass.
 * Note: toString() of user-defined java classes is step-aware and therefore can't be called
 * synchronously here; StringFormatHelper resolves those arguments beforehand.
 *
 * Throws
 *  - NullPointerException if the format string is null
 *  - IllegalFormatException for illegal syntax, specifiers that are incompatible with the
 *    given argument, missing arguments or other illegal conditions. The message starts with the
 *    name of the java exception subclass (e.g. "MissingFormatArgumentException: ...").
 * Surplus arguments are ignored (like in java).
 */
export class Formatter {

    /** locale used by {@link format}; english by default ("." as decimal separator, "," for grouping) */
    static locale: FormatterLocale = ENGLISH_LOCALE;

    public static format(format: string, ...args: any[]): string {
        return Formatter.formatWithLocale(Formatter.locale, format, ...args);
    }

    public static formatWithLocale(locale: FormatterLocale, format: string, ...args: any[]): string {
        if (format == null) throw new NullPointerExceptionClass("format string is null");
        if (args == null) args = [];

        let segments = FormatStringParser.parse(format);

        let result = "";
        let lastIndex = -1;          // index of the argument used by the previous specifier (for '<')
        let lastOrdinaryIndex = -1;  // ordinary indexing is independent of explicit indices

        for (let segment of segments) {
            if (typeof segment === "string") {
                result += segment;
                continue;
            }

            let spec = segment;
            if (spec.conversion === '%') {
                result += Formatter.justify("%", spec);
                continue;
            }
            if (spec.conversion === 'n') {
                result += "\n";
                continue;
            }

            let index: number;
            if (spec.usePreviousArgument) {
                if (lastIndex < 0) throw Formatter.missingArgument(spec);
                index = lastIndex;
            } else if (spec.argumentIndex !== undefined) {
                index = spec.argumentIndex - 1;
            } else {
                index = ++lastOrdinaryIndex;
            }
            if (index >= args.length) throw Formatter.missingArgument(spec);
            lastIndex = index;

            result += Formatter.formatArgument(spec, args[index], locale);
        }

        return result;
    }

    private static formatArgument(spec: FormatSpecifier, arg: any, locale: FormatterLocale): string {
        let classified = ArgumentClassifier.classify(arg);
        let s: string;

        switch (spec.conversion) {
            case 'b': s = Formatter.formatBoolean(classified, spec); break;
            case 'h': s = Formatter.formatHashCode(classified, spec); break;
            case 's': s = Formatter.formatString(classified, spec); break;
            case 'c': s = Formatter.formatCharacter(classified, spec); break;
            case 'd':
            case 'o':
            case 'x': s = Formatter.formatInteger(classified, spec, locale); break;
            default: s = Formatter.formatFloatingPoint(classified, spec, locale); break;    // e f g a
        }

        if (spec.upperCase) s = s.toUpperCase();
        return Formatter.justify(s, spec);
    }

    private static formatBoolean(arg: ClassifiedArgument, spec: FormatSpecifier): string {
        let s: string;
        if (arg.kind === "null") s = "false";
        else if (arg.kind === "boolean") s = arg.value ? "true" : "false";
        else s = "true";
        return Formatter.truncate(s, spec);
    }

    private static formatHashCode(arg: ClassifiedArgument, spec: FormatSpecifier): string {
        if (arg.kind === "null") return Formatter.truncate("null", spec);
        return Formatter.truncate((ArgumentClassifier.hashCode(arg) >>> 0).toString(16), spec);
    }

    private static formatString(arg: ClassifiedArgument, spec: FormatSpecifier): string {
        let s: string;
        switch (arg.kind) {
            case "null": s = "null"; break;
            case "string":
            case "char": s = arg.value; break;
            case "boolean": s = arg.value ? "true" : "false"; break;
            case "integral":
            case "floating":
            case "number": s = "" + arg.value; break;
            case "object": s = arg.text; break;
        }
        return Formatter.truncate(s, spec);
    }

    private static formatCharacter(arg: ClassifiedArgument, spec: FormatSpecifier): string {
        switch (arg.kind) {
            case "null": return "null";
            case "char": return arg.value;
            case "string":
                if (Array.from(arg.value).length === 1) return arg.value;
                throw Formatter.conversionMismatch(spec, arg);
            case "integral":
                if (arg.bits > 32) throw Formatter.conversionMismatch(spec, arg);
                return Formatter.codePointToString(arg.value);
            case "number":
                if (!Number.isInteger(arg.value)) throw Formatter.conversionMismatch(spec, arg);
                return Formatter.codePointToString(arg.value);
            default:
                throw Formatter.conversionMismatch(spec, arg);
        }
    }

    private static codePointToString(codePoint: number): string {
        if (codePoint < 0 || codePoint > 0x10FFFF) {
            throw new IllegalFormatExceptionClass(`IllegalFormatCodePointException: Code point = 0x${(codePoint >>> 0).toString(16)}`);
        }
        return String.fromCodePoint(codePoint);
    }

    private static formatInteger(arg: ClassifiedArgument, spec: FormatSpecifier, locale: FormatterLocale): string {
        switch (arg.kind) {
            case "null": return "null";
            case "integral":
                return NumberFormatting.formatIntegral(arg.value, arg.bits, spec, locale);
            case "number":
                if (!Number.isInteger(arg.value)) throw Formatter.conversionMismatch(spec, arg);
                let bits = arg.value >= -0x80000000 && arg.value <= 0x7fffffff ? 32 : 64;
                return NumberFormatting.formatIntegral(arg.value, bits, spec, locale);
            default:
                throw Formatter.conversionMismatch(spec, arg);
        }
    }

    private static formatFloatingPoint(arg: ClassifiedArgument, spec: FormatSpecifier, locale: FormatterLocale): string {
        switch (arg.kind) {
            case "null": return "null";
            case "floating":
            case "number":
                return Formatter.formatFloatingPointValue(arg.value, spec, locale);
            default:
                throw Formatter.conversionMismatch(spec, arg);
        }
    }

    private static formatFloatingPointValue(x: number, spec: FormatSpecifier, locale: FormatterLocale): string {
        if (Number.isNaN(x)) return "NaN";

        let negative = x < 0 || Object.is(x, -0);
        let v = Math.abs(x);
        if (!Number.isFinite(v)) return NumberFormatting.addSignAndZeroPadding("Infinity", negative, spec, false);

        let precision = spec.precision === undefined ? 6 : spec.precision;
        let magnitude: string;
        switch (spec.conversion) {
            case 'f': magnitude = NumberFormatting.formatFixed(v, precision, spec, locale); break;
            case 'e': magnitude = NumberFormatting.formatScientific(v, precision, spec, locale); break;
            case 'g': magnitude = NumberFormatting.formatGeneral(v, precision, spec, locale); break;
            default: return Formatter.formatHexFloat(v, negative, spec);
        }
        return NumberFormatting.addSignAndZeroPadding(magnitude, negative, spec, true);
    }

    private static formatHexFloat(v: number, negative: boolean, spec: FormatSpecifier): string {
        const has = (flag: string) => spec.flags.indexOf(flag) >= 0;
        let precision = spec.precision === undefined ? 0 : (spec.precision === 0 ? 1 : spec.precision);

        let s = HexFloat.hexDouble(v, precision);     // e.g. "1.8p1"
        let idx = s.indexOf('p');
        let mantissa = s.substring(0, idx);
        let exponent = s.substring(idx + 1);

        if (precision !== 0) {
            let fractionLength = mantissa.length - mantissa.indexOf('.') - 1;
            if (fractionLength < precision) mantissa += "0".repeat(precision - fractionLength);
        }

        let sign = negative ? "-" : (has('+') ? "+" : (has(' ') ? " " : ""));
        let zeros = "";
        if (has('0') && spec.width !== undefined) {
            let pad = spec.width - sign.length - 2 - mantissa.length - 1 - exponent.length;
            if (pad > 0) zeros = "0".repeat(pad);
        }
        return sign + "0x" + zeros + mantissa + "p" + exponent;
    }

    /** precision of %s, %b and %h is the maximum number of characters */
    private static truncate(s: string, spec: FormatSpecifier): string {
        if (spec.precision !== undefined && spec.precision < s.length) return s.substring(0, spec.precision);
        return s;
    }

    private static justify(s: string, spec: FormatSpecifier): string {
        if (spec.width === undefined || s.length >= spec.width) return s;
        let padding = " ".repeat(spec.width - s.length);
        return spec.flags.indexOf('-') >= 0 ? s + padding : padding + s;
    }

    private static missingArgument(spec: FormatSpecifier): IllegalFormatExceptionClass {
        return new IllegalFormatExceptionClass(`MissingFormatArgumentException: Format specifier '${spec.raw}'`);
    }

    private static conversionMismatch(spec: FormatSpecifier, arg: ClassifiedArgument): IllegalFormatExceptionClass {
        return new IllegalFormatExceptionClass(`IllegalFormatConversionException: ${spec.conversion} != ${arg.javaType}`);
    }

}
