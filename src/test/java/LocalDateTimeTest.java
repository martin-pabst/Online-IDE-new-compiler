/**::
 * LocalDateTime
 */

LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 15, 25);
LocalDateTime ldt2 = LocalDateTime.of(2025, 5, 10, 12, 15, 25);

assertEquals(2024, ldt.getYear(), "LocalDateTime.getYear");
assertEquals(6, ldt.getMonth(), "LocalDateTime.getMonth");
assertEquals(20, ldt.getDayOfMonth(), "LocalDateTime.getDayOfMonth");
assertEquals(12, ldt.getHour(), "LocalDateTime.getHour");
assertEquals(15, ldt.getMinute(), "LocalDateTime.getMinute");
assertEquals(25, ldt.getSecond(), "LocalDateTime.getSecond");

assertEquals(324, ldt.until(ldt2), "LocalDateTime.until");

/**::
 * LocalDateTime.until: complete days, negative if the argument is earlier
 */
LocalDateTime start = LocalDateTime.of(2024, 6, 20, 12, 0, 0);
assertEquals(324, LocalDateTime.of(2024, 6, 20, 12, 15, 25).until(LocalDateTime.of(2025, 5, 10, 12, 15, 25)), "later");
assertEquals(-324, LocalDateTime.of(2025, 5, 10, 12, 15, 25).until(LocalDateTime.of(2024, 6, 20, 12, 15, 25)), "earlier");
assertEquals(0, start.until(start), "same date-time");
assertEquals(0, start.until(LocalDateTime.of(2024, 6, 21, 11, 59, 59)), "one second less than a day");
assertEquals(1, start.until(LocalDateTime.of(2024, 6, 21, 12, 0, 0)), "exactly one day");
assertEquals(1, start.until(LocalDateTime.of(2024, 6, 22, 11, 0, 0)), "one day and 23 hours");
assertEquals(0, start.until(LocalDateTime.of(2024, 6, 19, 12, 0, 1)), "one second less than a day earlier");
assertEquals(-1, start.until(LocalDateTime.of(2024, 6, 19, 12, 0, 0)), "exactly one day earlier");
assertEquals(-1, start.until(LocalDateTime.of(2024, 6, 18, 13, 0, 0)), "one day and 23 hours earlier");
assertEquals(366, LocalDateTime.of(2024, 1, 1, 0, 0, 0).until(LocalDateTime.of(2025, 1, 1, 0, 0, 0)), "leap year");
// daylight saving time starts on March 31st, 2024 in central Europe
assertEquals(1, LocalDateTime.of(2024, 3, 30, 12, 0, 0).until(LocalDateTime.of(2024, 3, 31, 12, 0, 0)), "daylight saving time change");
int days = start.until(start.plusDays(5));
assertEquals(5, days, "result is an int");

/**::
 * LocalDateTime.plusDays/minusDays keep the time of day
 */
LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 15, 25);
assertEquals("25.06.2024 12:15:25", ldt.plusDays(5).toString(), "plusDays");
assertEquals("15.06.2024 12:15:25", ldt.minusDays(5).toString(), "minusDays");
assertEquals("15.06.2024 12:15:25", ldt.plusDays(-5).toString(), "plusDays with negative argument");
assertEquals("25.06.2024 12:15:25", ldt.minusDays(-5).toString(), "minusDays with negative argument");
assertEquals("20.06.2024 12:15:25", ldt.toString(), "ldt is unchanged");

assertEquals("01.01.2025 23:59:59", LocalDateTime.of(2024, 12, 31, 23, 59, 59).plusDays(1).toString(), "end of year");
assertEquals("29.02.2024 00:00:00", LocalDateTime.of(2024, 2, 28, 0, 0, 0).plusDays(1).toString(), "leap day");
assertEquals("29.02.2024 00:00:00", LocalDateTime.of(2024, 3, 1, 0, 0, 0).minusDays(1).toString(), "leap day backwards");
assertEquals("31.12.2024 08:00:00", LocalDateTime.of(2024, 1, 1, 8, 0, 0).plusDays(365).toString(), "365 days in a leap year");

