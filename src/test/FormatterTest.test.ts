import { describe, expect, test } from 'vitest'

import { Formatter } from '../tools/formatter/Formatter';
import { GERMAN_LOCALE } from '../tools/formatter/FormatterTypes';
import { IllegalFormatExceptionClass } from '../compiler/java/runtime/system/javalang/IllegalFormatExceptionClass';
import { NullPointerExceptionClass } from '../compiler/java/runtime/system/javalang/NullPointerExceptionClass';
import { ObjectClass, StringClass } from '../compiler/java/runtime/system/javalang/ObjectClassStringClass';
import { IntegerClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/IntegerClass';
import { LongClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/LongClass';
import { ShortClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/ShortClass';
import { ByteClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/ByteClass';
import { DoubleClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/DoubleClass';
import { FloatClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/FloatClass';
import { BooleanClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/BooleanClass';
import { CharacterClass } from '../compiler/java/runtime/system/primitiveTypes/wrappers/CharacterClass';

type Case = [format: string, args: any[], expected: string];

function check(cases: Case[]) {
    for (let [format, args, expected] of cases) {
        expect(Formatter.format(format, ...args), `format("${format}", ${JSON.stringify(args)})`).toBe(expected);
    }
}

function expectIllegalFormat(format: string, args: any[], messagePrefix: string) {
    let thrown: any = undefined;
    try {
        Formatter.format(format, ...args);
    } catch (e) {
        thrown = e;
    }
    expect(thrown, `format("${format}") should throw`).toBeInstanceOf(IllegalFormatExceptionClass);
    expect(thrown.message, `message of format("${format}")`).toMatch(new RegExp("^" + messagePrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

class FooObject extends ObjectClass {
    toString() { return "Foo!"; }
}

describe("Formatter: %d %o %x", () => {
    test("decimal integers", () => check([
        ["%d", [42], "42"],
        ["%d", [-42], "-42"],
        ["%5d", [42], "   42"],
        ["%-5d|", [42], "42   |"],
        ["%05d", [42], "00042"],
        ["%05d", [-42], "-0042"],
        ["%2d", [12345], "12345"],
        ["%,d", [1234567], "1,234,567"],
        ["%,d", [-1234567], "-1,234,567"],
        ["%,d", [999], "999"],
        ["%,10d", [1234], "     1,234"],
        ["%+d", [5], "+5"],
        ["%+d", [-5], "-5"],
        ["% d", [5], " 5"],
        ["%(d", [-5], "(5)"],
        ["%(d", [5], "5"],
        ["%(08d", [-5], "(000005)"],
        ["%d", [new LongClass(1234567890123)], "1234567890123"],
        ["%d", [new IntegerClass(-7)], "-7"],
        ["%d", [3.0], "3"],
        ["%d", [null], "null"],
        ["%5d", [null], " null"],
    ]));

    test("octal and hexadecimal", () => check([
        ["%x", [255], "ff"],
        ["%X", [255], "FF"],
        ["%#x", [255], "0xff"],
        ["%#X", [255], "0XFF"],
        ["%08x", [255], "000000ff"],
        ["%#010x", [255], "0x000000ff"],
        ["%x", [-1], "ffffffff"],
        ["%x", [new IntegerClass(-1)], "ffffffff"],
        ["%x", [new LongClass(-1)], "ffffffffffffffff"],
        ["%x", [new ShortClass(-1)], "ffff"],
        ["%x", [new ByteClass(-1)], "ff"],
        ["%x", [4294967296], "100000000"],
        ["%o", [8], "10"],
        ["%#o", [8], "010"],
        ["%o", [-1], "37777777777"],
    ]));
});

describe("Formatter: %f %e %g %a", () => {
    test("fixed point", () => check([
        ["%f", [1.5], "1.500000"],
        ["%f", [0], "0.000000"],
        ["%f", [-0.0], "-0.000000"],
        ["%.2f", [2.675], "2.68"],
        ["%.2f", [1.005], "1.01"],
        ["%.0f", [2.5], "3"],
        ["%.0f", [0.5], "1"],
        ["%.3f", [0.0005], "0.001"],
        ["%.2f", [0.001], "0.00"],
        ["%.1f", [1e-7], "0.0"],
        ["%.2f", [1e21], "1000000000000000000000.00"],
        ["%f", [123456789.123], "123456789.123000"],
        ["%10.3f", [3.14159], "     3.142"],
        ["%-10.3f|", [3.14159], "3.142     |"],
        ["%,.2f", [1234567.891], "1,234,567.89"],
        ["%08.2f", [-3.5], "-0003.50"],
        ["%+.1f", [2.25], "+2.3"],
        ["% .1f", [2.25], " 2.3"],
        ["%(.1f", [-2.25], "(2.3)"],
        ["%#.0f", [3], "3."],
        ["%.2f", [new DoubleClass(2.675)], "2.68"],
        ["%.1f", [new FloatClass(0.5)], "0.5"],
        ["%f", [null], "null"],
    ]));

    test("scientific", () => check([
        ["%e", [12345.678], "1.234568e+04"],
        ["%E", [12345.678], "1.234568E+04"],
        ["%.2e", [0.000123], "1.23e-04"],
        ["%e", [0], "0.000000e+00"],
        ["%.0e", [12345], "1e+04"],
        ["%#.0e", [12345], "1.e+04"],
        ["%e", [1e100], "1.000000e+100"],
        ["%.3e", [9.9995], "1.000e+01"],
        ["%e", [1.5], "1.500000e+00"],
        ["%12.2e", [-1234.5], "   -1.23e+03"],
    ]));

    test("general", () => check([
        ["%g", [0.0001234], "0.000123400"],
        ["%g", [0.00001234], "1.23400e-05"],
        ["%G", [0.00001234], "1.23400E-05"],
        ["%g", [123456789], "1.23457e+08"],
        ["%g", [123.456], "123.456"],
        ["%.3g", [1234.5], "1.23e+03"],
        ["%g", [0], "0.00000"],
        ["%g", [1], "1.00000"],
        ["%g", [999999.5], "1.00000e+06"],
        ["%.0g", [1234], "1e+03"],
        ["%,g", [12345.678], "12,345.7"],
    ]));

    test("hexadecimal floating point", () => check([
        ["%a", [1.0], "0x1.0p0"],
        ["%a", [3.0], "0x1.8p1"],
        ["%a", [0.5], "0x1.0p-1"],
        ["%a", [-2.0], "-0x1.0p1"],
        ["%a", [0.0], "0x0.0p0"],
        ["%A", [3.0], "0X1.8P1"],
        ["%.3a", [1.0], "0x1.000p0"],
        ["%.1a", [1.0625], "0x1.1p0"],
        ["%.1a", [1.09375], "0x1.2p0"],
        ["%.2a", [1.5], "0x1.80p0"],
        ["%a", [Number.MIN_VALUE], "0x0.0000000000001p-1022"],
        ["%12a", [1.0], "     0x1.0p0"],
    ]));

    test("special values", () => check([
        ["%f", [Number.NaN], "NaN"],
        ["%8.2f", [Number.NaN], "     NaN"],
        ["%f", [Number.POSITIVE_INFINITY], "Infinity"],
        ["%f", [Number.NEGATIVE_INFINITY], "-Infinity"],
        ["%(f", [Number.NEGATIVE_INFINITY], "(Infinity)"],
        ["%+f", [Number.POSITIVE_INFINITY], "+Infinity"],
        ["%010f", [Number.POSITIVE_INFINITY], "  Infinity"],
        ["%E", [Number.POSITIVE_INFINITY], "INFINITY"],
        ["%G", [Number.NaN], "NAN"],
    ]));
});

describe("Formatter: %s %b %c %h %% %n", () => {
    test("strings", () => check([
        ["%s", ["abc"], "abc"],
        ["%S", ["abc"], "ABC"],
        ["%.2s", ["abc"], "ab"],
        ["%5s", ["abc"], "  abc"],
        ["%-5s|", ["abc"], "abc  |"],
        ["%s", [null], "null"],
        ["%.3s", [null], "nul"],
        ["%s", [true], "true"],
        ["%s", [42], "42"],
        ["%s", [1.5], "1.5"],
        ["%s", [new StringClass("x")], "x"],
        ["%s", [new IntegerClass(7)], "7"],
        ["%s", [new DoubleClass(1.5)], "1.5"],
        ["%s", [new CharacterClass("z")], "z"],
        ["%s", [new BooleanClass(false)], "false"],
        ["%s", [new FooObject()], "Foo!"],
        ["Hallo %s, du bist %d Jahre alt.", ["Max", 12], "Hallo Max, du bist 12 Jahre alt."],
        ["", [], ""],
        ["no specifiers", [1, 2], "no specifiers"],
    ]));

    test("booleans", () => check([
        ["%b", [null], "false"],
        ["%b", [true], "true"],
        ["%b", [false], "false"],
        ["%b", ["x"], "true"],
        ["%b", [0], "true"],
        ["%B", [true], "TRUE"],
        ["%.2b", [true], "tr"],
        ["%b", [new BooleanClass(false)], "false"],
        ["%6b|", [true], "  true|"],
    ]));

    test("characters", () => check([
        ["%c", ["x"], "x"],
        ["%C", ["x"], "X"],
        ["%c", [new CharacterClass("ß")], "ß"],
        ["%c", [65], "A"],
        ["%c", [new IntegerClass(0x1F600)], "😀"],
        ["%c", [new ShortClass(66)], "B"],
        ["%c", [null], "null"],
        ["%3c", ["x"], "  x"],
        ["%-3c|", ["x"], "x  |"],
    ]));

    test("hash codes", () => check([
        ["%h", ["hello"], "5e918d2"],
        ["%H", ["hello"], "5E918D2"],
        ["%h", [new StringClass("hello")], "5e918d2"],
        ["%h", [null], "null"],
        ["%h", [new IntegerClass(255)], "ff"],
        ["%h", [-1], "ffffffff"],
        ["%h", [true], "4cf"],
        ["%h", [false], "4d5"],
        ["%h", [new CharacterClass("A")], "41"],
        ["%h", [new LongClass(4294967297)], "0"],     // (2^32 + 1) ^ ((2^32 + 1) >>> 32) = 2^32 -> low 32 bits are 0
        ["%h", [new LongClass(4294967298)], "3"],
    ]));

    test("percent and newline", () => check([
        ["%%", [], "%"],
        ["100%%", [], "100%"],
        ["%5%", [], "    %"],
        ["%-3%|", [], "%  |"],
        ["%n", [], "\n"],
        ["a%nb", [], "a\nb"],
        ["%d%%%n", [50], "50%\n"],
    ]));

    test("argument indices", () => check([
        ["%2$s %1$s", ["a", "b"], "b a"],
        ["%s %<s", ["a"], "a a"],
        ["%1$s %s %s", ["a", "b"], "a a b"],
        ["%s %2$s %s", ["a", "b", "c"], "a b b"],
        ["%2$s %<S", ["a", "b"], "b B"],
        ["%s", ["a", "b"], "a"],                  // surplus arguments are ignored
        ["%2$s", ["a", "b", "c"], "b"],
    ]));
});

describe("Formatter: locale", () => {
    test("german locale via formatWithLocale", () => {
        expect(Formatter.formatWithLocale(GERMAN_LOCALE, "%,.2f", 1234567.891)).toBe("1.234.567,89");
        expect(Formatter.formatWithLocale(GERMAN_LOCALE, "%,d", 1234567)).toBe("1.234.567");
        expect(Formatter.formatWithLocale(GERMAN_LOCALE, "%e", 12345.678)).toBe("1,234568e+04");
        expect(Formatter.formatWithLocale(GERMAN_LOCALE, "%.1f", 2.25)).toBe("2,3");
    });

    test("static locale", () => {
        let saved = Formatter.locale;
        try {
            Formatter.locale = GERMAN_LOCALE;
            expect(Formatter.format("%.2f", 3.14159)).toBe("3,14");
        } finally {
            Formatter.locale = saved;
        }
        expect(Formatter.format("%.2f", 3.14159)).toBe("3.14");
    });
});

describe("Formatter: exceptions", () => {
    test("incompatible arguments", () => {
        expectIllegalFormat("%d", ["x"], "IllegalFormatConversionException: d != java.lang.String");
        expectIllegalFormat("%d", [new StringClass("x")], "IllegalFormatConversionException: d != java.lang.String");
        expectIllegalFormat("%d", [new DoubleClass(1)], "IllegalFormatConversionException: d != java.lang.Double");
        expectIllegalFormat("%d", [1.5], "IllegalFormatConversionException: d != java.lang.Double");
        expectIllegalFormat("%d", [true], "IllegalFormatConversionException: d != java.lang.Boolean");
        expectIllegalFormat("%d", [new CharacterClass("x")], "IllegalFormatConversionException: d != java.lang.Character");
        expectIllegalFormat("%x", [new FooObject()], "IllegalFormatConversionException: x != ");
        expectIllegalFormat("%f", [new IntegerClass(1)], "IllegalFormatConversionException: f != java.lang.Integer");
        expectIllegalFormat("%e", ["1.5"], "IllegalFormatConversionException: e != java.lang.String");
        expectIllegalFormat("%c", [new LongClass(65)], "IllegalFormatConversionException: c != java.lang.Long");
        expectIllegalFormat("%c", ["ab"], "IllegalFormatConversionException: c != java.lang.String");
        expectIllegalFormat("%c", [1.5], "IllegalFormatConversionException: c != java.lang.Double");
        expectIllegalFormat("%c", [0x110000], "IllegalFormatCodePointException: Code point = 0x110000");
    });

    test("illegal format strings", () => {
        expectIllegalFormat("%q", [1], "UnknownFormatConversionException: Conversion = 'q'");
        expectIllegalFormat("%F", [1.5], "UnknownFormatConversionException: Conversion = 'F'");
        expectIllegalFormat("%D", [1], "UnknownFormatConversionException: Conversion = 'D'");
        expectIllegalFormat("abc%", [], "UnknownFormatConversionException: Conversion = '%'");
        expectIllegalFormat("%tY", [1], "UnknownFormatConversionException: Conversion = 'tY'");
        expectIllegalFormat("%-d", [1], "MissingFormatWidthException: %-d");
        expectIllegalFormat("%0d", [1], "MissingFormatWidthException: %0d");
        expectIllegalFormat("%-s", ["x"], "MissingFormatWidthException: %-s");
        expectIllegalFormat("%-05d", [1], "IllegalFormatFlagsException: Flags = '-0'");
        expectIllegalFormat("%+ d", [1], "IllegalFormatFlagsException: Flags = '+ '");
        expectIllegalFormat("%00d", [1], "DuplicateFormatFlagsException: Flags = '0'");
        expectIllegalFormat("%.2d", [1], "IllegalFormatPrecisionException: 2");
        expectIllegalFormat("%.2c", ["x"], "IllegalFormatPrecisionException: 2");
        expectIllegalFormat("%#d", [1], "FormatFlagsConversionMismatchException: Conversion = d, Flags = #");
        expectIllegalFormat("%,x", [1], "FormatFlagsConversionMismatchException: Conversion = x, Flags = ,");
        expectIllegalFormat("%+x", [1], "FormatFlagsConversionMismatchException: Conversion = x, Flags = +");
        expectIllegalFormat("%#s", ["x"], "FormatFlagsConversionMismatchException: Conversion = s, Flags = #");
        expectIllegalFormat("%+s", ["x"], "FormatFlagsConversionMismatchException: Conversion = s, Flags = +");
        expectIllegalFormat("%,e", [1.5], "FormatFlagsConversionMismatchException: Conversion = e, Flags = ,");
        expectIllegalFormat("%(a", [1.5], "FormatFlagsConversionMismatchException: Conversion = a, Flags = (");
        expectIllegalFormat("%#g", [1.5], "FormatFlagsConversionMismatchException: Conversion = g, Flags = #");
        expectIllegalFormat("%5n", [], "IllegalFormatWidthException: 5");
        expectIllegalFormat("%-n", [], "IllegalFormatFlagsException: Flags = '-'");
        expectIllegalFormat("%+%", [], "IllegalFormatFlagsException: Flags = '+'");
        expectIllegalFormat("%0$s", ["x"], "IllegalFormatArgumentIndexException: Illegal format argument index = 0");
    });

    test("missing arguments", () => {
        expectIllegalFormat("%s %s", ["x"], "MissingFormatArgumentException: Format specifier '%s'");
        expectIllegalFormat("%d", [], "MissingFormatArgumentException: Format specifier '%d'");
        expectIllegalFormat("%<s", ["x"], "MissingFormatArgumentException: Format specifier '%<s'");
        expectIllegalFormat("%3$s", ["x", "y"], "MissingFormatArgumentException: Format specifier '%3$s'");
    });

    test("null format string", () => {
        expect(() => Formatter.format(<any>null)).toThrow(NullPointerExceptionClass);
    });
});
