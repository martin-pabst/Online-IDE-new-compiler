import * as PIXI from 'pixi.js';
import { copyTextToClipboard } from '../../../../../tools/HtmlTools';
import { CallbackFunction } from '../../../../common/interpreter/RuntimeConstants';
import { Thread } from '../../../../common/interpreter/Thread';
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { MouseEventKind } from '../MouseManager';
import { GuiTextComponentClass } from "./GuiTextComponentClass";
import { JRC } from '../../../language/JavaRuntimeLibraryComments';

export class TextFieldClass extends GuiTextComponentClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class TextField extends GuiTextComponent", comment: JRC.TextfieldClassComment },
        { type: "method", signature: "TextField(double x, double y, double width, double fontsize, string caption)", java: TextFieldClass.prototype._cj$_constructor_$Textfield$double$double$double$double$string$string, comment: JRC.TextfieldConstructorComment },
        { type: "method", signature: "TextField(double x, double y, double width, double fontsize, string caption, string fontFamily)", java: TextFieldClass.prototype._cj$_constructor_$Textfield$double$double$double$double$string$string, comment: JRC.TextfieldConstructorComment },
        { type: "method", signature: "TextField copy()", java: TextFieldClass.prototype._mj$copy$Textfield$, comment: JRC.TextfieldCopyComment },
        { type: "method", signature: "void setPadding(double padding)", native: TextFieldClass.prototype.setPadding, comment: JRC.TextfieldSetPaddingComment },
        // { type: "method", signature: "string getText()", native: TextFieldClass.prototype.getText, comment: JRC.TextfieldGetTextComment },
    ];

    static type: NonPrimitiveType;

    backgroundGraphics!: PIXI.Graphics;
    mask!: PIXI.Graphics;
    keyboardFocusRect!: PIXI.Graphics;
    cursor!: PIXI.Graphics;
    selectionRectangle!: PIXI.Graphics;

    padding: number = 8;

    hasKeyboardFocus: boolean = false;

    characterStops: number[] = [];
    characterCenterList: number[] = [];

    isSelecting: boolean = false;
    selectionStart: number = 0;
    selectionEnd: number = 0;

    renderFromCharacterPosition: number = 0;

    timerId: any;

    isMouseOver: boolean = false;

    x!: number;
    y!: number;
    width!: number;
    caption!: string;


    _cj$_constructor_$Textfield$double$double$double$double$string$string(t: Thread, callback: CallbackFunction,
        x: number, y: number, width: number, fontsize: number, caption: string, fontFamily?: string
    ) {
        fontFamily = fontFamily || "sans serif";
        this.x = x;
        this.y = y;
        this.width = width;

        this._cj$_constructor_$GuiTextComponent$(t, () => {
            this.centerXInitial = x;
            this.centerYInitial = y;

            this.borderColor = 0x808080;
            this.borderWidth = fontsize/10;
            this.fillColor = 0xffffff;
            this.textColor = 0x000000;

            this.hitPolygonInitial = [];

            this.generateCharacterStops();

            this.render();

            this.initTimer();

            if (callback) callback();

        }, true, true, fontsize, caption, fontFamily);

    }


    initTimer() {
        let that = this;
        this.timerId = setInterval(() => {
            if (that.cursor != null && !that.cursor.destroyed && that.hasKeyboardFocus) {
                that.cursor.visible = !that.cursor.visible;
            }
        }, 500);

    }

    unregisterAsListener() {
        super.unregisterAsListener();
        clearInterval(this.timerId);
    }

    _mj$copy$Textfield$(t: Thread, callback: CallbackFunction) {

        let tf = new TextFieldClass();

        tf._cj$_constructor_$Textfield$double$double$double$double$string$string(
            t, () => {
                tf.padding = this.padding;
                tf.copyFrom(this);
                tf.render();
            }, this.x, this.y, this.width, this.fontsize, this.text, this.fontFamily
        )

    }


    render(): void {

        this.scrollIfNecessary();
        this.textCompomentPrerender();

        let t = this.text;
        if(t.length == 0){
            t = this.text;
            this.textStyle.fill = 0x404040;
        } else {
            t = this.text.substring(this.renderFromCharacterPosition);
        }

        if (this.container == null) {
            this.backgroundGraphics = new PIXI.Graphics();
            this.keyboardFocusRect = new PIXI.Graphics();
            this.cursor = new PIXI.Graphics();
            this.selectionRectangle = new PIXI.Graphics();

            this.mask = new PIXI.Graphics();

            this.pixiText = new PIXI.Text({text: t, style: this.textStyle});

            this.container = new PIXI.Container();
            this.container.localTransform.translate(this.x + this.padding, this.y + this.padding);
            this.container.setFromMatrix(this.container.localTransform);
            this.container.updateLocalTransform();

            this.world.app!.stage.addChild(this.container);

            this.container.addChild(this.mask);
            this.container.addChild(this.backgroundGraphics);
            this.container.addChild(this.keyboardFocusRect);
            this.container.addChild(this.selectionRectangle);
            this.container.addChild(this.pixiText);
            this.container.addChild(this.cursor);

            this.pixiText.mask = this.mask;
            this.selectionRectangle.mask = this.mask;

        } else {
            this.pixiText.text = t;
            this.backgroundGraphics.clear();
            this.mask.clear();
            this.keyboardFocusRect.clear();
            this.selectionRectangle.clear();
            this.cursor.clear();

            this.pixiText.alpha = this.fillAlpha;
            this.pixiText.anchor.x = 0;
            //@ts-ignore
            this.textStyle.align = "left";
            this.pixiText.style = this.textStyle;
        }

        this.centerXInitial = 0;
        this.centerYInitial = 0;

        let width = 0;

        if (this.text != null) {
            let tm = PIXI.CanvasTextMetrics.measureText(this.text, this.textStyle);

            width = this.width;
            this.height = tm.height;
            tm.fontProperties.ascent

            this.centerXInitial = width / 2;
            this.centerYInitial = this.height / 2;
        }

        let left = 0 - this.pixiText.anchor.x * width;
        let top = 0 - this.pixiText.anchor.y * this.height;

        this.hitPolygonInitial = [
            { x: left, y: top }, { x: left, y: top + this.height },
            { x: left + width, y: top + this.height }, { x: left + width, y: top }
        ];
        this.hitPolygonDirty = true;

        let rLeft = -this.padding;
        let rTop = -this.padding;

        this.mask.rect(0, 0, this.width - 2 * this.padding, this.height);
        this.mask.fill(0x000000);

        this.backgroundGraphics.roundRect(-this.padding, -this.padding, this.width, this.height + 2 * this.padding, this.fontsize/8);

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


        if (this.selectionEnd != this.selectionStart) {
            let xFrom = this.characterStops[this.selectionStart] - this.characterStops[this.renderFromCharacterPosition];
            let xTo = this.characterStops[this.selectionEnd] - this.characterStops[this.renderFromCharacterPosition];
            if(xTo < xFrom){
                let z = xTo;
                xTo = xFrom;
                xFrom = z;
            }
            this.selectionRectangle.roundRect(xFrom, 0, xTo - xFrom, this.height, this.fontsize/8);
            this.selectionRectangle.fill({color: 0x8080ff});
        }

        this.renderCursor();

        this.keyboardFocusRect.rect(-this.padding, -this.padding, this.width, this.height + 2 * this.padding);
        this.keyboardFocusRect.stroke({width: this.borderWidth, color: 0x800000, alpha: 1.0, alignment: 0.5});

        this.keyboardFocusRect.visible = this.hasKeyboardFocus;

    }

    renderCursor() {
        this.cursor.clear();
        let cursorWidth = Math.min(2, this.fontsize / 10);
        let cx = this.characterStops[this.selectionEnd] - this.characterStops[this.renderFromCharacterPosition];

        let start = new PIXI.Point(cx, 0);
        let end = new PIXI.Point(cx, this.height);

        this.cursor.moveTo(start.x, start.y).lineTo(end.x, end.y);
        this.cursor.stroke({width: cursorWidth, color: 0x0, alpha: 1.0, alignment: 0.5});
        this.cursor.visible = this.hasKeyboardFocus;
    }

    getLocalCoordinates(x: number, y: number) {
        let p = new PIXI.Point(x, y);
        this.getWorldTransform().applyInverse(p, p);
        return p;
    }

    onMouseEvent(kind: MouseEventKind, x: number, y: number): void {
        let containsPointer = this._containsPoint(x, y);

        switch (kind) {
            case "mousedown": {
                if (containsPointer) {
                    this.gainKeyboardFocus();
                    this.startSelecting(x, y);
                } else {
                    this.looseKeyboardFocus();
                }
            }
                break;
            case "mouseup": {
                this.stopSelecting();
            }
                break;
            case "mouseleave": {
                this.stopSelecting();
                this.isMouseOver = false;
                this.world._setCursor('default');
            }
                break;
            case "mousemove": {
                if (this.isSelecting) {
                    let pos = this.getLocalCoordinates(x, y);
                    this.selectionEnd = this.getCharacterPosition(pos.x);
                    this.render();
                }

                if(this.isMouseOver != containsPointer){
                    this.isMouseOver = containsPointer;
                    this.world._setCursor(containsPointer ? "pointer" : "default");
                }

            }
                break;
        }


    }

    generateCharacterStops() {
        this.characterStops = [0];
        for (let i = 1; i <= this.text.length; i++) {
            let subtext = this.text.substring(0, i);
            let tm = PIXI.CanvasTextMetrics.measureText(subtext, this.textStyle);
            this.characterStops.push(tm.width);
        }

        this.characterCenterList = [];
        for (let i = 0; i < this.characterStops.length - 1; i++) {
            this.characterCenterList.push((this.characterStops[i] + this.characterStops[i + 1]) / 2);
        }
    }

    startSelecting(x: number, y: number) {
        this.isSelecting = true;
        let pos = this.getLocalCoordinates(x, y);
        this.selectionStart = this.getCharacterPosition(pos.x);
        this.selectionEnd = this.selectionStart;
        this.render();
    }

    stopSelecting() {
        this.isSelecting = false;
    }

    deleteSelected() {
        if (this.selectionEnd != this.selectionStart) {
            this.adjustSelectStartLowerSelectEnd();
            this.text = this.text.substring(0, this.selectionStart) + this.text.substring(this.selectionEnd);
            this.selectionEnd = this.selectionStart;
            this.isSelecting = false;
        }
    }
    adjustSelectStartLowerSelectEnd() {
        if (this.selectionEnd < this.selectionStart) {
            let z = this.selectionEnd;
            this.selectionEnd = this.selectionStart;
            this.selectionStart = z;
        }
    }

    onKeyDown(key: string, isShift: boolean, isCtrl: boolean, isAlt: boolean): void {
        if (!this.hasKeyboardFocus) return;
        this.isSelecting = false;

        let that = this;
        if (isCtrl && key == "c") {
            this.adjustSelectStartLowerSelectEnd();
            copyTextToClipboard(this.text.substring(this.selectionStart, this.selectionEnd));
        } else if (isCtrl && key == "v") {
            navigator.clipboard.readText().then(
                clipText => {
                    that.deleteSelected();
                    that.text = that.text.substring(0, that.selectionEnd) + clipText + that.text.substring(that.selectionEnd);
                    that.selectionEnd += clipText.length;
                    that.selectionStart = that.selectionEnd;
                    that.generateCharacterStops();
                    that.render();
                    this.callOnChange(this.text);
                });
        } else if (key.length == 1) {
            this.deleteSelected();
            this.text = this.text.substring(0, this.selectionEnd) + key + this.text.substring(this.selectionEnd);
            this.selectionEnd++;
            this.selectionStart = this.selectionEnd;
            this.generateCharacterStops();
            this.render();
            this.callOnChange(this.text);
        } else {
            switch (key) {
                case "ArrowRight":
                    this.selectionEnd = Math.min(this.selectionEnd + 1, this.text.length);
                    if (!isShift) this.selectionStart = this.selectionEnd;
                    this.render();
                    break;
                case "ArrowLeft":
                    this.selectionEnd = Math.max(this.selectionEnd - 1, 0);
                    if (!isShift) this.selectionStart = this.selectionEnd;
                    this.render();
                    break;
                case "Delete":
                    if (this.selectionStart != this.selectionEnd) {
                        this.deleteSelected();
                    } else {
                        if (this.selectionEnd < this.text.length) {
                            this.text = this.text.substring(0, this.selectionEnd) + this.text.substring(this.selectionEnd + 1);
                        }
                    }
                    this.generateCharacterStops();
                    this.render();
                    this.callOnChange(this.text);
                    break;
                case "Backspace":
                    if (this.selectionStart != this.selectionEnd) {
                        this.deleteSelected();
                    } else {
                        if (this.selectionEnd > 0) {
                            this.text = this.text.substring(0, this.selectionEnd - 1) + this.text.substring(this.selectionEnd);
                            this.selectionEnd--;
                            this.selectionStart = this.selectionEnd;
                        }
                    }
                    this.generateCharacterStops();
                    this.render();
                    this.callOnChange(this.text);
                    break;
                case "Insert":
                    break;
                case "Home":
                    this.selectionStart = 0;
                    this.selectionEnd = 0;
                    this.render();
                    break;
                case "End":
                    this.selectionStart = this.text.length;
                    this.selectionEnd = this.text.length;
                    this.render();
                    break;
                default:
                    console.log(key);
                    break;
            }
        }


    }

    scrollIfNecessary(): boolean {
        let x = this.getCursorXFromCharacterPos(this.selectionEnd);
        let hasScrolled: boolean = false;
        while (x < 0 && this.renderFromCharacterPosition > 0) {
            this.renderFromCharacterPosition--;
            x = this.getCursorXFromCharacterPos(this.selectionEnd);
            hasScrolled = true;
        }

        while (x > this.width - 2 * this.padding && this.renderFromCharacterPosition < this.text.length) {
            this.renderFromCharacterPosition++;
            x = this.getCursorXFromCharacterPos(this.selectionEnd);
            hasScrolled = true;
        }
        return hasScrolled;
    }

    getCursorXFromCharacterPos(pos: number) {
        return this.characterStops[pos] - this.characterStops[this.renderFromCharacterPosition]
    }


    gainKeyboardFocus(): void {
        let keyboardListeners = this.scheduler.interpreter.keyboardManager?.internalKeyboardListeners;
        if(keyboardListeners){
            for (let ikl of keyboardListeners) {
                if (ikl != this) ikl.looseKeyboardFocus();
            }
        }
        this.hasKeyboardFocus = true;
        this.keyboardFocusRect.visible = true;
        this.cursor.visible = true;
    }

    looseKeyboardFocus(): void {
        this.hasKeyboardFocus = false;
        this.keyboardFocusRect.visible = false;
        this.cursor.visible = false;
    }

    getCharacterPosition(x: number): number {
        if (this.characterCenterList.length == 0) return 0;
        for (let i = 0; i < this.characterCenterList.length; i++) {
            if (x <= this.characterCenterList[i] - this.characterStops[this.renderFromCharacterPosition]) return i;
        }

        return this.characterCenterList.length;
    }

    setPadding(padding: number){
        this.padding = padding;
    }

}