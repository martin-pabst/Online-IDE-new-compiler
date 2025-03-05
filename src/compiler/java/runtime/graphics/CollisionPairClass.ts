import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { ShapeClass } from "./ShapeClass";

export class CollisionPairClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class CollisionPair<U extends Shape, V extends Shape> extends Object", comment: JRC.collisionPairClassComment},
        {type: "method", signature: "CollisionPair(U ShapeA, V shapeB)", native: CollisionPairClass.prototype._collisionPairConstructor, comment: JRC.collisionPairConstructorComment},
        {type: "field", signature: "public U shapeA", comment: JRC.collisionPairShapeAComment},
        {type: "field", signature: "public V shapeB", comment: JRC.collisionPairShapeBComment}
    ]

    static type: NonPrimitiveType;

    constructor(public shapeA?: ShapeClass, public shapeB?: ShapeClass){
        super();
    }

    _collisionPairConstructor(shapeA: ShapeClass, shapeB: ShapeClass){
        super._constructor();
        this.shapeA = shapeA;
        this.shapeB = shapeB;
        return this;
    }
}