import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/RuntimeConstants';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { AlignmentEnum } from './AlignmentEnum';
import { FilledShapeClass } from './FilledShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments';

export class TextClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Text extends FilledShape", comment: JRC.TextClassComment },

        { type: "method", signature: "Text()", java: TextClass.prototype._cj$_constructor_$Text$, comment: JRC.TextEmptyConstructorComment },
        { type: "method", signature: "Text(double x, double y, double fontSize, string text)", java: TextClass.prototype._cj$_constructor_$Text$double$double$double$string, comment: JRC.TextConstructorComment1 },
        { type: "method", signature: "Text(double x, double y, double fontSize, string text, string fontFamily)", java: TextClass.prototype._cj$_constructor_$Text$double$double$double$string, comment: JRC.TextConstructorComment1 },
        { type: "method", signature: "Text(double x, double y, double fontSize, double text)", java: TextClass.prototype._cj$_constructor_$Text$double$double$double$string, comment: JRC.TextConstructorComment1 },
        { type: "method", signature: "Text(double x, double y, double fontSize, double text, string fontFamily)", java: TextClass.prototype._cj$_constructor_$Text$double$double$double$string, comment: JRC.TextConstructorComment1 },

        { type: "method", signature: "void setFontsize(double fontsize)", native: TextClass.prototype._setFontsize, comment: JRC.TextSetFontsizeComment },
        { type: "method", signature: "void setText(string text)", native: TextClass.prototype._setText, comment: JRC.TextSetTextComment },
        { type: "method", signature: "void setText(double text)", native: TextClass.prototype._setText, comment: JRC.TextSetTextComment },

        { type: "method", signature: "void setAlignment(Alignment alignment)", native: TextClass.prototype._setAlignment, comment: JRC.TextSetAlignmentComment },
        { type: "method", signature: "void setStyle(boolean bold, boolean italic)", native: TextClass.prototype._setStyle, comment: JRC.TextSetStyleComment },

        { type: "method", signature: "double getFontsize()", template: `§1.fontsize` , comment: JRC.TextGetFontsizeComment },
        { type: "method", signature: "string getText()", template: `§1.text`, comment: JRC.TextGetTextComment },
        { type: "method", signature: "double getWidth()", native: TextClass.prototype._getWidth, comment: JRC.TextGetWidthComment },
        { type: "method", signature: "double getHeight()", native: TextClass.prototype._getHeight, comment: JRC.TextGetHeightComment },

        { type: "method", signature: "final void moveTo(double x, double y)", native: TextClass.prototype._moveTo, comment: JRC.TextMoveToComment },


        { type: "method", signature: "final Text copy()", java: TextClass.prototype._mj$copy$Text$, comment: JRC.TextCopyComment },

        { type: "method", signature: "String toString()", java: TextClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]

    static type: NonPrimitiveType;

    alignment: string = "left";

    textStyle: PIXI.TextStyle =
        new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 10,
            fontStyle: 'normal',
            fontWeight: 'normal',
            fill: this.fillColor == null ? 0x000000 : this.fillColor, // gradient possible...
            stroke: {
                color: this.borderColor == null ? 0x000000 : this.borderColor,
                width: this.borderColor == null ? 0 : this.borderWidth,
                join: 'round'
            },
            dropShadow: false,
            wordWrap: false,
            align: "left",
        });

    x!: number;
    y!: number;
    fontsize!: number;
    text!: string;
    fontFamily!: string;

    _cj$_constructor_$Text$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$Text$double$double$double$string(t, callback, 0, 0, 24, "Text");
    }

    _cj$_constructor_$Text$double$double$double$string(t: Thread, callback: CallbackFunction,
        x: number, y: number, fontSize: number, text: string | number, fontFamily?: string
    ) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.x = x;
            this.y = y;
            this.fontsize = fontSize;
            this.text = text + "";

            this.centerXInitial = x;
            this.centerYInitial = y;

            if (this.fontsize == 0) this.fontsize = 10;

            this.borderColor = undefined;
            this.textStyle.stroke = 0x000000;
            if (fontFamily != undefined) {
                this.textStyle.fontFamily = fontFamily;
            }

            this.hitPolygonInitial = [];


            this.render();
            if(callback) callback();
        });   // call base class constructor


    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter){
        this._mj$copy$Text$(t, callback);
    }

    _mj$copy$Text$(t: Thread, callback: CallbackFunction) {
        let copy = new TextClass();
        copy._cj$_constructor_$Text$double$double$double$string(t, callback, this.x, this.y, this.fontsize, this.text, this.fontFamily);
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }

    render(): void {

        let g: PIXI.Text = <any>this.container;
        this.textStyle.fill = this.fillColor == null ? 0x000000 : this.fillColor;
        this.textStyle.stroke = {
            color: this.borderColor == null ? 0x000000 : this.borderColor,
            width: this.borderColor == null ? 0 : this.borderWidth,
            join: 'round'
        }
        this.textStyle.fontSize = this.fontsize;

        if (!this.container) {
            g = new PIXI.Text({
                text: this.text,
                style: this.textStyle
            });
            this.container = g;

            this.container.localTransform.translate(this.x, this.y);
            this.container.setFromMatrix(this.container.localTransform);
            this.container.updateLocalTransform();
            //@ts-ignore
            this.container._didLocalTransformChangeId = this.container._didChangeId;

            this.setWorldTransformAndHitPolygonDirty();

            this.world.app!.stage.addChild(g);
        } else {
            g.text = this.text;
            g.alpha = this.fillAlpha;
            switch (this.alignment) {
                case "left": g.anchor.x = 0; break;
                case "center": g.anchor.x = 0.5; break;
                case "right": g.anchor.x = 1.0; break;
            }
            //@ts-ignore
            this.textStyle.align = this.alignment;
            g.style = this.textStyle;
        }

        this.centerXInitial = 0;
        this.centerYInitial = 0;

        let width = 0;
        let height = 0;

        if (this.text != null) {
            let tm = PIXI.CanvasTextMetrics.measureText("" + this.text, this.textStyle);

            width = tm.width;
            height = tm.height;
            tm.fontProperties.ascent

            this.centerXInitial = width / 2;
            this.centerYInitial = height / 2;
        }

        let left = 0 - g.anchor.x * width;
        let top = 0 - g.anchor.y * height;

        this.hitPolygonInitial = [
            { x: left, y: top }, { x: left, y: top + height },
            { x: left + width, y: top + height }, { x: left + width, y: top }
        ];


    };


    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if (callback) callback();

        return;
    }

    _debugOutput() {
        if(this.isDestroyed) return "<destroyed Text>"
        let s = `{text: ${this.text}, centerX: ${this._getCenterX()}, centerY: ${this._getCenterY()} }`;
        return s;
    }

    _moveTo(newX: number, newY: number){
        let p = new PIXI.Point(0, 0);
        this.getWorldTransform();
        this.container.localTransform.apply(p, p);
        this._move(newX - p.x, newY - p.y);
    }

    _setFontsize(fontsize: number) {
        this.fontsize = fontsize;
        if (this.fontsize == 0) this.fontsize = 10;
        this.render();
    }

    _setText(text: string | number) {
        this.text = text + "";
        this.render();
    }

    _setAlignment(alignment: AlignmentEnum) {
        this.alignment = alignment.name;
        this.render();
    }

    _getWidth(): number {
        let g: PIXI.Text = <any>this.container;
        return g.width;
    }

    _getHeight(): number {
        let g: PIXI.Text = <any>this.container;
        return g.height;
    }

    _setStyle(isBold: boolean, isItalic: boolean) {
        this.textStyle.fontWeight = isBold ? "bold" : "normal";
        this.textStyle.fontStyle = isItalic ? "italic" : "normal";
        this.render();
    }

}