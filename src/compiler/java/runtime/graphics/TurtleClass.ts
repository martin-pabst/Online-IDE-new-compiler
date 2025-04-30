import * as PIXI from 'pixi.js';
import { Punkt, abstandPunktZuStrecke, polygonBerührtPolygon, polygonEnthältPunkt, steckenzugSchneidetStreckenzug, streckenzugEnthältPunkt } from '../../../../tools/MatheTools.ts';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { CallbackFunction } from '../../../common/interpreter/StepFunction';
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { StringClass } from '../system/javalang/ObjectClassStringClass';
import { FilledShapeClass } from './FilledShapeClass';
import { ShapeClass } from './ShapeClass';
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';
import { ColorClass } from './ColorClass.ts';
import { ColorConverter } from './ColorConverter.ts';

export type LineElement = {
    x: number,
    y: number,
    color: number | null,
    alpha: number,
    lineWidth: number
}

export class TurtleClass extends FilledShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Turtle extends FilledShape", comment: JRC.TurtleClassComment },

        { type: "method", signature: "Turtle()", java: TurtleClass.prototype._cj$_constructor_$Turtle$, comment: JRC.TurtleEmptyConstructorComment },
        { type: "method", signature: "Turtle(double x, double y)", java: TurtleClass.prototype._cj$_constructor_$Turtle$double$double, comment: JRC.TurtleConstructorComment1 },
        { type: "method", signature: "Turtle(double x, double y, boolean showTurtle)", java: TurtleClass.prototype._cj$_constructor_$Turtle$double$double, comment: JRC.TurtleConstructorComment2 },
        { type: "method", signature: "final void forward(double length)", native: TurtleClass.prototype._forward, comment: JRC.TurtleForwardComment },
        { type: "method", signature: "final void turn(double angleInDeg)", native: TurtleClass.prototype._turn, comment: JRC.TurtleTurnComment },
        { type: "method", signature: "final void penUp()", template: `§1.penIsDown = false;`, comment: JRC.TurtlePenUpComment },
        { type: "method", signature: "final void penDown()", template: `§1.penIsDown = true;`, comment: JRC.TurtlePenDownComment },
        { type: "method", signature: "final void closeAndFill(boolean closeAndFill)", native: TurtleClass.prototype._closeAndFill, comment: JRC.TurtleCloseAndFillComment },
        { type: "method", signature: "final void showTurtle(boolean showTurtle)", native: TurtleClass.prototype._setShowTurtle, comment: JRC.TurtleShowTurtleComment },
        { type: "method", signature: "final void clear()", native: TurtleClass.prototype._clear, comment: JRC.TurtleClearComment },
        { type: "method", signature: "final boolean collidesWithBorderColor(int borderColor)", native: TurtleClass.prototype._collidesWithBorderColor, comment: JRC.TurtleCollidesWithBorderColorComment },
        { type: "method", signature: "final boolean collidesWithBorderColor(string borderColor)", native: TurtleClass.prototype._collidesWithBorderColor, comment: JRC.TurtleCollidesWithBorderColorComment },
        { type: "method", signature: "final boolean collidesWithBorderColor(Color borderColor)", native: TurtleClass.prototype._collidesWithBorderColor, comment: JRC.TurtleCollidesWithBorderColorComment },
        { type: "method", signature: "final double getLastSegmentLength()", native: TurtleClass.prototype._getLastSegmentLength, comment: JRC.TurtleGetLastSegmentLengthComment },
        { type: "method", signature: "final double getX()", template: `§1.getPosition().x`, comment: JRC.TurtleGetXComment },
        { type: "method", signature: "final double getY()", template: `§1.getPosition().y`, comment: JRC.TurtleGetYComment },
        { type: "method", signature: "final void moveTo(double x, double y)", native: TurtleClass.prototype._moveTo, comment: JRC.TurtleMoveToComment },
        
        { type: "method", signature: "final double getTurtleAngle()", native: TurtleClass.prototype._getTurtleAngleDeg, comment: JRC.TurtleGetTurtleAngleComment },

        { type: "method", signature: "final Turtle copy()", java: TurtleClass.prototype._mj$copy$Turtle$, comment: JRC.TurtleCopyComment },

        { type: "method", signature: "String toString()", java: TurtleClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

        { type: "method", signature: "final boolean collidesWith(Shape otherShape)", native: TurtleClass.prototype._collidesWith, comment: JRC.shapeCollidesWithComment },

    ]

    static type: NonPrimitiveType;

    lineElements: LineElement[] = [];
    turtleAngleDeg: number = 0; // in Rad

    isFilled: boolean = false;

    //@ts-ignore
    turtle!: PIXI.Graphics;             // If you change this identifier then you have to change corresponding declaration in class ShapeClass
    lineGraphic!: PIXI.Graphics;

    xSum: number = 0;
    ySum: number = 0;

    initialHitPolygonDirty: boolean = true;

    turtleSize: number = 40;

    penIsDown: boolean = true;

    lastLineWidth: number = 0;
    lastColor: number | null = 0;
    lastAlpha: number = 0;

    lastTurtleAngleDeg: number = 0; // angle in Rad

    renderJobPresent: boolean = false;

    angleHasChanged: boolean = true;
    lastLengthSign: number = -2;

    showTurtle: boolean = true;


    _cj$_constructor_$Turtle$(t: Thread, callback: CallbackFunction) {
        this._cj$_constructor_$Turtle$double$double(t, callback, 100, 200);
    }

    _cj$_constructor_$Turtle$double$double(t: Thread, callback: CallbackFunction, xStart: number, yStart: number, showTurtle: boolean = true) {
        this._cj$_constructor_$FilledShape$(t, () => {
            this.lineElements.push({
                x: xStart,
                y: yStart,
                color: 0,
                alpha: 1,
                lineWidth: 1
            });
            this.calculateCenter();

            this.borderColor = 0xffffff;
            this.borderWidth = 2;

            this.hitPolygonInitial = [];

            this.container = new PIXI.Container();

            this.world.app!.stage.addChild(this.container);

            this.lineGraphic = new PIXI.Graphics();
            this.container.addChild(this.lineGraphic);
            this.lineGraphic.moveTo(xStart, yStart);

            this.turtle = new PIXI.Graphics();
            this.container.addChild(this.turtle);
            this.turtle.visible = this.showTurtle;
            this.initTurtle(0, 0, this.turtleAngleDeg);
            this.moveTurtleTo(xStart, yStart, this.turtleAngleDeg);


            this.render();

            if (callback) callback();
        });   // call base class constructor


    }

    calculateCenter() {
        let length = this.lineElements.length;
        let lastLineElement = this.lineElements[length - 1];
        this.xSum += lastLineElement.x;
        this.ySum += lastLineElement.y;
        this.centerXInitial = this.xSum / length;
        this.centerYInitial = this.ySum / length;
    }

    _closeAndFill(closeAndFill: boolean) {
        if (closeAndFill != this.isFilled) {
            this.isFilled = closeAndFill;
            this.render();
            this.initialHitPolygonDirty = true;
        }
    }

    _setShowTurtle(show: boolean) {
        this.turtle.visible = show;
    }

    _turn(angleDeg: number) {
        this.angleHasChanged = true;
        this.turtleAngleDeg -= angleDeg;
        if (Math.abs(this.turtleAngleDeg) > 360) {
            this.turtleAngleDeg -= Math.floor(this.turtleAngleDeg / 360) * 360;
        }
        let lastLineElement: LineElement = this.lineElements[this.lineElements.length - 1];
        this.moveTurtleTo(lastLineElement.x, lastLineElement.y, this.turtleAngleDeg);
    }

    _setAngle(angleDeg: number) {
        this._turn(angleDeg + this.turtleAngleDeg)
    }

    newTurtleX!: number;
    newTurtleY!: number;
    newAngleDeg!: number;

    _forward(length: number) {

        if (Math.sign(length) != this.lastLengthSign) {
            this.angleHasChanged = true;
        }

        this.lastLengthSign = Math.sign(length);

        let lastLineElement: LineElement = this.lineElements[this.lineElements.length - 1];

        let newBorderColor = this.penIsDown ? this.borderColor! : null;
        let turtleAngleRad = this.turtleAngleDeg / 180.0 * Math.PI;

        let newLineElement: LineElement;

        if (!this.angleHasChanged && lastLineElement.color == newBorderColor &&
            lastLineElement.alpha == this.borderAlpha && lastLineElement.lineWidth == this.borderWidth) {
            lastLineElement.x += length * Math.cos(turtleAngleRad);
            lastLineElement.y += length * Math.sin(turtleAngleRad);
            newLineElement = lastLineElement;
        } else {
            newLineElement = {
                x: lastLineElement.x + length * Math.cos(turtleAngleRad),
                y: lastLineElement.y + length * Math.sin(turtleAngleRad),
                color: newBorderColor,
                alpha: this.borderAlpha,
                lineWidth: this.borderWidth
            }

            this.lineElements.push(newLineElement);
        }

        this.angleHasChanged = false;

        this.hitPolygonDirty = true;
        this.initialHitPolygonDirty = true;
        this.calculateCenter();

        this.newTurtleX = newLineElement.x;
        this.newTurtleY = newLineElement.y;
        this.newAngleDeg = this.turtleAngleDeg;

        // don't render more frequent than every 1/100 s
        if (!this.renderJobPresent) {
            this.renderJobPresent = true;
            setTimeout(() => {
                this.renderJobPresent = false;
                this.render();
                this.moveTurtleTo(this.newTurtleX, this.newTurtleY, this.turtleAngleDeg);
            }, 100);
        }

    }

    _moveTo(x: number, y: number) {
        let newLineElement: LineElement = {
            x: x,
            y: y,
            color: null,
            alpha: this.borderAlpha,
            lineWidth: this.borderWidth
        }

        this.lineElements.push(newLineElement);

        this.hitPolygonDirty = true;
        this.initialHitPolygonDirty = true;
        this.calculateCenter();
        this.moveTurtleTo(newLineElement.x, newLineElement.y, this.turtleAngleDeg);
    }


    initTurtle(x: number, y: number, angleDeg: number): void {
        this.turtle.clear();
        this.turtle.moveTo(x, y);

        let angleRad = angleDeg / 180.0 * Math.PI;

        let vx = Math.cos(angleRad);
        let vy = Math.sin(angleRad);

        let vxp = -Math.sin(angleRad);
        let vyp = Math.cos(angleRad);

        let lengthForward = this.turtleSize / 2;
        let lengthBackward = this.turtleSize / 4;
        let lengthBackwardP = this.turtleSize / 4;

        this.turtle.moveTo(x + vx * lengthForward, y + vy * lengthForward);
        this.turtle.lineTo(x - vx * lengthBackward + vxp * lengthBackwardP, y - vy * lengthBackward + vyp * lengthBackwardP);
        this.turtle.lineTo(x - vx * lengthBackward - vxp * lengthBackwardP, y - vy * lengthBackward - vyp * lengthBackwardP);
        this.turtle.lineTo(x + vx * lengthForward, y + vy * lengthForward);

        this.turtle.stroke({
            width: 3,
            color: 0xff0000,
            alpha: 1,
            alignment: 0.5
        })

    }

    moveTurtleTo(x: number, y: number, angleDeg: number) {
        this.turtle.localTransform.identity();
        this.turtle.localTransform.rotate(angleDeg / 180.0 * Math.PI);
        this.turtle.localTransform.translate(x, y);

        this.turtle.setFromMatrix(this.turtle.localTransform);

        this.turtle.updateLocalTransform();
        //@ts-ignore
        this.turtle._didLocalTransformChangeId = this.turtle._didChangeId;

        this.lastTurtleAngleDeg = this.turtleAngleDeg;
    }

    _collidesWith(shape: ShapeClass): boolean {

        if (shape instanceof TurtleClass && shape.initialHitPolygonDirty) {
            shape.setupInitialHitPolygon();
        }

        if (this.initialHitPolygonDirty) {
            this.setupInitialHitPolygon();
            this.transformHitPolygon();
            this.render();
        }

        if (!this.hasOverlappingBoundingBoxWith(shape)) return false;

        if (shape.shapes) {
            return shape._collidesWith(this);
        }

        if (this.hitPolygonInitial == null || shape.hitPolygonInitial == null) return true;

        // boundig boxes collide, so check further:
        if (this.hitPolygonDirty) this.transformHitPolygon();
        if (shape.hitPolygonDirty) shape.transformHitPolygon();

        if (shape.hitPolygonTransformed.length == 2 && !this.isFilled) {
            return steckenzugSchneidetStreckenzug(this.hitPolygonTransformed, shape.hitPolygonTransformed);
        }

        return polygonBerührtPolygon(this.hitPolygonTransformed, shape.hitPolygonTransformed);

    }

    setupInitialHitPolygon() {
        this.hitPolygonInitial = this.lineElements.map((le) => { return { x: le.x, y: le.y } });
    }

    _clear(x: number | undefined = undefined, y: number | undefined = undefined, angle: number | undefined = undefined) {
        let lastLineElement = this.lineElements.pop()!;
        if (x == null) x = lastLineElement.x;
        if (y == null) y = lastLineElement.y;

        this.lineElements = [];

        this.lineElements.push({
            x: x,
            y: y,
            color: 0,
            alpha: 1,
            lineWidth: 1
        });
        this.calculateCenter();

        this.hitPolygonInitial = [];
        if (angle != null) {
            this.turtleAngleDeg = angle;
            this.angleHasChanged = true;
            this.lastTurtleAngleDeg = 0;
            this.borderColor = 0;
            this.turtleSize = 40;
        }
        this.render();
        if (angle != null) {
            this.moveTurtleTo(x, y, angle);
        }
    }


    touchesAtLeastOneFigure(): boolean {
        let lastLineElement: LineElement = this.lineElements[this.lineElements.length - 1];
        let x = lastLineElement.x;
        let y = lastLineElement.y;

        for (let sh of this.world.shapesWhichBelongToNoGroup) {
            if (sh != this && sh._containsPoint(x, y)) {
                return true;
            }
        }
        return false;
    }

    touchesColor(farbe: number): boolean {
        let lastLineElement: LineElement = this.lineElements[this.lineElements.length - 1];
        let x = lastLineElement.x;
        let y = lastLineElement.y;

        for (let sh of this.world.shapesWhichBelongToNoGroup) {
            if (sh != this && sh._containsPoint(x, y)) {
                if (sh instanceof FilledShapeClass && sh.fillColor == farbe) return true;
                // if(sh instanceof TurtleHelper) TODO
            }
        }
        return false;
    }

    touchesShape(shape: ShapeClass) {
        let lastLineElement: LineElement = this.lineElements[this.lineElements.length - 1];
        let x = lastLineElement.x;
        let y = lastLineElement.y;
        return shape._containsPoint(x, y);
    }

    _containsPoint(x: number, y: number) {

        if (this.initialHitPolygonDirty) {
            this.setupInitialHitPolygon();
            this.transformHitPolygon();
            this.render();
        }

        if (!this.container.getBounds().containsPoint(x, y)) return false;

        if (this.hitPolygonInitial == null) return true;

        if (this.hitPolygonDirty) this.transformHitPolygon();

        if (this.isFilled) {
            return polygonEnthältPunkt(this.hitPolygonTransformed, { x: x, y: y });
        } else {
            return streckenzugEnthältPunkt(this.hitPolygonTransformed, { x: x, y: y });
        }
    }

    public borderContainsPointExcludingLastLineElement(x: number, y: number, color: number = -1): boolean {

        let lastLineElement = this.lineElements.pop()!;
        let ret = this.borderContainsPoint(x, y, color);
        this.lineElements.push(lastLineElement);
        return ret;
    }


    public borderContainsPoint(x: number, y: number, color: number = -1): boolean {

        let m = this.getWorldTransform();

        let transformIsIdentity = m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1 && m.tx == 0 && m.ty == 0;

        let p: Punkt = { x: x, y: y };

        if (this.lineElements.length < 2) return false;

        let rightLe: LineElement = this.lineElements[0];

        let left: Punkt;
        let right: Punkt = rightLe;

        if (!transformIsIdentity) {
            right = {
                x: (m.a * right.x) + (m.c * right.y) + m.tx,
                y: (m.b * right.x) + (m.d * right.y) + m.ty
            }
        }

        for (let i = 0; i < this.lineElements.length - 1; i++) {

            left = right;
            rightLe = this.lineElements[i + 1];
            right = rightLe;

            if (!transformIsIdentity) {
                right = {
                    x: (m.a * right.x) + (m.c * right.y) + m.tx,
                    y: (m.b * right.x) + (m.d * right.y) + m.ty
                }
            }

            if (color != -1 && rightLe.color != color) continue;

            if (abstandPunktZuStrecke(left, right, p) <= rightLe.lineWidth / 2) return true;

        }

        return false;
    }


    _collidesWithBorderColor(borderColor: number|ColorClass|string): boolean {
        let lastLineElement = this.lineElements[this.lineElements.length - 1];
        let x = lastLineElement.x;
        let y = lastLineElement.y;

        borderColor = ColorConverter.convertToInt(borderColor);

        for (let sh of this.world.shapesWhichBelongToNoGroup) {
            if (sh == this) {
                if ((<TurtleClass>sh).borderContainsPointExcludingLastLineElement(x, y, borderColor)) return true;
            } else {
                if (sh.borderContainsPoint(x, y, borderColor)) return true;
            }
        }

        return false;
    }

    _getLastSegmentLength(): any {
        if (this.lineElements.length < 2) return 0;
        let l1 = this.lineElements[this.lineElements.length - 2];
        let l2 = this.lineElements[this.lineElements.length - 1];
        let dx = l2.x - l1.x;
        let dy = l2.y - l1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getPosition(): LineElement {
        return this.lineElements[this.lineElements.length - 1];
    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter) {
        this._mj$copy$Turtle$(t, callback);
    }

    _mj$copy$Turtle$(t: Thread, callback: CallbackFunction) {
        let copy = new TurtleClass();
        copy._cj$_constructor_$Turtle$double$double(t, callback, this.lineElements[0].x, this.lineElements[0].y, this.showTurtle);
        copy.turtleAngleDeg = this.turtleAngleDeg;
        copy.lineElements = this.lineElements.slice();
        copy.copyFrom(this);
        copy.render();
        t.s.push(copy);
        if (callback) callback();
    }

    render(): void {

        let g: PIXI.Graphics = this.lineGraphic;

        if (this.lineElements.length > 1) {
            let le = this.lineElements[1];
            this.lastLineWidth = le.lineWidth;
            this.lastColor = le.color;
            this.lastAlpha = le.alpha;
        }

        g.clear();


        let firstPoint = this.lineElements[0];
        g.moveTo(firstPoint.x, firstPoint.y);

        for (let i = 1; i < this.lineElements.length; i++) {
            let le: LineElement = this.lineElements[i];
            if(this.lastColor != null){
                if (!this.isFilled && i > 1) {
                    if (le.lineWidth != this.lastLineWidth || le.color != this.lastColor || le.alpha != this.lastAlpha) {
                        g.stroke({
                            width: this.lastLineWidth,
                            color: this.lastColor == null ? 0x0 : this.lastColor,
                            alpha: this.lastAlpha,
                            alignment: 0.5
                        })
                        this.lastLineWidth = le.lineWidth;
                        this.lastAlpha = le.alpha;
                    }
                }
            }
            if (le.color != null) {
                g.lineTo(le.x, le.y);
                // console.log("LineTo: " + le.x + ", " + le.y);
            } else {
                g.moveTo(le.x, le.y);
                // console.log("MoveTo: " + le.x + ", " + le.y);
            }
            this.lastColor = le.color;
        }

        if (this.isFilled) {
            g.closePath();
            g.stroke({
                width: this.borderWidth,
                color: this.borderColor,
                alpha: this.borderAlpha,
                alignment: 0.5
            })
        } else {
            if (this.lineElements.length > 1) {
                let lastLineElement = this.lineElements[this.lineElements.length - 1];
                g.stroke({
                    width: lastLineElement.lineWidth,
                    color: lastLineElement.color == null ? 0x0 : lastLineElement.color,
                    alpha: lastLineElement.alpha,
                    alignment: 0.5
                })
            }
        }

        if (this.fillColor != null && this.isFilled) {
            g.fill(this.fillColor);
            g.alpha = this.fillAlpha;
        }


        g.closePath();

    };


    _mj$toString$String$(t: Thread, callback: CallbackParameter) {

        t.s.push(new StringClass(this._debugOutput()));

        if (callback) callback();

        return;
    }

    _debugOutput() {
        if (this.isDestroyed) return "<destroyed Turtle>"
        let s = `{centerX: ${this._getCenterX()}, centerY: ${this._getCenterY()} }`;
        return s;
    }

    _getTurtleAngleDeg(): number {
        return -this.turtleAngleDeg + this.angle;
    }


}