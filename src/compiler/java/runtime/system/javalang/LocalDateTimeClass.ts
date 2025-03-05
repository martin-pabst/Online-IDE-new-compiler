import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
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

        { type: "method", signature: "int compareTo(LocalDateTime object)", java: LocalDateTimeClass.prototype._mj$compareTo$int$T, comment: JRC.comparableCompareToComment },


        { type: "method", signature: "String toString()", java: LocalDateTimeClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]

    static type: NonPrimitiveType;

    date!: Date;

    _cj$_constructor_$LocalDateTime$(t: Thread, callback: CallbackFunction) {
        this._constructor();

        this.date = new Date();

        t.s.push(this);
    }

    static _now() {
        let obj = new LocalDateTimeClass();
        obj.date = new Date();
        return obj;
    }

    static _of(year: number, month: number, dayOfMonth: number, hour: number, minute: number, second: number) {
        let obj = new LocalDateTimeClass();
        obj.date = new Date(year, month - 1, dayOfMonth, hour, minute, second);
        return obj;
    }

    _plusDays(days: number) {
        return new Date(this.date.getTime() + days * 24 * 3600 * 1000);
    }

    _minusDays(days: number) {
        return new Date(this.date.getTime() - days * 24 * 3600 * 1000);
    }

    _mj$compareTo$int$T(otherDate: LocalDateTimeClass) {
        return Math.sign(this.date.getTime() - otherDate.date.getTime());
    }

    _until(otherDate: LocalDateTimeClass) {
        return (this.date.getTime() - otherDate.date.getTime()) / (24 * 3600 * 1000);
    }


    _mj$toString$String$(t: Thread, callback: CallbackFunction) {

        t.s.push(new StringClass(`${this.td(this.date.getDate())}.${this.td(this.date.getMonth() + 1)}.${this.td(this.date.getFullYear())} ${this.td(this.date.getHours())}:${this.td(this.date.getMinutes())}:${this.td(this.date.getSeconds())}`));
        if(callback) callback();
        return;
    }

    private td(value: number) {
        if (value < 10) return "0" + value;
        return "" + value;
    }
}