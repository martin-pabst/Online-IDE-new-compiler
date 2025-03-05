import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { EnumClass } from '../system/javalang/EnumClass';

export enum ScaleMode {linear, nearest_neighbour};

export class ScaleModeEnum extends EnumClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum ScaleMode", comment: JRC.scaleModeEnumComment },

    ]

    static type: NonPrimitiveType;

    static values = [
        new ScaleModeEnum("linear", ScaleMode.linear),
        new ScaleModeEnum("nearest_neighbour", ScaleMode.nearest_neighbour)
    ]

}