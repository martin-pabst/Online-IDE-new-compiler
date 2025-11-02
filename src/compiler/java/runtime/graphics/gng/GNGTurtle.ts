import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { ShapeClass } from "../ShapeClass.ts";
import { LineElement, TurtleClass } from "../TurtleClass.ts";
import { GNGBaseFigur, GNGPoint } from "./GNGBaseFigur.ts";
import { GNGFarben } from "./GNGFarben.ts";
import { GNGFigur } from "./GNGFigur.ts";
import { IGNGEventListener } from "./IGNGEventListener.ts";

export class GNGTurtle extends ObjectClass implements IGNGEventListener {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class GTurtle extends Object", comment: "Turtle-Klasse der Graphics'n Games-Bibliothek (Cornelsen-Verlag)" },

        { type: "field", signature: "protected int x", template: `§1.x`, comment: "x-Position des Grafikobjekts" },
        { type: "field", signature: "protected int y", template: `§1.y`, comment: "y-Position des Grafikobjekts" },
        { type: "field", signature: "protected int winkel", template: `§1.winkel`, comment: "Blickrichtung des Grafikobjekts in Grad" },
        { type: "field", signature: "protected int größe", template: `§1.größe`, comment: "Größe des Grafikobjekts (100 entspricht 'normalgroß')" },
        { type: "field", signature: "protected boolean sichtbar", template: `§1.sichtbar`, comment: "true, wenn das Grafikobjekt sichtbar ist" },
        { type: "field", signature: "protected boolean stiftUnten", template: `§1.stiftUnten`, comment: "true, wenn die Turtle beim Gehen zeichnet" },

        { type: "method", signature: "GTurtle()", java: GNGTurtle.prototype._cj$_constructor_$GTurtle$, comment: "Instanziert ein neues Turtle-Objekt." },
        { type: "method", signature: "void GrößeSetzen(int größe)", native: GNGTurtle.prototype._groesseSetzen, comment: "Setzt die Größe des Turtle-Dreiecks." },
        { type: "method", signature: "void FarbeSetzen(string farbe)", native: GNGTurtle.prototype._farbeSetzen, comment: "Setzt die Zeichenfarbe des Turtle-Dreiecks." },
        { type: "method", signature: "void Drehen(int winkelInGrad)", native: GNGTurtle.prototype._drehen, comment: "Dreht die Turtle um den angegebenen Winkel. Positiver Winkel bedeutet Drehung gegen den Uhrzeigersinn." },
        { type: "method", signature: "void Gehen(double länge)", native: GNGTurtle.prototype._gehen, comment: "Bewirkt, dass die Turtle um die angegebene Länge nach vorne geht." },
        { type: "method", signature: "void StiftHeben()", native: GNGTurtle.prototype._stiftHeben, comment: "Bewirkt, dass die Turtle beim Gehen ab jetzt nicht mehr zeichnet." },
        { type: "method", signature: "void StiftSenken()", native: GNGTurtle.prototype._stiftSenken, comment: "Bewirkt, dass die Turtle beim Gehen ab jetzt wieder zeichnet." },
        { type: "method", signature: "void Löschen()", native: GNGTurtle.prototype._löschen, comment: "Löscht alles von der Turtle gezeichnete und versetzt die Turtle in den Ausgangszustand." },
        { type: "method", signature: "void PositionSetzen(int x, int y)", native: GNGTurtle.prototype._positionSetzen, comment: "Verschiebt die Turtle an die Position (x, y) ohne eine neue Linie zu zeichnen." },
        { type: "method", signature: "void ZumStartpunktGehen()", native: GNGTurtle.prototype._zumStartpunktGehen, comment: "Verschiebt die Turtle an die Position (100, 200) ohne eine neue Linie zu zeichnen." },
        { type: "method", signature: "void WinkelSetzen(int winkelInGrad)", native: GNGTurtle.prototype._winkelSetzen, comment: "Setzt den Blickwinkel der Turtle. 0° => nach rechts, 90°: => nach oben, usw.." },
        { type: "method", signature: "int WinkelGeben()", native: GNGTurtle.prototype._winkelgeben, comment: "Gibt den Blickwinkel der Turtle zurück." },
        { type: "method", signature: "int XPositionGeben()", native: GNGTurtle.prototype._xPositionGeben, comment: "Gibt x-Position der Turtle zurück." },
        { type: "method", signature: "int YPositionGeben()", native: GNGTurtle.prototype._yPositionGeben, comment: "Gibt y-Position der Turtle zurück." },
        { type: "method", signature: "void SichtbarkeitSetzen(boolean sichtbarkeit)", native: GNGTurtle.prototype._sichtbarkeitSetzen, comment: "Schaltet die Sichtbarkeit der Figur ein oder aus." },
        { type: "method", signature: "void Entfernen()", native: GNGTurtle.prototype._entfernen, comment: "Entfernt die Figur von der Zeichenfläche." },

