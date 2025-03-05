import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { CircleClass } from "../CircleClass.ts";
import { EllipseClass } from "../EllipseClass.ts";
import { FilledShapeClass } from "../FilledShapeClass.ts";
import { GroupClass } from "../GroupClass.ts";
import { PolygonClass } from "../PolygonClass.ts";
import { RectangleClass } from "../RectangleClass.ts";
import { GNGBaseFigur } from "./GNGBaseFigur.ts";
import { GNGFarben } from "./GNGFarben.ts";
import { IGNGEventListener } from "./IGNGEventListener.ts";

type GNGPoint = {
    x: number,
    y: number
}

export class GNGFigur extends ObjectClass implements IGNGEventListener {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Figur extends Object", comment: "Figur-Klasse der Graphics'n Games-Bibliothek (Cornelsen-Verlag)" },
        { type: "method", signature: "Figur()", java: GNGFigur.prototype._cj$_constructor_$Figur$, comment: "Instanziert ein neues, achsenparalleles Figur-Objekt." },

        { type: "field", signature: "int x", template: '§1.center.x', comment: "x-Position der Figur" },
        { type: "field", signature: "int y", template: '§1.center.y', comment: "y-Position der Figur" },
        { type: "field", signature: "int angle", template: 'Math.round(§1.group.angle)', comment: "Blickrichtung der Figur in Grad" },
        { type: "field", signature: "int größe", template: 'Math.round(§1.group.scaleFactor * 100)', comment: "Größe der Figur (100 entspricht 'normalgroß')" },
        { type: "field", signature: "boolean sichtbar", template: '§1.group.container.visible', comment: "true, wenn die Figur sichtbar ist" },

        { type: "method", signature: "void GrößeSetzen(int größe)", native: GNGFigur.prototype._groesseSetzen, comment: "Setzt die Größe der Figur." },
        { type: "method", signature: "void Drehen(int grad)", native: GNGFigur.prototype._drehen, comment: "Dreht die Figur um den angegebenen Winkel. Positiver Winkel bedeutet Drehung gegen den Uhrzeigersinn." },
        { type: "method", signature: "void Gehen(double länge)", native: GNGFigur.prototype._gehen, comment: "Bewirkt, dass die Figur um die angegebene Länge 'nach vorne' geht." },
        { type: "method", signature: "void PositionSetzen(int x, int y)", native: GNGFigur.prototype._positionSetzen, comment: "Verschiebt die Figur an die Position (x, y)." },
        { type: "method", signature: "void ZumStartpunktGehen()", native: GNGFigur.prototype._zumStartpunktGehen, comment: "Verschiebt die Figur an die Position (100, 200)." },
        { type: "method", signature: "void WinkelSetzen(int winkel)", native: GNGFigur.prototype._winkelSetzen, comment: "Dreht die Figur so, dass der Blickwinkel der Figur in die angegebene Richtung zeigt. 0° => nach rechts (initial), 90°: => nach oben, usw." },
        { type: "method", signature: "int WinkelGeben()", native: GNGFigur.prototype._winkelGeben, comment: "Gibt den Blickwinkel der Figur zurück." },
        { type: "method", signature: "int XPositionGeben()", template: '§1.center.x', comment: "Gibt x-Position der Figur zurück." },
        { type: "method", signature: "int YPositionGeben()", template: '§1.center.y', comment: "Gibt y-Position der Figur zurück." },
        { type: "method", signature: "void SichtbarkeitSetzen()", native: GNGFigur.prototype._sichtbarkeitSetzen, comment: "Schaltet die Sichtbarkeit der Figur ein oder aus." },
        { type: "method", signature: "void Entfernen()", native: GNGFigur.prototype._entfernen, comment: "Entfernt die Figur aus dem Zeichenfenster." },
        { type: "method", signature: "void GanzNachVornBringen()", native: GNGFigur.prototype._ganzNachVornBringen, comment: "Setzt das Grafikobjekt vor alle anderen." },
        { type: "method", signature: "void GanzNachHintenBringen()", native: GNGFigur.prototype._ganzNachHintenBringen, comment: "Setzt das Grafikobjekt hinter alle anderen." },
        { type: "method", signature: "void NachVornBringen()", native: GNGFigur.prototype._nachVornBringen, comment: "Setzt das Grafikobjekt eine Ebene nach vorne." },
        { type: "method", signature: "void NachHintenBringen()", native: GNGFigur.prototype._nachHintenBringen, comment: "Setzt das Grafikobjekt eine Ebene nach hinten." },
        { type: "method", signature: "void EigeneFigurLöschen()", java: GNGFigur.prototype._mj$eigeneFigurLoeschen$void$, comment: "Löscht die hinzugefügten Figuren" },
        { type: "method", signature: "boolean Berührt()", native: GNGFigur.prototype._beruehrt, comment: "Gibt genau dann true zurück, wenn die Figur mit irgendeinem anderen graphischen Objekt kollidiert." },
        { type: "method", signature: "boolean Berührt(string farbe)", native: GNGFigur.prototype._beruehrtFarbe, comment: "Gibt genau dann true zurück, wenn die Figur mit einem graphischen Objekt der angegebenen Farbe kollidiert." },
        { type: "method", signature: "boolean Berührt(Object objekt)", native: GNGFigur.prototype._beruehrtObjekt, comment: "Gibt genau dann true zurück, wenn die Figur mit dem übergebenen graphischen Objekt kollidiert." },
        { type: "method", signature: "void FigurteilFestlegenDreieck(int x1, int y1, int x2, int y2, int x3, int y3, string farbe)", java: GNGFigur.prototype._j_figurteilFestlegenDreieck, comment: "Erzeugt ein neues, dreieckiges Element und fügt es der Figur hinzu." },
        { type: "method", signature: "void FigurteilFestlegenRechteck(int x, int y, int breite, int höhe, string farbe)", java: GNGFigur.prototype._j_figurteilFestlegenRechteck, comment: "Erzeugt ein neues, rechteckiges Element einer eigenen Darstellung der Figur." },
        { type: "method", signature: "void FigurteilFestlegenEllipse(int x, int y, int breite, int höhe, string farbe)", java: GNGFigur.prototype._j_figurteilFestlegenEllipse, comment: "Erzeugt ein neues, elliptisches Element einer eigenen Darstellung der Figur." },

