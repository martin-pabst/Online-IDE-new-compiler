import * as PIXI from 'pixi.js';
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { GuiComponentClass } from "./GuiComponentClass.ts";
import { Thread } from '../../../../common/interpreter/Thread.ts';
import { CallbackFunction } from '../../../../common/interpreter/RuntimeConstants.ts';
import { GuiTextComponentClass } from './GuiTextComponentClass.ts';
import { lightenDarkenIntColor } from '../../../../../tools/HtmlTools.ts';
import { MouseEventKind } from '../MouseManager.ts';
import { JRC } from '../../../language/JavaRuntimeLibraryComments.ts';

export class ButtonClass extends GuiTextComponentClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Button extends GuiTextComponent", comment: JRC.ButtonClassComment},
        {type: "method", signature: "Button(double x, double y, double fontsize, string text)", java: ButtonClass.prototype._cj$_constructor_$Button$double$double$double$string, comment: JRC.ButtonConstructorComment},
        {type: "method", signature: "Button(double x, double y, double fontsize, string text, string fontFamily)", java: ButtonClass.prototype._cj$_constructor_$Button$double$double$double$string, comment: JRC.ButtonConstructorComment},
        {type: "method", signature: "Button copy()", java: ButtonClass.prototype._mj$copy$Button$, comment: JRC.ButtonCopyComment},

    ];

    static type: NonPrimitiveType;

    x!: number;
    y!: number;

    backgroundGraphics!: PIXI.Graphics;
    higlightGraphics!: PIXI.Graphics;

    mouseIsDown: boolean = false;

    isMouseOver: boolean = false;

    _cj$_constructor_$Button$double$double$double$string(t: Thread, callback: CallbackFunction,
        x: number, y: number, fontsize: number, text: string, fontFamily?: string
    ){

        this.x = x;
        this.y = y;

        this._cj$_constructor_$GuiTextComponent$(t, () => {
            this.centerXInitial = x;
            this.centerYInitial = y;

            this.borderColor = 0x808080;
            this.borderWidth = fontsize / 8;
            this.fillColor = 0x0000ff;

            this.hitPolygonInitial = [];

            this.render();

            if(callback) callback();

        }, true, false, fontsize, text, fontFamily);

    }

    onKeyDown(key: string, isShift: boolean, isCtrl: boolean, isAlt: boolean): void {}

    looseKeyboardFocus(): void {}

    _mj$copy$Button$(t: Thread, callback: CallbackFunction) {

        let button = new ButtonClass();
        button.textColor = this.textColor;
        this._cj$_constructor_$Button$double$double$double$string(t, () => {
            if(callback) callback();
        }, this.x, this.y, this.fontsize, this.text, this.fontFamily);

    }

    render(): void {

        this.textCompomentPrerender();

        let padding = this.fontsize / 3;

        if (this.container == null) {
            this.backgroundGraphics = new PIXI.Graphics();
            this.higlightGraphics = new PIXI.Graphics();

            this.pixiText = new PIXI.Text({
                text: this.text,
                style: this.textStyle
            });

            this.container = new PIXI.Container();
            this.container.localTransform.translate(this.x, this.y);
            this.container.setFromMatrix(this.container.localTransform);
            this.container.updateLocalTransform();

            this.world.app!.stage.addChild(this.container);

            this.container.addChild(this.higlightGraphics);
            this.container.addChild(this.backgroundGraphics);
            this.container.addChild(this.pixiText);

        } else {
            this.pixiText.text = this.text;
            this.backgroundGraphics.clear();
            this.higlightGraphics.clear();

            this.pixiText.alpha = this.fillAlpha;
            this.pixiText.anchor.x = 0;
            this.pixiText.style = this.textStyle;
        }

        this.centerXInitial = 0;
        this.centerYInitial = 0;


        if (this.text != null) {
            let tm = PIXI.CanvasTextMetrics.measureText(this.text, this.textStyle);

            this.textWidth = tm.width;
            this.textHeight = tm.height;

            this.pixiText.localTransform.identity();
            this.pixiText.localTransform.translate(padding, padding);
            this.pixiText.setFromMatrix(this.pixiText.localTransform);
            this.pixiText.updateLocalTransform();

            this.centerXInitial = this.textWidth / 2 + padding;
            this.centerYInitial = this.textHeight / 2 + padding;
        }

        let left = 0;
        let top = 0;
        this.dotWidth = this.textWidth + 2 * padding;
        this.height = this.textHeight + 2 * padding;

        this.hitPolygonInitial = [
            { x: left, y: top }, { x: left + this.dotWidth, y: top }, { x: left + this.dotWidth, y: top + this.height },
            { x: left, y: top + this.height }
        ];
        this.hitPolygonDirty = true;

        this.backgroundGraphics.roundRect(0, 0, this.dotWidth, this.height, this.height / 8);

        if (this.fillColor != null) {
            this.backgroundGraphics.fill(this.fillColor);
            this.backgroundGraphics.alpha = this.fillAlpha;
        }

        if (this.borderColor != null) {
            this.backgroundGraphics.stroke({
                width: this.borderWidth,
                color: this.borderColor,
                alpha: this.borderAlpha,
                alignment: 1.0
            })
        }


        let highlightWidth = this.height / 10 + this.borderWidth;
        this.higlightGraphics.roundRect(-highlightWidth, -highlightWidth, this.dotWidth + 2 * highlightWidth, this.height + 2 * highlightWidth, this.height / 4);
        if (this.fillColor != null) {
            this.higlightGraphics.fill(lightenDarkenIntColor(this.fillColor, 0.4));
        }

        this.higlightGraphics.visible = this.mouseIsDown;
    }

    onMouseEvent(kind: MouseEventKind, x: number, y: number): void {
        let containsPointer = this._containsPoint(x, y);

        switch (kind) {
            case "mousedown":
                if (containsPointer) {
                    this.mouseIsDown = true;
                    this.higlightGraphics.visible = true;
                }
                break;
            case "mouseup": {
                if (containsPointer && this.mouseIsDown) {
                    this.higlightGraphics.visible = false;
                    this.callOnChange("clicked");
                }
                this.mouseIsDown = false;
            }
                break;
            case "mouseleave": {
                this.isMouseOver = false;
                this.world._setCursor('default');
            }
                break;
            case "mousemove": {

                if (this.isMouseOver != containsPointer) {
                    this.isMouseOver = containsPointer;
                    this.world._setCursor(containsPointer ? "pointer" : "default");
                }

            }
        }

    }




}