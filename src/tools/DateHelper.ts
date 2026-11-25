import { DateHelperMessages } from "./DateHelperMessages";
import { currentLanguageId } from "./language/LanguageManager";

/**
 * Formats Date objects (interpreted in the browser's local time) with pattern strings.
 *
 * Two pattern syntaxes are supported:
 *  - "SimpleDateFormat": like java.text.SimpleDateFormat,
 *    see https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html
 *  - "DateTimeFormatter": like java.time.format.DateTimeFormatter.ofPattern,
 *    see https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html
 *    (including optional sections [...] and pad modifier p)
 *
 * Time zone pattern letters are not supported (a LocalDateTime has no time zone): they throw a
 * DateFormatError, except inside an optional section of a DateTimeFormatter pattern, which is then omitted
 * (as in Java). Pattern letter B (day period) isn't supported either.
 *
 * Month names, weekday names etc. and the week rules (pattern letters w, W, Y, e, c) depend on the
 * language: "de" gives German names and ISO weeks (Monday first, first week has at least 4 days),
 * "en" gives English names and US weeks (Sunday first, first week has at least 1 day).
 * The language defaults to the IDE's current language.
 */
export class DateHelper {

    /**
     * Parses the given pattern. Use this to format several dates with the same pattern.
     * @throws DateFormatError if the pattern is invalid
     */
    static parsePattern(pattern: string, syntax: DatePatternSyntax = "SimpleDateFormat"): DatePattern {
        let elements = syntax == "SimpleDateFormat" ? parseSimpleDateFormatPattern(pattern) : parseDateTimeFormatterPattern(pattern);
        return new DatePattern(pattern, syntax, elements);
    }

    /**
     * Formats date according to pattern.
     * @param language "de" or "en"; defaults to the IDE's current language
     * @throws DateFormatError if the pattern is invalid
     */
    static format(date: Date, pattern: string, syntax: DatePatternSyntax = "SimpleDateFormat", language?: string): string {
        return DateHelper.parsePattern(pattern, syntax).format(date, language);
    }

    /**
     * Number of complete days from start until end (negative if end is earlier), like Java's
     * LocalDateTime.until(end, ChronoUnit.DAYS). Uses local date and time of day, so a daylight saving time
     * change in between doesn't matter.
     */
    static daysUntil(start: Date, end: Date): number {
        let days = epochDay(end.getFullYear(), end.getMonth() + 1, end.getDate()) - epochDay(start.getFullYear(), start.getMonth() + 1, start.getDate());
        let timeOfDayDifference = milliOfDay(end) - milliOfDay(start);
        if (days > 0 && timeOfDayDifference < 0) {
            days--;
        } else if (days < 0 && timeOfDayDifference > 0) {
            days++;
        }
        return days;
    }

    /**
     * Returns a new Date which is days later (earlier if days is negative) than date at the same local time of day,
     * like Java's LocalDateTime.plusDays, even if there's a daylight saving time change in between.
     */
    static plusDays(date: Date, days: number): Date {
        let result = new Date(date.getTime());
        result.setDate(result.getDate() + days);
        return result;
    }

}

export type DatePatternSyntax = "SimpleDateFormat" | "DateTimeFormatter";

/**
 * Thrown if a pattern is invalid or can't be applied. The message is in the IDE's current language.
 */
export class DateFormatError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DateFormatError";
    }
}

/**
 * A parsed pattern, see DateHelper.parsePattern.
 */
export class DatePattern {

    constructor(readonly pattern: string, readonly syntax: DatePatternSyntax, private readonly elements: PatternElement[]) {
    }

    /**
     * @param language "de" or "en"; defaults to the IDE's current language
     * @throws DateFormatError if a padded field is wider than its pad width (DateTimeFormatter syntax only)
     */
    format(date: Date, language: string = currentLanguageId): string {
        let values = new DateValues(date, localeData[language] ?? localeData["de"]);
        return this.formatElements(this.elements, values) ?? "";
    }