        { type: "method", signature: "void GanzNachVornBringen()", native: GNGTurtle.prototype._ganzNachVornBringen, comment: "Setzt das Grafikobjekt vor alle anderen." },
        { type: "method", signature: "void GanzNachHintenBringen()", native: GNGTurtle.prototype._ganzNachHintenBringen, comment: "Setzt das Grafikobjekt hinter alle anderen." },
        { type: "method", signature: "void NachVornBringen()", native: GNGTurtle.prototype._nachVornBringen, comment: "Setzt das Grafikobjekt eine Ebene nach vorne." },
        { type: "method", signature: "void NachHintenBringen()", native: GNGTurtle.prototype._nachHintenBringen, comment: "Setzt das Grafikobjekt eine Ebene nach hinten." },

        { type: "method", signature: "boolean Berührt()", native: GNGTurtle.prototype._beruehrt, comment: "Gibt genau dann true zurück, wenn sich an der aktuellen Position der Turtle mindestens eine andere Figur befindet." },
        { type: "method", signature: "boolean Berührt(Object object)", native: GNGTurtle.prototype._touchesShape, comment: "Gibt genau dann true zurück, wenn sich an der aktuellen Position der Turtle mindestens eine andere Figur mit der angegebenen Farbe befindet." },
        { type: "method", signature: "boolean Berührt(string farbe)", native: GNGTurtle.prototype._touchesColor, comment: "Gibt genau dann true zurück, wenn die übergebene Figur die aktuelle Turtleposition enthält." },

