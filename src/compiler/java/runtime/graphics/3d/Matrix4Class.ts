import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import * as THREE from 'three';
import { Vector3Class } from "./Vector3Class";

export class Matrix4Class extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Matrix4 extends Object", comment: JRC.Matrix4ClassComment },
        { type: "method", signature: "Matrix4()", native: Matrix4Class.prototype._constructorIdentity, comment: JRC.Matrix4ConstructorIdentityComment },
        { type: "method", signature: "Matrix4( double n11, double n12, double n13, double n14, double n21, double n22, double n23, double n24, double n31, double n32, double n33, double n34, double n41, double n42, double n43, double n44)", native: Matrix4Class.prototype._constructorTuples, comment: JRC.Matrix4ConstructorTupleComment },
        { type: "method", signature: "Matrix4( Matrix4 otherMatrix)", native: Matrix4Class.prototype._constructorOtherMatrix, comment: JRC.Matrix4ConstructorOtherMatrixComment },
        { type: "method", signature: "Matrix4 makeRotationX(double angleInDegrees)", native: Matrix4Class.prototype._makeRotationX, comment: JRC.Matrix4MakeRotationXComment },
        { type: "method", signature: "Matrix4 makeRotationY(double angleInDegrees)", native: Matrix4Class.prototype._makeRotationY, comment: JRC.Matrix4MakeRotationYComment },
        { type: "method", signature: "Matrix4 makeRotationZ(double angleInDegrees)", native: Matrix4Class.prototype._makeRotationZ, comment: JRC.Matrix4MakeRotationZComment },
        { type: "method", signature: "Matrix4 makeRotationAxis(Vector3 axis)", native: Matrix4Class.prototype._makeRotationAxis, comment: JRC.Matrix4MakeRotationAxisComment },
        { type: "method", signature: "Matrix4 makeScale(double x, double y, double z)", native: Matrix4Class.prototype._makeScale, comment: JRC.Matrix4MakeScaleComment },
        { type: "method", signature: "Matrix4 makeTranslation(Vector3 v)", native: Matrix4Class.prototype._makeTranslation, comment: JRC.Matrix4MakeTranslationComment },
        { type: "method", signature: "Matrix4 makeTranslation(double x, double y, double z)", native: Matrix4Class.prototype._makeTranslationXYZ, comment: JRC.Matrix4MakeTranslationComment },
        { type: "method", signature: "Matrix4 multiplyScalar(double factor)", native: Matrix4Class.prototype._multiplyScalar, comment: JRC.Matrix4MultiplyScalarComment },
        { type: "method", signature: "Matrix4 invert()", native: Matrix4Class.prototype._invert, comment: JRC.Matrix4InvertComment },
        { type: "method", signature: "double determinant()", native: Matrix4Class.prototype._determinant, comment: JRC.Matrix4DeterminantComment },
        { type: "method", signature: "Matrix4 clone()", native: Matrix4Class.prototype._clone, comment: JRC.Matrix4CloneComment },
        { type: "method", signature: "Matrix4 copyFropm(Matrix4 m)", native: Matrix4Class.prototype._copyFrom, comment: JRC.Matrix4CopyFromComment },
        { type: "method", signature: "Matrix4 multiply(Matrix4 m)", native: Matrix4Class.prototype._multiply, comment: JRC.Matrix4MultiplyComment },
        { type: "method", signature: "Matrix4 premultiply(Matrix4 m)", native: Matrix4Class.prototype._premultiply, comment: JRC.Matrix4preMultiplyComment },
    ];

    static type: NonPrimitiveType;

    m: THREE.Matrix4;

    constructor(m?: THREE.Matrix4) {
        super();
        this.m = m;
    }

    _constructorIdentity() {
        this.m = new THREE.Matrix4();
        return this;
    }

    _constructorTuples(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number) {
        this.m = new THREE.Matrix4(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
        return this;
    }

    _constructorOtherMatrix(m: THREE.Matrix4){
        this.m = new THREE.Matrix4().copy(m);
        return this;
    }

    _makeRotationX(angleInDegrees: number){
        this.m.makeRotationX(angleInDegrees/180*Math.PI);
        return this;
    }

    _makeRotationY(angleInDegrees: number){
        this.m.makeRotationY(angleInDegrees/180*Math.PI);
        return this;
    }

    _makeRotationZ(angleInDegrees: number){
        this.m.makeRotationZ(angleInDegrees/180*Math.PI);
        return this;
    }

    _makeRotationAxis(axis: Vector3Class, angleInDegrees: number){
        this.m.makeRotationAxis(axis.v, angleInDegrees/180*Math.PI);
        return this;
    }

    _makeScale(x: number, y: number, z: number){
        this.m.makeScale(x, y, z);
        return this;
    }

    _makeTranslation(v: Vector3Class){
        this.m.makeTranslation(v.v);
        return this;
    }

    _makeTranslationXYZ(x: number, y: number, z: number){
        this.m.makeTranslation(x, y, z);
        return this;
    }

    _multiplyScalar(factor: number){
        this.m.multiplyScalar(factor);
        return this;
    }

    _invert(){
        this.m.invert();
        return this;
    }

    _determinant(){
        return this.m.determinant();
    }

    _clone(): Matrix4Class {
        return new Matrix4Class(this.m.clone());
    }

    _copyFrom(m1: Matrix4Class){
        this.m.copy(m1.m);
        return this;
    }

    _multiply(m1: Matrix4Class){
        this.m.multiply(m1.m);
        return this;
    }

    _premultiply(m1: Matrix4Class){
        this.m.premultiply(m1.m);
        return this;
    }

}