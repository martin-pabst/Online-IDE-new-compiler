import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/StepFunction';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { FilledShapeClass } from './FilledShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

export class RoundedRectangleClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class RoundedRectangle extends FilledShape", comment: JRC.RoundedRectangleClassComment },

        { type: "field", signature: "private double width", nativeIdentifier: "scaledWidth"},
        { type: "field", signature: "private double height", nativeIdentifier: "scaledHeight"},
        { type: "field", signature: "private double radius", nativeIdentifier: "scaledRadius"},


        { type: "method", signature: "RoundedRectangle()", java: RoundedRectangleClass.prototype._cj$_constructor_$RoundedRectangle$, comment: JRC.RoundedRectangleEmptyConstructorComment },
        { type: "method", signature: "RoundedRectangle(double left, double top, double width, double height, double radius)", java: RoundedRectangleClass.prototype._cj$_constructor_$RoundedRectangle$double$double$double$double$double, comment: JRC.RoundedRectangleConstructorComment },
        { type: "method", signature: "final void setWidth(double width)", native: RoundedRectangleClass.prototype._setWidth, comment: JRC.RoundedRectangleSetWidthComment },
        { type: "method", signature: "final void setHeight(double height)", native: RoundedRectangleClass.prototype._setHeight, comment: JRC.RoundedRectangleSetHeightComment },
        { type: "method", signature: "final double getWidth()", template: '(§1.width*§1.scaleFactor)', comment: JRC.RoundedRectangleGetWidthComment },
        { type: "method", signature: "final double getHeight()", template: '(§1.height*§1.scaleFactor)', comment: JRC.RoundedRectangleGetHeightComment },
        { type: "method", signature: "final RoundedRectangle copy()", java: RoundedRectangleClass.prototype._mj$copy$RoundedRectangle$, comment: JRC.RoundedRectangleCopyComment },
        { type: "method", signature: "final RoundedRectangle moveTo(double x, double y)", native: RoundedRectangleClass.prototype._moveTo, comment: JRC.RoundedRectangleMoveToComment },

        { type: "method", signature: "String toString()", java: RoundedRectangleClass.prototype._mj$toString$String$ , comment: JRC.objectToStringComment},

    ]

    static type: NonPrimitiveType;
    left!: number;
    top!: number;
    width!: number;
    height!: number;
    radius!: number;

    get scaledWidth(): number {
        return this.scaleFactor * this.width;
    }

    get scaledHeight(): number {
        return this.scaleFactor * this.width;
    }

    get scaledRadius(): number {
        return this.scaleFactor * this.radius;
    }



    _cj$_constructor_$RoundedRectangle$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$RoundedRectangle$double$double$double$double$double(t, callback, 0, 0, 100, 100, 10);
    }

    _cj$_constructor_$RoundedRectangle$double$double$double$double$double(t: Thread, callback: CallbackFunction,
        left: number, top: number, width: number, height: number, radius: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.centerXInitial = left + width / 2;
            this.centerYInitial = top + height / 2;

            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.radius = radius;

            this.hitPolygonInitial = [];

            this.addCenterCircle(left + radius, top + radius, Math.PI/2);
            this.addCenterCircle(left + radius, top + height - radius, Math.PI);
            this.addCenterCircle(left + width - radius, top + height - radius, 3*Math.PI/2);
            this.addCenterCircle(left + width - radius, top + radius, 0);
            this.hitPolygonInitial.push({x: left + radius, y: top});


            this.render();
        });   // call base class constructor


    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$RoundedRectangle$(t, callback);
    }

    _mj$copy$RoundedRectangle$(t: Thread, callback: CallbackFunction){
        let copy = new RoundedRectangleClass();
        copy._cj$_constructor_$RoundedRectangle$double$double$double$double$double(t, callback, this.left, this.top, this.width, this.height, this.radius);
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if(callback) callback();
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

        g.roundRect(this.left, this.top, this.width, this.height, this.radius);

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

    private addCenterCircle(midx: number, midy: number, angleStart: number){
        let n = 8;
        let dw = Math.PI/2/n;

        for(let i = 0; i <= n; i++){
            this.hitPolygonInitial.push({x: midx + this.radius*Math.cos(angleStart + dw*i), y: midy - this.radius*Math.sin(angleStart + dw*i)})
        }
    }

    _setWidth(width: number){
        this.width = width / this.container.scale.x;
        this.centerXInitial = this.left + this.width / 2;

        this.render();
    }

    _setHeight(height: number){
        this.height = height / this.container.scale.y;
        this.centerYInitial = this.top + this.height / 2;

        this.render();
    }

    _moveTo(x: number, y: number){
        this.transformHitPolygon();

        this._move(x - this.hitPolygonTransformed[0].x, y - this.hitPolygonTransformed[0].y);

        return this;
    }

    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if(callback) callback();

        return;
    }

    _debugOutput(){
        if(this.isDestroyed) return "<destroyed RoundedRectangle>"
        let s = `{width: ${this.width * this.scaleFactor}, height: ${this.height * this.scaleFactor}, radius: ${this.radius * this.scaleFactor}, centerX: ${this._getCenterX()}, centerY: ${this._getCenterY()} }`;
        return s;
    }



}