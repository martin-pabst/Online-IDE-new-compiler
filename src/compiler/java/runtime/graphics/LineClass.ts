import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/RuntimeConstants';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { FilledShapeClass } from './FilledShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

export class LineClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Line extends FilledShape", comment: JRC.LineClassComment },

        { type: "method", signature: "Line()", java: LineClass.prototype._cj$_constructor_$Line$, comment: JRC.LineEmptyConstructorComment },
        { type: "method", signature: "Line(double x1, double y1, double x2, double y2)", java: LineClass.prototype._cj$_constructor_$Line$double$double$double$double, comment: JRC.LineConstructorComment1 },

        { type: "method", signature: "final void setPoints(double x1, double y1, double x2, double y2)", native: LineClass.prototype._setPoints, comment: JRC.LineSetPointsComment },

        { type: "method", signature: "final Line copy()", java: LineClass.prototype._mj$copy$Line$, comment: JRC.LineCopyComment },

        { type: "method", signature: "String toString()", java: LineClass.prototype._mj$toString$String$ , comment: JRC.objectToStringComment},

    ]

    static type: NonPrimitiveType;

    _cj$_constructor_$Line$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$Line$double$double$double$double(t, callback, 0, 0, 100, 100);
    }

    _cj$_constructor_$Line$double$double$double$double(t: Thread, callback: CallbackFunction,
        x1: number, y1: number, x2: number, y2: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
           this.hitPolygonInitial = [{x: x1, y: y1}, {x: x2, y: y2}]
            this.borderColor = 0xffffff;
            this.borderWidth = 1;
            this.render();
        });   // call base class constructor


    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Line$(t, callback);
    }

    _mj$copy$Line$(t: Thread, callback: CallbackFunction){
        let copy = new LineClass();
        copy._cj$_constructor_$Line$double$double$double$double(t, callback, this.hitPolygonInitial[0].x, this.hitPolygonInitial[0].y, this.hitPolygonInitial[1].x, this.hitPolygonInitial[1].y);
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

        g.moveTo(this.hitPolygonInitial[0].x, this.hitPolygonInitial[0].y);
        g.lineTo(this.hitPolygonInitial[1].x, this.hitPolygonInitial[1].y);

        if (this.borderColor != null) {
            g.stroke({
                width: this.borderWidth,
                color: this.borderColor,
                alpha: this.borderAlpha,
                alignment: 0.5
            })
        }

    };

    _setPoints(x1: number, y1: number, x2: number, y2: number){
        let p0 = new PIXI.Point(x1, y1);
        this.getWorldTransform().applyInverse(p0, p0);
        this.hitPolygonInitial[0].x = p0.x;
        this.hitPolygonInitial[0].y = p0.y;

        let p1 = new PIXI.Point(x2, y2);
        this.getWorldTransform().applyInverse(p1, p1);
        this.hitPolygonInitial[1].x = p1.x;
        this.hitPolygonInitial[2].y = p1.y;

        this.render();
    }

    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if(callback) callback();

        return;
    }

    _debugOutput(){
        if(this.isDestroyed) return "<destroyed Line>"
        this.transformHitPolygon();
        let s = `{x1: ${this.hitPolygonTransformed[0].x}, y1: ${this.hitPolygonTransformed[0].y}, x2: ${this.hitPolygonTransformed[1].x}, y2: ${this.hitPolygonTransformed[1].y}}`;
        return s;
    }



}