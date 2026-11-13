/**
 * Hexadecimal floating point representation (java: Double.toHexString, used by the %a conversion).
 */
export class HexFloat {

    private static SIGNIFICAND_BITS = 52n;
    private static SIGNIFICAND_MASK = (1n << 52n) - 1n;
    private static EXPONENT_MASK = 0x7ffn << 52n;

    static doubleToBits(d: number): bigint {
        let view = new DataView(new ArrayBuffer(8));
        view.setFloat64(0, d);
        return view.getBigUint64(0);
    }

    static bitsToDouble(bits: bigint): number {
        let view = new DataView(new ArrayBuffer(8));
        view.setBigUint64(0, BigInt.asUintN(64, bits));
        return view.getFloat64(0);
    }

    /**
     * Same as java.lang.Double.toHexString for finite values, e.g. 3.0 -> "0x1.8p1", -0.5 -> "-0x1.0p-1"
     */
    static toHexString(d: number): string {
        if (Number.isNaN(d)) return "NaN";
        if (d === Number.POSITIVE_INFINITY) return "Infinity";
        if (d === Number.NEGATIVE_INFINITY) return "-Infinity";

        let negative = d < 0 || Object.is(d, -0);
        let sign = negative ? "-" : "";
        if (d === 0) return sign + "0x0.0p0";

        let bits = HexFloat.doubleToBits(Math.abs(d));
        let exponentBits = Number((bits & HexFloat.EXPONENT_MASK) >> HexFloat.SIGNIFICAND_BITS);
        let subnormal = exponentBits === 0;

        let significand = (bits & HexFloat.SIGNIFICAND_MASK).toString(16).padStart(13, "0");
        significand = significand.replace(/0{1,12}$/, "");
        if (significand.length === 0) significand = "0";

        let exponent = subnormal ? -1022 : exponentBits - 1023;
        return sign + "0x" + (subnormal ? "0." : "1.") + significand + "p" + exponent;
    }

    /**
     * Mirrors java.util.Formatter.FormatSpecifier.hexDouble: returns the hex representation
     * (without the "0x" prefix and without sign) of a finite value >= 0, rounded (half even) to
     * precision hex digits after the point. precision == 0 means "no rounding".
     */
    static hexDouble(d: number, precision: number): string {
        if (!Number.isFinite(d) || d === 0 || precision === 0 || precision >= 13) {
            return HexFloat.toHexString(d).substring(2);
        }

        let bits = HexFloat.doubleToBits(d);
        let exponentBits = (bits & HexFloat.EXPONENT_MASK) >> HexFloat.SIGNIFICAND_BITS;
        let subnormal = exponentBits === 0n;
        if (subnormal) {
            d = d * Math.pow(2, 54);          // scale up so that the value is normal
            bits = HexFloat.doubleToBits(d);
        }

        let significantBits = 1n + BigInt(precision) * 4n;
        let shiftDistance = 53n - significantBits;
        let newSignif = (bits & (HexFloat.EXPONENT_MASK | HexFloat.SIGNIFICAND_MASK)) >> shiftDistance;
        let roundingBits = bits & ~(~0n << shiftDistance);
        let leastZero = (newSignif & 1n) === 0n;
        let round = ((1n << (shiftDistance - 1n)) & roundingBits) !== 0n;
        let sticky = shiftDistance > 1n && (~(1n << (shiftDistance - 1n)) & roundingBits) !== 0n;
        if ((leastZero && round && sticky) || (!leastZero && round)) newSignif++;

        let result = HexFloat.bitsToDouble(newSignif << shiftDistance);
        if (!Number.isFinite(result)) return "1.0p1024";

        let res = HexFloat.toHexString(result).substring(2);
        if (!subnormal) return res;

        let idx = res.indexOf('p');
        let exp = Number.parseInt(res.substring(idx + 1)) - 54;
        return res.substring(0, idx) + "p" + exp;
    }

}