        { type: "method", signature: "void AktionAusführen()", java: GNGFigur.prototype._mj$AktionAusführen$void$, comment: "Diese Methode wird vom Taktgeber aufgerufen." },
        { type: "method", signature: "void TasteGedrückt(char taste)", java: GNGFigur.prototype._mj$TasteGedrückt$void$char, comment: "Wird aufgerufen, wenn eine Taste gedrückt wird." },
        { type: "method", signature: "void SonderTasteGedrückt(int sondertaste)", java: GNGFigur.prototype._mj$SonderTasteGedrückt$void$int, comment: "Wird aufgerufen, wenn eine SonderTaste gedrückt wird." },
        { type: "method", signature: "void MausGeklickt(int x, int y, int anzahl)", java: GNGFigur.prototype._mj$MausGeklickt$void$int$int$int, comment: "Wird aufgerufen, wenn eine die linke Maustaste gedrückt wird." },


    ];

    static type: NonPrimitiveType;

    group!: GroupClass;
    center: GNGPoint = {
        x: 100,
        y: 200
    }

    isInitialTriangle: boolean = false;


    _cj$_constructor_$Figur$(t: Thread, callback: CallbackFunction) {

        this.group = new GroupClass();

        this.group._cj$_constructor_$Group$(t, () => {
            t.s.pop();
            t.s.push(this);
            this.setGNGBackgroundColor();
            this.drawInitialTriangle(t, () => {

                // registerEvents();
                if (callback) callback();
            }, this.center)

            if (this._mj$AktionAusführen$void$ != GNGFigur.prototype._mj$AktionAusführen$void$) {
                this.group.world.registerGNGEventListener(this, "aktionAusführen");
            }

            if (this._mj$TasteGedrückt$void$char != GNGFigur.prototype._mj$TasteGedrückt$void$char) {
                this.group.world.registerGNGEventListener(this, "tasteGedrückt");
            }

            if (this._mj$SonderTasteGedrückt$void$int != GNGFigur.prototype._mj$SonderTasteGedrückt$void$int) {
                this.group.world.registerGNGEventListener(this, "sondertasteGedrückt");
            }

            if (this._mj$MausGeklickt$void$int$int$int != GNGFigur.prototype._mj$MausGeklickt$void$int$int$int) {
                this.group.world.registerGNGEventListener(this, "mausGeklickt");
            }

        });

    }

    setGNGBackgroundColor() {
        if (this.group.world.shapesWhichBelongToNoGroup.length == 1) {
            this.group.world._setBackgroundColor("#e6e6e6");
        }
    }

    drawInitialTriangle(t: Thread, callback: CallbackFunction, center: GNGPoint) {
        this.group._scale(1 / this.group.scaleFactor);
        let polygon: PolygonClass = new PolygonClass();
        polygon._cj$_constructor_$Polygon$boolean$double_I(t, () => {
            t.s.pop();
            polygon._move(center.x, center.y);
            polygon._setFillColorString("yellow");
            polygon._setBorderColorString("black");
            polygon._setBorderWidth(2);
            this.group.add(polygon);

            let circle = new CircleClass();
            circle._cj$_constructor_$Circle$double$double$double(t, () => {
                t.s.pop();
                circle._move(center.x, center.y);
                circle._setFillColorString("blue");
                circle._setBorderColorString("black");
                circle._setBorderWidth(2);
                this.group.add(circle);
                this.isInitialTriangle = true;
                this.group._scale(0.4, center.x, center.y);
                if (callback) callback();
            }, 0, 0, 10)
        }, true, [-50, -50, 50, 0, -50, 50]);

    }

    _groesseSetzen(groesse: number) {
        let newFactor = groesse / 100;
        this.group._scale(newFactor / this.group.scaleFactor, this.center.x, this.center.y);
    }

    _drehen(grad: number) {
        this.group._rotate(grad, this.center.x, this.center.y);
    }

    _gehen(laenge: number) {
        let angleRad = this.group.angle / 180 * Math.PI;
        let dx = laenge * Math.cos(angleRad);
        let dy = laenge * Math.sin(-angleRad);
        this.center.x += dx;
        this.center.y += dy;

        this.group._move(dx, dy);

    }

    _positionSetzen(x: number, y: number) {
        this.group._move(x - this.center.x, y - this.center.y);
        this.center.x = x;
        this.center.y = y;
    }

    _zumStartpunktGehen() {
        this._positionSetzen(100, 200);
    }

    _winkelSetzen(winkel: number) {
        this._drehen(winkel - this.group.angle);
    }

    _winkelGeben(): number {

        if (this.group.angle < 0) this.group.angle += 360 * Math.ceil(this.group.angle / (-360));
        if (this.group.angle >= 360) this.group.angle -= 360 * Math.floor(this.group.angle / 360);
        return Math.round(this.group.angle);

    }

    _sichtbarkeitSetzen(sichtbarkeit: boolean) {
        this.group._setVisible(sichtbarkeit);
    }

    _entfernen() {
        this.group.world.unRegisterGNGEventListener(this, "aktionAusführen");
        this.group.world.unRegisterGNGEventListener(this, "tasteGedrückt");
        this.group.world.unRegisterGNGEventListener(this, "sondertasteGedrückt");
        this.group.world.unRegisterGNGEventListener(this, "mausGeklickt");
        this.group.destroy();
    }

    _ganzNachVornBringen() {
        this.group.bringToFront();
    }

    _ganzNachHintenBringen() {
        this.group.sendToBack();
    }

    _nachVornBringen() {
        this.group.bringOnePlaneFurtherToFront();
    }

    _nachHintenBringen() {
        this.group.bringOnePlaneFurtherToBack();
    }

    _mj$eigeneFigurLoeschen$void$(t: Thread, callback: CallbackFunction) {
        this.group.destroyAllChildren();
        // this.drawInitialTriangle(t, callback, this.center);
    }

    _beruehrt(): boolean {
        for (let shape of this.group.world.shapesWhichBelongToNoGroup) {
            if (shape != this.group && shape._collidesWith(this.group)) {
                return true;
            }
        }
        return false;
    }

    _beruehrtFarbe(farbeAsString: string): boolean {
        let farbe = GNGFarben[farbeAsString];
        if (farbe == null) farbe = 0;

        for (let shape of this.group.world.shapesWhichBelongToNoGroup) {
            if (shape != this.group) {
                if (shape instanceof GroupClass) {   // andere zusammengesetzte Figur!
                    for (let part of shape.shapes) {
                        if (part instanceof FilledShapeClass && farbe == part.fillColor) {
                            if (this.group._collidesWith(part)) {
                                return true;
                            }
                        }
                    }
                } else {

                    if (shape instanceof FilledShapeClass && farbe == shape.fillColor) {
                        if (this.group._collidesWith(shape)) return true;
                    }
                }

            }
        }

        return false;
    }

    _beruehrtObjekt(objekt: ObjectClass): boolean {
        if (objekt instanceof GNGFigur) {
            return this.group._collidesWith(objekt.group);
        }

        if (objekt instanceof GNGBaseFigur) {
            return this.group._collidesWith(objekt.filledShape);
        }

        return false;
    }

    _j_figurteilFestlegenDreieck(t: Thread, callback: CallbackFunction, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, farbeString: string) {
        let farbe = GNGFarben[farbeString];
        if (farbe == null) farbe = 0;

        if (this.isInitialTriangle) this.group.destroyAllChildren();
        this.isInitialTriangle = false;

        let triangle = new PolygonClass();
        triangle._cj$_constructor_$Polygon$boolean$double_I(t, () => {
            triangle._rotate(this.group.angle, 0, 0);
            triangle._scale(this.group.scaleFactor, 0, 0);
            triangle._move(this.center.x, this.center.y);
            triangle._setFillColorInt(farbe);
            triangle._setBorderColorString("black");
            triangle._setBorderWidth(2);
            this.group.add(triangle);
            if (callback) callback();
        }, true, [x1, y1, x2, y2, x3, y3], true);

    }

    _j_figurteilFestlegenRechteck(t: Thread, callback: CallbackFunction, x: number, y: number, breite: number, hoehe: number, farbeString: string) {
        let farbe = GNGFarben[farbeString];
        if (farbe == null) farbe = 0;

        if (this.isInitialTriangle) this.group.destroyAllChildren();
        this.isInitialTriangle = false;

        let rectangle = new RectangleClass();
        rectangle._cj$_constructor_$Rectangle$double$double$double$double(t, () => {
            rectangle._rotate(this.group.angle, 0, 0);
            rectangle._scale(this.group.scaleFactor, 0, 0);
            rectangle._move(this.center.x, this.center.y);
            rectangle._setFillColorInt(farbe);
            rectangle._setBorderColorString("black");
            rectangle._setBorderWidth(2);
            this.group.add(rectangle);
            if (callback) callback();
        }, x + 0.05, y + 0.05, breite - 0.1, hoehe - 0.1);

    }


    _j_figurteilFestlegenEllipse(t: Thread, callback: CallbackFunction, x: number, y: number, breite: number, hoehe: number, farbeString: string) {
        let farbe = GNGFarben[farbeString];
        if (farbe == null) farbe = 0;

        if (this.isInitialTriangle) this.group.destroyAllChildren();
        this.isInitialTriangle = false;

        hoehe = hoehe - 0.1;      // hack to ensure collision-handling identical to gng (also 0.05 two lines below)
        breite = breite - 0.1;

        let ellipse = new EllipseClass();
        ellipse._cj$_constructor_$Ellipse$double$double$double$double(t, () => {
            ellipse._rotate(this.group.angle, 0, 0);
            ellipse._scale(this.group.scaleFactor, 0, 0);
            ellipse._move(this.center.x, this.center.y);
            ellipse._setFillColorInt(farbe);
            ellipse._setBorderColorString("black");
            ellipse._setBorderWidth(2);
            this.group.add(ellipse);
            if (callback) callback();
        }, x + breite / 2 + 0.05, y + hoehe / 2 + 0.05, breite / 2, hoehe / 2);
    }

    // Eventlistener-dummies:
    _mj$AktionAusführen$void$(t: Thread, callback: () => void | undefined): void {
        throw new Error("Method not implemented.");
    }
    _mj$TasteGedrückt$void$char(t: Thread, callback: () => void | undefined, key: string): void {
        throw new Error("Method not implemented.");
    }
    _mj$SonderTasteGedrückt$void$int(t: Thread, callback: () => void | undefined, key: number): void {
        throw new Error("Method not implemented.");
    }
    _mj$MausGeklickt$void$int$int$int(t: Thread, callback: () => void | undefined, x: number, y: number, anzahl: number): void {
        throw new Error("Method not implemented.");
    }

    _mj$TaktImpulsAusführen$void$(t: Thread, callback: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }

    _mj$Ausführen$void$(t: Thread, callback: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }
    _mj$Taste$void$char(t: Thread, callback: (() => void) | undefined, key: string): void {
        throw new Error("Method not implemented.");
    }
    _mj$SonderTaste$void$int(t: Thread, callback: (() => void) | undefined, key: number): void {
        throw new Error("Method not implemented.");
    }
    _mj$Geklickt$void$int$int$int(t: Thread, callback: (() => void) | undefined, x: number, y: number, anzahl: number): void {
        throw new Error("Method not implemented.");
    }

    _containsPoint(x: number, y: number) {
        return this.group._containsPoint(x, y);
    }
}