// daylight saving time starts on March 31st and ends on October 27th, 2024 in central Europe
assertEquals("31.03.2024 12:00:00", LocalDateTime.of(2024, 3, 30, 12, 0, 0).plusDays(1).toString(), "plusDays over start of daylight saving time");
assertEquals("30.03.2024 12:00:00", LocalDateTime.of(2024, 3, 31, 12, 0, 0).minusDays(1).toString(), "minusDays over start of daylight saving time");
assertEquals("27.10.2024 12:00:00", LocalDateTime.of(2024, 10, 26, 12, 0, 0).plusDays(1).toString(), "plusDays over end of daylight saving time");
assertEquals("26.10.2024 12:00:00", LocalDateTime.of(2024, 10, 27, 12, 0, 0).minusDays(1).toString(), "minusDays over end of daylight saving time");

/**::
 * LocalDateTime.toString()
 */
LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 5, 7);
assertEquals("20.06.2024 12:05:07", ldt.toString(), "toString()");
assertEquals("Zeit: 20.06.2024 12:05:07", "Zeit: " + ldt, "string concatenation");

/**::
 * LocalDateTime.compareTo (direct, via Comparable and Collections.sort)
 */
LocalDateTime a = LocalDateTime.of(2024, 6, 20, 12, 15, 25);
LocalDateTime b = LocalDateTime.of(2025, 5, 10, 12, 15, 25);
LocalDateTime c = LocalDateTime.of(2023, 1, 1, 0, 0, 0);
assertEquals(-1, a.compareTo(b), "a < b");
assertEquals(1, b.compareTo(a), "b > a");
assertEquals(0, a.compareTo(LocalDateTime.of(2024, 6, 20, 12, 15, 25)), "a == a");

Comparable<LocalDateTime> comparable = a;
assertEquals(-1, comparable.compareTo(b), "compareTo via Comparable");

ArrayList<LocalDateTime> list = new ArrayList<>();
list.add(b);
list.add(a);
list.add(c);
Collections.sort(list);
assertEquals("01.01.2023 00:00:00", list.get(0).toString(), "sorted: first");
assertEquals("20.06.2024 12:15:25", list.get(1).toString(), "sorted: second");
assertEquals("10.05.2025 12:15:25", list.get(2).toString(), "sorted: third");

/**::
 * LocalDateTime.format(String) and toString(String) with SimpleDateFormat patterns (German)
 */
LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 15, 25);   // Thursday
assertEquals("20.06.2024 12:15:25", ldt.format("dd.MM.yyyy HH:mm:ss"), "dd.MM.yyyy HH:mm:ss");
assertEquals("20.06.2024 12:15:25", ldt.toString("dd.MM.yyyy HH:mm:ss"), "toString(String)");
String pattern = "d.M.yy";
assertEquals("20.6.24", ldt.format(pattern), "pattern in variable");
assertEquals("2024-06-20T12:15:25", ldt.format("yyyy-MM-dd'T'HH:mm:ss"), "ISO with quoted T");

assertEquals("Donnerstag, 20. Juni 2024", ldt.format("EEEE, d. MMMM yyyy"), "full names");
assertEquals("Do., 20. Juni 2024", ldt.format("EEE, dd. MMM yyyy"), "short names");
assertEquals("6 06 Jun Juni", ldt.format("L LL LLL LLLL"), "standalone month");
LocalDateTime march = LocalDateTime.of(2025, 3, 5, 9, 7, 3);
assertEquals("März Mär März", march.format("MMM LLL MMMM"), "March short/standalone/full");

assertEquals("12 Uhr, 12 PM", ldt.format("H 'Uhr', h a"), "quoted text, AM/PM");
assertEquals("'12'", ldt.format("''HH''"), "escaped quotes outside quoted text");
assertEquals("o'clock", ldt.format("'o''clock'"), "escaped quote inside quoted text");
assertEquals("20.06. - 12:15", ldt.format("dd.MM. - HH:mm"), "non-letters are copied");
assertEquals("n. Chr. 2024", ldt.format("G yyyy"), "era");
assertEquals("2024 2024 24 02024", ldt.format("y yyy yy yyyyy"), "year lengths");
assertEquals("0 000", ldt.format("S SSS"), "milliseconds");

