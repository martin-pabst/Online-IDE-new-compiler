import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { DateHelper } from "../../../../../tools/DateHelper";
import { DateTimeFormatterClass } from "./DateTimeFormatterClass";
import { NullPointerExceptionClass } from "./NullPointerExceptionClass";
import { ObjectClass, StringClass } from "./ObjectClassStringClass";

export class LocalDateTimeClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class LocalDateTime extends Object implements Comparable<LocalDateTime>", comment: JRC.LocalDateTimeClassComment },

        { type: "method", signature: "LocalDateTime()", java: LocalDateTimeClass.prototype._cj$_constructor_$LocalDateTime$, comment: JRC.LocalDateTimeEmptyConstructorComment },

        { type: "method", signature: "static LocalDateTime now()", native: LocalDateTimeClass._now, comment: JRC.LocalDateTimeNowComment },
        { type: "method", signature: "static LocalDateTime of(int year, int month, int dayOfMonth, int hour, int minute, int second)", native: LocalDateTimeClass._of, comment: JRC.LocalDateTimeOfComment },
        { type: "method", signature: "LocalDateTime plusDays(int days)", native: LocalDateTimeClass.prototype._plusDays, comment: JRC.LocalDateTimePlusDaysComment },
        { type: "method", signature: "LocalDateTime minusDays(int days)", native: LocalDateTimeClass.prototype._minusDays, comment: JRC.LocalDateTimeMinusDaysComment },
        { type: "method", signature: "int until(LocalDateTime object)", native: LocalDateTimeClass.prototype._until, comment: JRC.LocalDateTimeUntilComment },

        { type: "method", signature: "int getYear()", template: `§1.date.getFullYear()`, comment: JRC.LocalDateTimeGetYearComment },
        { type: "method", signature: "int getMonth()", template: `§1.date.getMonth() + 1`, comment: JRC.LocalDateTimeGetMonthComment },
        { type: "method", signature: "int getDayOfMonth()", template: `§1.date.getDate()`, comment: JRC.LocalDateTimeGetDayOfMonthComment },
        { type: "method", signature: "int getHour()", template: `§1.date.getHours()`, comment: JRC.LocalDateTimeGetHourComment },
        { type: "method", signature: "int getMinute()", template: `§1.date.getMinutes()`, comment: JRC.LocalDateTimeGetMinuteComment },
        { type: "method", signature: "int getSecond()", template: `§1.date.getSeconds()`, comment: JRC.LocalDateTimeGetSecondComment },

        // java-implementation is needed for calls via interface Comparable (method identifier _mj$compareTo$int$T)
        { type: "method", signature: "int compareTo(LocalDateTime object)", native: LocalDateTimeClass.prototype._compareTo, java: LocalDateTimeClass.prototype._mj$compareTo$int$T, comment: JRC.comparableCompareToComment },

        { type: "method", signature: "string format(string pattern)", native: LocalDateTimeClass.prototype._format, comment: JRC.LocalDateTimeFormatComment },
        { type: "method", signature: "string toString(string pattern)", native: LocalDateTimeClass.prototype._format, comment: JRC.LocalDateTimeFormatComment },
        { type: "method", signature: "string format(DateTimeFormatter formatter)", native: LocalDateTimeClass.prototype._formatWithFormatter, comment: JRC.LocalDateTimeFormatWithFormatterComment },

        { type: "method", signature: "String toString()", java: LocalDateTimeClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]

    static type: NonPrimitiveType;

    date!: Date;

    _cj$_constructor_$LocalDateTime$(t: Thread, callback: CallbackFunction) {
        this._constructor();

        this.date = new Date();

        t.s.push(this);
    }

    constructor(date ?: Date) {
        super();
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }

    static _now() {
        let obj = new LocalDateTimeClass();
        return obj;
    }

    static _of(year: number, month: number, dayOfMonth: number, hour: number, minute: number, second: number) {
        let obj = new LocalDateTimeClass(new Date(year, month - 1, dayOfMonth, hour, minute, second));
        return obj;
    }

    _plusDays(days: number): LocalDateTimeClass {
        return new LocalDateTimeClass(DateHelper.plusDays(this.date, days));
    }

    _minusDays(days: number): LocalDateTimeClass {
        return new LocalDateTimeClass(DateHelper.plusDays(this.date, -days));
    }

    _compareTo(otherDate: LocalDateTimeClass): number {
        if (otherDate == null) throw new NullPointerExceptionClass(JRC.localDateTimeNullPointerException());
        return Math.sign(this.date.getTime() - otherDate.date.getTime());
    }

    _mj$compareTo$int$T(t: Thread, callback: CallbackFunction, otherDate: LocalDateTimeClass) {
        t.s.push(this._compareTo(otherDate));
        if (callback) callback();
    }

    /**
     * complete days from this until otherDate, like Java's this.until(otherDate, ChronoUnit.DAYS)
     */
    _until(otherDate: LocalDateTimeClass): number {
        if (otherDate == null) throw new NullPointerExceptionClass(JRC.localDateTimeNullPointerException());
        return DateHelper.daysUntil(this.date, otherDate.date);
    }

    /**
     * pattern as in java.text.SimpleDateFormat
     */
    _format(pattern: string): string {
        return DateTimeFormatterClass.formatDate(this.date, DateTimeFormatterClass.parsePattern(pattern, "SimpleDateFormat"));
    }

    _formatWithFormatter(formatter: DateTimeFormatterClass): string {
        if (formatter == null) throw new NullPointerExceptionClass(JRC.dateTimeFormatterNullPointerException());
        return formatter._format(this);
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        t.s.push(new StringClass(this._format("dd.MM.yyyy HH:mm:ss")));
        if(callback) callback();
        return;
    }

}
