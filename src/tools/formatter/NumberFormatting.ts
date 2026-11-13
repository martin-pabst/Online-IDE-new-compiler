import { FormatSpecifier, FormatterLocale } from "./FormatterTypes";

/**
 * Decimal representation of a non-negative finite number:
 * value = 0.<digits> * 10^pointPos
 * digits has no leading zeros (except for the value zero: digits == "0") and no trailing zeros.
 */
export type DecimalDigits = { digits: string; pointPos: number };

/**
 * Pure helper functions for the numeric conversions of {@link Formatter}.
 *
 * Java rounds on the shortest decimal representation of a double (Double.toString) using
 * RoundingMode.HALF_UP, whereas Number.prototype.toFixed rounds the exact binary value
 * ((2.675).toFixed(2) == "2.67", java gives "2.68"). Therefore all rounding here is done on
 * decimal digit strings.
 */
export class NumberFormatting {

    /** Shortest round-trip decimal digits of a finite number >= 0 */
    static toDecimalDigits(x: number): DecimalDigits {
        if (x === 0) return { digits: "0", pointPos: 1 };

        let s = x.toString();          // "2.675", "123", "1e+21", "1.5e-7"
        let exp = 0;
        let ei = s.indexOf('e');
        if (ei >= 0) {
            exp = Number.parseInt(s.substring(ei + 1));
            s = s.substring(0, ei);
        }

        let dot = s.indexOf('.');
        let intDigits = dot >= 0 ? s.substring(0, dot) : s;
        let fracDigits = dot >= 0 ? s.substring(dot + 1) : "";

        let digits = intDigits + fracDigits;
        let pointPos = intDigits.length + exp;

        let lead = 0;
        while (lead < digits.length - 1 && digits.charAt(lead) === '0') lead++;
        digits = digits.substring(lead);
        pointPos -= lead;

        let end = digits.length;
        while (end > 1 && digits.charAt(end - 1) === '0') end--;
        digits = digits.substring(0, end);

        return { digits, pointPos };
    }

