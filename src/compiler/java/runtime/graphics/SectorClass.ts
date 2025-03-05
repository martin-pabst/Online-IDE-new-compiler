import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/RuntimeConstants';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { FilledShapeClass } from './FilledShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

export class SectorClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Sector extends FilledShape", comment: JRC.SectorClassComment },

        {
            type: "method", signature: "Sector(double mx, double my, double radius, double startAngle, double endAngle)",
            java: SectorClass.prototype._cj$_constructor_$Sector$double$double$double$double$double, comment: JRC.SectorConstructorComment
        },

        { type: "method", signature: "final void setInnerRadius(double innerRadius)", native: SectorClass.prototype._setRadius, comment: JRC.SectorSetRadiusComment },
        { type: "method", signature: "final double getInnerRadiusX()", template: '(§1.radius*§1.scaleFactor)', comment: JRC.SectorGetRadiusComment },

        { type: "method", signature: "final void setStartAngle(double startAngle)", native: SectorClass.prototype._setStartAngle, comment: JRC.SectorSetStartAngleComment },
        { type: "method", signature: "final double getStartAngleX()", template: '(§1.startAngle/Math.PI*180)', comment: JRC.SectorGetStartAngleComment },

        { type: "method", signature: "final void setEndAngle(double endAngle)", native: SectorClass.prototype._setEndAngle, comment: JRC.SectorSetEndAngleComment },
        { type: "method", signature: "final double getEndAngleX()", template: '(§1.endAngle/Math.PI*180)', comment: JRC.SectorGetEndAngleComment },

        { type: "method", signature: "final void drawRadii(boolean drawRadii)", native: SectorClass.prototype._drawRadii, comment: JRC.SectorDrawRadiiComment },

        { type: "method", signature: "final Sector copy()", java: SectorClass.prototype._mj$copy$Sector$, comment: JRC.SectorCopyComment },

        { type: "method", signature: "final boolean containsPoint(double x, double y)", native: SectorClass.prototype._containsPoint, comment: JRC.shapeContainsPointComment },

        { type: "method", signature: "String toString()", java: SectorClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },


    ]

    static type: NonPrimitiveType;
    mx!: number;
    my!: number;
    radius!: number;
    startAngleRad!: number;
    endAngleRad!: number;
    drawRadii: boolean = true;


    _cj$_constructor_$Sector$double$double$double$double$double(t: Thread, callback: CallbackFunction,
        mx: number, my: number, innerRadius: number, startAngle: number, endAngle: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.centerXInitial = mx;
            this.centerYInitial = my;

            this.mx = mx;
            this.my = my;
            this.radius = innerRadius;
            this.startAngleRad = startAngle / 180 * Math.PI;
            this.endAngleRad = endAngle / 180 * Math.PI;

            this.render();
        });   // call base class constructor


    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Sector$(t, callback);
    }

    _mj$copy$Sector$(t: Thread, callback: CallbackFunction) {
        let copy = new SectorClass();
        copy._cj$_constructor_$Sector$double$double$double$double$double(t, callback, this.mx, this.my, this.radius, this.startAngleRad, this.endAngleRad);
        copy.drawRadii = this.drawRadii;
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }

    render(): void {

        this.hitPolygonInitial = [];

        let deltaAlpha = this.endAngleRad - this.startAngleRad;
        this.hitPolygonInitial.push({ x: this.mx, y: this.my });

        for (let i = 0; i < 16; i++) {
            let alpha = this.startAngleRad + deltaAlpha * i;
            this.hitPolygonInitial.push({
                x: this.mx + this.radius * Math.cos(alpha),
                y: this.my + this.radius * Math.sin(alpha)
            });
        }
        this.hitPolygonInitial.push({ x: this.mx, y: this.my });

        this.hitPolygonDirty = true;

        let g: PIXI.Graphics = <any>this.container;

        if (g == null) {
            g = new PIXI.Graphics();
            this.container = g;
            this.world.app.stage.addChild(g);

        } else {
            g.clear();
        }

        if(Math.abs(this.startAngleRad - this.endAngleRad) < 0.00000001){
            g.circle(this.mx, this.my, this.radius);
        } else {
            if(this.drawRadii){
                g.moveTo(this.mx, this.my);
            }
            g.arc(this.mx, this.my, this.radius, -this.startAngleRad, -this.endAngleRad, true);
            if(this.drawRadii){
                g.lineTo(this.mx, this.my);
            }
        }

        if(this.drawRadii){
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

        g.closePath();

    };

    _setRadius(radius: number) {
        this.radius = radius / this.container.scale.x;

        this.render();
    }


    _setStartAngle(angleDeg: number) {
        this.startAngleRad = angleDeg / 180 * Math.PI;
        this.render();
    }

    _setEndAngle(angleDeg: number) {
        this.endAngleRad = angleDeg / 180 * Math.PI;
        this.render();
    }

    _drawRadii(drawRadii: boolean){
        this.drawRadii = drawRadii;
        this.render();
    }

    containsPoint(x: number, y: number) {

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        let p: PIXI.Point = new PIXI.Point(x, y);
        let m = this.container.worldTransform;

        m.applyInverse(p, p);

        let dx = p.x - this.mx;
        let dy = p.y - this.my;
        let angle = Math.atan2(-dy, dx);

        if (dx * dx + dy * dy <= this.radius * this.radius) {
            let towPI = 2*Math.PI;
            let normalizedStartAngle = this.startAngleRad < 0 ? towPI + this.startAngleRad : this.startAngleRad;
            let normalizedEndAngle = this.endAngleRad < 0 ? towPI + this.endAngleRad : this.endAngleRad;
            let normalizedAngle = angle < 0 ? towPI + angle : angle;
            let ret = (normalizedAngle >= normalizedStartAngle && normalizedStartAngle <= normalizedEndAngle);
            if(normalizedStartAngle <= normalizedEndAngle){
                return ret;
            } else {
                return !ret;
            }
        } else {
            return false;
        }


    }


    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if (callback) callback();

        return;
    }

    _debugOutput() {
        if(this.isDestroyed) return "<destroyed Sector>"
        let s = `{startAngle: ${this.startAngleRad / Math.PI * 180 * this.scaleFactor}, endAngle: ${this.endAngleRad / Math.PI * 180 * this.scaleFactor}, radius: ${this.radius * this.scaleFactor}, mx: ${this._getCenterX()}, my: ${this._getCenterY()} }`;
        return s;
    }


}