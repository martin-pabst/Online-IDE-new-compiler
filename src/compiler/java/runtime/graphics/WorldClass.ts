
import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter.ts';
import { Interpreter } from '../../../common/interpreter/Interpreter.ts';
import { Thread } from "../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../common/interpreter/ThreadState.ts";
import { ColorHelper } from '../../lexer/ColorHelper.ts';
import { LibraryDeclarations } from "../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass.ts";
import { ActorManager } from './ActorManager.ts';
import { GroupClass } from './GroupClass.ts';
import { ActorType, IActor } from './IActor.ts';
import { IWorld } from './IWorld.ts';
import { MouseManager } from './MouseManager2D.ts';
import { ShapeClass } from './ShapeClass.ts';
import { GNGEventListenerType, IGNGEventListener } from './gng/IGNGEventListener.ts';
import { GNGEventlistenerManager } from './gng/GNGEventlistenerManager.ts';
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';
import { GraphicSystem } from '../../../common/interpreter/GraphicsManager.ts';
import { ColorClass } from './ColorClass.ts';
import { NullPointerExceptionClass } from '../system/javalang/NullPointerExceptionClass.ts';
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException.ts';
import { DOM } from '../../../../tools/DOM.ts';


export class WorldClass extends ObjectClass implements IWorld, GraphicSystem {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class World" },

        { type: "method", signature: "World()", java: WorldClass.prototype._cj$_constructor_$World$ },
        { type: "method", signature: "World(int width, int height)", java: WorldClass.prototype._cj$_constructor_$World$int$int },

        { type: "method", signature: "void setBackgroundColor(Color colorAsObject)", native: WorldClass.prototype._setBackgroundColorColor, comment: JRC.worldSetBackgroundColorColorComment },
        { type: "method", signature: "void setBackgroundColor(int colorAsRGBInt)", native: WorldClass.prototype._setBackgroundColor, comment: JRC.world3dSetBackgroundColorIntComment },
        { type: "method", signature: "void setBackgroundColor(string colorAsString)", native: WorldClass.prototype._setBackgroundColor, comment: JRC.world3dSetBackgroundColorStringComment },

        { type: "method", signature: "void move(double dx, double dy)", native: WorldClass.prototype._translate, comment: JRC.worldMoveComment },
        { type: "method", signature: "void rotate(double angleInDeg, double centerX, double centerY)", native: WorldClass.prototype._rotate, comment: JRC.worldRotateComment },
        { type: "method", signature: "void scale(double factor, double centerX, double centerY)", native: WorldClass.prototype._scale, comment: JRC.worldScaleComment },


        { type: "method", signature: "void setCoordinateSystem(double left, double top, double width, double height)", native: WorldClass.prototype._setCoordinateSystem, comment: JRC.worldSetCoordinateSystemComment },
        { type: "method", signature: "void setCursor(string cursor)", native: WorldClass.prototype._setCursor, comment: JRC.world3dSetCursorComment },
        { type: "method", signature: "static void clear()", java: WorldClass._mj$clear$, comment: JRC.world3dClearComment },

        { type: "method", signature: "double getWidth()", template: `Math.round(§1.currentWidth)`, comment: JRC.worldGetWidthComment },
        { type: "method", signature: "double getHeight()", template: `Math.round(§1.currentHeight)`, comment: JRC.worldGetHeightComment },
        { type: "method", signature: "double getTop()", template: `Math.round(§1.currentTop)`, comment: JRC.worldGetTopComment },
        { type: "method", signature: "double getLeft()", template: `Math.round(§1.currentLeft)`, comment: JRC.worldGetLeftComment },

        { type: "method", signature: "Group getDefaultGroup()", template: `§1.defaultGroup`, comment: JRC.worldGetDefaultGroupComment },
        { type: "method", signature: "void setDefaultGroup(Group defaultGroup)", template: `§1.defaultGroup = §2;`, comment: JRC.worldSetDefaultGroupComment },

