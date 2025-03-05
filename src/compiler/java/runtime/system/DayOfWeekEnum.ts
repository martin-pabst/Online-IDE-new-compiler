import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { EnumClass } from './javalang/EnumClass';

export enum DayOfWeek {monday, tuesday, wednesday, thursday, friday, saturday, sunday}

export class DayOfWeekEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum DayOfWeek", comment: JRC.DayOfWeekEnumComment },

    ]

    static type: NonPrimitiveType;

    static values = [
        new DayOfWeekEnum(JRC.DayOfWeekMondayConst(), DayOfWeek.monday),
        new DayOfWeekEnum(JRC.DayOfWeekTuesdayConst(), DayOfWeek.tuesday),
        new DayOfWeekEnum(JRC.DayOfWeekWednesdayConst(), DayOfWeek.wednesday),
        new DayOfWeekEnum(JRC.DayOfWeekThursdayConst(), DayOfWeek.thursday),
        new DayOfWeekEnum(JRC.DayOfWeekFridayConst(), DayOfWeek.friday),
        new DayOfWeekEnum(JRC.DayOfWeekSaturdayConst(), DayOfWeek.saturday),
        new DayOfWeekEnum(JRC.DayOfWeekSundayConst(), DayOfWeek.sunday)
    ]


}