    /**
     * @returns undefined if elements contain a field which is not available (time zone)
     */
    private formatElements(elements: PatternElement[], values: DateValues): string | undefined {
        let s = "";
        for (let element of elements) {
            switch (element.kind) {
                case "literal":
                    s += element.text;
                    break;
                case "field":
                    s += this.syntax == "SimpleDateFormat" ? formatSimpleDateFormatField(element, values) : formatDateTimeFormatterField(element, values);
                    break;
                case "optional":
                    // like Java: an optional section containing a field which is not available is omitted
                    s += this.formatElements(element.elements, values) ?? "";
                    break;
                case "unavailable":
                    return undefined;
            }
        }
        return s;
    }
}

type FieldElement = { kind: "field", letter: string, count: number, padWidth: number };
type LiteralElement = { kind: "literal", text: string };
/** DateTimeFormatter syntax: [...] */
type OptionalElement = { kind: "optional", elements: PatternElement[] };
/** DateTimeFormatter syntax: time zone field inside an optional section */
type UnavailableElement = { kind: "unavailable" };
type PatternElement = FieldElement | LiteralElement | OptionalElement | UnavailableElement;

type LocaleData = {
    monthsFull: string[],
    monthsShort: string[],
    monthsShortStandalone: string[],
    monthsNarrow: string[],
    /** index 0 is Monday */
    weekdaysFull: string[],
    weekdaysShort: string[],
    weekdaysShortStandalone: string[],
    weekdaysNarrow: string[],
    amPm: string[],
    /** index 0: BC, index 1: AD */
    erasShort: string[],
    erasFull: string[],
    erasNarrow: string[],
    quartersShort: string[],
    quartersFull: string[],
    /** ISO numbering: 1 == Monday, ..., 7 == Sunday */
    firstDayOfWeek: number,
    minimalDaysInFirstWeek: number
}

// names as in Java 9+ (CLDR locale data) for Locale.GERMANY and Locale.US
const localeData: Record<string, LocaleData> = {
    "de": {
        monthsFull: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        monthsShort: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
        monthsShortStandalone: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        monthsNarrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        weekdaysFull: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
        weekdaysShort: ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."],
        weekdaysShortStandalone: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        weekdaysNarrow: ["M", "D", "M", "D", "F", "S", "S"],
        amPm: ["AM", "PM"],
        erasShort: ["v. Chr.", "n. Chr."],
        erasFull: ["v. Chr.", "n. Chr."],
        erasNarrow: ["v. Chr.", "n. Chr."],
        quartersShort: ["Q1", "Q2", "Q3", "Q4"],
        quartersFull: ["1. Quartal", "2. Quartal", "3. Quartal", "4. Quartal"],
        firstDayOfWeek: 1,
        minimalDaysInFirstWeek: 4
    },
    "en": {
        monthsFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        monthsShortStandalone: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        monthsNarrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        weekdaysFull: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weekdaysShortStandalone: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weekdaysNarrow: ["M", "T", "W", "T", "F", "S", "S"],
        amPm: ["AM", "PM"],
        erasShort: ["BC", "AD"],
        erasFull: ["Before Christ", "Anno Domini"],
        erasNarrow: ["B", "A"],
        quartersShort: ["Q1", "Q2", "Q3", "Q4"],
        quartersFull: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
        firstDayOfWeek: 7,
        minimalDaysInFirstWeek: 1
    }
}

/*
 * Parsing
 */

const simpleDateFormatLetters = "GyYMLwWDdFEuaHkKhmsS";
const simpleDateFormatTimeZoneLetters = "zZX";

const dateTimeFormatterLetters = "GuyYDMLdQqwWEecFahKkHmsSAnNg";
const dateTimeFormatterTimeZoneLetters = "VvzOXxZ";
const dateTimeFormatterReservedCharacters = "{}#";

function isAsciiLetter(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
}

function runLength(pattern: string, start: number): number {
    let end = start + 1;
    while (end < pattern.length && pattern[end] == pattern[start]) end++;
    return end - start;
}

/**
 * Follows java.text.SimpleDateFormat.compile
 */
