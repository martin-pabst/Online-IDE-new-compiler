import * as PIXI from 'pixi.js';
import { CallbackFunction } from '../../../../common/interpreter/RuntimeConstants.ts';
import { Thread } from '../../../../common/interpreter/Thread.ts';
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { MouseEventKind } from '../MouseManager.ts';
import { GuiTextComponentClass } from './GuiTextComponentClass.ts';
import { JRC } from '../../../language/JavaRuntimeLibraryComments.ts';

export class RadioButtonClass extends GuiTextComponentClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class RadioButton extends GuiTextComponent", comment: JRC.RadiobuttonClassComment },
        { type: "method", signature: "RadioButton(double x, double y, double width, double fontsize, string text, int index)", java: RadioButtonClass.prototype._cj$_constructor_$Radiobutton$double$double$double$double$string$int, comment: JRC.RadiobuttonConstructorComment },
        { type: "method", signature: "RadioButton(double x, double y, double width, double fontsize, string text, string fontFamily, int index)", java: RadioButtonClass.prototype._cj$_constructor_$Radiobutton$double$double$double$double$string$string$int, comment: JRC.RadiobuttonConstructorComment },
        { type: "method", signature: "RadioButton copy()", java: RadioButtonClass.prototype._mj$copy$Button$, comment: JRC.RadiobuttonCopyComment },
        { type: "method", signature: "int getIndex()", template: '§1.index', comment: JRC.RadiobuttonGetIndexComment },
        { type: "method", signature: "int getIndexOfSelectedRadiobutton()", native: RadioButtonClass.prototype.getIndexOfSelectedRadiobutton, comment: JRC.RadiobuttonGetIndexOfSelectedRadiobuttonComment},
        { type: "method", signature: "int getTextOfSelectedRadiobutton()", native: RadioButtonClass.prototype.getTextOfSelectedRadiobutton, comment: JRC.RadiobuttonGetTextOfSelectedRadiobuttonComment},
        { type: "method", signature: "void setIndex()", native: RadioButtonClass.prototype.setIndex, comment: JRC.RadiobuttonSetIndexComment},
        { type: "method", signature: "void setDotColor()", native: RadioButtonClass.prototype.setDotColor, comment: JRC.RadiobuttonSetDotColorComment},
        { type: "method", signature: "void connectTo(RadioButton... otherButtons)", native: RadioButtonClass.prototype.connectTo, comment: JRC.RadiobuttonConnectToComment},
        { type: "method", signature: "void select()", native: RadioButtonClass.prototype.setSelected, comment: JRC.RadiobuttonSelectComment},
        { type: "method", signature: "boolean isSelected()", template: `§1.isSelected`, comment: JRC.RadiobuttonIsSelectedComment},
    ];

    static type: NonPrimitiveType;

    x!: number;
    y!: number;

    backgroundGraphics!: PIXI.Graphics;
    dot!: PIXI.Graphics;

    distanceToText: number = 4;

    dotColor: number = 0x000000;

    isSelected: boolean = true;

    mouseIsDown: boolean = false;

    isMouseOver: boolean = false;

    index!: number;

    otherButtons: RadioButtonClass[] = [];

    _cj$_constructor_$Radiobutton$double$double$double$double$string$int(t: Thread, callback: CallbackFunction,
        x: number, y: number, width: number, fontsize: number, text: string, index: number
    ) {
        this._cj$_constructor_$Radiobutton$double$double$double$double$string$string$int(t, callback, x, y, width, fontsize, text, undefined, index);
    }

    _cj$_constructor_$Radiobutton$double$double$double$double$string$string$int(t: Thread, callback: CallbackFunction,
        x: number, y: number, width: number, fontsize: number, text: string, fontFamily: string | undefined, index:  number
    ) {

        this.isSelected = false;

        this.fontFamily = fontFamily || "sans serif";

        this.index = index;

        this.x = x;
        this.y = y;
        this.dotWidth = width;

        this._cj$_constructor_$GuiTextComponent$(t, () => {
            this.centerXInitial = x;
            this.centerYInitial = y;

            this.borderColor = 0x808080;
            this.borderWidth = width / 10;
            this.fillColor = 0xffffff;

            this.hitPolygonInitial = [];

            this.render();

            if (callback) callback();

        }, true, false, fontsize, text, fontFamily);

    }

    onKeyDown(key: string, isShift: boolean, isCtrl: boolean, isAlt: boolean): void { }

    looseKeyboardFocus(): void { }

    _mj$copy$Button$(t: Thread, callback: CallbackFunction) {

        let radiobutton = new RadioButtonClass();
        radiobutton.textColor = this.textColor;
        radiobutton.dotColor = this.dotColor;

        radiobutton.distanceToText = this.distanceToText;
        radiobutton.isSelected = this.isSelected;

        radiobutton._cj$_constructor_$Radiobutton$double$double$double$double$string$string$int(t, () => {
            if (callback) callback();
        }, this.x, this.y, this.dotWidth, this.fontsize, this.text, this.fontFamily, this.index + 1);

    }

    setIndex(index: number){
        this.index = index;
    }

    getIndexOfSelectedRadiobutton(): number {
        if (this.isSelected) {
            return this.index;
        }
        for (let rb of this.otherButtons) {
            if (rb.isSelected) return rb.index;
        }

        return -1;
    }

    getTextOfSelectedRadiobutton(): string {
        if (this.isSelected) {
            return this.text;
        }
        for (let rb of this.otherButtons) {
            if (rb.isSelected) return rb.text;
        }

        return "";
    }

    setSelected() {
        this.isSelected = true;
        this.render();
        for (let ob of this.otherButtons) {
            ob.isSelected = false;
            ob.render();
        }
    }

    connectTo(otherButtons: RadioButtonClass[]) {
        if(otherButtons == null) return;

        for (let rb of otherButtons) {
            if (this.otherButtons.indexOf(rb) < 0 && rb != this) {
                this.otherButtons.push(rb);
            }
        }

        for(let rb of otherButtons){
            let list = this.otherButtons.slice();
            list.push(this);
            let othersIndex = list.indexOf(rb);
            if(othersIndex >= 0) list.splice(othersIndex, 1);

            rb.otherButtons = list;
        }
    }

    setDotColor(color: number) {
        this.dotColor = color;
        this.render();
    }


    setCrossColor(color: number) {
        this.dotColor = color;
        this.render();
    }

    render(): void {

        this.textCompomentPrerender();

        if (this.container == null) {
            this.backgroundGraphics = new PIXI.Graphics();
            this.dot = new PIXI.Graphics();

            this.textStyle.align = "left";
            this.pixiText = new PIXI.Text({ text: this.text, style: this.textStyle });
            this.pixiText.x = this.dotWidth + this.distanceToText;
            this.pixiText.alpha = this.fillAlpha;
            this.pixiText.anchor.x = 0;
            this.pixiText.y = 0;

            this.container = new PIXI.Container();

            this.container.addChild(this.backgroundGraphics);
            this.container.addChild(this.pixiText);
            this.container.addChild(this.dot);

            this.container.localTransform.translate(this.x, this.y);
            this.container.setFromMatrix(this.container.localTransform);
            this.container.updateLocalTransform();

            this.world.app!.stage.addChild(this.container);

        } else {
            this.pixiText.text = this.text;
            this.backgroundGraphics.clear();
            this.dot.clear();

        }

        this.centerXInitial = 0;
        this.centerYInitial = 0;

        let textTop = 0;

        if (this.text != null) {
            let tm = PIXI.CanvasTextMetrics.measureText(this.text, this.textStyle);

            this.textWidth = tm.width;
            this.textHeight = tm.height;
            let ascent = tm.fontProperties.ascent

            textTop = (this.dotWidth - this.textHeight) / 2;
            this.distanceToText = tm.fontProperties.descent * 3;

            this.pixiText.localTransform.identity();
            this.pixiText.localTransform.translate(this.dotWidth + this.distanceToText, textTop);
            this.pixiText.setFromMatrix(this.pixiText.localTransform);
            this.pixiText.updateLocalTransform();

            this.centerXInitial = (this.dotWidth + this.textWidth + this.distanceToText) / 2;
            this.centerYInitial = this.dotWidth / 2;
        }

        let left = 0;
        let top = 0;
        let textBottom = top + this.dotWidth - textTop;
        let overallWidth = this.textWidth + this.dotWidth + this.distanceToText;
        this.height = Math.max(this.dotWidth, this.textHeight);

        this.hitPolygonInitial = [
            { x: left, y: top }, { x: left + this.dotWidth, y: top }, { x: left + this.dotWidth + this.distanceToText, y: textTop },
            { x: left + overallWidth, y: textTop },
            { x: left + overallWidth, y: textBottom },
            { x: left + this.dotWidth + this.distanceToText, y: textBottom },
            { x: left + this.dotWidth, y: top + this.dotWidth },
            { x: left, y: top + this.dotWidth }
        ];
        this.hitPolygonDirty = true;

        this.backgroundGraphics.circle(this.dotWidth / 2, this.dotWidth / 2, this.dotWidth / 2);

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

        let df = 3.0;
        let bwdf = this.borderWidth * df;


        this.dot.circle(this.dotWidth / 2, this.dotWidth / 2, this.dotWidth / 6);
        if (this.dotColor != null) {
            this.dot.fill(this.dotColor);
        }

        this.dot.visible = this.isSelected;
    }

    setChecked(checked: boolean) {
        this.isSelected = checked;
        this.render();
    }

    onMouseEvent(kind: MouseEventKind, x: number, y: number): void {
        let containsPointer = this._containsPoint(x, y);

        switch (kind) {
            case "mousedown":
                if (containsPointer) {
                    this.mouseIsDown = true;
                }
                break;
            case "mouseup": {
                if (containsPointer && this.mouseIsDown) {
                    this.setSelected();
                    this.render();
                    this.callOnChange("" + this.index);
                    for(let rb of this.otherButtons){
                        rb.callOnChange("" + this.index);
                    }
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

    _isChecked(): boolean {
        return this.isSelected;
    }


}