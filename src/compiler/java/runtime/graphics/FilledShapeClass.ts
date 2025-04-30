import * as PIXI from 'pixi.js';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ShapeClass } from './ShapeClass';
import { CallbackFunction } from '../../../common/interpreter/StepFunction';
import { FilledShapeDefaults } from './FilledShapeDefaults';
import { ColorClass } from './ColorClass';
import { ColorHelper } from '../../lexer/ColorHelper';
import { JRC } from '../../language/JavaRuntimeLibraryComments';
import { NullPointerExceptionClass } from '../system/javalang/NullPointerExceptionClass';
import { polygonzugEnthältPunkt } from '../../../../tools/MatheTools.ts';

export class FilledShapeClass extends ShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "abstract class FilledShape extends Shape" },

        { type: "method", signature: "FilledShape()", java: FilledShapeClass.prototype._cj$_constructor_$FilledShape$ },
        { type: "method", signature: "Color getFillColor()", native: FilledShapeClass.prototype._getFillColor , comment: JRC.fsGetFillColorComment},
        { type: "method", signature: "int getFillColorAsInt()", native: FilledShapeClass.prototype._getFillColorAsInt , comment: JRC.fsGetFillColorComment},
        { type: "method", signature: "void setFillColor(Color color)", native: FilledShapeClass.prototype._setFillColorColor , comment: JRC.fsSetFillColorCommentColor},
        { type: "method", signature: "void setFillColor(Color color, double alpha)", native: FilledShapeClass.prototype._setFillColorColor , comment: JRC.fsSetFillColorCommentColor},
        { type: "method", signature: "void setFillColor(int color)", native: FilledShapeClass.prototype._setFillColorInt , comment: JRC.fsSetFillColorCommentInt},
        { type: "method", signature: "void setFillColor(int color, double alpha)", native: FilledShapeClass.prototype._setFillColorIntDouble , comment: JRC.fsSetFillColorCommentIntDouble},
        { type: "method", signature: "void setFillColor(string color)", native: FilledShapeClass.prototype._setFillColorString , comment: JRC.fsSetFillColorCommentString},
        { type: "method", signature: "void setFillColor(string color, double alpha)", native: FilledShapeClass.prototype._setFillColorStringDouble , comment: JRC.fsSetFillColorCommentStringDouble},
        { type: "method", signature: "Color getBorderColor()", native: FilledShapeClass.prototype._getBorderColor , comment: JRC.fsGetBorderColorComment},
        { type: "method", signature: "int getBorderColorAsInt()", native: FilledShapeClass.prototype._getBorderColorAsInt , comment: JRC.fsGetBorderColorComment},
        { type: "method", signature: "void setBorderColor(Color color)", native: FilledShapeClass.prototype._setBorderColorColor , comment: JRC.fsSetBorderColorCommentColor},
        { type: "method", signature: "void setBorderColor(Color color, double alpha)", native: FilledShapeClass.prototype._setBorderColorColor , comment: JRC.fsSetBorderColorCommentColor},
        { type: "method", signature: "void setBorderColor(int color)", native: FilledShapeClass.prototype._setBorderColorInt , comment: JRC.fsSetBorderColorCommentInt},
        { type: "method", signature: "void setBorderColor(int color, double alpha)", native: FilledShapeClass.prototype._setBorderColorIntDouble , comment: JRC.fsSetBorderColorCommentIntDouble},
        { type: "method", signature: "void setBorderColor(string color)", native: FilledShapeClass.prototype._setBorderColorString , comment: JRC.fsSetBorderColorCommentString},
        { type: "method", signature: "void setBorderColor(string color, double alpha)", native: FilledShapeClass.prototype._setBorderColorStringDouble , comment: JRC.fsSetBorderColorCommentStringDouble},
        { type: "method", signature: "void setBorderWidth(double width)", native: FilledShapeClass.prototype._setBorderWidth , comment: JRC.fsSetBorderWidthComment},
        { type: "method", signature: "double getBorderWidth()", native: FilledShapeClass.prototype._getBorderWidth , comment: JRC.fsGetBorderWidthComment},
        { type: "method", signature: "void setAlpha(double alpha)", native: FilledShapeClass.prototype._setAlpha , comment: JRC.fsSetAlphaComment},
        { type: "method", signature: "double getAlpha()", native: FilledShapeClass.prototype._getAlpha , comment: JRC.fsGetAlphaComment},

        { type: "method", signature: "static void setDefaultBorder(double width, string color)", native: FilledShapeClass._setDefaultBorder , comment: JRC.fsSetDefaultBorderComment1},
        { type: "method", signature: "static void setDefaultBorder(double width, int color, double alpha)", native: FilledShapeClass._setDefaultBorder , comment: JRC.fsSetDefaultBorderComment2},
        { type: "method", signature: "static void setDefaultBorder(string color)", native: FilledShapeClass._setDefaultFillColor , comment: JRC.fsSetDefaultFillColor},
        { type: "method", signature: "static void setDefaultBorder(int color, double alpha)", native: FilledShapeClass._setDefaultFillColor , comment: JRC.fsSetDefaultFillColor},



        // { type: "method", signature: "final boolean isKeyUp(string key)", java: ActorClass.prototype._mj$isKeyUp$boolean$string },

    ]

    static type: NonPrimitiveType;

    fillColor: number = FilledShapeDefaults.defaultFillColor;       // If you change this identifier then you have to change corresponding declaration in class ShapeClass
    fillAlpha: number = FilledShapeDefaults.defaultFillAlpha;

    borderColor?: number = FilledShapeDefaults.defaultBorderColor;
    borderAlpha: number = FilledShapeDefaults.defaultBorderAlpha;
    borderWidth: number = FilledShapeDefaults.defaultBorderWidth;


    _cj$_constructor_$FilledShape$(t: Thread, callback: CallbackFunction){
        this._cj$_constructor_$Shape$(t, callback);   // call base class constructor



    }

    render(){

    }

    copyFrom(otherFilledShape: FilledShapeClass){
        super.copyFrom(otherFilledShape);
        this.fillColor = otherFilledShape.fillColor;
        this.fillAlpha = otherFilledShape.fillAlpha;
        this.borderColor = otherFilledShape.borderColor;
        this.borderAlpha = otherFilledShape.borderAlpha;
        this.borderWidth = otherFilledShape.borderWidth;
    }

    _getFillColor(): ColorClass {
        if(this.fillColor==null){
            return null;
        }
        let c = new ColorClass();
        c.fromIntAndAlpha(this.fillColor, this.fillAlpha);
        return c;
    }

    _getFillColorAsInt(): number {
        return this.fillColor || 0x0;
    }

    _getBorderColor(): ColorClass {
        if(this.borderColor==null){
            return null;
        }
        let c = new ColorClass();
        c.fromIntAndAlpha(this.borderColor, this.borderAlpha);
        return c;
    }

    _getBorderColorAsInt(): number {
        return this.borderColor || 0x0;
    }

    _setBorderWidth(borderWidth: number) {
        this.borderWidth = borderWidth;
        this.render();
    }

    _getBorderWidth():number {
        return this.borderWidth;
    }

    _setAlpha(alpha: number){
        this.fillAlpha = alpha;
        this.borderAlpha = alpha;
        this.render();
    }

    _getAlpha(): number {
        return this.fillAlpha;
    }

    _setFillColorInt(color: number) {
        this.fillColor = color % 0x1000000;
        this.render();
    }

    _setFillColorColor(color: ColorClass, alpha?: number) {
        if(color == null){
            this.fillColor = null;
        } else{
            this.fillColor = color.red * 0x10000 + color.green * 0x100 + color.blue;
            if(alpha) this.fillAlpha = alpha;
        }
        this.render();
    }

    _setBorderColorColor(color: ColorClass, alpha?: number) {
        if(color == null){
            this.borderColor = null;
        }else{
            this.borderColor = color.red * 0x10000 + color.green * 0x100 + color.blue;
            if(alpha) this.borderAlpha = alpha;
        }
        this.render();
    }

    _setFillColorIntDouble(color: number, alpha: number) {
        this.fillColor = color % 0x1000000;
        this.fillAlpha = alpha;
        this.render();
    }

    _setFillColorString(color: string) {
        let c = ColorHelper.parseColorToOpenGL(color);
        this.fillColor = c.color!;
        this.fillAlpha = c.alpha;
        this.render();
    }

    _setFillColorStringDouble(color: string, alpha: number) {
        let c = ColorHelper.parseColorToOpenGL(color);
        this.fillColor = c.color!;
        this.fillAlpha = alpha;
        this.render();
    }

    _setBorderColorInt(color: number) {
        this.borderColor = color % 0x1000000;
        this.render();
    }

    _setBorderColorIntDouble(color: number, alpha: number) {
        this.borderColor = color % 0x1000000;
        this.borderAlpha = color;
        this.render();
    }

    _setBorderColorString(color: string) {
        let c = ColorHelper.parseColorToOpenGL(color);
        this.borderColor = c.color!;
        this.borderAlpha = c.alpha;
        this.render();
    }

    _setBorderColorStringDouble(color: string, alpha: number) {
        let c = ColorHelper.parseColorToOpenGL(color);
        this.borderColor = c.color!;
        this.borderAlpha = alpha;
        this.render();
    }

    static _setDefaultBorder(width: number, color: string | number, alpha?: number){
        FilledShapeDefaults.defaultBorderWidth = width;

        if (typeof color == "string") {
            let c = ColorHelper.parseColorToOpenGL(color);
            FilledShapeDefaults.defaultBorderColor = c.color;
            FilledShapeDefaults.defaultBorderAlpha = alpha == null ? c.alpha : alpha;
        } else {
            FilledShapeDefaults.defaultBorderColor = color;
            if (alpha != null) FilledShapeDefaults.defaultBorderAlpha = alpha;
        }

    }

    static _setDefaultFillColor(color: string | number, alpha?: number) {

        if (typeof color == "string") {
            let c = ColorHelper.parseColorToOpenGL(color);
            FilledShapeDefaults.defaultFillColor = c.color || 0x303030;
            FilledShapeDefaults.defaultFillAlpha = alpha == null ? c.alpha : alpha;
        } else {
            FilledShapeDefaults.defaultFillColor = color;
            if (alpha != null) FilledShapeDefaults.defaultFillAlpha = alpha;
        }

    }

    public borderContainsPoint(x: number, y: number, color: number = -1): boolean {
        if(typeof this.borderColor == 'undefined') return false;
        if(color != -1 && color != this.borderColor) return false;

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        if (this.hitPolygonInitial == null) return true;

        if (this.hitPolygonDirty) this.transformHitPolygon();
        return polygonzugEnthältPunkt(this.hitPolygonTransformed, { x: x, y: y }, this.borderWidth/2);

    }

}