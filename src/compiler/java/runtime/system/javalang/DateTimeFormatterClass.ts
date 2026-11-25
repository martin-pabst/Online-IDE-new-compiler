import { DateFormatError, DateHelper, DatePattern, DatePatternSyntax } from "../../../../../tools/DateHelper";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { IllegalArgumentExceptionClass } from "./IllegalArgumentException";
import type { LocalDateTimeClass } from "./LocalDateTimeClass";
import { NullPointerExceptionClass } from "./NullPointerExceptionClass";
import { ObjectClass } from "./ObjectClassStringClass";

/**
 * java.time.format.DateTimeFormatter (pattern based formatting of LocalDateTime objects only)
 */
export class DateTimeFormatterClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class DateTimeFormatter extends Object", comment: JRC.DateTimeFormatterClassComment },

        { type: "method", signature: "static DateTimeFormatter ofPattern(string pattern)", native: DateTimeFormatterClass._ofPattern, comment: JRC.DateTimeFormatterOfPatternComment },
        { type: "method", signature: "string format(LocalDateTime dateTime)", native: DateTimeFormatterClass.prototype._format, comment: JRC.DateTimeFormatterFormatComment },
    ]

    static type: NonPrimitiveType;

    constructor(public datePattern?: DatePattern) {
        super();
    }

    static _ofPattern(pattern: string): DateTimeFormatterClass {
        return new DateTimeFormatterClass(DateTimeFormatterClass.parsePattern(pattern, "DateTimeFormatter"));
    }

    _format(dateTime: LocalDateTimeClass): string {
        if (dateTime == null) throw new NullPointerExceptionClass(JRC.localDateTimeNullPointerException());
        return DateTimeFormatterClass.formatDate(dateTime.date, this.datePattern);
    }

    /**
     * Helper for LocalDateTime and DateTimeFormatter: converts DateFormatErrors into IllegalArgumentExceptions.
     */
    static parsePattern(pattern: string, syntax: DatePatternSyntax): DatePattern {
        if (pattern == null) throw new NullPointerExceptionClass(JRC.datePatternNullPointerException());
        try {
            return DateHelper.parsePattern(pattern, syntax);
        } catch (e) {
            if (e instanceof DateFormatError) throw new IllegalArgumentExceptionClass(e.message);
            throw e;
        }
    }

    /**
     * Helper for LocalDateTime and DateTimeFormatter: converts DateFormatErrors into IllegalArgumentExceptions.
     */
    static formatDate(date: Date, datePattern: DatePattern): string {
        try {
            return datePattern.format(date);
        } catch (e) {
            if (e instanceof DateFormatError) throw new IllegalArgumentExceptionClass(e.message);
            throw e;
        }
    }

}
