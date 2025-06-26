import { CallbackFunction, Klass } from "../../../common/interpreter/StepFunction";
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from "../../language/JavaRuntimeLibraryComments.ts";
import { ColorHelper } from "../../lexer/ColorHelper";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException.ts";

export class ColorClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Color extends Object" },

        { type: "field", signature: "int red" },
        { type: "field", signature: "int green" },
        { type: "field", signature: "int blue" },
        { type: "field", signature: "double alpha" },

        { type: "method", signature: "Color(int red, int green, int blue)", native: ColorClass.prototype._constructorColorClass, comment: JRC.ColorConstructorFromRGB },
        { type: "method", signature: "Color(int red, int green, int blue, double alpha)", native: ColorClass.prototype._constructorColorClass1, comment: JRC.ColorConstructorFromRGBA },
        { type: "method", signature: "static int randomColor()", native: ColorClass._randomColor, comment: JRC.ColorRandomColor0 },
        { type: "method", signature: "static int randomColor(int minimumBrightness)", native: ColorClass._randomColorMin, comment: JRC.ColorRandomColor1 },
        { type: "method", signature: "static int randomColor(int minimumBrightness, int maximumBrightness)", native: ColorClass._randomColorMinMax, comment: JRC.ColorRandomColor2 },
        { type: "method", signature: "final String toString()", native: ColorClass.prototype._toString, comment: JRC.ColorToString },
        { type: "method", signature: "final int toInt()", native: ColorClass.prototype._toInt, comment: JRC.ColorToInt },
        { type: "method", signature: "final boolean equals(Color otherColor)", java: ColorClass.prototype._mj$equals$boolean$Object },
        { type: "method", signature: "final int getRed()", template: `(§1.red)`, comment: JRC.ColorGetRed},
        { type: "method", signature: "final int getGreen()", template: `(§1.green)`, comment: JRC.ColorGetGreen },
        { type: "method", signature: "final int getBlue()", template: `(§1.blue)`, comment: JRC.ColorGetBlue },
        { type: "method", signature: "static int fromRGB(int red, int green, int blue)", native: ColorClass._fromRGB, comment: JRC.ColorFromRGB },
        { type: "method", signature: "static string fromRGBA(int red, int green, int blue, double alpha)", native: ColorClass._fromRGBA, comment: JRC.ColorFromRGBA },
        { type: "method", signature: "static string fromHSLA(double hue, double saturation, double luminance, double alpha)", native: ColorClass._fromHSLA, comment: JRC.ColorFromHSLA },
        { type: "method", signature: "static int fromHSL(double hue, double saturation, double luminance)", native: ColorClass._fromHSL, comment: JRC.ColorFromHSL },
    ]

    static type: NonPrimitiveType;

    red!: number;
    green!: number;
    blue!: number;

    alpha: number = 1.0;

    static _initPredefinedColors(){

        for (let colorName in ColorHelper.predefinedColors) {

            let intColor = ColorHelper.predefinedColors[colorName];

            let c = new ColorClass();

            c.red = (intColor & 0xff0000) >> 16;
            c.green = (intColor & 0xff00) >> 8;
            c.blue = (intColor & 0xff);

            ColorClass.__javaDeclarations.push(
                {type: "field", signature: "final static Color " + colorName }
            )

            let k: Klass = ColorClass;

            k[colorName] = c;
        }



    }

    _constructorColorClass(red: number, green: number, blue: number): ColorClass {
        this.red = red;
        this.green = green;
        this.blue = blue;
        if(red < 0 || red > 255) throw new RuntimeExceptionClass(JRC.RedValueOutOfBoundsException());
        if(green < 0 || green > 255) throw new RuntimeExceptionClass(JRC.GreenValueOutOfBoundsException());
        if(blue < 0 || blue > 255) throw new RuntimeExceptionClass(JRC.BlueValueOutOfBoundsException());
        return this;
    }
    
    _constructorColorClass1(red: number, green: number, blue: number, alpha: number): ColorClass {
        this.red = red;
        this.green = green;
        this.blue = blue;
        if(red < 0 || red > 255) throw new RuntimeExceptionClass(JRC.RedValueOutOfBoundsException());
        if(green < 0 || green > 255) throw new RuntimeExceptionClass(JRC.GreenValueOutOfBoundsException());
        if(blue < 0 || blue > 255) throw new RuntimeExceptionClass(JRC.BlueValueOutOfBoundsException());
        this.alpha = alpha;
        if(alpha < 0 || alpha > 1) throw new RuntimeExceptionClass(JRC.AlphaValueOutOfBoundsException());
        return this;
    }

    static _randomColor(): number {
        return Math.floor(Math.random() * 0xffffff);
    }

    static _randomColorMin(min: number): number {
        
        return this._randomColorMinMax(min, 255);

    }

    static _randomColorMinMax(min: number, max: number): number {
        if (min < 0) min = 0;
        if (max < 0) max = 0;

        let brigthness = (Math.random() * (max - min) + min) * Math.sqrt(3);

        let r: number = Math.random();
        let g: number = Math.random();
        let b: number = Math.random();

        let d = Math.sqrt(r * r + g * g + b * b);
        if(d < 1e-10) d = 1e-10;

        r = Math.floor(r/d * brigthness);
        g = Math.floor(g/d * brigthness);
        b = Math.floor(b/d * brigthness);

        if(r > 255) r = 255;
        if(g > 255) g = 255;
        if(b > 255) b = 255;

        return 0x10000 * r + 0x100 * g + b;

    }

    _toString(): StringClass {
        return new StringClass(ColorHelper.rgbColorToHexRGB(this.red, this.green, this.blue));
    }

    static _fromRGB(r: number, g: number, b: number): number {
        r = Math.min(r, 255); r = Math.max(0, r);
        g = Math.min(g, 255); g = Math.max(0, g);
        b = Math.min(b, 255); b = Math.max(0, b);

        return (r * 0x10000 + g * 0x100 + b);

    }

    static _fromRGBA(r: number, g: number, b: number, a: number): string {
        r = Math.min(r, 255); r = Math.max(0, r);
        g = Math.min(g, 255); g = Math.max(0, g);
        b = Math.min(b, 255); b = Math.max(0, b);

        a = Math.min(a, 1); a = Math.max(0, a);

        let color: string = (r * 0x1000000 + g * 0x10000 + b * 0x100 + Math.floor(a * 255)).toString(16);
        while (color.length < 8) color = "0" + color;

        return "#" + color;
    }

    static _fromHSLA(h: number, s: number, l: number, a: number): string {
        h = Math.min(h, 360); h = Math.max(0, h);
        s = Math.min(s, 100); s = Math.max(0, s);
        l = Math.min(l, 100); l = Math.max(0, l);
        a = Math.min(a, 1); a = Math.max(0, a);

        let rgb = ColorClass.hslToRgb(h, s, l);

        let color: string = (rgb.r * 0x1000000 + rgb.g * 0x10000 + rgb.b * 0x100 + Math.floor(a * 255)).toString(16);
        while (color.length < 8) color = "0" + color;

        return "#" + color;

    }

    static _fromHSL(h: number, s: number, l: number): number {
        h = Math.min(h, 360); h = Math.max(0, h);
        s = Math.min(s, 100); s = Math.max(0, s);
        l = Math.min(l, 100); l = Math.max(0, l);

        let rgb = ColorClass.hslToRgb(h, s, l);

        return (rgb.r * 0x10000 + rgb.g * 0x100 + rgb.b);
    }

    static hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {

        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);


        return { r: r, g: g, b: b }

    }

    fromIntAndAlpha(color: number | undefined, alpha: number){
        if(color){
            this.red = (color & 0xff0000)/0x10000;
            this.green = (color & 0xff00)/0x100;
            this.blue = color & 0xff;
        }
        this.alpha = alpha;
    }

    _toInt(): number {
        return this.red * 0x10000 + this.green * 0x100 + this.blue;
    }

    _mj$equals$boolean$Object(t: Thread, callback: CallbackFunction, otherObject: ObjectClassOrNull): void {
        if(otherObject instanceof ColorClass){
            if(otherObject == null){
                t.s.push(false);
                if(callback) callback();
                return;
            }
            t.s.push(this.red == otherObject.red && this.green == otherObject.green && this.blue == otherObject.blue);
            if(callback) callback();
        } else {
            super._mj$equals$boolean$Object(t, callback, otherObject);
        }
    }

}