        { type: "method", signature: "void follow(Shape shape, double margin, double xMin, double xMax, double yMin, double yMax)", native: WorldClass.prototype._follow, comment: JRC.worldFollowComment },

        { type: "method", signature: "void addMouseListener(MouseListener mouseListener)", template: `§1.mouseManager.${MouseManager.prototype.addJavaMouseListener.name}(§2);`, comment: JRC.world3dAddMouseListenerComment },

        { type: "method", signature: "static World getWorld()", java: WorldClass._getWorld, comment: JRC.getWorldComment },



    ]

    static type: NonPrimitiveType;

    interpreter!: Interpreter;

    width: number = 800;
    height: number = 600;

    currentLeft: number = 0;
    currentTop: number = 0;
    currentWidth: number = 800;
    currentHeight: number = 600;

    app!: PIXI.Application;

    graphicsDiv?: HTMLDivElement;
    resizeObserver?: ResizeObserver;

    gngEventlistenerManager!: GNGEventlistenerManager;

    defaultGroup?: GroupClass;

    shapesWhichBelongToNoGroup: ShapeClass[] = [];

    shapesNotAffectedByWorldTransforms: ShapeClass[] = [];

    mouseManager!: MouseManager;

    tickerFunction?: (ticker: PIXI.Ticker) => void;


    _cj$_constructor_$World$(t: Thread, callback: CallbackParameter) {
        this.interpreter = t.scheduler.interpreter;
        this._cj$_constructor_$World$int$int(t, callback, 800, 600);
    }

    _cj$_constructor_$World$int$int(t: Thread, callback: CallbackParameter, width: number, height: number) {

        this.interpreter = t.scheduler.interpreter;
        let interpreter = this.interpreter;

        interpreter.graphicsManager?.registerGraphicSystem(this);

        let existingWorld = <WorldClass>interpreter.retrieveObject("WorldClass");
        if (existingWorld) {

            if(this.constructor["type"].identifier != 'World'){
                throw new RuntimeExceptionClass("Es wurde schon ein World-Objekt instanziert.");
            }

            t.s.push(existingWorld);
            this.app?.stage.removeChildren(0, this.app.stage.children.length).forEach(c => c.destroy());
            existingWorld.changeResolution(interpreter, width, height);
            if (callback) callback();
            return existingWorld;
        }

        let oldstate = t.state;
        t.state = ThreadState.waiting;

        interpreter.storeObject("WorldClass", this);

        let graphicsDivParent = <HTMLDivElement>interpreter.graphicsManager?.graphicsDiv;

        let oldGraphicsDivs = graphicsDivParent.getElementsByClassName('pixiWorld');
        for (let i = 0; i < oldGraphicsDivs.length; i++) {
            oldGraphicsDivs[i].remove();
        }

        this.graphicsDiv = DOM.makeDiv(graphicsDivParent, 'pixiWorld');
        this.graphicsDiv.style.overflow = "hidden";

        let hasWorld3D = graphicsDivParent.getElementsByClassName('world3d').length > 0;
        if (hasWorld3D) this.graphicsDiv.style.pointerEvents = "none";


        this.app = new PIXI.Application();

        this.app.init({ backgroundAlpha: hasWorld3D ? 0 : 1, background: '#000000', width: width, height: height, resizeTo: undefined, antialias: true }).then(async () => {

            this.app!.canvas.style.width = "10px";
            this.app!.canvas.style.height = "10px";
            this.graphicsDiv?.appendChild(this.app!.canvas);

            this.resizeObserver = new ResizeObserver(() => { this.changeResolution(interpreter, this.width, this.height); });
            this.resizeObserver.observe(this.graphicsDiv!.parentElement!.parentElement!);

            this.app!.stage.setFromMatrix(new PIXI.Matrix(1, 0, 0, 1, 0, 0));

            this.changeResolution(interpreter, width, height);

            this.addCallbacks(interpreter);

            this.tickerFunction = (ticker: PIXI.Ticker) => {
                this.tick(PIXI.Ticker.shared.elapsedMS, interpreter);
            };

            this.app!.ticker.add(this.tickerFunction);
            this.app!.ticker.maxFPS = 30;
            this.app!.ticker.minFPS = 30;

            interpreter.isExternalTimer = true;

            this.mouseManager = new MouseManager(this, interpreter.graphicsManager?.coordinatesDiv);
            this.mouseManager.registerListeners();

            this.gngEventlistenerManager = new GNGEventlistenerManager(interpreter, this);

            await interpreter.graphicsManager?.initPixiUserSpritesheet();

            t.state = oldstate;

            t.s.push(this);

            if (callback) callback();
        })

    }

    tick(elapsedMS: number, interpreter: Interpreter) {
        interpreter.timerFunction(33);
    }

    addCallbacks(interpreter: Interpreter) {
        let onResetRuntimeCallback = () => {
            interpreter.deleteObject("WorldClass");
            interpreter.eventManager.off(onResetRuntimeCallback);
            interpreter.eventManager.off(onProgramStoppedCallback);
            this.destroyWorld(interpreter);
        }

        let onProgramStoppedCallback = () => {
            if(this.interpreter.getMain().getRepl().state == "standalone") return;
            this.onProgramStopped();
            interpreter.eventManager.off(onProgramStoppedCallback);
            this.mouseManager.removeAllListeners();
        }

        interpreter.eventManager.on("resetRuntime", onResetRuntimeCallback)
        interpreter.eventManager.on("stop", onProgramStoppedCallback)

    }

    destroyWorld(interpreter: Interpreter) {

        this.mouseManager.unregisterListeners();
        this.interpreter.actorManager.clear();
        this.gngEventlistenerManager.clear();

        interpreter.isExternalTimer = false;
        this.app?.destroy({ removeView: true }, {});
        //@ts-ignore
        this.app = undefined;
        this.resizeObserver?.disconnect();
        this.graphicsDiv?.remove();
        interpreter.deleteObject("WorldClass");

    }

    changeResolution(interpreter: Interpreter, width: number, height: number) {
        this.width = width;
        this.height = height;

        this.currentLeft = 0;
        this.currentTop = 0;
        this.currentWidth = width;
        this.currentHeight = height;
        // prevent graphicsDiv from overflowing
        this.app!.canvas.style.width = "10px";
        this.app!.canvas.style.height = "10px";

        this.app?.renderer.resize(width, height, 1);

        let rect = this.graphicsDiv!.parentElement!.parentElement!.getBoundingClientRect();
        if (rect.width == 0 || rect.height == 0) rect = this.graphicsDiv!.parentElement!.getBoundingClientRect();

        let newCanvasWidth: number;
        let newCanvasHeight: number;
        if (width / height > rect.width / rect.height) {
            newCanvasWidth = rect.width;
            newCanvasHeight = rect.width / width * height;
        } else {
            newCanvasHeight = rect.height;
            newCanvasWidth = rect.height / height * width;
        }

        newCanvasHeight = Math.min(newCanvasHeight, rect.height);
        newCanvasWidth = Math.min(newCanvasWidth, rect.width);


        this.app!.canvas.style.width = newCanvasWidth + "px";
        this.app!.canvas.style.height = newCanvasHeight + "px";

        interpreter.graphicsManager?.resizeGraphicsDivHeight();

    }

    onProgramStopped() {

        this.interpreter.deleteObject("WorldClass");

        const stageSize: PIXI.TextureSourceOptions = {
            width: this.app!.screen.width,
            height: this.app!.screen.height,
            antialias: true
        };
        // Create two render textures... these dynamic textures will be used to draw the scene into itself
        let renderTexture = PIXI.RenderTexture.create(stageSize);
        setTimeout(() => {      // outer timeout is needed for Bitmap-objects to get fully uploaded to gpu (see mandelbrot test...)
            if (!this.app) return;
            this.app!.renderer.render({
                container: this.app!.stage,
                target: renderTexture,
                clear: true
            });
            setTimeout(() => { // inner timeout is needed to await rendering to texture
                if (!this.app) return;
                let children = this.app!.stage.children.slice();
                this.app!.stage.removeChildren(0, children.length);
                children.forEach(c => c.destroy());

                let sprite = new PIXI.Sprite(renderTexture);
                sprite.x = 0;
                sprite.y = 0;
                sprite.anchor = 0;
                this.app!.stage.setFromMatrix(new PIXI.Matrix());
                this.app?.stage.addChild(sprite);
            }, 200)
        }, 200)

    }

    hasActors(): boolean {
        return this.mouseManager.hasMouseListeners() || this.gngEventlistenerManager?.hasEventListeners();
    }

    registerGNGEventListener(listener: IGNGEventListener, type: GNGEventListenerType): void {
        this.gngEventlistenerManager.registerEventlistener(listener, type);
    }

    unRegisterGNGEventListener(listener: IGNGEventListener, type: GNGEventListenerType): void {
        this.gngEventlistenerManager.removeEventlistener(listener, type);
    }

    _setBackgroundColor(color: string | number) {
        let renderer = (<PIXI.Renderer>(this.app.renderer));
        if (typeof color == "string") {
            let c = ColorHelper.parseColorToOpenGL(color);
            if (!c.color) return;
            renderer.background.color.setValue(c.color);
        } else {
            renderer.background.color.setValue(color);
        }

    }

    _setBackgroundColorColor(color: ColorClass) {
        let renderer = (<PIXI.Renderer>(this.app.renderer));
        if (color == null) throw new NullPointerExceptionClass(JRC.fsColorIsNullException());
        renderer.background.color = color.red * 0x10000 + color.green * 0x100 + color.blue;
    }



    _rotate(angleInDeg: number, centerX: number, centerY: number) {
        let angleRad = -angleInDeg / 180 * Math.PI;
        let stage = this.app.stage;
        let matrix = new PIXI.Matrix().copyFrom(stage.localTransform);

        stage.localTransform.identity();
        stage.localTransform.translate(-centerX, -centerY);
        stage.localTransform.rotate(angleRad);
        stage.localTransform.translate(centerX, centerY);
        stage.localTransform.prepend(matrix);

        stage.setFromMatrix(stage.localTransform);
        //@ts-ignore
        stage._didLocalTransformChangeId = stage._didChangeId;

        this.computeCurrentWorldBounds();
        this.shapesNotAffectedByWorldTransforms.forEach(
            (shape) => {
                shape._rotate(-angleInDeg, centerX, centerY);
            });

    }

    _scale(factor: number, centerX: number, centerY: number) {
        if (Math.abs(factor) < 1e-14) return;
        let stage = this.app.stage;
        let matrix = new PIXI.Matrix().copyFrom(stage.localTransform);

        stage.localTransform.identity();
        stage.localTransform.translate(-centerX, -centerY);
        stage.localTransform.scale(factor, factor);
        stage.localTransform.translate(centerX, centerY);
        stage.localTransform.prepend(matrix);

        stage.setFromMatrix(stage.localTransform);
        //@ts-ignore
        stage._didLocalTransformChangeId = stage._didChangeId;

        this.computeCurrentWorldBounds();
        this.shapesNotAffectedByWorldTransforms.forEach(
            (shape) => {
                shape._scale(1 / factor, centerX, centerY);
            });

    }

    _translate(dx: number, dy: number) {
        let stage = this.app.stage;
        let matrix = new PIXI.Matrix().copyFrom(stage.localTransform);

        stage.localTransform.identity();
        stage.localTransform.translate(dx, dy);
        stage.localTransform.prepend(matrix);

        stage.setFromMatrix(stage.localTransform);
        //@ts-ignore
        stage._didLocalTransformChangeId = stage._didChangeId;

        this.computeCurrentWorldBounds();
        this.shapesNotAffectedByWorldTransforms.forEach(
            (shape) => {
                shape._move(-dx, -dy);
            });

        stage.worldTransform.copyFrom(stage.localTransform);
        this.shapesWhichBelongToNoGroup.forEach((shape) => shape.worldTransformDirty = true);
    }

    _setCoordinateSystem(left: number, top: number, width: number, height: number) {
        let stage = this.app.stage;

        stage.localTransform.identity();
        stage.localTransform.translate(-left, -top);
        stage.localTransform.scale(this.width / width, this.height / height);

        stage.setFromMatrix(stage.localTransform);
        //@ts-ignore
        stage._didLocalTransformChangeId = stage._didChangeId;

        this.computeCurrentWorldBounds();
        let inverseFactor = width / this.width;
        this.shapesNotAffectedByWorldTransforms.forEach(
            (shape) => {
                shape._scale(inverseFactor, left, top);
                shape._move(left, top);
            });

    }

    computeCurrentWorldBounds() {

        let p1: PIXI.Point = new PIXI.Point(0, 0);
        this.app.stage.localTransform.applyInverse(p1, p1);

        let p2: PIXI.Point = new PIXI.Point(this.width, this.height);
        this.app.stage.localTransform.applyInverse(p2, p2);

        this.currentLeft = p1.x;
        this.currentTop = p1.y;
        this.currentWidth = Math.abs(p2.x - p1.x);
        this.currentHeight = Math.abs(p2.y - p1.y);

    }

    _setCursor(cursor: string) {
        this.app.canvas.style.cursor = cursor;
    }

    static _mj$clear$(t: Thread) {

        let existingWorld = <WorldClass>t.scheduler.interpreter.retrieveObject("WorldClass");
        if (!existingWorld) return;

        while (existingWorld.shapesWhichBelongToNoGroup.length > 0) {
            existingWorld.shapesWhichBelongToNoGroup.pop()?.destroy();
        }
    }

    getIdentifier(): string {
        return "2D-World";
    }

    _follow(shape: ShapeClass, margin: number, xMin: number, xMax: number, yMin: number, yMax: number) {
        if (shape == null) throw new RuntimeExceptionClass(JRC.shapeNullError());
        if (shape.isDestroyed) throw new RuntimeExceptionClass(JRC.shapeAlreadyDestroyedError());

        let moveX: number = 0;
        let moveY: number = 0;

        let shapeX: number = shape._getCenterX();
        let shapeY: number = shape._getCenterY();

        let outsideRight = shapeX - (this.currentLeft + this.currentWidth - margin);
        if (outsideRight > 0 && this.currentLeft + this.currentWidth < xMax) {
            moveX = -outsideRight;
        }

        let outsideLeft = (this.currentLeft + margin) - shapeX;
        if (outsideLeft > 0 && this.currentLeft > xMin) {
            moveX = outsideLeft;
        }

        let outsideBottom = shapeY - (this.currentTop + this.currentHeight - margin);
        if (outsideBottom > 0 && this.currentTop + this.currentHeight <= yMax) {
            moveY = -outsideBottom;
        }

        let outsideTop = (this.currentTop + margin) - shapeY;
        if (outsideTop > 0 && this.currentTop >= yMin) {
            moveY = outsideTop;
        }

        if (moveX != 0 || moveY != 0) {
            let stage = this.app!.stage;
            let matrix = new PIXI.Matrix().copyFrom(stage.localTransform);
            stage.localTransform.identity();
            stage.localTransform.translate(moveX, moveY);
            stage.localTransform.prepend(matrix);

            stage.setFromMatrix(stage.localTransform);

            //@ts-ignore
            stage._didLocalTransformChangeId = stage._didChangeId;

            this.computeCurrentWorldBounds();
            this.shapesNotAffectedByWorldTransforms.forEach(
                (shape) => {
                    shape._move(-moveX, -moveY);
                });
        }

    }

    static _getWorld(t: Thread) {
        const w = t.scheduler.interpreter.retrieveObject("WorldClass");
        if (w == undefined) {
            throw new RuntimeExceptionClass(JRC.actorWorld2dDoesntexistException());
        }
        t.s.push(w);
    }

}

