import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { EnumClass } from '../system/javalang/EnumClass';

export enum Direction {top, right, bottom, left}

export class DirectionEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum Direction", comment: JRC.DirectionEnumComment },

    ]

    static type: NonPrimitiveType;

    static values = [
        new DirectionEnum("top", Direction.top),
        new DirectionEnum("right", Direction.right),
        new DirectionEnum("bottom", Direction.bottom),
        new DirectionEnum("left", Direction.left)
    ]


}