        { type: "method", signature: "void AktionAusführen()", java: GNGTurtle.prototype._mj$AktionAusführen$void$, comment: "Diese Methode wird vom Taktgeber aufgerufen." },
        { type: "method", signature: "void TasteGedrückt(char taste)", java: GNGTurtle.prototype._mj$TasteGedrückt$void$char, comment: "Wird aufgerufen, wenn eine Taste gedrückt wird." },
        { type: "method", signature: "void SonderTasteGedrückt(int sondertaste)", java: GNGTurtle.prototype._mj$SonderTasteGedrückt$void$int, comment: "Wird aufgerufen, wenn eine SonderTaste gedrückt wird." },
        { type: "method", signature: "void MausGeklickt(int x, int y, int anzahl)", java: GNGTurtle.prototype._mj$MausGeklickt$void$int$int$int, comment: "Wird aufgerufen, wenn eine die linke Maustaste gedrückt wird." },
    ];


    turtle!: TurtleClass;

    // visible fields:
    moveAnchor: GNGPoint = { x: 0, y: 0 };
    colorString: string = "schwarz";

    get x() {
        return this.turtle.getPosition().x;
    }   

    get y() {
        return this.turtle.getPosition().y;
    }

    get winkel() {
        return Math.round(this.turtle.angle);
    }

    get größe() {
        return this.turtle.turtleSize;
    }

    get sichtbar() {
        return this.turtle.container.visible;
    }

    get stiftUnten() {
        return this.turtle.penIsDown;
    }

    set stiftUnten(value: boolean) {
        this.turtle.penIsDown = value;
    }

    set größe(value: number) {
        this._groesseSetzen(value);
    }

    set sichtbar(value: boolean) {
        this._sichtbarkeitSetzen(value);
    }

    set x(value: number) {
        this.turtle._moveTo(value, this.moveAnchor.y);
    }
    
    set y(value: number) {
        this.turtle._moveTo(this.moveAnchor.x, value);
    }

    set winkel(value: number) {
        this._winkelSetzen(value);
    }



    _cj$_constructor_$GTurtle$(t: Thread, callback: CallableFunction) {

        this.turtle = new TurtleClass();

        this.turtle._cj$_constructor_$Turtle$double$double(t, () => {
            t.s.pop();
            t.s.push(this);

            this.turtle.borderWidth = 1;
            this.turtle.showTurtle = true;
            this.turtle._setBorderColorInt(0x000000);
            this.turtle.render();

            this.moveAnchor = { x: 10, y: 10 };

            this.setGNGBackgroundColor();

            if (callback) callback();

            if (this._mj$AktionAusführen$void$ != GNGTurtle.prototype._mj$AktionAusführen$void$) {
                this.turtle.world.registerGNGEventListener(this, "aktionAusführen");
            }

            if (this._mj$TasteGedrückt$void$char != GNGTurtle.prototype._mj$TasteGedrückt$void$char) {
                this.turtle.world.registerGNGEventListener(this, "tasteGedrückt");
            }

            if (this._mj$SonderTasteGedrückt$void$int != GNGTurtle.prototype._mj$SonderTasteGedrückt$void$int) {
                this.turtle.world.registerGNGEventListener(this, "sondertasteGedrückt");
            }

            if (this._mj$MausGeklickt$void$int$int$int != GNGTurtle.prototype._mj$MausGeklickt$void$int$int$int) {
                this.turtle.world.registerGNGEventListener(this, "mausGeklickt");
            }
        }, 100, 200);

    }

    setGNGBackgroundColor() {
        if (this.turtle.world.shapesWhichBelongToNoGroup.length == 1) {
            this.turtle.world._setBackgroundColor("#e6e6e6");
        }
    }

    _groesseSetzen(groesse: number) {
        this.turtle.turtleSize = groesse;
        this.turtle.borderWidth = groesse / 100;
        this.turtle.moveTurtleTo(0, 0, 0);
        this.turtle.initTurtle(0, 0, this.turtle.angle);
        this.turtle.moveTurtleTo(this.turtle.lineElements[this.turtle.lineElements.length - 1].x, this.turtle.lineElements[this.turtle.lineElements.length - 1].y, this.turtle.angle)
        this.turtle._turn(0);
    }

    _farbeSetzen(farbe: string) {
        this.colorString = farbe;
        if (!farbe) farbe = "schwarz";
        let color: number = GNGFarben[farbe.toLocaleLowerCase()];
        this.turtle._setBorderColorInt(color);
    }

    _ganzNachVornBringen() {
        this.turtle.bringToFront();
    }

    _ganzNachHintenBringen() {
        this.turtle.sendToBack();
    }

    _nachVornBringen() {
        this.turtle.bringOnePlaneFurtherToFront();
    }

    _nachHintenBringen() {
        this.turtle.bringOnePlaneFurtherToBack();
    }

    _touchesShape(object: any) {
        let lastLineElement = this.turtle.lineElements[this.turtle.lineElements.length - 1];
        let x = lastLineElement.x;
        let y = lastLineElement.y;
        if (object instanceof ShapeClass || object instanceof GNGBaseFigur || object instanceof GNGFigur || object instanceof GNGTurtle) return object._containsPoint(x, y);

        return false;
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
        return this.turtle._containsPoint(x, y);
    }

    _entfernen(){
        this.turtle.world.unRegisterGNGEventListener(this, "aktionAusführen");
        this.turtle.world.unRegisterGNGEventListener(this, "tasteGedrückt");
        this.turtle.world.unRegisterGNGEventListener(this, "sondertasteGedrückt");
        this.turtle.world.unRegisterGNGEventListener(this, "mausGeklickt");
        this.turtle.destroy();
    }

    _touchesColor(color: string) {
        let colorInt: number = GNGFarben[color];
        return this.turtle.touchesColor(colorInt);
    }

    _drehen(winkelInGrad: number) { 
        this.turtle._turn(winkelInGrad);
    }

    _gehen(länge: number) {
        this.turtle._forward(länge);
    }
    
    _stiftHeben() {
        this.turtle.penIsDown = false;
    }
    _stiftSenken() {
        this.turtle.penIsDown = true;
    }
    _löschen() {
        this.turtle._clear(100, 200, 0);
    }

    _positionSetzen(x: number, y: number) {
        this.turtle._moveTo(x, y);
    }
    _winkelSetzen(winkelInGrad: number) {
        this.turtle._setAngle(winkelInGrad);
    }
    _sichtbarkeitSetzen(sichtbarkeit: boolean) {
        this.turtle._setVisible(sichtbarkeit);
    }

    _zumStartpunktGehen() {
        this.turtle._moveTo(100, 200);
    }
    _xPositionGeben() {
        return this.turtle.getPosition().x;
    }
    _yPositionGeben() {
        return this.turtle.getPosition().y;
    }
    _winkelgeben() {
        return -this.turtle.turtleAngleDeg;
    }
    _beruehrt() {
        return this.turtle.touchesAtLeastOneFigure();
    }

}