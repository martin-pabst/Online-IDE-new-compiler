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

export class CircleClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Circle extends FilledShape", comment: JRC.circleClassComment },

        { type: "field", signature: "private double radius", nativeIdentifier: "scaledRadius"},

        { type: "method", signature: "Circle()", java: CircleClass.prototype._cj$_constructor_$Circle$, comment: JRC.circleEmptyConstructorComment },
        { type: "method", signature: "Circle(double mx, double my, double r)", java: CircleClass.prototype._cj$_constructor_$Circle$double$double$double, comment: JRC.circleConstructorComment },

        { type: "method", signature: "final void setRadius(double radius)", native: CircleClass.prototype._setRadius, comment: JRC.circleSetRadiusComment },
        { type: "method", signature: "final double getRadius()", template: '(§1.radius*§1.scaleFactor)', comment: JRC.circleGetRadiusComment },
        { type: "method", signature: "final Circle copy()", java: CircleClass.prototype._mj$copy$Circle$, comment: JRC.circleCopyComment },

        { type: "method", signature: "final boolean containsPoint(double x, double y)", native: CircleClass.prototype._containsPoint , comment: JRC.shapeContainsPointComment},

        { type: "method", signature: "String toString()", java: CircleClass.prototype._mj$toString$String$ , comment: JRC.objectToStringComment},


    ]

    static type: NonPrimitiveType;
    mx!: number;
    my!: number;
    radius!: number;


    get scaledRadius(): number {
        return this.scaleFactor * this.radius;
    }

    _cj$_constructor_$Circle$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$Circle$double$double$double(t, callback, 50, 50, 50);
    }

    _cj$_constructor_$Circle$double$double$double(t: Thread, callback: CallbackFunction,
        mx: number, my: number, radius: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.centerXInitial = mx;
            this.centerYInitial = my;

            this.mx = mx;
            this.my = my;
            this.radius = radius;

            this.render();
            if(callback) callback();
        });   // call base class constructor


    }


    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Circle$(t, callback);
    }

    _mj$copy$Circle$(t: Thread, callback: CallbackFunction){
        let copy = new CircleClass();
        copy._cj$_constructor_$Circle$double$double$double(t, callback, this.mx, this.my, this.radius);
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
                x: this.mx + this.radius * Math.cos(alpha),
                y: this.my + this.radius * Math.sin(alpha)
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

        g.circle(this.mx, this.my, this.radius);

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

    _setRadius(radius: number){
        this.radius = radius / this.container.scale.x;

        this.render();
    }

    containsPoint(x: number, y: number) {

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        let p: PIXI.Point = new PIXI.Point(x, y);
        let m = this.container.worldTransform;

        m.applyInverse(p, p);

        let dx = p.x - this.mx;
        let dy = p.y - this.my;
        return dx * dx + dy * dy <= this.radius * this.radius;

    }

    _collidesWith(otherShape: ShapeClass) {
        if (otherShape instanceof CircleClass) {

            let p1 = new PIXI.Point(this.centerXInitial, this.centerYInitial);
            this.container.worldTransform.apply(p1, p1);

            let radius1 = this.radius * this.container.scale.x

            let p2 = new PIXI.Point(otherShape.centerXInitial, otherShape.centerYInitial);
            otherShape.container.worldTransform.apply(p2, p2);

            let radius2 = otherShape.radius * otherShape.container.scale.x

            let d1 = p1.x - p2.x;
            let d2 = p1.y - p2.y;

            return d1*d1 + d2*d2 <= (radius1 + radius2) * (radius1 + radius2);


        } else {
            return super._collidesWith(otherShape);
        }
    }

    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if(callback) callback();

        return;
    }

    _debugOutput(){
        if(this.isDestroyed) return "<destroyed Circle>"
        let s = `{r: ${this.radius * this.scaleFactor}, mx: ${this._getCenterX()}, my: ${this._getCenterY()} }`;
        return s;
    }


}