    /** "999" -> "1000", "" -> "1" */
    static incrementDigits(d: string): string {
        let arr = d.split("");
        let i = arr.length - 1;
        while (i >= 0) {
            if (arr[i] === '9') {
                arr[i] = '0';
                i--;
            } else {
                arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1);
                return arr.join("");
            }
        }
        return "1" + arr.join("");
    }

    /**
     * Rounds HALF_UP to the given number of fraction digits.
     * Returns the integer part (without grouping, at least "0") and exactly fractionDigits fraction digits.
     */
    static roundToFraction(dd: DecimalDigits, fractionDigits: number): { intPart: string; fracPart: string } {
        let { digits, pointPos } = dd;
        let keep = pointPos + fractionDigits;      // number of digits that survive
        let d: string;
        let pp = pointPos;

        if (keep < 0) {
            d = "";
            pp = -fractionDigits;
        } else if (keep >= digits.length) {
            d = digits + "0".repeat(keep - digits.length);
        } else {
            d = digits.substring(0, keep);
            if (digits.charCodeAt(keep) >= 53 /* '5' */) {
                let inc = NumberFormatting.incrementDigits(d);
                if (inc.length > d.length) pp++;
                d = inc;
            }
        }

        // invariant: d.length == pp + fractionDigits
        let intPart = pp > 0 ? d.substring(0, pp) : "";
        let fracPart = pp >= 0 ? d.substring(pp) : "0".repeat(-pp) + d;
        if (intPart === "") intPart = "0";
        return { intPart, fracPart };
    }

    /**
     * Rounds HALF_UP to exactly n significant digits (n >= 1); pads with zeros if necessary.
     */
    static roundToSignificant(dd: DecimalDigits, n: number): DecimalDigits {
        let { digits, pointPos } = dd;
        if (digits.length <= n) return { digits: digits + "0".repeat(n - digits.length), pointPos };

        let d = digits.substring(0, n);
        if (digits.charCodeAt(n) >= 53 /* '5' */) {
            let inc = NumberFormatting.incrementDigits(d);
            if (inc.length > n) {
                inc = inc.substring(0, n);
                pointPos++;
            }
            d = inc;
        }
        return { digits: d, pointPos };
    }

    static groupDigits(intPart: string, separator: string): string {
        let result = "";
        for (let i = 0; i < intPart.length; i++) {
            if (i > 0 && (intPart.length - i) % 3 === 0) result += separator;
            result += intPart.charAt(i);
        }
        return result;
    }

    /** %f for a finite number >= 0 (no sign, no padding) */
    static formatFixed(x: number, precision: number, spec: FormatSpecifier, locale: FormatterLocale): string {
        let { intPart, fracPart } = NumberFormatting.roundToFraction(NumberFormatting.toDecimalDigits(x), precision);
        if (spec.flags.indexOf(',') >= 0) intPart = NumberFormatting.groupDigits(intPart, locale.groupingSeparator);
        if (precision > 0) return intPart + locale.decimalSeparator + fracPart;
        return intPart + (spec.flags.indexOf('#') >= 0 ? locale.decimalSeparator : "");
    }

    /** %e for a finite number >= 0 (no sign, no padding), e.g. "1.234568e+04" */
    static formatScientific(x: number, precision: number, spec: FormatSpecifier, locale: FormatterLocale): string {
        let mantissaDigits: string;
        let exponent: number;

        if (x === 0) {
            mantissaDigits = "0".repeat(precision + 1);
            exponent = 0;
        } else {
            let dd = NumberFormatting.roundToSignificant(NumberFormatting.toDecimalDigits(x), precision + 1);
            mantissaDigits = dd.digits;
            exponent = dd.pointPos - 1;
        }

        let mantissa = mantissaDigits.charAt(0);
        if (precision > 0) {
            mantissa += locale.decimalSeparator + mantissaDigits.substring(1);
        } else if (spec.flags.indexOf('#') >= 0) {
            mantissa += locale.decimalSeparator;
        }

        let expAbs = Math.abs(exponent).toString();
        if (expAbs.length < 2) expAbs = "0" + expAbs;
        return mantissa + "e" + (exponent < 0 ? "-" : "+") + expAbs;
    }

    /**
     * %g for a finite number >= 0 (no sign, no padding).
     * After rounding to precision significant digits java uses %e style if the
     * exponent is < -4 or >= precision, otherwise %f style.
     */
    static formatGeneral(x: number, precision: number, spec: FormatSpecifier, locale: FormatterLocale): string {
        if (precision === 0) precision = 1;
        if (x === 0) return NumberFormatting.formatFixed(0, precision - 1, spec, locale);

        let dd = NumberFormatting.roundToSignificant(NumberFormatting.toDecimalDigits(x), precision);
        let exponent = dd.pointPos - 1;
        if (exponent < -4 || exponent >= precision) {
            return NumberFormatting.formatScientific(x, precision - 1, spec, locale);
        }
        return NumberFormatting.formatFixed(x, precision - exponent - 1, spec, locale);
    }

    /**
     * %d, %o, %x for an integral value (no justification). Negative values are rendered
     * in two's complement with the given bit width for %o and %x, like java does for
     * Byte/Short/Integer/Long.
     */
    static formatIntegral(value: number, bits: number, spec: FormatSpecifier, locale: FormatterLocale): string {
        let big = BigInt(Math.trunc(value));
        const has = (flag: string) => spec.flags.indexOf(flag) >= 0;

        if (spec.conversion === 'd') {
            let negative = big < 0n;
            let magnitude = (negative ? -big : big).toString();
            if (has(',')) magnitude = NumberFormatting.groupDigits(magnitude, locale.groupingSeparator);
            return NumberFormatting.addSignAndZeroPadding(magnitude, negative, spec, true);
        }

        let unsigned = BigInt.asUintN(bits, big);
        let digits = unsigned.toString(spec.conversion === 'o' ? 8 : 16);
        let prefix = has('#') ? (spec.conversion === 'o' ? "0" : "0x") : "";
        if (has('0') && spec.width !== undefined) {
            let pad = spec.width - prefix.length - digits.length;
            if (pad > 0) digits = "0".repeat(pad) + digits;
        }
        return prefix + digits;
    }

    /**
     * Adds the leading sign ('-', '+', ' ' or '(' ... ')') and - if the '0' flag is set - pads
     * the magnitude with zeros so that the whole result has the specified width.
     */
    static addSignAndZeroPadding(magnitude: string, negative: boolean, spec: FormatSpecifier, zeroPaddingAllowed: boolean): string {
        const has = (flag: string) => spec.flags.indexOf(flag) >= 0;
        let leading = negative ? (has('(') ? "(" : "-") : (has('+') ? "+" : (has(' ') ? " " : ""));
        let trailing = negative && has('(') ? ")" : "";

        if (zeroPaddingAllowed && has('0') && spec.width !== undefined) {
            let pad = spec.width - leading.length - trailing.length - magnitude.length;
            if (pad > 0) magnitude = "0".repeat(pad) + magnitude;
        }
        return leading + magnitude + trailing;
    }

}