assertEquals("172 0172", ldt.format("D DDDD"), "day of year");
assertEquals("25 3 3 4", ldt.format("w W F u"), "week of year, week of month, day of week in month, day number of week");
assertEquals("09:07:03 9:7:3", march.format("HH:mm:ss H:m:s"), "padding");

LocalDateTime midnight = LocalDateTime.of(2024, 1, 1, 0, 5, 7);
assertEquals("00 24 0 12 AM", midnight.format("HH k K h a"), "hours at midnight");
LocalDateTime evening = LocalDateTime.of(2024, 1, 1, 23, 5, 7);
assertEquals("23 23 11 11 PM", evening.format("HH k K h a"), "hours in the evening");

// ISO week years
assertEquals("2025-W01-1", LocalDateTime.of(2024, 12, 30, 0, 0, 0).format("YYYY-'W'ww-u"), "2024-12-30 is in week 1 of 2025");
assertEquals("2020-W53-5", LocalDateTime.of(2021, 1, 1, 0, 0, 0).format("YYYY-'W'ww-u"), "2021-01-01 is in week 53 of 2020");
assertEquals("2026-W53-5", LocalDateTime.of(2027, 1, 1, 0, 0, 0).format("YYYY-'W'ww-u"), "2027-01-01 is in week 53 of 2026");
assertEquals("2026-W01-4", LocalDateTime.of(2026, 1, 1, 0, 0, 0).format("YYYY-'W'ww-u"), "2026-01-01 is in week 1 of 2026");
assertEquals("0", LocalDateTime.of(2024, 6, 1, 0, 0, 0).format("W"), "June 1st 2024 (Saturday) is in week 0 of June");

/**::
 * LocalDateTime.format(String): invalid patterns
 */
LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 15, 25);
assertEquals("IllegalArgumentException", formatError(ldt, "dd.bb.yyyy"), "unknown pattern letter");
assertEquals("IllegalArgumentException", formatError(ldt, "HH 'Uhr"), "unterminated quote");
assertEquals("IllegalArgumentException", formatError(ldt, "HH:mm z"), "time zone");
assertEquals("IllegalArgumentException", formatError(ldt, "HH:mm Z"), "time zone");
assertEquals("IllegalArgumentException", formatError(ldt, "HH:mm X"), "time zone");
assertEquals("NullPointerException", formatError(ldt, null), "null pattern");
assertEquals("no exception", formatError(ldt, "[{#}]"), "brackets and braces are no special characters in SimpleDateFormat");

String message = "";
try {
    ldt.format("dd.bb.yyyy");
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Der Buchstabe 'b' ist im Datumsformat \"dd.bb.yyyy\" nicht erlaubt. Text muss in einfache Anführungszeichen gesetzt werden, z.B. \"dd.MM.yyyy 'um' HH:mm\".", message, "exception message");

String formatError(LocalDateTime ldt, String pattern) {
    try {
        ldt.format(pattern);
    } catch(IllegalArgumentException e) {
        return "IllegalArgumentException";
    } catch(NullPointerException e) {
        return "NullPointerException";
    }
    return "no exception";
}

/**::
 * DateTimeFormatter.ofPattern (German)
 */
LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 15, 25);   // Thursday
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
assertEquals("20.06.2024 12:15:25", formatter.format(ldt), "formatter.format(ldt)");
assertEquals("20.06.2024 12:15:25", ldt.format(formatter), "ldt.format(formatter)");
assertEquals("Donnerstag, 20. Juni 2024", ldt.format(DateTimeFormatter.ofPattern("EEEE, d. MMMM uuuu")), "full names");

