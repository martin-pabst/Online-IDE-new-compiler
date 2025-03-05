import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { CircleClass } from "../CircleClass.ts";
import { GNGBaseFigur } from "./GNGBaseFigur.ts";

export class GNGKreis extends GNGBaseFigur {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Kreis extends GNGBaseFigur", comment: "Kreis-Klasse der Graphics'n Games-Bibliothek (Cornelsen-Verlag)"},
        {type: "method", signature: "Kreis()", java: GNGKreis.prototype._cj$_constructor_$Kreis$, comment: "Instanziert ein neues Kreis-Objekt."},
        {type: "method", signature: "void RadiusSetzen(int radius)", native: GNGKreis.prototype._radiusSetzen, comment: "Setzt den Radius des Kreis-Objekts."},
    ];

    static type: NonPrimitiveType;

    renderGNG(): void {
        let circle = this.filledShape as CircleClass;
        circle.mx = this.moveAnchor.x;
        circle.my = this.moveAnchor.y;
        circle.radius = this.width/2;
        circle.render();
    }

    _cj$_constructor_$Kreis$(t: Thread, callback: CallbackFunction){

        let circle = new CircleClass();
        this.filledShape = circle;

        circle._cj$_constructor_$Circle$double$double$double(t, () => {
            t.s.pop();
            t.s.push(this);
            this.moveAnchor = {x: 60, y: 10};
            this.width = 100;
            this.height = 100;
            this.colorString = "rot";
            circle.centerXInitial = 60;
            circle.centerYInitial = 60;
            circle._setFillColorInt(0xff0000);
            this.setGNGBackgroundColor();
            if(callback) callback();
        }, 60, 60, 50);

    }

    _radiusSetzen(radius: number){
        this.width = 2*radius;
        this.height = 2*radius;
        this.renderGNG();
    }

}