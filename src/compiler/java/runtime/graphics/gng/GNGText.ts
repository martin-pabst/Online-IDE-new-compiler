import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { CircleClass } from "../CircleClass.ts";
import { TextClass } from "../TextClass.ts";
import { GNGBaseFigur } from "./GNGBaseFigur.ts";

export class GNGText extends GNGBaseFigur {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class GText extends GNGBaseFigur", comment: "Text-Klasse der Graphics'n Games-Bibliothek (Cornelsen-Verlag)"},
        {type: "method", signature: "GText()", java: GNGText.prototype._cj$_constructor_$GText$, comment: "Instanziert ein neues Text-Objekt."},

        {type: "field", signature: "protected string text", comment: "Angezeigter Text"},
        {type: "field", signature: "protected int textgröße", nativeIdentifier: 'textgroesse', comment: "Textgröße"},

        {type: "method", signature: "void TextSetzen(string text)", native: GNGText.prototype._textSetzen, comment: "Ändert den Text des Text-Objekts."},
        {type: "method", signature: "void TextGrößeSetzen(int textGröße)", native: GNGText.prototype._textGroesseSetzen, comment: "Setzt die Schriftgröße des Text-Objekts."},
        {type: "method", signature: "void TextVergrößern()", native: GNGText.prototype._textVergroessern, comment: "Vergrößert die Schriftgröße des Text-Objekts."},
        {type: "method", signature: "void TextVerkleinern()", native: GNGText.prototype._textVerkleinern, comment: "Verkleinert die Schriftgröße des Text-Objekts."},
        {type: "method", signature: "string getText()", template: '§1.text', comment: "Gibt den Textinhalt zurück."},

    ];

    static type: NonPrimitiveType;

    get text(): string {
        return (<TextClass>this.filledShape).text;
    }

    get textgroesse(): number {
        return (<TextClass>this.filledShape).fontsize;
    }

    renderGNG(): void {
        let textShape = <TextClass>this.filledShape;
        textShape.x = this.moveAnchor.x;
        textShape.y = this.moveAnchor.y - textShape.fontsize;

        this.filledShape.render();

        // after this.render() is executed this.centerXInitial is textHeight/2 and this.centerYInitial is textWidth/2

        let rotationCenterX = textShape.x + textShape.centerXInitial;
        let rotationCenterY = textShape.y + textShape.centerYInitial;

        let container = textShape.container;

        container.localTransform.identity();
        // top-left edge of text now is at (0/0)
        container.localTransform.translate(-textShape.centerXInitial, -textShape.centerYInitial);
        container.localTransform.rotate(-textShape.angle / 180 * Math.PI);
        container.localTransform.translate(rotationCenterX, rotationCenterY);

        container.setFromMatrix(container.localTransform);
        container.updateLocalTransform();

        textShape.setWorldTransformAndHitPolygonDirty();

    }

    _cj$_constructor_$GText$(t: Thread, callback: CallbackFunction){

        let text = new TextClass();
        this.filledShape = text;

        text._cj$_constructor_$Text$double$double$double$string(t, () => {
            t.s.pop();
            t.s.push(this);
            this.moveAnchor = {x: 10, y: 10};
            this.width = 100;
            this.height = 100;
            this.colorString = "schwarz";
            text.centerXInitial = 60;
            text.centerYInitial = 60;
            text._setFillColorInt(0x000000);
            this.setGNGBackgroundColor();
            if(callback) callback();
        }, 10, -3, 12, "Text");

    }

    _textSetzen(text: string){
        (<TextClass>this.filledShape).text = text;
        this.renderGNG();
    }

    _textGroesseSetzen(fontSize: number){
        (<TextClass>this.filledShape).fontsize = fontSize;
        this.renderGNG();
    }

    _textVergroessern(){
        let size = (<TextClass>this.filledShape).fontsize;
        if (size <= 10) {
            size += 1;
        }
        else if (size <= 40) {
            size += 2;
        }
        else {
            size += 4;
        }

        this._textGroesseSetzen(size);

    }

    _textVerkleinern(){
        let size = (<TextClass>this.filledShape).fontsize;
        if (size <= 10) {
            size -= 1;
        }
        else if (size <= 40) {
            size -= 2;
        }
        else {
            size -= 4;
        }
        if (size < 1) {
            size = 1;
        }

        this._textGroesseSetzen(size);

    }

}