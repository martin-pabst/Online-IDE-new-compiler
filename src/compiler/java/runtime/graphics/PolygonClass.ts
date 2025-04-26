import * as PIXI from 'pixi.js';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ShapeClass } from './ShapeClass';
import { FilledShapeClass } from './FilledShapeClass';
import { CallbackFunction } from '../../../common/interpreter/StepFunction';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { convexhull } from '../../../../tools/ConvexHull.ts';
import { GroupClass } from './GroupClass.ts';
import { polygonEnthältPunkt, streckenzugEnthältPunkt } from '../../../../tools/MatheTools.ts';
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';

export class PolygonClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Polygon extends FilledShape", comment: JRC.PolygonClassComment },

        { type: "method", signature: "Polygon()", java: PolygonClass.prototype._cj$_constructor_$Polygon$, comment: JRC.PolygonEmptyConstructorComment },
        { type: "method", signature: "Polygon(boolean closeAndFill)", java: PolygonClass.prototype._cj$_constructor_$Polygon$boolean$double_I, comment: JRC.PolygonEmptyConstructorComment },
        { type: "method", signature: "Polygon(boolean closeAndFill, double... coordinates)", java: PolygonClass.prototype._cj$_constructor_$Polygon$boolean$double_I, comment: JRC.PolygonConstructor2Comment },
        { type: "method", signature: "Polygon(boolean closeAndFill, double[] coordinates)", java: PolygonClass.prototype._cj$_constructor_$Polygon$boolean$double_I, comment: JRC.PolygonConstructor1Comment },
        { type: "method", signature: "Polygon(Shape shape)", java: PolygonClass.prototype._cj$_constructor_$Polygon$Shape, comment: JRC.PolygonConstructorShapeComment },

        { type: "method", signature: "void addPoint(double x, double y)", native: PolygonClass.prototype._addPoint, comment: JRC.PolygonAddPointComment },
        { type: "method", signature: "void setPoints(double[] points)", native: PolygonClass.prototype._setPoints, comment: JRC.PolygonSetPointsComment },
        { type: "method", signature: "void addPoints(double[] points)", native: PolygonClass.prototype._addPoints, comment: JRC.PolygonAddPointsComment },
        { type: "method", signature: "void insertPoint(double x, double y, int index)", native: PolygonClass.prototype._insertPoint, comment: JRC.PolygonInsertPointComment },
        { type: "method", signature: "void movePointTo(double x, double y, int index)", native: PolygonClass.prototype._movePointTo, comment: JRC.PolygonMovePointToComment },
        { type: "method", signature: "void open()", native: PolygonClass.prototype._open, comment: JRC.PolygonOpenComment },
        { type: "method", signature: "void close()", native: PolygonClass.prototype._close, comment: JRC.PolygonCloseComment },


        { type: "method", signature: "final boolean containsPoint(double x, double y)", native: PolygonClass.prototype._containsPoint , comment: JRC.shapeContainsPointComment},

        { type: "method", signature: "final Polygon copy()", java: PolygonClass.prototype._mj$copy$Polygon$, comment: JRC.PolygonCopyComment },

        { type: "method", signature: "String toString()", java: PolygonClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]

    static type: NonPrimitiveType;
    isClosed: boolean = false;
    closeAndFill: boolean = false;

    _cj$_constructor_$Polygon$Shape(t: Thread, callback: CallbackFunction, shape: ShapeClass) {

        let points: convexhull.Point[] = [];
        points = this.extractPoints(shape, points);
        if(shape instanceof GroupClass){
            points = convexhull.makeHull(points);
        }


        let pointsNumber: number[] = [];
        for (let p of points) {
            pointsNumber.push(p.x);
            pointsNumber.push(p.y);
        }

        if (pointsNumber.length > 0) {
            pointsNumber = pointsNumber.concat(pointsNumber.slice(0, 2))
        }

        this._cj$_constructor_$Polygon$boolean$double_I(t, callback, false, pointsNumber);

    }

    extractPoints(shape: ShapeClass, points: convexhull.Point[]): convexhull.Point[] {
        if (shape instanceof GroupClass) {
            let points1: convexhull.Point[] = [];
            for (let sh of shape.shapes) {
                points1 = this.extractPoints(sh, points1);
            }
            return points.concat(points1);
        } else {
            if (shape.hitPolygonDirty) shape.transformHitPolygon();
            return points.concat(shape.hitPolygonTransformed.map(function (punkt) { return { x: punkt.x, y: punkt.y } }));
        }
    }


    _cj$_constructor_$Polygon$(t: Thread, callback: CallbackFunction) {

        let pointsNumber: number[] = [];
        for (let i: number = 0; i < 6; i++) {
            let angle: number = Math.PI / 3 * i;
            let x: number = 100 + 50 * Math.cos(angle);
            let y: number = 100 - 50 * Math.sin(angle);
            pointsNumber.push(x, y);
        }

        this._cj$_constructor_$Polygon$boolean$double_I(t, callback, true, pointsNumber);
    }

    _cj$_constructor_$Polygon$boolean$double_I(t: Thread, callback: CallbackFunction, closeAndFill: boolean, points?: number[], isClosed: boolean = false) {

        this._cj$_constructor_$FilledShape$(t, () => {

            this.closeAndFill = closeAndFill;
            this.isClosed = isClosed;

            let xSum = 0; let ySum = 0;
            this.hitPolygonInitial = [];

            if (points) {
                for (let i = 0; i < points.length;) {
                    let x = points[i++];
                    let y = points[i++];
                    xSum += x;
                    ySum += y;
                    this.hitPolygonInitial.push({ x: x, y: y });
                }

                if (points.length > 1) {
                    this.centerXInitial = xSum / this.hitPolygonInitial.length;
                    this.centerYInitial = ySum / this.hitPolygonInitial.length;
                }
            }

            if (!closeAndFill) {
                this.borderColor = 0x0000ff;
            }


            this.render();
            if(callback) callback();
        });   // call base class constructor



    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Polygon$(t, callback);
    }

    _mj$copy$Polygon$(t: Thread, callback: CallbackFunction) {
        let copy = new PolygonClass();
        copy._cj$_constructor_$Polygon$boolean$double_I(t, callback, this.closeAndFill, [], this.isClosed);
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }

    render(): void {

        let g: PIXI.Graphics = <any>this.container;

        if (!this.container) {
            g = new PIXI.Graphics();
            this.container = g;
            this.world.app.stage.addChild(g);

        } else {
            g.clear();
        }

        if (this.hitPolygonInitial.length > 0) {
            g.moveTo(this.hitPolygonInitial[0].x, this.hitPolygonInitial[0].y);
            for (let i = 1; i < this.hitPolygonInitial.length; i++) {
                g.lineTo(this.hitPolygonInitial[i].x, this.hitPolygonInitial[i].y);
            }
        }

        if (this.closeAndFill || this.isClosed) {
            g.closePath();
        }

        if (this.fillColor != null) {
            g.fill(this.fillColor);
            g.alpha = this.fillAlpha;
        }

        if (this.borderColor != null) {
            g.stroke({
                width: this.borderWidth,
                color: this.borderColor,
                alpha: this.borderAlpha,
                alignment: 0.5
            })
        }




    };


    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if (callback) callback();

        return;
    }

    _debugOutput() {
        if(this.isDestroyed) return "<destroyed Polygon>"
        this.transformHitPolygon();
        let points = this.hitPolygonTransformed.map((p) => "(" + p.x + ", " + p.y + ")").join(", ");
        let s = `{points: [${points}] }`;
        return s;
    }

    _addPoint(x: number, y: number, render: boolean = true){
        let p = new PIXI.Point(x, y);
        this.getWorldTransform().applyInverse(p, p);
        this.hitPolygonInitial.push({ x: p.x, y: p.y });
        this.hitPolygonDirty = true;
        if (render) this.render();
    }

    _insertPoint(x: number, y: number, index: number) {
        if (index < 0) index = 0;
        if (index > this.hitPolygonInitial.length) index = this.hitPolygonInitial.length;
        let p = new PIXI.Point(x, y);
        this.getWorldTransform().applyInverse(p, p);
        this.hitPolygonInitial.splice(index, 0, { x: p.x, y: p.y });
        this.hitPolygonDirty = true;
        this.render();
    }

    _movePointTo(x: number, y: number, index: number) {
        if (index < 0) index = 0;
        if (index > this.hitPolygonInitial.length) index = this.hitPolygonInitial.length;
        if(this.hitPolygonInitial.length == 0) return;
        let p = new PIXI.Point(x, y);
        this.getWorldTransform().applyInverse(p, p);
        this.hitPolygonInitial[index].x = p.x;
        this.hitPolygonInitial[index].y = p.y;
        this.hitPolygonDirty = true;
        this.render();
    }

    _setPoint(x: number, y: number, index: number) {
        if (index == 0 || index == 1) {
            this.hitPolygonInitial[index] = { x: x, y: y };
            this.hitPolygonDirty = true;
            this.render();
        }
    }

    _setPoints(coordinates: number[]) {

        this.hitPolygonInitial = [];
        for(let i = 0; i < coordinates.length - 1; i += 2){
            this.hitPolygonInitial.push({x: coordinates[i], y: coordinates[i+1]});
        }

        this.hitPolygonDirty = true;
        this.render();
    }

    _addPoints(points: number[]){
        for (let i = 0; i < points.length - 1; i += 2) {
            this._addPoint(points[i], points[i + 1], i >= points.length - 2);
        }
    }

    _setAllPointsUntransformed(points: number[]) {
        this.hitPolygonInitial = [];
        for (let i = 0; i < points.length; i += 2) {
            this.hitPolygonInitial.push({ x: points[i], y: points[i + 1] })
        }
        this.hitPolygonDirty = true;
        this.render();
    }

    _containsPoint(x: number, y: number) {

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        if (this.hitPolygonInitial == null) return true;

        if (this.hitPolygonDirty) this.transformHitPolygon();

        if(this.closeAndFill){
            return polygonEnthältPunkt(this.hitPolygonTransformed, { x: x, y: y });
        } else {
            return streckenzugEnthältPunkt(this.hitPolygonTransformed, { x: x, y: y });
        }
    }

    _open(){
        this.isClosed = false;
        this.render();
    }

    _close(){
        this.isClosed = true;
        this.render();
    }

}