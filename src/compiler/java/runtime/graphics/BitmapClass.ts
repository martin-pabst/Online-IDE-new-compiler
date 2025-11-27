import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/StepFunction';
import { Thread } from "../../../common/interpreter/Thread";
import { ColorHelper } from '../../lexer/ColorHelper.ts';
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException.ts';
import { ColorClass } from './ColorClass.ts';
import { ShapeClass } from './ShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';
import { PositionClass } from './PositionClass.ts';
import { downloadFile } from '../../../../tools/HtmlTools.ts';
import * as UPNG from 'upng-js'


export class BitmapClass extends ShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Bitmap extends Shape", comment: JRC.BitmapClassComment },

        {
            type: "method", signature: "Bitmap(int resolutionX, int resolutionY, double left, double top, double displayWidth, double displayHeight)",
            java: BitmapClass.prototype._cj$_constructor_$Bitmap$int$int$double$double$double$double, comment: JRC.BitmapConstructorComment
        },
        { type: "method", signature: "final int getResolutionX()", native: BitmapClass.prototype._getResolutionX, comment: JRC.BitmapGetResolutionXComment },
        { type: "method", signature: "final int getResolutionY()", native: BitmapClass.prototype._getResolutionY, comment: JRC.BitmapGetResolutionYComment },
        { type: "method", signature: "final void setColor(int x, int y, int color, double alpha)", native: BitmapClass.prototype._setColor, comment: JRC.BitmapSetColorComment },
        { type: "method", signature: "final void setColor(int x, int y, string color, double alpha)", native: BitmapClass.prototype._setColor, comment: JRC.BitmapSetColorComment },
        { type: "method", signature: "final void setColor(int x, int y, int color)", native: BitmapClass.prototype._setColor, comment: JRC.BitmapSetColorComment },
        { type: "method", signature: "final void setColor(int x, int y, string color)", native: BitmapClass.prototype._setColor, comment: JRC.BitmapSetColorComment },
        { type: "method", signature: "final Color getColor(int x, int y)", native: BitmapClass.prototype._getColor, comment: JRC.BitmapGetColorComment },
        { type: "method", signature: "final int getColorAsInt(int x, int y)", native: BitmapClass.prototype._getColorAsInt, comment: JRC.BitmapGetColorComment },
        { type: "method", signature: "double getAlpha(int x, int y)", native: BitmapClass.prototype._getAlpha, comment: JRC.BitmapGetPixelAlphaComment },

        { type: "method", signature: "final boolean isColor(int x, int y, string colorAsRGBString)", native: BitmapClass.prototype._isColor, comment: JRC.BitmapIsColorComment },
        { type: "method", signature: "final boolean isColor(int x, int y, int color)", native: BitmapClass.prototype._isColor, comment: JRC.BitmapIsColorComment },

        { type: "method", signature: "final Position screenCoordinatesToBitmapCoordinates(double x, double y)", native: BitmapClass.prototype._worldCoordinatesToBitmapCoordinates, comment: JRC.BitmapWorldCoordinatesToBitmapCoordinatesComment },

        { type: "method", signature: "final void fillAll(int color, double alpha)", native: BitmapClass.prototype._fillAll, comment: JRC.BitmapFillAllComment },
        { type: "method", signature: "final void fillAll(string colorAsRGBString, double alpha)", native: BitmapClass.prototype._fillAll, comment: JRC.BitmapFillAllComment },

        { type: "method", signature: "final void downloadAsPngFile(string filename)", native: BitmapClass.prototype._downloadAsPngFile, comment: JRC.BitmapDownloadAsPngFileComment },



        { type: "method", signature: "final Bitmap copy()", java: BitmapClass.prototype._mj$copy$Bitmap$, comment: JRC.BitmapCopyComment },

        { type: "method", signature: "String toString()", java: BitmapClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]

    static type: NonPrimitiveType;
    left!: number;
    top!: number;
    width!: number;
    height!: number;
    anzahlX!: number;
    anzahlY!: number;

    texture!: PIXI.Texture;
    ts!: PIXI.TextureSource;
    data!: Uint32Array;

    isBigEndian: boolean = true;

    _cj$_constructor_$Bitmap$int$int$double$double$double$double(t: Thread, callback: CallbackFunction,
        anzahlX: number, anzahlY: number, left: number, top: number, width: number, height: number,
        bitmapToCopy?: BitmapClass, clone: boolean = false
    ) {
        this._cj$_constructor_$Shape$(t, () => {
            this.centerXInitial = left + width / 2;
            this.centerYInitial = top + height / 2;

            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.anzahlX = anzahlX;
            this.anzahlY = anzahlY;

            this.initBitmap(bitmapToCopy, clone);
        });   // call base class constructor


    }

    private initBitmap(bitmapToCopy?: BitmapClass, clone: boolean = false) {
        let uInt32 = new Uint32Array([0x11223344]);
        let uInt8 = new Uint8Array(uInt32.buffer);

        if (uInt8[0] === 0x44) {
            this.isBigEndian = false;
        } else if (uInt8[0] === 0x11) {
            this.isBigEndian = true;
        }

        // TODO: Little Endian...

        this.centerXInitial = this.left + this.width / 2;
        this.centerYInitial = this.top + this.height / 2;

        this.hitPolygonInitial = [
            { x: this.left, y: this.top }, { x: this.left, y: this.top + this.height }, { x: this.left + this.width, y: this.top + this.height }, { x: this.left + this.width, y: this.top }
        ];

        this.initGraphics(bitmapToCopy, clone);

        let sprite = <PIXI.Sprite>this.container;

        sprite.localTransform.scale(this.width / this.anzahlX, this.height / this.anzahlY);
        sprite.localTransform.translate(this.left, this.top);
        sprite.setFromMatrix(sprite.localTransform);
        sprite.updateLocalTransform();
        //@ts-ignore
        sprite._didLocalTransformChangeId = sprite._didChangeId;

        this.setWorldTransformAndHitPolygonDirty();

        let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
        sprite.localTransform.applyInverse(p, p);
        this.centerXInitial = p.x;
        this.centerYInitial = p.y;

    }

    protected initGraphics(bitmapToCopy?: BitmapClass, clone: boolean = false) {

        if (bitmapToCopy == null) {
            this.data = new Uint32Array(this.anzahlX * this.anzahlY);
        } else {
            if (clone) {
                this.data = bitmapToCopy.data;
            } else {
                this.data = new Uint32Array(bitmapToCopy.data);
            }
        }

        let u8Array = new Uint8Array(this.data.buffer);

        if (!clone) {

            this.texture = PIXI.Texture.from(new PIXI.BufferImageSource({
                resource: u8Array,
                width: this.anzahlX,
                height: this.anzahlY,
                scaleMode: "nearest",
                format: "rgba8unorm",        // unfortunately the only one that works..
                alphaMode: "premultiplied-alpha", // 'no-premultiply-alpha' | 'premultiply-alpha-on-upload' | 'premultiplied-alpha'

            }))

        } else {
            this.texture = bitmapToCopy!.texture;
        }

        this.container = new PIXI.Sprite(this.texture);

        this.world.app.stage.addChild(this.container);
    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter) {
        this._mj$copy$Bitmap$(t, callback);
    }

    _mj$copy$Bitmap$(t: Thread, callback: CallbackFunction) {
        let copy = new BitmapClass();
        copy._cj$_constructor_$Bitmap$int$int$double$double$double$double(t, callback, this.anzahlX, this.anzahlY, this.left, this.top, this.width, this.height,
            this, true
        );
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }

    render(): void {

    };

    timerID: any = undefined;
    uploadData() {
        if (this.timerID) return;

        this.timerID = setTimeout(() => {
            this.texture.source.update();
            this.timerID = undefined;
        }, 100)

    }

    public _getColor(x: number, y: number): ColorClass {

        let i = (x + y * (this.anzahlX));

        let c = this.data[i];

        let color = new ColorClass();
        color.red = c & 0xff;
        color.green = (c & 0xff00) >> 8;
        color.blue = (c & 0xff0000) >> 16;

        color.alpha = 1.0;

        return color;

    }

    public _getColorAsInt(x: number, y: number): number {

        let i = (x + y * (this.anzahlX));

        let c = this.data[i];

        return ((c & 0xff) << 16) + (c & 0xff00) + ((c & 0xff0000) >> 16)

    }

    public _getAlpha(x: number, y: number): number {

        let i = (x + y * (this.anzahlX));
        let c = this.data[i];

        return ((c & 0xff000000) >>> 24) / 255.0; // >>> to get unsigned shift

    }

    public _isColor(x: number, y: number, color: string | number, alpha?: number) {

        let i = (x + y * (this.anzahlX));

        let c: number | undefined;

        if (typeof color == "string") {
            let ch = ColorHelper.parseColorToOpenGL(color);
            c = ch.color;
            alpha = ch.alpha;
        } else {
            c = color;
        }

        let c1 = this.data[i];
        let red = c1 & 0xff;
        let green = (c1 & 0xff00) >> 8;
        let blue = (c1 & 0xff0000) >> 16;


        return c == red * 0x10000 + green * 0x100 + blue;

    }

    public _setColor(x: number, y: number, color: string | number, alpha?: number) {

        if (x < 0 || x > this.anzahlX || y < 0 || y > this.anzahlY) {
            throw new RuntimeExceptionClass(JRC.BitmapCoordinatesOutOfBoundsException(x, y, this.anzahlX, this.anzahlY));
        }

        let i = (x + y * (this.anzahlX));
        let c: number | undefined;

        if (typeof color == "string") {
            let ch = ColorHelper.parseColorToOpenGL(color);
            c = ch.color;
            if (alpha == null) alpha = ch.alpha;
        } else {
            c = color;
            if (alpha == null) alpha = 1.0;
        }

        if (c) {
            this.data[i] = Math.round(alpha * 255) * 0x1000000 + ((c & 0xff) << 16) + (c & 0xff00) + ((c & 0xff0000) >> 16);

            this.uploadData();
        }
    }

    public _fillAll(color: string | number, alpha?: number) {
        let c: number | undefined;

        if (typeof color == "string") {
            let ch = ColorHelper.parseColorToOpenGL(color);
            c = ch.color;
            alpha = ch.alpha;
        } else {
            c = color;
        }

        if (c && alpha) {
            this.data.fill(Math.round(alpha * 255) * 0x1000000 + ((c & 0xff) << 16) + (c & 0xff00) + ((c & 0xff0000) >> 16));

            this.uploadData();
        }
    }

    public _downloadAsPngFile(filename: string) {
        let pngFileBuffer = UPNG.encode([<ArrayBuffer>this.data.buffer], this.anzahlX, this.anzahlY, 0);
        let pngFile = new Uint8Array(pngFileBuffer);
        //@ts-ignore
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            //@ts-ignore
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            var e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
            a.download = filename;
            a.href = window.URL.createObjectURL(new Blob([pngFile], { type: 'application/octet-stream' }));
            a.dataset.downloadurl = ['image/png', a.download, a.href].join(':');
            //@ts-ignore
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            a.remove();
        }

    }

    public setzeFarbeRGBA(x: number, y: number, r: number, g: number, b: number, alpha: number) {
        let c = alpha * 0xff000000 + b * 0x10000 + g * 0x100 + r;
        let i = (x + y * (this.anzahlX));
        this.data[i] = c;
        this.uploadData();
    }

    public getFarbe(x: number, y: number): number {
        let c = this.data[x + y * this.anzahlX] & 0xffffff;
        return (c & 0xff) << 16 + (c & 0xff00) + (c & 0xff0000) >> 16;
    }

    public getAlpha(x: number, y: number): number {
        return (this.data[x + y * this.anzahlX] & 0xff000000) >> 24 / 255;
    }


    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if (callback) callback();

        return;
    }

    _debugOutput() {
        if (this.isDestroyed) return "<destroyed Bitmap>"
        let s = `{width: ${this.width * this.scaleFactor}, height: ${this.height * this.scaleFactor}, centerX: ${this._getCenterX()}, centerY: ${this._getCenterY()} }`;
        return s;
    }

    _worldCoordinatesToBitmapCoordinates(x: number, y: number) {
        let xb = Math.trunc((x - this.top) / this.width * this.anzahlX);
        let yb = Math.trunc((y - this.top) / this.width * this.anzahlY);

        return new PositionClass(xb, yb);
    }

    _getResolutionX() {
        return this.anzahlX;
    }

    _getResolutionY() {
        return this.anzahlY;
    }

}