function parseSimpleDateFormatPattern(pattern: string): PatternElement[] {
    let elements: PatternElement[] = [];
    let pos = 0;
    while (pos < pattern.length) {
        let c = pattern[pos];
        if (c == "'") {
            if (pattern[pos + 1] == "'") {
                // '' outside of quoted text
                elements.push({ kind: "literal", text: "'" });
                pos += 2;
                continue;
            }
            let text = "";
            pos++;
            while (true) {
                if (pos >= pattern.length) throw new DateFormatError(DateHelperMessages.unterminatedQuote(pattern));
                if (pattern[pos] == "'") {
                    if (pattern[pos + 1] != "'") break;
                    // '' inside quoted text
                    pos++;
                }
                text += pattern[pos++];
            }
            elements.push({ kind: "literal", text: text });
            pos++;  // skip closing quote
        } else if (isAsciiLetter(c)) {
            if (simpleDateFormatTimeZoneLetters.includes(c)) throw new DateFormatError(DateHelperMessages.timeZoneNotSupported(c, pattern));
            if (!simpleDateFormatLetters.includes(c)) throw new DateFormatError(DateHelperMessages.unknownPatternLetter(c, pattern));
            let count = runLength(pattern, pos);
            elements.push({ kind: "field", letter: c, count: count, padWidth: 0 });
            pos += count;
        } else {
            elements.push({ kind: "literal", text: c });
            pos++;
        }
    }
    return elements;
}

/**
 * Follows java.time.format.DateTimeFormatterBuilder.parsePattern and parseField
 */
function parseDateTimeFormatterPattern(pattern: string): PatternElement[] {
    let root: PatternElement[] = [];
    // stack of element lists of open optional sections; root is at index 0
    let stack: PatternElement[][] = [root];

    let pos = 0;
    while (pos < pattern.length) {
        let current = stack[stack.length - 1];
        let c = pattern[pos];
        if (isAsciiLetter(c)) {
            let count = runLength(pattern, pos);
            pos += count;
            let padWidth = 0;
            if (c == "p") {
                // pad modifier: pads the next field with spaces to width count
                if (pos >= pattern.length || !isAsciiLetter(pattern[pos])) {
                    throw new DateFormatError(DateHelperMessages.padLetterWithoutPattern(pattern));
                }
                padWidth = count;
                c = pattern[pos];
                count = runLength(pattern, pos);
                pos += count;
            }

            if (dateTimeFormatterTimeZoneLetters.includes(c)) {
                if (stack.length == 1) throw new DateFormatError(DateHelperMessages.timeZoneNotSupported(c, pattern));
                current.push({ kind: "unavailable" });
            } else if (c == "B") {
                throw new DateFormatError(DateHelperMessages.dayPeriodNotSupported(pattern));
            } else if (dateTimeFormatterLetters.includes(c)) {
                checkDateTimeFormatterLetterCount(c, count, pattern);
                current.push({ kind: "field", letter: c, count: count, padWidth: padWidth });
            } else {
                throw new DateFormatError(DateHelperMessages.unknownPatternLetter(c, pattern));
            }
        } else if (c == "'") {
            let start = pos++;
            for (; pos < pattern.length; pos++) {
                if (pattern[pos] == "'") {
                    if (pos + 1 < pattern.length && pattern[pos + 1] == "'") {
                        pos++;
                    } else {
                        break;
                    }
                }
            }
            if (pos >= pattern.length) throw new DateFormatError(DateHelperMessages.unterminatedQuote(pattern));
            let text = pattern.substring(start + 1, pos);
            current.push({ kind: "literal", text: text.length == 0 ? "'" : text.replace(/''/g, "'") });
            pos++;
        } else if (c == "[") {
            let optional: OptionalElement = { kind: "optional", elements: [] };
            current.push(optional);
            stack.push(optional.elements);
            pos++;
        } else if (c == "]") {
            if (stack.length == 1) throw new DateFormatError(DateHelperMessages.closingBracketWithoutOpeningBracket(pattern));
            stack.pop();
            pos++;
        } else if (dateTimeFormatterReservedCharacters.includes(c)) {
            throw new DateFormatError(DateHelperMessages.reservedCharacter(c, pattern));
        } else {
            current.push({ kind: "literal", text: c });
            pos++;
        }
    }
    return root;
}

