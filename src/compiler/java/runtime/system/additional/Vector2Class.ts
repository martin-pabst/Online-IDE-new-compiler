import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../javalang/ObjectClassStringClass";

export class Vector2Class extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Vector2 extends Object", comment: JRC.Vector2ClassComment },

        { type: "field", signature: "public double x", comment: JRC.Vector2XComment },
        { type: "field", signature: "public double y", comment: JRC.Vector2YComment },

        { type: "method", signature: "Vector2(double x, double y)", native: Vector2Class.prototype._constructor2, comment: JRC.Vector2ConstructorComment },

        { type: "method", signature: "static Vector2 fromPolarCoordinates()", native: Vector2Class._fromPolarCoordinates, comment: JRC.Vector2ToStringComment },
        { type: "method", signature: "final double getAngleDeg()", native: Vector2Class.prototype._getAngleDeg, comment: JRC.Vector2GetAngleDegComment },
        { type: "method", signature: "final double getAngleRad()", native: Vector2Class.prototype._getAngleRad, comment: JRC.Vector2GetAngleRadComment },
        { type: "method", signature: "final double getLength()", native: Vector2Class.prototype._getLength, comment: JRC.Vector2GetLengthComment },
        { type: "method", signature: "final Vector2 getUnitVector()", native: Vector2Class.prototype._getUnitVector, comment: JRC.Vector2GetUnitVectorComment },
        { type: "method", signature: "final Vector2 clone()", native: Vector2Class.prototype._clone, comment: JRC.Vector2CloneComment },
        { type: "method", signature: "final Vector2 setLength(double newLength)", native: Vector2Class.prototype._setLength, comment: JRC.Vector2SetLengthComment },
        { type: "method", signature: "final Vector2 scaledBy(double factor)", native: Vector2Class.prototype._scaledBy, comment: JRC.Vector2ScaledByComment },
        { type: "method", signature: "final Vector2 scale(double factor)", native: Vector2Class.prototype._scale, comment: JRC.Vector2ScaleComment },
        { type: "method", signature: "final Vector2 rotatedBy(double angleDeg)", native: Vector2Class.prototype._rotatedBy, comment: JRC.Vector2RotatedByComment },
        { type: "method", signature: "final Vector2 rotate(double angleDeg)", native: Vector2Class.prototype._rotate, comment: JRC.Vector2RotateComment },
        { type: "method", signature: "final Vector2 plus(Vector2 otherVector)", native: Vector2Class.prototype._plus, comment: JRC.Vector2PlusComment },
        { type: "method", signature: "final Vector2 minus(Vector2 otherVector)", native: Vector2Class.prototype._minus, comment: JRC.Vector2MinusComment },
        { type: "method", signature: "final Vector2 add(Vector2 otherVector)", native: Vector2Class.prototype._add, comment: JRC.Vector2AddComment },
        { type: "method", signature: "final Vector2 sub(Vector2 otherVector)", native: Vector2Class.prototype._sub, comment: JRC.Vector2SubComment },
        { type: "method", signature: "final double scalarProduct(Vector2 otherVector)", native: Vector2Class.prototype._scalarProduct, comment: JRC.Vector2ScalarProductComment },
        { type: "method", signature: "final double distanceTo(Vector2 otherVector)", native: Vector2Class.prototype._distanceTo, comment: JRC.Vector2DistanceToComment },
        { type: "method", signature: "final static double distance(double x1, double y1, double x2, double y2)", native: Vector2Class._distance, comment: JRC.Vector2DistanceComment },

        { type: "method", signature: "public boolean equals(Vector2 otherVector)", native: Vector2Class.prototype._equals , comment: JRC.objectEqualsComment},
        { type: "method", signature: "String toString()", java: Vector2Class.prototype._mj$toString$String$, comment: JRC.Vector2ToStringComment },
    ];

    static type: NonPrimitiveType;

    x: number;
    y: number;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }

    _constructor2(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    _equals(other: Vector2Class): boolean {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) < 1e-14;
    }

    _plus(other: Vector2Class) {
        return new Vector2Class(this.x + other.x, this.y + other.y);
    }

    _minus(other: Vector2Class) {
        return new Vector2Class(this.x - other.x, this.y - other.y);
    }

    static _fromPolarCoordinates(r: number, alphaDeg: number) {
        let alphaRad = alphaDeg / 180 * Math.PI;
        return new Vector2Class(r * Math.cos(alphaRad), r * Math.sin(alphaRad));
    }

    _getAngleDeg() {
        let angle = Math.atan2(this.y, this.x) / Math.PI * 180;

        return angle >= 0 ? angle : 360 + angle;
    }

    _getAngleRad() {
        let angle = Math.atan2(this.y, this.x);

        return angle >= 0 ? angle : Math.PI*2 + angle;
    }

    _getLength() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    _getUnitVector(){
        let length2 = this.x * this.x + this.y * this.y;
        if(length2 < 1e-14) return new Vector2Class(0, 0);

        let length: number = Math.sqrt(length2);

        return new Vector2Class(this.x/length, this.y/length);

    }

    _clone(){

        return new Vector2Class(this.x, this.y);

    }

    _setLength(newLength: number): Vector2Class {
        let oldLength = Math.sqrt(this.x*this.x + this.y*this.y);
        if(oldLength > 0){
            let factor = newLength/oldLength;
            this.x *= factor;
            this.y *= factor;
        }
        return this;
    }

    _add(other: Vector2Class): Vector2Class {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    _sub(other: Vector2Class): Vector2Class {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    _scalarProduct(other: Vector2Class): number {
        return this.x*other.x + this.y*other.y;
    }

    _scaledBy(factor: number): Vector2Class {
        return new Vector2Class(this.x*factor, this.y*factor);
    }

    _rotatedBy(angleDeg: number): Vector2Class {
        let angleRad = angleDeg/180*Math.PI;
        let sin = Math.sin(angleRad);
        let cos = Math.cos(angleRad);

        return new Vector2Class(this.x*cos - this.y*sin, this.x*sin + this.y*cos);
    }

    _rotate(angleDeg: number): Vector2Class {
        let angleRad = angleDeg/180*Math.PI;
        let sin = Math.sin(angleRad);
        let cos = Math.cos(angleRad);

        let newX = this.x*cos - this.y*sin;
        let newY = this.x*sin + this.y*cos;

        this.x = newX;
        this.y = newY;

        return this;
    }

    _scale(factor: number): Vector2Class {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    _distanceTo(other: Vector2Class): number {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    static _distance(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx*dx + dy*dy);
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        t.s.push(new StringClass("(" + this.x + ", " + this.y + ")"));
        if (callback) callback();
    }

    _debugOutput(): string {
        return `{x = ${this.x}, y = ${this.y}}`;
    }



}