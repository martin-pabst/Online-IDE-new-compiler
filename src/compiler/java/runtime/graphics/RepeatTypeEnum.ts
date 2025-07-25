import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { EnumClass } from '../system/javalang/EnumClass';

export enum RepeatType {once, onceWithoutDestroying, loop, backAndForth}

export class RepeatTypeEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum RepeatType", comment: JRC.repeatTypeEnumComment },

    ]

    static type: NonPrimitiveType;

    static values = [
        new RepeatTypeEnum("once", RepeatType.once),
        new RepeatTypeEnum("onceWithoutDestroying", RepeatType.onceWithoutDestroying),
        new RepeatTypeEnum("loop", RepeatType.loop),
        new RepeatTypeEnum("backAndForth", RepeatType.backAndForth)
    ]


}