function checkDateTimeFormatterLetterCount(letter: string, count: number, pattern: string) {
    let maxCount: number;
    switch (letter) {
        case "c":
            if (count == 2) throw new DateFormatError(DateHelperMessages.invalidPattern("cc", pattern));
            maxCount = 5;
            break;
        case "G": case "M": case "L": case "Q": case "q": case "E": case "e":
            maxCount = 5;
            break;
        case "a": case "F": case "W":
            maxCount = 1;
            break;
        case "d": case "h": case "H": case "k": case "K": case "m": case "s": case "w":
            maxCount = 2;
            break;
        case "D":
            maxCount = 3;
            break;
        case "S":
            maxCount = 9;
            break;
        default:    // u, y, Y, A, n, N, g
            maxCount = 19;
    }
    if (count > maxCount) throw new DateFormatError(DateHelperMessages.tooManyPatternLetters(letter, pattern));
}

/*
 * Formatting
 */

function formatSimpleDateFormatField(field: FieldElement, v: DateValues): string {
    let count = field.count;
    let locale = v.locale;
    switch (field.letter) {
        case "G": return locale.erasShort[v.era];
        case "y": return count == 2 ? zeroPad(v.yearOfEra % 100, 2) : zeroPad(v.yearOfEra, count);
        case "Y": return count == 2 ? zeroPad(Math.abs(v.weekBasedYear) % 100, 2) : zeroPad(v.weekBasedYear, count);
        case "M": return count >= 4 ? locale.monthsFull[v.month - 1] : count == 3 ? locale.monthsShort[v.month - 1] : zeroPad(v.month, count);
        case "L": return count >= 4 ? locale.monthsFull[v.month - 1] : count == 3 ? locale.monthsShortStandalone[v.month - 1] : zeroPad(v.month, count);
        case "w": return zeroPad(v.weekOfWeekBasedYear, count);
        case "W": return zeroPad(v.weekOfMonth, count);
        case "D": return zeroPad(v.dayOfYear, count);
        case "d": return zeroPad(v.dayOfMonth, count);
        case "F": return zeroPad(v.alignedWeekOfMonth, count);
        case "E": return count >= 4 ? locale.weekdaysFull[v.isoDayOfWeek - 1] : locale.weekdaysShort[v.isoDayOfWeek - 1];
        case "u": return zeroPad(v.isoDayOfWeek, count);
        case "a": return locale.amPm[v.amPm];
        case "H": return zeroPad(v.hour, count);
        case "k": return zeroPad(v.clockHourOfDay, count);
        case "K": return zeroPad(v.hourOfAmPm, count);
        case "h": return zeroPad(v.clockHourOfAmPm, count);
        case "m": return zeroPad(v.minute, count);
        case "s": return zeroPad(v.second, count);
        case "S": return zeroPad(v.millisecond, count);
    }
    return "";
}

