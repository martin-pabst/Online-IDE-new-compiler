import { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { Vector2Class } from "../../system/additional/Vector2Class";
import { NullPointerExceptionClass } from "../../system/javalang/NullPointerExceptionClass";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import * as THREE from 'three';
import { Matrix4Class } from "./Matrix4Class";
import { Vector3Class } from "./Vector3Class";

export class Line3Class extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Line3 extends Object", comment: JRC.Line3ClassComment },

        { type: "method", signature: "Line3(Vector3 lineStart, Vector3 lineEnd)", native: Line3Class.prototype._constructor2, comment: JRC.Line3ConstructorComment },

        { type: "method", signature: "final double getLength()", native: Line3Class.prototype._getLength, comment: JRC.Line3GetLengthComment },
        { type: "method", signature: "final Line3 clone()", native: Line3Class.prototype._clone, comment: JRC.Line3CloneComment },
        { type: "method", signature: "final Line3 applyMatrix4(Matrix4 m)", native: Line3Class.prototype._applyMatrix4, comment: JRC.Line3ApplyMatrix4Comment },
        { type: "method", signature: "final Vector3 closestPointTo(Vector3 point, boolean clampToLine)", native: Line3Class.prototype._closestPointTo, comment: JRC.Line3ClosestPointToComment },
        { type: "method", signature: "final double distanceToPoint(Vector3 point, boolean clampToLine)", native: Line3Class.prototype._distanceToPoint, comment: JRC.Line3DistanceToPointComment },
        { type: "method", signature: "final Vector3 at(double t)", native: Line3Class.prototype._at, comment: JRC.Line3AtComment },
        { type: "method", signature: "final Vector3 start()", native: Line3Class.prototype._start, comment: JRC.Line3StartComment },
        { type: "method", signature: "final Vector3 end()", native: Line3Class.prototype._end, comment: JRC.Line3EndComment },

        { type: "method", signature: "String toString()", java: Line3Class.prototype._mj$toString$String$, comment: JRC.Line3ToStringComment },
    ];

    static type: NonPrimitiveType;
    line3: THREE.Line3;

    constructor(lineStart: THREE.Vector3, lineEnd: THREE.Vector3) {
        super();
        this.line3 = new THREE.Line3(lineStart, lineEnd)
    }

    _constructor2(lineStart: Vector3Class, lineEnd: Vector3Class) {
        this.line3 = new THREE.Line3(lineStart.v, lineEnd.v);
        return this;
     }

    _getLength() {
        return this.line3.distance();
    }

    _clone() {

        return new Line3Class(this.line3.start.clone(), this.line3.end.clone());

    }

    _at(t: number): Vector3Class {
        const point = new THREE.Vector3();
        this.line3.at(t, point);
        return new Vector3Class(point.x, point.y, point.z);
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        t.s.push(new StringClass(`(${this.line3.start.x}, ${this.line3.start.y}, ${this.line3.start.z}}) -> (${this.line3.end.x}, ${this.line3.end.y}, ${this.line3.end.z})`));
        if (callback) callback();
    }

    _debugOutput(): string {
        return `(${this.line3.start.x}, ${this.line3.start.y}, ${this.line3.start.z}}) -> (${this.line3.end.x}, ${this.line3.end.y}, ${this.line3.end.z})`
    }

    _applyMatrix4(m: Matrix4Class): Line3Class {
        this.line3.applyMatrix4(m.m);
        return this;
    }

    _closestPointTo(point: Vector3Class, clampToLine: boolean): Vector3Class {
        const closestPoint = new THREE.Vector3();
        this.line3.closestPointToPoint(point.v, clampToLine, closestPoint);
        return new Vector3Class(closestPoint.x, closestPoint.y, closestPoint.z);
    }

    _distanceToPoint(point: Vector3Class, clampToLine: boolean): number {
        const closestPoint = new THREE.Vector3();
        this.line3.closestPointToPoint(point.v, clampToLine, closestPoint);
        return closestPoint.distanceTo(point.v);
    }

    _start(): Vector3Class {
        return new Vector3Class(this.line3.start.x, this.line3.start.y, this.line3.start.z);
    }

    _end(): Vector3Class {
        return new Vector3Class(this.line3.end.x, this.line3.end.y, this.line3.end.z);
    }
}