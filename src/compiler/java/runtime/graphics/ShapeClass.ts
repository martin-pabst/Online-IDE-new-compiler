import * as PIXI from 'pixi.js';
import { Punkt, polygonBerührtPolygonExakt, polygonEnthältPunkt, polygonzugEnthältPunkt } from '../../../../tools/MatheTools';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter';
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from '../../language/JavaRuntimeLibraryComments';
import { ColorHelper } from '../../lexer/ColorHelper';
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException';
import { ActorClass } from "./ActorClass";
import { ColorClass } from './ColorClass';
import { DirectionEnum } from './DirectionEnum';
import { FilledShapeDefaults } from './FilledShapeDefaults';
import { GroupClass } from './GroupClass';
import { updateWorldTransformRecursively } from './PixiHelper';
import { IWorld } from './IWorld';

export type MouseEventMethod = (t: Thread, callback: CallbackParameter, x: number, y: number, button: number) => void;

export class ShapeClass extends ActorClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "abstract class Shape extends Actor", comment: JRC.shapeClassComment },

        { type: "field", signature: "private double angle", nativeIdentifier: "_angle", comment: JRC.shapeAngleComment },
        { type: "field", signature: "protected double centerX", nativeIdentifier: "_centerX", comment: JRC.shapeCenterXComment },
        { type: "field", signature: "protected double centerY", nativeIdentifier: "_centerY", comment: JRC.shapeCenterYComment },
        { type: "field", signature: "private double scaleFactor", nativeIdentifier: "_scaleFactor", comment: JRC.shapeScaleFactorComment },

        { type: "method", signature: "Shape()", java: ShapeClass.prototype._cj$_constructor_$Shape$ },
        { type: "method", signature: "final void move(double dx, double dy)", native: ShapeClass.prototype._move, comment: JRC.shapeMoveComment },
        { type: "method", signature: "final void rotate(double angleInDeg, double centerX, double centerY)", native: ShapeClass.prototype._rotate, comment: JRC.shapeRotateComment1 },
        { type: "method", signature: "final void rotate(double angleInDeg)", native: ShapeClass.prototype._rotate, comment: JRC.shapeRotateComment2 },
        { type: "method", signature: "final void scale(double factor, double centerX, double centerY)", native: ShapeClass.prototype._scale, comment: JRC.shapeScaleComment1 },
        { type: "method", signature: "final void setScale(double newScale)", native: ShapeClass.prototype._setScale, comment: JRC.shapeSetScaleComment },
        { type: "method", signature: "final void scale(double factor)", native: ShapeClass.prototype._scale, comment: JRC.shapeScaleComment2 },
        { type: "method", signature: "final void mirrorX()", template: "§1._mirrorXY(-1, 1)", comment: JRC.shapeMirrorXComment },
        { type: "method", signature: "final void mirrorY()", template: "§1._mirrorXY(1, -1)", comment: JRC.shapeMirrorYComment },
        { type: "method", signature: "final void defineDirection(double angleInDeg)", native: ShapeClass.prototype._defineDirection, comment: JRC.shapeDefineDirectionComment },
        { type: "method", signature: "final void forward(double distance)", native: ShapeClass.prototype._forward, comment: JRC.shapeForwardComment },
        { type: "method", signature: "final boolean isOutsideView()", native: ShapeClass.prototype._isOutsideView, comment: JRC.shapeOutsideViewComment },
        { type: "method", signature: "final double getCenterX()", native: ShapeClass.prototype._getCenterX, comment: JRC.shapeCenterXComment },
        { type: "method", signature: "final double getCenterY()", native: ShapeClass.prototype._getCenterY, comment: JRC.shapeCenterYComment },
        { type: "method", signature: "final double getAngle()", template: '(§1.angle)', comment: JRC.shapeAngleComment },
        { type: "method", signature: "final void setAngle(double newAngle)", native: ShapeClass.prototype._setAngle, comment: JRC.shapeSetAngleComment },
        { type: "method", signature: "final boolean containsPoint(double x, double y)", native: ShapeClass.prototype._containsPoint, comment: JRC.shapeContainsPointComment },
        { type: "method", signature: "final void moveTo(double x, double y)", native: ShapeClass.prototype._moveTo, comment: JRC.shapeMoveToComment },
        { type: "method", signature: "final void defineCenter(double x, double y)", native: ShapeClass.prototype._defineCenter, comment: JRC.shapeDefineCenterComment },
        { type: "method", signature: "final void defineCenterRelative(double x, double y)", native: ShapeClass.prototype._defineCenterRelative, comment: JRC.shapeDefineCenterRelativeComment },

        { type: "method", signature: "final void tint(int color)", native: ShapeClass.prototype._setTintInt, comment: JRC.shapeTintComment },
        { type: "method", signature: "final void tint(string color)", native: ShapeClass.prototype._setTintString, comment: JRC.shapeTintComment },
        { type: "method", signature: "final void tint(Color color)", native: ShapeClass.prototype._setTintColor, comment: JRC.shapeTintComment },

        { type: "method", signature: "final Direction directionRelativeTo(Shape otherShape)", native: ShapeClass.prototype._directionRelativeTo, comment: JRC.shapeDirectionRelativeToComment },
        { type: "method", signature: "final void moveBackFrom(Shape otherShape, boolean keepColliding)", native: ShapeClass.prototype._moveBackFrom, comment: JRC.shapeMoveBackFromComment },

        { type: "method", signature: "static void setDefaultVisibility(boolean isVisible)", native: ShapeClass._setDefaultVisibility, comment: JRC.shapeSetDefaultVisibilityComment },
        { type: "method", signature: "final void setVisible(boolean isVisible)", native: ShapeClass.prototype._setVisible, comment: JRC.shapeSetVisibleComment },
        { type: "method", signature: "final boolean isVisible()", template: '§1.container.visible', comment: JRC.shapeSetVisibleComment },
        { type: "method", signature: "final void setStatic(boolean isStatic)", native: ShapeClass.prototype._setStatic, comment: JRC.shapeSetStaticComment },
        { type: "method", signature: "final void bringToFront()", native: ShapeClass.prototype._bringToFront, comment: JRC.shapeBringToFrontComment },
        { type: "method", signature: "final void sendToBack()", native: ShapeClass.prototype._sendToBack, comment: JRC.shapeSendToBackComment },


        { type: "method", signature: "final boolean collidesWith(Shape otherShape)", native: ShapeClass.prototype._collidesWith, comment: JRC.shapeCollidesWithComment },
        { type: "method", signature: "final boolean collidesWithAnyShape()", native: ShapeClass.prototype._collidesWithAnyShape, comment: JRC.shapeCollidesWithAnyShapeComment },
        { type: "method", signature: "final boolean collidesWithFillColor(int color)", native: ShapeClass.prototype._collidesWithAnyShape, comment: JRC.shapeCollidesWithFillColorComment },
        { type: "method", signature: "final boolean collidesWithFillColor(string color)", native: ShapeClass.prototype._collidesWithAnyShape, comment: JRC.shapeCollidesWithFillColorComment },
        { type: "method", signature: "final boolean collidesWithFillColor(Color color)", native: ShapeClass.prototype._collidesWithAnyShape, comment: JRC.shapeCollidesWithFillColorComment },
        { type: "method", signature: "final Sprite getFirstCollidingSprite(int imageIndex)", native: ShapeClass.prototype._getFirstCollidingSprite, comment: JRC.shapeGetFirstCollidingSpriteComment },
        { type: "method", signature: "final <T> T[] getCollidingShapes(Group<T> group)", native: ShapeClass.prototype._getCollidingShapes, comment: JRC.shapeGetCollidingShapesComment },


        { type: "method", signature: "void onMouseUp(double x, double y, int button)", java: ShapeClass.prototype._mj$onMouseUp$void$double$double$int, comment: JRC.shapeOnMouseUpComment },
        { type: "method", signature: "void onMouseDown(double x, double y, int button)", java: ShapeClass.prototype._mj$onMouseDown$void$double$double$int, comment: JRC.shapeOnMouseDownComment },
        { type: "method", signature: "void onMouseEnter(double x, double y)", java: ShapeClass.prototype._mj$onMouseEnter$void$double$double, comment: JRC.shapeOnMouseEnterComment },
        { type: "method", signature: "void onMouseLeave(double x, double y)", java: ShapeClass.prototype._mj$onMouseLeave$void$double$double, comment: JRC.shapeOnMouseLeaveComment },
        { type: "method", signature: "void onMouseMove(double x, double y)", java: ShapeClass.prototype._mj$onMouseMove$void$double$double, comment: JRC.shapeOnMouseMoveComment },

        { type: "method", signature: "void startTrackingEveryMouseMovement()", native: ShapeClass.prototype._startTrackingEveryMouseMovement, comment: JRC.shapeStartTrackingEveryMouseMovementComment },
        { type: "method", signature: "void stopTrackingEveryMouseMovement()", native: ShapeClass.prototype._stopTrackingEveryMouseMovement, comment: JRC.shapeStartTrackingEveryMouseMovementComment },

        { type: "method", signature: "abstract Shape copy()", java: ShapeClass.prototype._mj$copy$Shape$, comment: JRC.shapeCopyComment },
        { type: "method", signature: "final World getWorld()", java: ShapeClass.prototype._mj$getWorld$World, comment: JRC.getWorldComment },



    ]

    static type: NonPrimitiveType;

    container!: PIXI.Container;

    belongsToGroup?: GroupClass;

    // fields of child classes:
    declare fillColor: number | undefined;  // fillColor is a number if this shape is a FilledShapeClass.
    declare shapes: ShapeClass[] | undefined;    // shapes is defined if this shape is a GroupClass
    declare turtle: PIXI.Graphics | undefined;  // turtle is defined if this shape is a TurtleClass
    declare imageIndex: number | undefined; // index is defined if this shape is a SpriteClass

    centerXInitial: number = 0;
    centerYInitial: number = 0;

    angle: number = 0;      // in Degrees

    hitPolygonInitial: Punkt[] = [];
    hitPolygonTransformed: Punkt[] = [];
    hitPolygonDirty = true;

    reactToMouseEventsWhenInvisible: boolean = false;

    mouseLastSeenInsideObject: boolean = false;

    trackMouseMove: boolean = false;

    scaleFactor: number = 1.0;

    directionRad: number = 0;

    lastMoveDx: number = 0;
    lastMoveDy: number = 0;

    world: IWorld;

    get _centerX(): number {
        return this._getCenterX();
    }

    get _centerY(): number {
        return this._getCenterY();
    }

    set _centerX(cx: number) {
        this._moveTo(cx, this._centerY);
    }

    set _centerY(cy: number) {
        this._moveTo(this._centerX, cy);
    }

    get _angle(): number {
        return this.angle;
    }

    set _angle(a: number) {
        this._setAngle(a);
    }

    get _scaleFactor(): number {
        return this.scaleFactor;
    }

    set _scaleFactor(sf: number) {
        this._scale(sf / this.scaleFactor);
    }


    mouseEventsImplemented?: { [mouseEvent: string]: MouseEventMethod };

    copyFrom(otherShape: ShapeClass) {
        super.copyFrom(otherShape);
        this.centerXInitial = otherShape.centerXInitial;
        this.centerYInitial = otherShape.centerYInitial;
        this.angle = otherShape.angle;
        this.hitPolygonInitial = otherShape.hitPolygonInitial.slice();
        this.hitPolygonTransformed = otherShape.hitPolygonTransformed.slice();
        this.hitPolygonDirty = otherShape.hitPolygonDirty;
        this.reactToMouseEventsWhenInvisible = otherShape.reactToMouseEventsWhenInvisible;
        this.mouseLastSeenInsideObject = otherShape.mouseLastSeenInsideObject;
        this.trackMouseMove = otherShape.trackMouseMove;
        this.scaleFactor = otherShape.scaleFactor;
        this.directionRad = otherShape.directionRad;
        this.lastMoveDx = otherShape.lastMoveDx;
        this.lastMoveDy = otherShape.lastMoveDy;

        this.container.localTransform.copyFrom(otherShape.container.localTransform);
        this.container.setFromMatrix(otherShape.container.localTransform);
        updateWorldTransformRecursively(otherShape.container, false);
    }

    render(): void { };

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter) {
        // this method is abstract => empty method stub
    }

    /*
     * TermCodeGenerator.invokeConstructor does compiler magic to ensure that this method is called AFTER the constructor
     * of the child class of Shape is FULLY finished
     */
    _registerListeners(t: Thread) {
        super._registerListeners(t);
        let atLeastOneMouseListenerOverridden = false;
        if (this._mj$onMouseDown$void$double$double$int != ShapeClass.prototype._mj$onMouseDown$void$double$double$int) {
            atLeastOneMouseListenerOverridden = true;
            if (!this.mouseEventsImplemented) this.mouseEventsImplemented = {};
            this.mouseEventsImplemented["mousedown"] = this._mj$onMouseDown$void$double$double$int;
        }
        if (this._mj$onMouseUp$void$double$double$int != ShapeClass.prototype._mj$onMouseUp$void$double$double$int) {
            atLeastOneMouseListenerOverridden = true;
            if (!this.mouseEventsImplemented) this.mouseEventsImplemented = {};
            this.mouseEventsImplemented["mouseup"] = this._mj$onMouseUp$void$double$double$int;
        }
        if (this._mj$onMouseMove$void$double$double != ShapeClass.prototype._mj$onMouseMove$void$double$double) {
            atLeastOneMouseListenerOverridden = true;
            if (!this.mouseEventsImplemented) this.mouseEventsImplemented = {};
            this.mouseEventsImplemented["mousemove"] = this._mj$onMouseMove$void$double$double;
        }
        if (this._mj$onMouseEnter$void$double$double != ShapeClass.prototype._mj$onMouseEnter$void$double$double) {
            atLeastOneMouseListenerOverridden = true;
            if (!this.mouseEventsImplemented) this.mouseEventsImplemented = {};
            this.mouseEventsImplemented["mouseenter"] = this._mj$onMouseEnter$void$double$double;
        }
        if (this._mj$onMouseLeave$void$double$double != ShapeClass.prototype._mj$onMouseLeave$void$double$double) {
            atLeastOneMouseListenerOverridden = true;
            if (!this.mouseEventsImplemented) this.mouseEventsImplemented = {};
            this.mouseEventsImplemented["mouseleave"] = this._mj$onMouseLeave$void$double$double;
        }
        if (atLeastOneMouseListenerOverridden) {
            this.world.mouseManager.addShapeWithImplementedMouseMethods(this);
        }
    }

    _cj$_constructor_$Shape$(t: Thread, callback: CallbackParameter) {

        this.world = t.scheduler.interpreter.retrieveObject("WorldClass");
        t.s.push(this);

        if (!this.world) {
            new t.classes["World"]()._cj$_constructor_$World$(t, () => {
                this.world = t.s.pop();
                if (!this.world.defaultGroup) {
                    this.world.shapesWhichBelongToNoGroup.push(this);
                }
                if (callback) callback();
            });
        } else {
            if (!this.world.defaultGroup) {
                this.world.shapesWhichBelongToNoGroup.push(this);
            }
            if (callback) callback();
        }

    }

    _isOutsideView() {
        let bounds = this.container.getBounds(true);
        let wh = this.world;
        return bounds.right < wh.
            currentLeft || bounds.left > wh.currentLeft + wh.currentWidth
            || bounds.bottom < wh.currentTop || bounds.top > wh.currentTop + wh.currentHeight;
    }



    _move(dx: number, dy: number) {
        if (dx != 0 || dy != 0) {
            this.lastMoveDx = dx;
            this.lastMoveDy = dy;
        }

        this.container.setFromMatrix(this.container.localTransform.translate(dx, dy));

        this.container.updateLocalTransform();
        //@ts-ignore
        this.container._didLocalTransformChangeId = this.container._didChangeId;

        this.setWorldTransformAndHitPolygonDirty();

    }

    _rotate(angleInDeg: number, cX?: number, cY?: number) {
        if (typeof cX == "undefined") {
            let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
            this.container.localTransform.apply(p, p);
            cX = p.x;
            cY = p.y;
        } else {
            let p = new PIXI.Point(cX, cY);
            this.getWorldTransform().applyInverse(p, p);
            this.container.localTransform.apply(p, p);
            cX = p.x;
            cY = p.y;
        }

        this.container.localTransform.translate(-cX, -cY);
        this.container.localTransform.rotate(-angleInDeg / 180 * Math.PI);
        this.container.localTransform.translate(cX, cY);

        this.container.setFromMatrix(this.container.localTransform);

        this.container.updateLocalTransform();
        //@ts-ignore
        this.container._didLocalTransformChangeId = this.container._didChangeId;

        this.setWorldTransformAndHitPolygonDirty();

        this.angle += angleInDeg;
        this.directionRad += angleInDeg / 180 * Math.PI;

    }

    _setScale(factor: number){
        this._scale(factor/this.scaleFactor);
    }

    _scale(factor: number, cX?: number, cY?: number) {
        if (typeof cX == "undefined") {
            let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
            this.container.localTransform.apply(p, p);
            cX = p.x;
            cY = p.y;
        } else {
            let p = new PIXI.Point(cX, cY);
            //@ts-ignore
            this.getWorldTransform().applyInverse(p, p);
            this.container.localTransform.apply(p, p);
            cX = p.x;
            cY = p.y;
        }

        this.container.localTransform.translate(-cX, -cY);
        this.container.localTransform.scale(factor, factor);
        this.container.localTransform.translate(cX, cY);


        this.container.setFromMatrix(this.container.localTransform);
        this.container.updateLocalTransform();
        //@ts-ignore
        this.container._didLocalTransformChangeId = this.container._didChangeId;

        this.setWorldTransformAndHitPolygonDirty();

        this.scaleFactor *= factor;

    }

    _mirrorXY(scaleX: number, scaleY: number) {
        let cX: number, cY: number;

        let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
        this.container.localTransform.apply(p, p);
        cX = p.x;
        cY = p.y;

        this.container.localTransform.translate(-cX, -cY);
        this.container.localTransform.scale(scaleX, scaleY);
        this.container.localTransform.translate(cX, cY);

        this.container.setFromMatrix(this.container.localTransform);

        this.container.updateLocalTransform();
        //@ts-ignore
        this.container._didLocalTransformChangeId = this.container._didChangeId;

        this.setWorldTransformAndHitPolygonDirty();

    }

    _forward(distance: number) {
        let dx = distance * Math.cos(this.directionRad);
        let dy = -distance * Math.sin(this.directionRad);
        this._move(dx, dy);
    }

    _defineDirection(angleInDeg: number) {
        this.directionRad = angleInDeg / 180 * Math.PI;
    }

    /**
     * For Graphics and Games library
     */
    bringOnePlaneFurtherToFront() {
        let container: PIXI.Container = <PIXI.Container>this.container.parent;
        let highestIndex = container.children.length - 1;
        let index = container.getChildIndex(this.container);
        if (index < highestIndex) {
            container.setChildIndex(this.container, index + 1);
        }
    }

    /**
     * For Graphics and Games library
     */
    bringOnePlaneFurtherToBack() {
        let container: PIXI.Container = <PIXI.Container>this.container.parent;
        let index = container.getChildIndex(this.container);
        if (index > 0) {
            container.setChildIndex(this.container, index - 1);
        }
    }

    bringToFront() {
        let container: PIXI.Container = <PIXI.Container>this.container.parent;
        let highestIndex = container.children.length - 1;

        if (this.belongsToGroup) {
            this.belongsToGroup.setChildIndex(this, highestIndex);
        } else {
            container.setChildIndex(this.container, highestIndex);
        }
    }

    sendToBack() {
        if (this.belongsToGroup) {
            this.belongsToGroup.setChildIndex(this, 0);
        } else {
            let container: PIXI.Container = <PIXI.Container>this.container.parent;
            container.setChildIndex(this.container, 0);
        }
    }

    addToDefaultGroupAndSetDefaultVisibility() {

        this.container.visible = FilledShapeDefaults.defaultVisibility;

        if (this.world.defaultGroup) {
            this.world.defaultGroup.add(this);
        }
    }

    tint(color: string | number) {
        let c: number | undefined;
        if (typeof color == 'string') {
            c = ColorHelper.parseColorToOpenGL(color).color || 0x303030;
        } else {
            c = color;
        }

        if (this.container.tint) {
            this.container.tint = c;
        }

    }

    public _getCenterX(): number {
        let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
        if (this.container) this.getWorldTransform().apply(p, p);
        return p.x;
    }

    public _getCenterY(): number {
        let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
        if (this.container) this.getWorldTransform().apply(p, p);
        return p.y;
    }


    public getCenter(): PIXI.Point {
        let p = new PIXI.Point(this.centerXInitial, this.centerYInitial);
        return this.container.worldTransform.apply(p, p);
    }

    public destroy() {
        if (this.isDestroyed) return;

        let world = this.world;

        if (this.belongsToGroup) {
            let index = this.belongsToGroup.shapes.indexOf(this);
            if (index >= 0) {
                this.belongsToGroup.shapes.splice(index, 1);
            }
            this.belongsToGroup.container.removeChildAt(this.belongsToGroup.container.getChildIndex(this.container))
        } else {
            let index1 = world.shapesWhichBelongToNoGroup.indexOf(this);
            if (index1 >= 0) world.shapesWhichBelongToNoGroup.splice(index1, 1);
        }

        let index2 = world.shapesNotAffectedByWorldTransforms.indexOf(this);
        if (index2 >= 0) world.shapesNotAffectedByWorldTransforms.splice(index2, 1);

        this.world.interpreter.actorManager.shapesToDestroySafely.push(this);

        if (this.mouseEventsImplemented) {
            this.world.mouseManager.removeShapeWithImplementedMouseMethods(this);
        }

        super.destroy();
    }

    transformHitPolygon() {
        if (!this.hitPolygonDirty) return;

        this.hitPolygonTransformed = [];
        let m = this.getWorldTransform();
        for (let p of this.hitPolygonInitial) {
            this.hitPolygonTransformed.push({
                x: (m.a * p.x) + (m.c * p.y) + m.tx,
                y: (m.b * p.x) + (m.d * p.y) + m.ty
            });
        }

        this.hitPolygonDirty = false;

    }

    _containsPoint(x: number, y: number) {
        if (!this.container.getBounds().containsPoint(x, y)) return false;

        if (this.hitPolygonInitial == null) return true;

        if (this.hitPolygonDirty) this.transformHitPolygon();
        return polygonEnthältPunkt(this.hitPolygonTransformed, { x: x, y: y });
    }




    _moveTo(x: number, y: number) {
        this._move(x - this._getCenterX(), y - this._getCenterY())
    }

    _defineCenter(x: number, y: number) {
        let p = new PIXI.Point(x, y);
        this.getWorldTransform().applyInverse(p, p);
        this.centerXInitial = p.x;
        this.centerYInitial = p.y;
    }

    _defineCenterRelative(x: number, y: number) {
        let bounds = this.container.getBounds(false);
        let topLeft = new PIXI.Point(bounds.left, bounds.top);
        let bottomRight = new PIXI.Point(bounds.right, bounds.bottom);
        topLeft = this.world.app.stage.localTransform.applyInverse(topLeft);
        bottomRight = this.world.app.stage.localTransform.applyInverse(bottomRight);

        this._defineCenter(topLeft.x + (bottomRight.x - topLeft.x) * x, topLeft.y + (bottomRight.y - topLeft.y) * y);
    }

    static _setDefaultVisibility(isVisible: boolean) {
        FilledShapeDefaults.setDefaultVisibility(isVisible);
    }

    _setVisible(isVisible: boolean) {
        this.container.visible = isVisible;
    }

    _setStatic(isStatic: boolean) {
        let list = this.world.shapesNotAffectedByWorldTransforms;
        if (isStatic) {
            list.push(this);
        } else {
            let index = list.indexOf(this);
            if (index >= 0) {
                list.splice(index, 1);
            }
        }
    }

    _mj$onMouseUp$void$double$double$int(t: Thread, callback: CallbackParameter, x: number, y: number, button: number) { }
    _mj$onMouseDown$void$double$double$int(t: Thread, callback: CallbackParameter, x: number, y: number, button: number) { }
    _mj$onMouseEnter$void$double$double(t: Thread, callback: CallbackParameter, x: number, y: number) { }
    _mj$onMouseLeave$void$double$double(t: Thread, callback: CallbackParameter, x: number, y: number) { }
    _mj$onMouseMove$void$double$double(t: Thread, callback: CallbackParameter, x: number, y: number) { }

    _collidesWith(otherShape: ShapeClass): boolean {

        // is other shape a turtle?
        if (!this.turtle && otherShape.turtle) {
            return otherShape._collidesWith(this);
        }

        // is other shape a group?
        if (otherShape.shapes) {
            return otherShape._collidesWith(this);
        }

        if (this.isDestroyed == null || otherShape.isDestroyed == null) return false;

        // uncomment this to remove lag of 1/30 s
        // updateWorldTransformRecursively(this.container, false);
        // updateWorldTransformRecursively(otherShape.container, false);


        if (!this.hasOverlappingBoundingBoxWith(otherShape)) return false;

        if (this.hitPolygonInitial == null || otherShape.hitPolygonInitial == null) return true;

        // boundig boxes collide, so check further:
        if (this.hitPolygonDirty) this.transformHitPolygon();
        if (otherShape.hitPolygonDirty) otherShape.transformHitPolygon();

        // return polygonBerührtPolygon(this.hitPolygonTransformed, shapeHelper.hitPolygonTransformed);
        return polygonBerührtPolygonExakt(this.hitPolygonTransformed, otherShape.hitPolygonTransformed, true, true);

    }

    hasOverlappingBoundingBoxWith(otherShape: ShapeClass, bb?: PIXI.Bounds) {
        if (!bb) bb = this.container.getBounds();

        let bb1 = otherShape.container.getBounds();

        if (bb.left > bb1.right || bb1.left > bb.right) return false;

        if (bb.top > bb1.bottom || bb1.top > bb.bottom) return false;

        return true;
    }

    getFirstCollidingSpriteHelper(imageIndex: number, shapes: ShapeClass[], bounds: PIXI.Bounds): ShapeClass | null {
        let collidingSprite: ShapeClass | null = null;

        for (let otherShape of shapes) {

            if (otherShape == this) continue;

            if (otherShape.isDestroyed) continue;

            if (otherShape.shapes) {
                collidingSprite = this.getFirstCollidingSpriteHelper(imageIndex, otherShape.shapes, bounds);
                if (collidingSprite) break;
            } else {
                let spriteIndex = otherShape.imageIndex;
                if (!spriteIndex || spriteIndex != imageIndex) continue;

                if (!this.hasOverlappingBoundingBoxWith(otherShape, bounds)) continue;

                if (this.hitPolygonInitial == null || otherShape.hitPolygonInitial == null) {
                    collidingSprite = otherShape;
                    break;
                }

                if (otherShape.hitPolygonDirty) otherShape.transformHitPolygon();

                if (polygonBerührtPolygonExakt(this.hitPolygonTransformed, otherShape.hitPolygonTransformed, true, true)) {
                    collidingSprite = otherShape;
                    break;
                }
            }


        }

        return collidingSprite;

    }

    _getFirstCollidingSprite(imageIndex: number): ShapeClass | null {
        if (this.hitPolygonDirty) this.transformHitPolygon();
        return this.getFirstCollidingSpriteHelper(imageIndex, this.world.shapesWhichBelongToNoGroup, this.container.getBounds());
    }

    _getCollidingShapes(group: GroupClass): ShapeClass[] | null {
        if (group == null) return [];

        if (!this.hasOverlappingBoundingBoxWith(group)) return [];

        let ret: ShapeClass[] = [];
        for (let shape of group.shapes) {
            if (this._collidesWith(shape)) ret.push(shape);
        }
        return ret;
    }

    collidesWithAnyShapeHelper(color: number | undefined, shapes: ShapeClass[], bounds: PIXI.Bounds): boolean {

        if (this.hitPolygonDirty) this.transformHitPolygon();

        let collisionDetected: boolean = false;
        for (let otherShape of shapes) {

            if (otherShape == this) continue;

            if (otherShape.isDestroyed) continue;

            if (color != null && !otherShape.shapes) {
                if (otherShape.fillColor != color) continue;
            }
            
            if (!this.hasOverlappingBoundingBoxWith(otherShape, bounds)) continue;
            
            if (otherShape.shapes && !this.shapes) {
                if (this.collidesWithAnyShapeHelper(color, otherShape.shapes, bounds)) {
                    collisionDetected = true;
                    break;
                }
            }

            if (this.shapes) {
                let cd: boolean = false;
                for(let shape of this.shapes){
                    if (shape.collidesWithAnyShapeHelper(color, [otherShape], bounds)) {
                        cd = true;
                        break;
                    }
                }
                if(cd){
                    collisionDetected = true;
                    break;
                }
            }

            if (this.hitPolygonInitial == null || otherShape.hitPolygonInitial == null) {
                collisionDetected = false;
                break;
            }

            if(this.hitPolygonTransformed.length == 0){
                collisionDetected = true;
                break;
            }

            if (otherShape.hitPolygonDirty) otherShape.transformHitPolygon();


            if (polygonBerührtPolygonExakt(this.hitPolygonTransformed, otherShape.hitPolygonTransformed, true, true)) {
                collisionDetected = true;
                break;
            }

        }

        return collisionDetected;

    }

    _collidesWithAnyShape(color?: number | string | ColorClass): boolean {

        if (color) {
            if (typeof color == "string") {
                color = ColorHelper.parseColorToOpenGL(color).color;
            } else if (color instanceof ColorClass) {
                color = color._toInt();
            }
        }


        if (this.isDestroyed) return false;

        let bb = this.container.getBounds();
        if (this.hitPolygonDirty) this.transformHitPolygon();

        return this.collidesWithAnyShapeHelper(<number>color, this.world.shapesWhichBelongToNoGroup, bb);
    }




    worldTransformDirty: boolean = true;

    setWorldTransformAndHitPolygonDirty() {
        this.worldTransformDirty = true;
        this.hitPolygonDirty = true;
    }

    public getWorldTransform(): PIXI.Matrix {
        //@ts-ignore
        if (!this.worldTransformDirty) return this.container._worldTransform || PIXI.Matrix.IDENTITY;
        if (this.belongsToGroup != null)
            this.belongsToGroup.getWorldTransform();
        let parent = this.container.parent;

        //@ts-ignore
        this.container._worldTransform ||= new PIXI.Matrix();
        //@ts-ignore
        if (this.belongsToGroup != null) {
            //@ts-ignore
            PIXI.updateWorldTransform(this.container.localTransform, parent._worldTransform, this.container._worldTransform);
        } else {
            //@ts-ignore
            this.container._worldTransform.copyFrom(this.container.localTransform);
            // PIXI.updateWorldTransform(this.container.localTransform, parent.localTransform, this.container._worldTransform);
        }

        this.worldTransformDirty = false;

        //@ts-ignore
        return this.container._worldTransform;
    }

    public borderContainsPoint(x: number, y: number, color: number = -1): boolean {
        return false;
    }

    _setAngle(angle: number) {
        this._rotate(angle - this.angle);
    }

    _bringToFront() {

        if (this.belongsToGroup) {
            this.belongsToGroup.setChildIndex(this, this.belongsToGroup.shapes.length - 1);
            return;
        }

        let parentContainer = this.world.app.stage;
        let highestIndex = parentContainer.children.length - 1;
        parentContainer.setChildIndex(this.container, highestIndex);
        return;

    }

    _sendToBack() {

        if (this.belongsToGroup) {
            this.belongsToGroup.setChildIndex(this, 0);
            return;
        }

        let parentContainer = this.world.app.stage;
        parentContainer.setChildIndex(this.container, 0);
        return;

    }

    _setTintInt(color: number) {
        if (typeof this.container.tint !== 'undefined') {
            this.container.tint = color % 0x1000000;
        }
    }

    _setTintString(color: string) {
        let c = ColorHelper.parseColorToOpenGL(color);
        if (typeof this.container.tint !== 'undefined') {
            this.container.tint = c.color!;
        }
    }

    _setTintColor(color: ColorClass) {
        if(color == null){
            this.container.tint = 0xffffff;
        } else {
            this.container.tint = color._toInt();
        }
    }

    _startTrackingEveryMouseMovement() {
        this.trackMouseMove = true;
    }

    _stopTrackingEveryMouseMovement() {
        this.trackMouseMove = false;
    }

    _directionRelativeTo(otherShape: ShapeClass): DirectionEnum {
        if (otherShape == null) throw new RuntimeExceptionClass(JRC.shapeNullError());
        if (otherShape.isDestroyed) throw new RuntimeExceptionClass(JRC.shapeAlreadyDestroyedError());

        let bb = this.container.getBounds();
        let bb1 = otherShape.container.getBounds();

        let dx1 = bb1.left - bb.right;  // positive if left
        let dx2 = bb.left - bb1.right;  // positive if right

        let dy1 = bb1.top - bb.bottom;  // positive if top
        let dy2 = bb.top - bb1.bottom;  // positive if bottom

        let pairs: { distance: number, ei: DirectionEnum }[] = [];

        if (this.lastMoveDx > 0) {
            pairs.push({ distance: dx1, ei: DirectionEnum.values[3] });
        } else if (this.lastMoveDx < 0) {
            pairs.push({ distance: dx2, ei: DirectionEnum.values[1] });
        }

        if (this.lastMoveDy > 0) {
            pairs.push({ distance: dy1, ei: DirectionEnum.values[0] });
        } else if (this.lastMoveDy < 0) {
            pairs.push({ distance: dy2, ei: DirectionEnum.values[2] });
        }

        if (pairs.length == 0) {
            pairs = [
                { distance: dx1, ei: DirectionEnum.values[3] },
                { distance: dx2, ei: DirectionEnum.values[1] },
                { distance: dy1, ei: DirectionEnum.values[0] },
                { distance: dy2, ei: DirectionEnum.values[2] }
            ]
        }


        let max = pairs[0].distance;
        let ei = pairs[0].ei;
        for (let i = 1; i < pairs.length; i++) {
            if (pairs[i].distance > max) {
                max = pairs[i].distance;
                ei = pairs[i].ei;
            }
        }

        return ei;
    }

    _moveBackFrom(sh1: ShapeClass, keepColliding: boolean) {
        if (sh1 == null) throw new RuntimeExceptionClass(JRC.shapeNullError());
        if (sh1.isDestroyed) throw new RuntimeExceptionClass(JRC.shapeAlreadyDestroyedError());

        // subsequent calls to move destroy values in this.lastMoveDx and this.lastMoveDy, so:
        let lmdx = this.lastMoveDx;
        let lmdy = this.lastMoveDy;

        let length = Math.sqrt(lmdx * lmdx + lmdy * lmdy);
        if (length < 0.001) return;

        if (!this._collidesWith(sh1)) return;

        let parameterMax = 0;       // collision with this parameter
        this._move(-lmdx, -lmdy);

        let currentParameter = -1;  // move to parameterMin

        while (this._collidesWith(sh1)) {
            parameterMax = currentParameter;    // collision at this parameter
            let newParameter = currentParameter * 2;
            this._move(lmdx * (newParameter - currentParameter), lmdy * (newParameter - currentParameter));
            currentParameter = newParameter;
            if ((currentParameter + 1) * length < -100) {
                this._move(lmdx * (-1 - currentParameter), lmdy * (-1 - currentParameter));
                return;
            }
        }
        let parameterMin = currentParameter;

        let isColliding: boolean = false;
        // Situation now: no collision at parameterMin == currentParameter, collision at parameterMax
        while ((parameterMax - parameterMin) * length > 1) {
            let np = (parameterMax + parameterMin) / 2;
            this._move(lmdx * (np - currentParameter), lmdy * (np - currentParameter));
            if (isColliding = this._collidesWith(sh1)) {
                parameterMax = np;
            } else {
                parameterMin = np;
            }
            currentParameter = np;
        }

        if (keepColliding && !isColliding) {
            this._move(lmdx * (parameterMax - currentParameter), lmdy * (parameterMax - currentParameter));
        } else if (isColliding && !keepColliding) {
            this._move(lmdx * (parameterMin - currentParameter), lmdy * (parameterMin - currentParameter));
        }

        this.lastMoveDx = lmdx;
        this.lastMoveDy = lmdy;
    }

    _mj$getWorld$World(t: Thread, callback: CallbackParameter) {
        const w = t.scheduler.interpreter.retrieveObject("WorldClass");
        if (w == undefined) {
            if (this["world3d"] != null) {//equivalent to this instanceof Object3d, other option: t.scheduler.interpreter.retrieveObject("World3dClass") !== undefined
                throw new RuntimeExceptionClass(JRC.actorWorld2dDoesntexistOn3dObjectException());
            }
            throw new RuntimeExceptionClass(JRC.actorWorld2dDoesntexistException());
        }
        t.s.push(w);
    }

}