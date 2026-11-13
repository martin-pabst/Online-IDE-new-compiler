/**
 * Locale-dependent characters used by {@link Formatter}.
 */
export type FormatterLocale = {
    decimalSeparator: string;
    groupingSeparator: string;
}

export const ENGLISH_LOCALE: FormatterLocale = { decimalSeparator: ".", groupingSeparator: "," };
export const GERMAN_LOCALE: FormatterLocale = { decimalSeparator: ",", groupingSeparator: "." };

/**
 * One parsed format specifier, e.g. %-10.3f
 * Syntax (see java.util.Formatter): %[argument_index$][flags][width][.precision]conversion
 */
export type FormatSpecifier = {
    raw: string;                    // the specifier as written in the format string, e.g. "%-10.3f"
    argumentIndex?: number;         // explicit 1-based argument index ("%2$s"), undefined if not given
    usePreviousArgument: boolean;   // '<' flag: reuse the argument of the previous specifier
    flags: string;                  // validated flag characters, each at most once (subset of "-#+ 0,(<")
    width?: number;
    precision?: number;
    conversion: string;             // lower-case conversion character: b h s c d o x e f g a % n
    upperCase: boolean;             // true for B H S C X E G A
}

/** A format string is parsed into fixed text and specifiers. */
export type FormatSegment = string | FormatSpecifier;
