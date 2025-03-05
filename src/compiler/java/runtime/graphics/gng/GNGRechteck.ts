import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { CircleClass } from "../CircleClass.ts";
import { RectangleClass } from "../RectangleClass.ts";
import { GNGBaseFigur } from "./GNGBaseFigur.ts";

export class GNGRechteck extends GNGBaseFigur {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Rechteck extends GNGBaseFigur", comment: "Rechteck-Klasse der Graphics'n Games-Bibliothek (Cornelsen-Verlag)"},
        {type: "method", signature: "Rechteck()", java: GNGRechteck.prototype._cj$_constructor_$Rechteck$, comment: "Instanziert ein neues, achsenparalleles Rechteck-Objekt."},

        {type: "field", signature: "protected int breite", comment: "Breite des Recthecks"},
        {type: "field", signature: "protected int höhe", comment: "Höhe des Rechtecks"},

        {type: "method", signature: "void GrößeSetzen(int breite, int höhe)", native: GNGRechteck.prototype._groesseSetzen, comment: "Setzt die Breite und Höhe des Rechtecks."}
    ];

    static type: NonPrimitiveType;

    get breite(): number {
        if(!this.filledShape?.container?.scale) return 0;
        return Math.round(Math.abs(this.width * this.filledShape.container.scale.x));
    }

    get höhe(): number {
        if(!this.filledShape?.container?.scale) return 0;
        return Math.round(Math.abs(this.height * this.filledShape.container.scale.y));
    }

    renderGNG(): void {
        let rectangle = this.filledShape as RectangleClass;
        let rotationCenterX = this.moveAnchor.x + this.width/2;
        let rotationCenterY = this.moveAnchor.y + this.height/2;

        rectangle.left = this.moveAnchor.x;
        rectangle.top = this.moveAnchor.y;
        rectangle.width = this.width;
        rectangle.height = this.height;

        rectangle.calculateHitPolygonInitial();

        rectangle.render();

        rectangle.container.localTransform.identity();
        rectangle.container.localTransform.translate(-rotationCenterX, -rotationCenterY);
        rectangle.container.localTransform.rotate(-this.filledShape.angle / 180 * Math.PI);
        rectangle.container.localTransform.translate(rotationCenterX, rotationCenterY);
        rectangle.container.setFromMatrix(rectangle.container.localTransform);
        rectangle.container.updateLocalTransform();
        rectangle.setWorldTransformAndHitPolygonDirty();
    }

    _cj$_constructor_$Rechteck$(t: Thread, callback: CallbackFunction){

        let rectangle = new RectangleClass();
        this.filledShape = rectangle;

        rectangle._cj$_constructor_$Rectangle$double$double$double$double(t, () => {
            t.s.pop();
            t.s.push(this);
            this.moveAnchor = {x: 10, y: 10};
            this.width = 100;
            this.height = 100;
            this.colorString = "rot";
            rectangle._setFillColorInt(0xff0000);
            this.setGNGBackgroundColor();
            if(callback) callback();
        }, 10, 10, 100, 100);

    }

    _groesseSetzen(breite: number, hoehe: number){
        this.width = breite;
        this.height = hoehe;
        this.renderGNG();
    }

}