assertEquals("Do. Do. Do. Donnerstag D", ldt.format(DateTimeFormatter.ofPattern("E EE EEE EEEE EEEEE")), "day of week");
assertEquals("6 06 Juni Juni J", ldt.format(DateTimeFormatter.ofPattern("M MM MMM MMMM MMMMM")), "month");
assertEquals("6 06 Jun Juni J", ldt.format(DateTimeFormatter.ofPattern("L LL LLL LLLL LLLLL")), "standalone month");
assertEquals("4 04 Do. Donnerstag 4 Do Donnerstag", ldt.format(DateTimeFormatter.ofPattern("e ee eee eeee c ccc cccc")), "localized day of week");
assertEquals("2 02 Q2 2. Quartal 2", ldt.format(DateTimeFormatter.ofPattern("Q QQ QQQ QQQQ QQQQQ")), "quarter");
assertEquals("2024 24 2024 02024 2024 24 2024", ldt.format(DateTimeFormatter.ofPattern("u uu uuuu uuuuu y yy yyyy")), "year");
assertEquals("n. Chr. n. Chr.", ldt.format(DateTimeFormatter.ofPattern("G GGGG")), "era");
assertEquals("172 172 172 25 25 3 3 2024", ldt.format(DateTimeFormatter.ofPattern("D DD DDD w ww W F Y")), "day of year and weeks");
assertEquals("12:15 PM, 0 12", ldt.format(DateTimeFormatter.ofPattern("h:mm a, K k")), "hours");
assertEquals("0 000 000000000 0 44125000 44125000000000 60481", ldt.format(DateTimeFormatter.ofPattern("S SSS SSSSSSSSS n A N g")), "fractions, milli/nano of day, modified julian day");
assertEquals("5 05 005 5 05 1 01", LocalDateTime.of(2024, 1, 5, 1, 2, 3).format(DateTimeFormatter.ofPattern("D DD DDD d dd H HH")), "padding");

assertEquals("Uhrzeit: 12 Uhr, o'clock, '", ldt.format(DateTimeFormatter.ofPattern("'Uhrzeit:' HH 'Uhr', 'o''clock', ''")), "quoted text");
assertEquals("2024-06-20 12:15", ldt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd[ HH:mm]")), "optional section");
assertEquals("2024-06-20 12:15", ldt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd[ HH:mm][ z]")), "optional section with time zone is omitted");
assertEquals("2024-06", ldt.format(DateTimeFormatter.ofPattern("[yyyy[ VV]-MM]")), "nested optional section with time zone is omitted");
assertEquals("20.06.", ldt.format(DateTimeFormatter.ofPattern("[dd.MM.")), "unclosed optional section");
assertEquals("20|  6|12", ldt.format(DateTimeFormatter.ofPattern("ppd|pppM|ppH")), "pad modifier");

/**::
 * DateTimeFormatter.ofPattern: invalid patterns
 */
LocalDateTime ldt = LocalDateTime.of(2024, 6, 20, 12, 15, 25);
assertEquals("IllegalArgumentException", ofPatternError("bb"), "unknown pattern letter");
assertEquals("IllegalArgumentException", ofPatternError("HH 'Uhr"), "unterminated quote");
assertEquals("IllegalArgumentException", ofPatternError("ddd"), "too many letters: d");
assertEquals("IllegalArgumentException", ofPatternError("EEEEEE"), "too many letters: E");
assertEquals("IllegalArgumentException", ofPatternError("aa"), "too many letters: a");
assertEquals("IllegalArgumentException", ofPatternError("cc"), "cc");
assertEquals("IllegalArgumentException", ofPatternError("HH:mm z"), "time zone outside of optional section");
assertEquals("IllegalArgumentException", ofPatternError("dd]"), "] without [");
assertEquals("IllegalArgumentException", ofPatternError("dd{"), "reserved character");
assertEquals("IllegalArgumentException", ofPatternError("pp"), "pad letter without pattern letter");
assertEquals("IllegalArgumentException", ofPatternError("B"), "day period");
assertEquals("NullPointerException", ofPatternError(null), "null pattern");
assertEquals("no exception", ofPatternError("dd.MM.yyyy"), "valid pattern");

String message = "no exception";
try {
    ldt.format(DateTimeFormatter.ofPattern("pd"));
} catch(IllegalArgumentException e) {
    message = e.getMessage();
}
assertEquals("Die Ausgabe \"20\" ist länger als die Füllbreite 1.", message, "pad width exceeded");

message = "no exception";
try {
    DateTimeFormatter f = null;
    ldt.format(f);
} catch(NullPointerException e) {
    message = "NullPointerException";
}
assertEquals("NullPointerException", message, "ldt.format(null formatter)");

String ofPatternError(String pattern) {
    try {
        DateTimeFormatter.ofPattern(pattern);
    } catch(IllegalArgumentException e) {
        return "IllegalArgumentException";
    } catch(NullPointerException e) {
        return "NullPointerException";
    }
    return "no exception";
}

