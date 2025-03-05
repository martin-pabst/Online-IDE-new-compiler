import * as PIXI from 'pixi.js';
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { GuiComponentClass } from "./GuiComponentClass.ts";
import { Thread } from '../../../../common/interpreter/Thread.ts';
import { CallbackFunction } from '../../../../common/interpreter/RuntimeConstants.ts';
import { JRC } from '../../../language/JavaRuntimeLibraryComments.ts';

export class GuiTextComponentClass extends GuiComponentClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "abstract class GuiTextComponent extends GuiComponent", comment: JRC.GuiTextComponentClassComment},
        {type: "method", signature: "GuiTextComponent()", java: GuiTextComponentClass.prototype._cj$_constructor_$GuiTextComponent$},

        {type: "method", signature: "void setFontsize(double fontsize)", native: GuiTextComponentClass.prototype.setFontsize, comment: JRC.GuiTextComponentSetFontsizeComment},
        {type: "method", signature: "void setText(string text)", native: GuiTextComponentClass.prototype.setText, comment: JRC.GuiTextComponentSetTextComment},
        {type: "method", signature: "string getText()", native: GuiTextComponentClass.prototype.getText, comment: JRC.GuiTextComponentGetTextComment},
        {type: "method", signature: "double getFontsize()", template: `§1.fontsize`, comment: JRC.GuiTextComponentGetFontsizeComment},
        {type: "method", signature: "void setStyle(boolean isBold, boolean isItalic)", native: GuiTextComponentClass.prototype.setStyle, comment: JRC.GuiTextComponentSetStyleComment},
        {type: "method", signature: "void setTextColor(int color)", native: GuiTextComponentClass.prototype.setTextColor, comment: JRC.GuiTextComponentSetTextColor},

    ];

    static type: NonPrimitiveType;


    pixiText!: PIXI.Text;

    textColor: number = 0xffffff;

    textHeight: number = 10;
    textWidth: number = 10;
    fontsize: number = 12;
    text: string = "";
    fontFamily: string = "sans serif";

    textStyle: PIXI.TextStyle =
        new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 10,
            fontStyle: 'normal',
            fontWeight: 'normal',
            fill: 0xffffff, // gradient possible...
            stroke: {
                color: 0x000000,
                width: 0,
                join: 'round'
            },
            dropShadow: false,
            wordWrap: false,
            align: "center"
        });

        _cj$_constructor_$GuiTextComponent$(t: Thread, callback: CallbackFunction,
            registerAsMouseListener: boolean, registerAsKeyboardListener: boolean,
            fontsize: number, text: string, fontFamily?: string){
                this._cj$_constructor$GuiComponent$(t, () => {
                    this.fontsize = fontsize || 10;
                    this.fontFamily = fontFamily || "sans serif";
                    this.text = text;
                    if (this.fontsize == 0) this.fontsize = 10;

                    this.textStyle.fontSize = fontsize;

                    if (fontFamily != null) {
                        this.textStyle.fontFamily = fontFamily;
                    }
                    if(callback) callback();
                }, registerAsMouseListener, registerAsKeyboardListener);

        }

    setStyle(isBold: boolean, isItalic: boolean) {
        this.textStyle.fontWeight = isBold ? "bold" : "normal";
        this.textStyle.fontStyle = isItalic ? "italic" : "normal";
        this.render();
    }

    textCompomentPrerender(): void {
        this.textStyle.fill = this.textColor == null ? 0x000000 : this.textColor;
        //@ts-ignore
        this.textStyle.stroke.color = 0x000000;
        //@ts-ignore
        this.textStyle.stroke.width = 0;
        this.textStyle.fontSize = this.fontsize;

    }

    setFontsize(fontsize: number) {
        this.fontsize = fontsize;
        if (this.fontsize == 0) this.fontsize = 10;
        this.render();
    }

    setText(text: string) {
        this.text = text;
        this.render();
    }

    setTextColor(color: number) {
        this.textColor = color;
        this.render();
    }

    getText(): string {
        return this.text;
    }


}