function formatDateTimeFormatterField(field: FieldElement, v: DateValues): string {
    let count = field.count;
    let locale = v.locale;
    let s: string = "";
    switch (field.letter) {
        case "G": s = textByCount(count, locale.erasShort, locale.erasFull, locale.erasNarrow, v.era); break;
        case "u": s = formatYear(v.year, count); break;
        case "y": s = formatYear(v.yearOfEra, count); break;
        case "Y": s = formatYear(v.weekBasedYear, count); break;
        case "Q": case "q":
            s = count <= 2 ? zeroPad(v.quarter, count) : textByCount(count, locale.quartersShort, locale.quartersFull, ["1", "2", "3", "4"], v.quarter - 1);
            break;
        case "M":
            s = count <= 2 ? zeroPad(v.month, count) : textByCount(count, locale.monthsShort, locale.monthsFull, locale.monthsNarrow, v.month - 1);
            break;
        case "L":
            s = count <= 2 ? zeroPad(v.month, count) : textByCount(count, locale.monthsShortStandalone, locale.monthsFull, locale.monthsNarrow, v.month - 1);
            break;
        case "E":
            s = textByCount(Math.max(count, 3), locale.weekdaysShort, locale.weekdaysFull, locale.weekdaysNarrow, v.isoDayOfWeek - 1);
            break;
        case "e":
            s = count <= 2 ? zeroPad(v.localizedDayOfWeek, count) : textByCount(count, locale.weekdaysShort, locale.weekdaysFull, locale.weekdaysNarrow, v.isoDayOfWeek - 1);
            break;
        case "c":
            s = count == 1 ? zeroPad(v.localizedDayOfWeek, 1) : textByCount(count, locale.weekdaysShortStandalone, locale.weekdaysFull, locale.weekdaysNarrow, v.isoDayOfWeek - 1);
            break;
        case "d": s = zeroPad(v.dayOfMonth, count); break;
        case "D": s = zeroPad(v.dayOfYear, count); break;
        case "F": s = zeroPad(v.alignedWeekOfMonth, count); break;
        case "w": s = zeroPad(v.weekOfWeekBasedYear, count); break;
        case "W": s = zeroPad(v.weekOfMonth, count); break;
        case "a": s = locale.amPm[v.amPm]; break;
        case "H": s = zeroPad(v.hour, count); break;
        case "k": s = zeroPad(v.clockHourOfDay, count); break;
        case "K": s = zeroPad(v.hourOfAmPm, count); break;
        case "h": s = zeroPad(v.clockHourOfAmPm, count); break;
        case "m": s = zeroPad(v.minute, count); break;
        case "s": s = zeroPad(v.second, count); break;
        // fraction of second: exactly count digits
        case "S": s = zeroPad(v.nanoOfSecond, 9).substring(0, count); break;
        case "A": s = zeroPad(v.milliOfDay, count); break;
        case "n": s = zeroPad(v.nanoOfSecond, count); break;
        case "N": s = zeroPad(v.nanoOfDay, count); break;
        case "g": s = zeroPad(v.modifiedJulianDay, count); break;
    }

    if (field.padWidth > 0) {
        if (s.length > field.padWidth) throw new DateFormatError(DateHelperMessages.padWidthExceeded(s, field.padWidth));
        s = s.padStart(field.padWidth, " ");
    }

    return s;
}

/**
 * count 3: short text, count 4: full text, count 5: narrow text
 */
function textByCount(count: number, short: string[], full: string[], narrow: string[], index: number): string {
    if (count == 4) return full[index];
    if (count == 5) return narrow[index];
    return short[index];
}

/**
 * DateTimeFormatter: yy is reduced to two digits, yyyy and more use SignStyle.EXCEEDS_PAD
 */
function formatYear(year: number, count: number): string {
    if (count == 2) return zeroPad(Math.abs(year) % 100, 2);
    let s = zeroPad(year, count);
    if (count >= 4 && year > 0 && s.length > count) s = "+" + s;
    return s;
}

function zeroPad(value: number, minDigits: number): string {
    let digits = Math.abs(value).toString().padStart(minDigits, "0");
    return value < 0 ? "-" + digits : digits;
}

/*
 * Date values
 */

function floorMod(x: number, y: number): number {
    return ((x % y) + y) % y;
}

function lengthOfYear(year: number): number {
    let isLeapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    return isLeapYear ? 366 : 365;
}

/**
 * Days since 1970-01-01 (proleptic gregorian calendar)
 */
function epochDay(year: number, month: number, dayOfMonth: number): number {
    let d = new Date(0);
    d.setUTCFullYear(year, month - 1, dayOfMonth);  // unlike Date.UTC, setUTCFullYear doesn't map years 0 - 99 to 1900 - 1999
    return Math.round(d.getTime() / (24 * 3600 * 1000));
}

function milliOfDay(date: Date): number {
    return ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 + date.getMilliseconds();
}

/*
 * Week computations follow java.time.temporal.WeekFields.ComputedDayOfField
 */

/**
 * @returns offset of the first day of the first week of the month/year relative to day 1
 */
function startOfWeekOffset(day: number, localizedDayOfWeek: number, minimalDaysInFirstWeek: number): number {
    let weekStart = floorMod(day - localizedDayOfWeek, 7);
    let offset = -weekStart;
    if (weekStart + 1 > minimalDaysInFirstWeek) {
        // the previous week has the minimum days in the current month/year to be a 'week'
        offset = 7 - weekStart;
    }
    return offset;
}

function computeWeek(offset: number, day: number): number {
    return Math.floor((7 + offset + (day - 1)) / 7);
}

