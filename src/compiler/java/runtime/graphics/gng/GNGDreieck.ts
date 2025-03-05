import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { CircleClass } from "../CircleClass.ts";
import { PolygonClass } from "../PolygonClass.ts";
import { GNGBaseFigur } from "./GNGBaseFigur.ts";

export class GNGDreieck extends GNGBaseFigur {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Dreieck extends GNGBaseFigur", comment: "Dreieck-Klasse der Graphics'n Games-Bibliothek (Cornelsen-Verlag)"},
        {type: "method", signature: "Dreieck()", java: GNGDreieck.prototype._cj$_constructor_$Dreieck$, comment: "Instanziert ein neues Dreieck-Objekt."},

        {type: "field", signature: "protected int breite", comment: "Breite des Dreiecks"},
        {type: "field", signature: "protected int höhe", comment: "Höhe des Dreiecks"},

        {type: "method", signature: "void GrößeSetzen(int breite, int höhe)", native: GNGDreieck.prototype._groesseSetzen, comment: "Setzt die Breite und Höhe des Rechtecks."}

    ];



    static type: NonPrimitiveType;

    get breite(): number {
        return Math.round(Math.abs(this.width * this.filledShape.container.scale.x));
    }

    get höhe(): number {
        return Math.round(Math.abs(this.height * this.filledShape.container.scale.y));
    }


    renderGNG(): void {
        let max = this.moveAnchor.x;
        let may = this.moveAnchor.y;

        let rotationCenterX = max;
        let rotationCenterY = may + this.height/2;

        this.filledShape.hitPolygonInitial = [{x: max, y: may}, {x: max + this.width/2, y: may + this.height}, {x: max - this.width/2, y: may + this.height}];

        this.filledShape.render();
        let container = this.filledShape.container;

        container.localTransform.identity();
        container.localTransform.translate(-rotationCenterX, -rotationCenterY);
        container.localTransform.rotate(-this.filledShape.angle / 180 * Math.PI);
        container.localTransform.translate(rotationCenterX, rotationCenterY);
        container.setFromMatrix(container.localTransform);
        container.updateLocalTransform();

        this.filledShape.setWorldTransformAndHitPolygonDirty();
    }

    _cj$_constructor_$Dreieck$(t: Thread, callback: CallbackFunction){

        let triangle = new PolygonClass();
        this.filledShape = triangle;

        triangle._cj$_constructor_$Polygon$boolean$double_I(t, () => {
            t.s.pop();
            t.s.push(this);
            this.moveAnchor = {x: 60, y: 10};
            this.width = 100;
            this.height = 100;
            this.colorString = "rot";
            triangle.centerXInitial = 60;
            triangle.centerYInitial = 60;
            triangle._setFillColorInt(0xff0000);
            this.setGNGBackgroundColor();
            if(callback) callback();
        }, true, [60, 10, 110,110, 10, 110]);

    }

    _groesseSetzen(breite: number, hoehe: number){
        this.width = breite;
        this.height = hoehe;
        this.renderGNG();
    }


}