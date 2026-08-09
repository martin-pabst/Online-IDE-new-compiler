import { Position } from "../../common/range/Position"
import { JavaArrayType } from "../types/JavaArrayType";
import type { JavaPackage } from "../types/JavaPackage";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";

export type TypePosition = {
    position: Position;
    type: NonPrimitiveType | StaticNonPrimitiveType | JavaArrayType | JavaPackage;
}