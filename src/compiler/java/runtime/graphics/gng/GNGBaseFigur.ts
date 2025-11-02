import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { FilledShapeClass } from "../FilledShapeClass.ts";
import { GNGFarben } from "./GNGFarben.ts";

export type GNGPoint = {
    x: number,
    y: number
}

export class GNGBaseFigur extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "abstract class GNGBaseFigur extends Object"},

        {type: "field", signature: "protected string farbe", comment: "Farbe des Grafikobjekts", template: `§1.colorString`, getValueForDebugger: (o) => o.colorString},
        {type: "field", signature: "protected int x", template: `§1.moveAnchor.x`, getValueForDebugger: (o) => o.moveAnchor.x, comment: "x-Position des Grafikobjekts"},
        {type: "field", signature: "protected int y", template: `§1.moveAnchor.y`, getValueForDebugger: (o) => o.moveAnchor.y, comment: "y-Position des Grafikobjekts"},
        {type: "field", signature: "protected int winkel", template: `Math.round(§1.filledShape.angle)`, getValueForDebugger: (o) => Math.round(o.filledShape.angle), comment: "Blickrichtung des Grafikobjekts in Grad"},
        {type: "field", signature: "protected int größe", template: `§1.width`, getValueForDebugger: (o) => o.width, comment: "Größe des Grafikobjekts (100 entspricht 'normalgroß')"},
        {type: "field", signature: "protected boolean sichtbar", template: `§1.filledShape.container.visible`, getValueForDebugger: (o) => o.filledShape.container.visible, comment: "true, wenn das Grafikobjekt sichtbar ist"},

        {type: "method", signature: "void PositionSetzen(int x, int y)", native: GNGBaseFigur.prototype._positionSetzen, comment: "Verschiebt die Figur zur Position (x,y). Beim Rechteck führt dies beispielsweise dazu, dass die linke obere Ecke bei (x, y) zu liegen kommt."},
        {type: "method", signature: "void Verschieben(int deltaX, int deltaY)", native: GNGBaseFigur.prototype._verschieben, comment: "Verschiebt die Figur um (x, y)"},
        {type: "method", signature: "void Drehen(int grad)", native: GNGBaseFigur.prototype._drehen, comment: "Dreht die Figur um den angegebenen Winkel. Der Drehpunkt ist abhängig von der Art der Figur."},
        {type: "method", signature: "void FarbeSetzen(string farbe)", native: GNGBaseFigur.prototype._farbeSetzen, comment: "Setzt die Farbe der Figur."},
        {type: "method", signature: "void WinkelSetzen(int winkel)", native: GNGBaseFigur.prototype._winkelSetzen, comment: "Setzt den Drehwinkel der Figur. Der Winkel wird in Grad angegebenen, positive Werte bedeuten eine Drehung gegen den Uhrzeigersinn."},
        {type: "method", signature: "void SichtbarkeitSetzen(boolean sichtbarkeit)", native: GNGBaseFigur.prototype._sichtbarkeitSetzen, comment: "Schaltet die Sichtbarkeit der Figur ein oder aus."},
        {type: "method", signature: "void Entfernen()", native: GNGBaseFigur.prototype._destroy, comment: "Zerstört das Objekt."},
        {type: "method", signature: "void GanzNachVornBringen()", native: GNGBaseFigur.prototype._ganzNachVornBringen, comment: "Setzt das Grafikobjekt vor alle anderen."},
        {type: "method", signature: "void GanzNachHintenBringen()", native: GNGBaseFigur.prototype._ganzNachHintenBringen, comment: "Setzt das Grafikobjekt hinter alle anderen."},
        {type: "method", signature: "void NachVornBringen()", native: GNGBaseFigur.prototype._nachVornBringen, comment: "Setzt das Grafikobjekt eine Ebene nach vorne."},
        {type: "method", signature: "void NachHintenBringen()", native: GNGBaseFigur.prototype._nachHintenBringen, comment: "Setzt das Grafikobjekt eine Ebene nach hinten."},

    ];

    static type: NonPrimitiveType;

    filledShape!: FilledShapeClass;

    // visible fields:
    moveAnchor: GNGPoint = {x: 0, y: 0};
    width: number = 100;
    height: number = 100;
    colorString: string = "schwarz";

    renderGNG(): void {}

    setGNGBackgroundColor(){
        if(this.filledShape.world.shapesWhichBelongToNoGroup.length == 1){
            this.filledShape.world._setBackgroundColor("#e6e6e6");
        }
    }

    _positionSetzen(x: number, y: number){
        this.moveAnchor.x = x;
        this.moveAnchor.y = y;
        this.renderGNG();
    }

    _verschieben(x: number, y: number){
        this.moveAnchor.x += x;
        this.moveAnchor.y += y;
        this.renderGNG();
    }

    _drehen(grad: number){
        this.filledShape.angle += grad;
        this.filledShape.directionRad += grad/180*Math.PI;
        this.renderGNG();
    }

    _farbeSetzen(farbe: string){
        this.colorString = farbe;
        if(!farbe) farbe = "schwarz";
        let color: number = GNGFarben[farbe.toLocaleLowerCase()];

        this.filledShape._setFillColorInt(color);
        this.filledShape.render();
    }

    _winkelSetzen(winkel: number){
        this.filledShape.angle = winkel;
        this.filledShape.directionRad = winkel/180*Math.PI;
        this.renderGNG();
    }

    _sichtbarkeitSetzen(sichtbarkeit: boolean){
        this.filledShape._setVisible(sichtbarkeit);
    }

    _destroy(){
        this.filledShape.destroy();
    }

    _ganzNachVornBringen(){
        this.filledShape.bringToFront();
    }

    _ganzNachHintenBringen(){
        this.filledShape.sendToBack();
    }

    _nachVornBringen(){
        this.filledShape.bringOnePlaneFurtherToFront();
    }

    _nachHintenBringen(){
        this.filledShape.bringOnePlaneFurtherToBack();
    }

    _containsPoint(x: number, y: number){
        return this.filledShape._containsPoint(x, y);
    }
}