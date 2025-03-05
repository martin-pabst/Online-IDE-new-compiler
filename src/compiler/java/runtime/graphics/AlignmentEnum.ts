import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { EnumClass } from '../system/javalang/EnumClass';

export enum Alignment {left, center, right, top, bottom}

export class AlignmentEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum Alignment", comment: JRC.AlignmentEnumComment },

    ]

    static type: NonPrimitiveType;

    static values = [
        new AlignmentEnum("left", Alignment.left),
        new AlignmentEnum("center", Alignment.center),
        new AlignmentEnum("right", Alignment.right),
        new AlignmentEnum("top", Alignment.top),
        new AlignmentEnum("bottom", Alignment.bottom)
    ]


}