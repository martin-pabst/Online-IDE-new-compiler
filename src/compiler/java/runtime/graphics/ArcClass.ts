import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/RuntimeConstants';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { FilledShapeClass } from './FilledShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

export class ArcClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Arc extends FilledShape", comment: JRC.ArcClassComment },

        {
            type: "method", signature: "Arc(double mx, double my, double innerRadius, double outerRadius, double startAngle, double endAngle)",
            java: ArcClass.prototype._cj$_constructor_$Arc$double$double$double$double$double$double, comment: JRC.ArcConstructorComment
        },

        { type: "method", signature: "final void setInnerRadius(double innerRadius)", native: ArcClass.prototype._setInnerRadius, comment: JRC.ArcSetInnerRadiusComment },
        { type: "method", signature: "final double getInnerRadiusX()", template: '(§1.innerRadius*§1.scaleFactor)', comment: JRC.ArcGetInnerRadiusComment },

        { type: "method", signature: "final void setOuterRadius(double outerRadius)", native: ArcClass.prototype._setOuterRadius, comment: JRC.ArcSetOuterRadiusComment },
        { type: "method", signature: "final double getOuterRadiusX()", template: '(§1.outerRadius*§1.scaleFactor)', comment: JRC.ArcGetOuterRadiusComment },

        { type: "method", signature: "final void setStartAngle(double startAngle)", native: ArcClass.prototype._setStartAngle, comment: JRC.ArcSetStartAngleComment },
        { type: "method", signature: "final double getStartAngleX()", template: '(§1.startAngle/180*Math.PI)', comment: JRC.ArcGetStartAngleComment },

        { type: "method", signature: "final void setEndAngle(double endAngle)", native: ArcClass.prototype._setEndAngle, comment: JRC.ArcSetEndAngleComment },
        { type: "method", signature: "final double getEndAngleX()", template: '(§1.endAngle/180*Math.PI)', comment: JRC.ArcGetEndAngleComment },

        { type: "method", signature: "final Arc copy()", java: ArcClass.prototype._mj$copy$Arc$, comment: JRC.ArcCopyComment },

        { type: "method", signature: "final boolean containsPoint(double x, double y)", native: ArcClass.prototype._containsPoint, comment: JRC.shapeContainsPointComment },

        { type: "method", signature: "String toString()", java: ArcClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },


    ]

    static type: NonPrimitiveType;
    mx!: number;
    my!: number;
    innerRadius!: number;
    outerRadius!: number;
    startAngleRad!: number;
    endAngleRad!: number;


    _cj$_constructor_$Arc$double$double$double$double$double$double(t: Thread, callback: CallbackFunction,
        mx: number, my: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.centerXInitial = mx;
            this.centerYInitial = my;

            this.mx = mx;
            this.my = my;
            this.innerRadius = innerRadius;
            this.outerRadius = outerRadius;
            this.startAngleRad = startAngle / 180 * Math.PI;
            this.endAngleRad = endAngle / 180 * Math.PI;

            this.render();
        });   // call base class constructor


    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Arc$(t, callback);
    }

    _mj$copy$Arc$(t: Thread, callback: CallbackFunction) {
        let copy = new ArcClass();
        copy._cj$_constructor_$Arc$double$double$double$double$double$double(t, callback, this.mx, this.my, this.innerRadius, this.outerRadius, this.startAngleRad, this.endAngleRad);
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }

    render(): void {

        this.hitPolygonInitial = [];

        let deltaAlpha = this.endAngleRad - this.startAngleRad;

        for (let i = 0; i < 16; i++) {
            let alpha = this.startAngleRad + deltaAlpha * i;
            this.hitPolygonInitial.push({
                x: this.mx + this.outerRadius * Math.cos(alpha),
                y: this.my + this.outerRadius * Math.sin(alpha)
            });
        }

        for (let i = 0; i < 16; i++) {
            let alpha = this.endAngleRad - deltaAlpha * i;
            this.hitPolygonInitial.push({
                x: this.mx + this.innerRadius * Math.cos(alpha),
                y: this.my + this.innerRadius * Math.sin(alpha)
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

        if (this.startAngleRad === void 0) { this.startAngleRad = 0; }
        if (this.endAngleRad === void 0) { this.endAngleRad = Math.PI * 2; }
        if (Math.abs(this.endAngleRad - this.startAngleRad) >= Math.PI * 2) {
            g.circle(this.mx, this.my, this.outerRadius)

            if (this.fillColor != null) {
                g.fill(this.fillColor);
                g.alpha = this.fillAlpha;
            }
            g.circle(this.mx, this.my, this.innerRadius)
            g.cut();
        } else {
            g.moveTo(this.mx + this.outerRadius * Math.cos(this.startAngleRad), this.my - this.outerRadius * Math.sin(this.startAngleRad));
            g.lineTo(this.mx + this.innerRadius * Math.cos(this.startAngleRad), this.my - this.innerRadius * Math.sin(this.startAngleRad));
            g.arc(this.mx, this.my, this.innerRadius, -this.startAngleRad, -this.endAngleRad, true)
                .arc(this.mx, this.my, this.outerRadius, -this.endAngleRad, -this.startAngleRad, false)

            if (this.fillColor != null) {
                g.fill(this.fillColor);
                g.alpha = this.fillAlpha;
            }
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

    _setInnerRadius(radius: number) {
        this.innerRadius = radius / this.container.scale.x;

        this.render();
    }

    _setOuterRadius(radius: number) {
        this.outerRadius = radius / this.container.scale.x;

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

    containsPoint(x: number, y: number) {

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        let p: PIXI.Point = new PIXI.Point(x, y);
        let m = this.container.worldTransform;

        m.applyInverse(p, p);

        let dx = p.x - this.mx;
        let dy = p.y - this.my;
        let angle = Math.atan2(-dy, dx);

        let r2 = dx * dx + dy * dy;

        if (r2 <= this.outerRadius * this.outerRadius && r2 >= this.innerRadius * this.innerRadius) {
            let towPI = 2 * Math.PI;
            let normalizedStartAngle = this.startAngleRad < 0 ? towPI + this.startAngleRad : this.startAngleRad;
            let normalizedEndAngle = this.endAngleRad < 0 ? towPI + this.endAngleRad : this.endAngleRad;
            let normalizedAngle = angle < 0 ? towPI + angle : angle;
            let ret = (normalizedAngle >= normalizedStartAngle && normalizedStartAngle <= normalizedEndAngle);
            if (normalizedStartAngle <= normalizedEndAngle) {
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
        if (this.isDestroyed) return "<destroyed Arc>"
        let s = `{startAngle: ${this.startAngleRad / Math.PI * 180 * this.scaleFactor}, endAngle: ${this.endAngleRad / Math.PI * 180 * this.scaleFactor}, innerRadius: ${this.innerRadius * this.scaleFactor}, outerRadius: ${this.outerRadius * this.scaleFactor}, mx: ${this._getCenterX()}, my: ${this._getCenterY()} }`;
        return s;
    }


}