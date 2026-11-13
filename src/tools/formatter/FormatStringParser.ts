import { IllegalFormatExceptionClass } from "../../compiler/java/runtime/system/javalang/IllegalFormatExceptionClass";
import { FormatSegment, FormatSpecifier } from "./FormatterTypes";

/**
 * Parses a java.util.Formatter format string into fixed text and format specifiers and
 * validates each specifier the same way java.util.Formatter does (flag/width/precision
 * compatibility with the conversion). Every violation throws an IllegalFormatException whose
 * message starts with the name of the exception java would throw.
 */
export class FormatStringParser {

    // same regular expression as java.util.Formatter uses:
    private static specifierRegex = /%(\d+\$)?([-#+ 0,(<]*)?(\d+)?(\.\d+)?([tT])?([a-zA-Z%])/g;

    /** conversions that are complete without any flags, width or precision (java: Conversion.isValid) */
    private static simpleConversions = "bBhHsScCdoxXeEfgGaA%n";


    static parse(format: string): FormatSegment[] {
        let segments: FormatSegment[] = [];
        let i = 0;
        const max = format.length;

        while (i < max) {
            let n = format.indexOf('%', i);
            if (n < 0) {
                segments.push(format.substring(i));
                break;
            }
            if (n > i) segments.push(format.substring(i, n));

            i = n + 1;
            if (i >= max) throw FormatStringParser.unknownConversion("%");

            let c = format.charAt(i);
            if (FormatStringParser.simpleConversions.indexOf(c) >= 0) {
                segments.push(FormatStringParser.buildSpecifier("%" + c, undefined, "", undefined, undefined, c));
                i++;
                continue;
            }

            FormatStringParser.specifierRegex.lastIndex = n;
            let m = FormatStringParser.specifierRegex.exec(format);
            if (m == null || m.index != n) throw FormatStringParser.unknownConversion(c);

            if (m[5]) {
                // date/time conversions (%tY, %TH, ...) need Date/Calendar arguments which don't exist here
                throw new IllegalFormatExceptionClass(`UnknownFormatConversionException: Conversion = '${m[5]}${m[6]}' (date/time conversions are not supported)`);
            }

            segments.push(FormatStringParser.buildSpecifier(m[0], m[1], m[2] || "", m[3], m[4], m[6]));
            i = n + m[0].length;
        }

        return segments;
    }

    private static buildSpecifier(raw: string, indexGroup: string | undefined, flagsGroup: string,
        widthGroup: string | undefined, precisionGroup: string | undefined, conversionChar: string): FormatSpecifier {

        // only the exact characters listed are valid (e.g. 'F' and 'D' are not)
        if (FormatStringParser.simpleConversions.indexOf(conversionChar) < 0) {
            throw FormatStringParser.unknownConversion(conversionChar);
        }
        let conversion = conversionChar.toLowerCase();

        let argumentIndex: number | undefined = undefined;
        if (indexGroup) {
            let indexString = indexGroup.substring(0, indexGroup.length - 1);
            argumentIndex = Number.parseInt(indexString);
            if (!Number.isSafeInteger(argumentIndex) || argumentIndex <= 0) {
                throw new IllegalFormatExceptionClass(`IllegalFormatArgumentIndexException: Illegal format argument index = ${indexString}`);
            }
        }

        let flags = "";
        for (let f of flagsGroup) {
            if (flags.indexOf(f) >= 0) {
                throw new IllegalFormatExceptionClass(`DuplicateFormatFlagsException: Flags = '${f}'`);
            }
            flags += f;
        }

        let usePreviousArgument = flags.indexOf('<') >= 0;
        if (usePreviousArgument) argumentIndex = undefined;   // java: '<' overrides an explicit index

        let width: number | undefined = undefined;
        if (widthGroup) {
            width = Number.parseInt(widthGroup);
            if (!Number.isSafeInteger(width)) throw new IllegalFormatExceptionClass(`IllegalFormatWidthException: ${widthGroup}`);
        }

        let precision: number | undefined = undefined;
        if (precisionGroup) {
            precision = Number.parseInt(precisionGroup.substring(1));
            if (!Number.isSafeInteger(precision)) throw new IllegalFormatExceptionClass(`IllegalFormatPrecisionException: ${precisionGroup.substring(1)}`);
        }

        let spec: FormatSpecifier = {
            raw, argumentIndex, usePreviousArgument, flags, width, precision, conversion,
            upperCase: conversionChar != conversion
        };

        FormatStringParser.validate(spec);
        return spec;
    }

    /**
     * Mirrors the checks in java.util.Formatter.FormatSpecifier (checkGeneral, checkCharacter,
     * checkInteger, checkFloat, checkText).
     */
    private static validate(spec: FormatSpecifier) {
        const has = (flag: string) => spec.flags.indexOf(flag) >= 0;
        const c = spec.conversion;

        const failMismatch = (flag: string) => {
            throw new IllegalFormatExceptionClass(`FormatFlagsConversionMismatchException: Conversion = ${c}, Flags = ${flag}`);
        }
        const checkBadFlags = (...badFlags: string[]) => {
            for (let f of badFlags) if (has(f)) failMismatch(f);
        }
        const missingWidth = () => new IllegalFormatExceptionClass(`MissingFormatWidthException: ${spec.raw}`);
        const illegalFlags = () => new IllegalFormatExceptionClass(`IllegalFormatFlagsException: Flags = '${spec.flags}'`);
        const illegalPrecision = () => new IllegalFormatExceptionClass(`IllegalFormatPrecisionException: ${spec.precision}`);

        const checkNumeric = (precisionAllowed: boolean) => {
            if (!precisionAllowed && spec.precision !== undefined) throw illegalPrecision();
            if ((has('-') || has('0')) && spec.width === undefined) throw missingWidth();
            if ((has('+') && has(' ')) || (has('-') && has('0'))) throw illegalFlags();
        }

        switch (c) {
            case 'b':
            case 'h':
            case 's':
                // '#' is only allowed for Formattable arguments in java, which don't exist here
                if (has('#')) failMismatch('#');
                if (has('-') && spec.width === undefined) throw missingWidth();
                checkBadFlags('+', ' ', '0', ',', '(');
                break;
            case 'c':
                if (spec.precision !== undefined) throw illegalPrecision();
                checkBadFlags('#', '+', ' ', '0', ',', '(');
                if (has('-') && spec.width === undefined) throw missingWidth();
                break;
            case 'd':
                checkNumeric(false);
                checkBadFlags('#');
                break;
            case 'o':
            case 'x':
                checkNumeric(false);
                // ',' is never allowed, the sign flags only for BigInteger arguments
                checkBadFlags(',', '+', ' ', '(');
                break;
            case 'e':
                checkNumeric(true);
                checkBadFlags(',');
                break;
            case 'f':
                checkNumeric(true);
                break;
            case 'g':
                checkNumeric(true);
                checkBadFlags('#');
                break;
            case 'a':
                checkNumeric(true);
                checkBadFlags('(', ',');
                break;
            case '%':
                if (spec.precision !== undefined) throw illegalPrecision();
                if (spec.flags.replace('-', '').length > 0) throw illegalFlags();
                if (has('-') && spec.width === undefined) throw missingWidth();
                break;
            case 'n':
                if (spec.precision !== undefined) throw illegalPrecision();
                if (spec.width !== undefined) throw new IllegalFormatExceptionClass(`IllegalFormatWidthException: ${spec.width}`);
                if (spec.flags.length > 0) throw illegalFlags();
                break;
        }
    }

    private static unknownConversion(conversion: string): IllegalFormatExceptionClass {
        return new IllegalFormatExceptionClass(`UnknownFormatConversionException: Conversion = '${conversion}'`);
    }

}
