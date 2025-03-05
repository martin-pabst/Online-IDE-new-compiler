import * as PIXI from 'pixi.js';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ShapeClass } from './ShapeClass';
import { FilledShapeClass } from './FilledShapeClass';
import { CallbackFunction } from '../../../common/interpreter/RuntimeConstants';
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

export class EllipseClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Ellipse extends FilledShape", comment: JRC.EllipseClassComment },

        { type: "field", signature: "private double radiusX", nativeIdentifier: "scaledRadiusX"},
        { type: "field", signature: "private double radiusY", nativeIdentifier: "scaledRadiusY"},

        { type: "method", signature: "Ellipse()", java: EllipseClass.prototype._cj$_constructor_$Ellipse$, comment: JRC.EllipseEmptyConstructorComment },
        { type: "method", signature: "Ellipse(double mx, double my, double rx, double ry)", java: EllipseClass.prototype._cj$_constructor_$Ellipse$double$double$double$double, comment: JRC.EllipseConstructorComment },

        { type: "method", signature: "final void setRadiusX(double radiusX)", native: EllipseClass.prototype._setRadiusX, comment: JRC.EllipseSetRadiusXComment },
        { type: "method", signature: "final double getRadiusX()", template: '(§1.radiusX*§1.scaleFactor)', comment: JRC.EllipseGetRadiusXComment },

        { type: "method", signature: "final void setRadiusY(double radiusY)", native: EllipseClass.prototype._setRadiusY, comment: JRC.EllipseSetRadiusYComment },
        { type: "method", signature: "final double getRadiusY()", template: '(§1.radiusY*§1.scaleFactor)', comment: JRC.EllipseGetRadiusYComment },

        { type: "method", signature: "final Ellipse copy()", java: EllipseClass.prototype._mj$copy$Ellipse$, comment: JRC.EllipseCopyComment },

        { type: "method", signature: "final boolean containsPoint(double x, double y)", native: EllipseClass.prototype._containsPoint , comment: JRC.shapeContainsPointComment},

        { type: "method", signature: "String toString()", java: EllipseClass.prototype._mj$toString$String$ , comment: JRC.objectToStringComment},


    ]

    static type: NonPrimitiveType;
    mx!: number;
    my!: number;
    radiusX!: number;
    radiusY!: number;

    get scaledRadiusX(): number {
        return this.scaleFactor * this.radiusX;
    }

    get scaledRadiusY(): number {
        return this.scaleFactor * this.radiusY;
    }



    _cj$_constructor_$Ellipse$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$Ellipse$double$double$double$double(t, callback, 200, 100, 100, 50);
    }

    _cj$_constructor_$Ellipse$double$double$double$double(t: Thread, callback: CallbackFunction,
        mx: number, my: number, radiusX: number, radiusY: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.centerXInitial = mx;
            this.centerYInitial = my;

            this.mx = mx;
            this.my = my;
            this.radiusX = radiusX;
            this.radiusY = radiusY;

            this.render();
            if(callback) callback();
        });   // call base class constructor


    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Ellipse$(t, callback);
    }

    _mj$copy$Ellipse$(t: Thread, callback: CallbackFunction){
        let copy = new EllipseClass();
        copy._cj$_constructor_$Ellipse$double$double$double$double(t, callback, this.mx, this.my, this.radiusX, this.radiusY);
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if(callback) callback();
    }

    render(): void {

        this.hitPolygonInitial = [];

        let deltaAlpha = Math.PI / 8;
        for (let i = 0; i < 16; i++) {
            let alpha = deltaAlpha * i;
            this.hitPolygonInitial.push({
                x: this.mx + this.radiusX * Math.cos(alpha),
                y: this.my + this.radiusY * Math.sin(alpha)
            });
        }
        this.hitPolygonDirty = true;

        let g: PIXI.Graphics = <any>this.container;

        if (g == null) {
            g = new PIXI.Graphics();
            this.container = g;
            this.world.app.stage.addChild(g);

        } else {
            g.clear();
        }

        g.ellipse(this.mx, this.my, this.radiusX, this.radiusY);

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

        g.closePath();

    };

    _setRadiusX(radius: number){
        this.radiusX = radius / this.container.scale.x;

        this.render();
    }

    _setRadiusY(radius: number){
        this.radiusY = radius / this.container.scale.y;

        this.render();
    }

    containsPoint(x: number, y: number) {

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        let p: PIXI.Point = new PIXI.Point(x, y);
        let m = this.container.worldTransform;

        m.applyInverse(p, p);

        let dx = p.x - this.mx;
        let dy = p.y - this.my;
        return dx*dx/(this.radiusX*this.radiusX) + dy*dy/(this.radiusY*this.radiusY) <= 1;


    }


    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if(callback) callback();

        return;
    }

    _debugOutput(){
        if(this.isDestroyed) return "<destroyed Ellipse>"
        let s = `{rx: ${this.radiusX * this.scaleFactor}, ry: ${this.radiusY * this.scaleFactor}, mx: ${this._getCenterX()}, my: ${this._getCenterY()} }`;
        return s;
    }


}