class DateValues {
    readonly year: number;
    readonly month: number;
    readonly dayOfMonth: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    /** 1 == Monday, ..., 7 == Sunday */
    readonly isoDayOfWeek: number;
    readonly dayOfYear: number;

    constructor(private readonly date: Date, readonly locale: LocaleData) {
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        this.dayOfMonth = date.getDate();
        this.hour = date.getHours();
        this.minute = date.getMinutes();
        this.second = date.getSeconds();
        this.millisecond = date.getMilliseconds();
        this.isoDayOfWeek = floorMod(date.getDay() - 1, 7) + 1;
        this.dayOfYear = epochDay(this.year, this.month, this.dayOfMonth) - epochDay(this.year, 1, 1) + 1;
    }

    /** 0 == BC, 1 == AD */
    get era(): number { return this.year > 0 ? 1 : 0; }
    get yearOfEra(): number { return this.year > 0 ? this.year : 1 - this.year; }
    get quarter(): number { return Math.floor((this.month - 1) / 3) + 1; }

    /** 0 == AM, 1 == PM */
    get amPm(): number { return this.hour < 12 ? 0 : 1; }
    /** 1 - 24 */
    get clockHourOfDay(): number { return this.hour == 0 ? 24 : this.hour; }
    /** 0 - 11 */
    get hourOfAmPm(): number { return this.hour % 12; }
    /** 1 - 12 */
    get clockHourOfAmPm(): number { return this.hour % 12 == 0 ? 12 : this.hour % 12; }

    get nanoOfSecond(): number { return this.millisecond * 1000000; }
    get milliOfDay(): number { return milliOfDay(this.date); }
    get nanoOfDay(): number { return this.milliOfDay * 1000000; }
    get modifiedJulianDay(): number { return epochDay(this.year, this.month, this.dayOfMonth) + 40587; }

    /** SimpleDateFormat: F (day of week in month), DateTimeFormatter: F */
    get alignedWeekOfMonth(): number { return Math.floor((this.dayOfMonth - 1) / 7) + 1; }

    /** 1 == first day of week in this locale */
    get localizedDayOfWeek(): number { return floorMod(this.isoDayOfWeek - this.locale.firstDayOfWeek, 7) + 1; }

    get weekOfMonth(): number {
        let offset = startOfWeekOffset(this.dayOfMonth, this.localizedDayOfWeek, this.locale.minimalDaysInFirstWeek);
        return computeWeek(offset, this.dayOfMonth);
    }

    get weekBasedYear(): number {
        let minimalDays = this.locale.minimalDaysInFirstWeek;
        let offset = startOfWeekOffset(this.dayOfYear, this.localizedDayOfWeek, minimalDays);
        let week = computeWeek(offset, this.dayOfYear);
        if (week == 0) return this.year - 1;
        // date in partial week at the end of the year which belongs to the next year?
        let newYearWeek = computeWeek(offset, lengthOfYear(this.year) + minimalDays);
        if (week >= newYearWeek) return this.year + 1;
        return this.year;
    }

    get weekOfWeekBasedYear(): number {
        return DateValues.weekOfWeekBasedYear(this.year, this.dayOfYear, this.localizedDayOfWeek, this.locale.minimalDaysInFirstWeek);
    }

    private static weekOfWeekBasedYear(year: number, dayOfYear: number, localizedDayOfWeek: number, minimalDays: number): number {
        let offset = startOfWeekOffset(dayOfYear, localizedDayOfWeek, minimalDays);
        let week = computeWeek(offset, dayOfYear);
        if (week == 0) {
            // day belongs to the last week of the previous year: compute week of December 31st of previous year
            let previousYear = year - 1;
            let dayOfWeekOfDecember31st = floorMod(localizedDayOfWeek - 1 - dayOfYear, 7) + 1;
            return DateValues.weekOfWeekBasedYear(previousYear, lengthOfYear(previousYear), dayOfWeekOfDecember31st, minimalDays);
        } else if (week > 50) {
            // date in partial week at the end of the year which belongs to the next year?
            let newYearWeek = computeWeek(offset, lengthOfYear(year) + minimalDays);
            if (week >= newYearWeek) week = week - newYearWeek + 1;
        }
        return week;
    }
}
