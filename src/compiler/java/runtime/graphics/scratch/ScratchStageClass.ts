import * as PIXI from "pixi.js";
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { KeyDownListener } from "../../../../common/interpreter/KeyboardManager";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ClassClass } from "../../system/ClassClass";
import { StringClass } from "../../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../../system/javalang/RuntimeException";
import { ActorClass } from "../ActorClass";
import { IWorld } from "../IWorld";
import { InternalMouseListener, MouseEventKind } from "../MouseManager2D";
import { KeyCodeEnum } from "./KeyCodeEnum";
import { MouseCodeEnum } from "./MouseCodeEnum";
import { ScratchCameraClass } from "./ScratchCameraClass";
import { ScratchColorClass } from "./ScratchColorClass";
import { ScratchCostumes } from "./ScratchCostumes";
import { DEBUG_COLOR, DEBUG_FONT_FAMILY, DEBUG_FONT_SIZE, round2, roundInt } from "./ScratchDebug";
import { SCRATCH_FONT_FAMILY, loadScratchFont } from "./ScratchFont";
import { applyCameraTransform, createScratchLayers, ScratchLayers } from "./ScratchLayers";
import { scratchSpriteList } from "./ScratchLists";
import { ScratchPenClass } from "./ScratchPenClass";
import { IScratchEventReceiver, ScratchRuntimeManager } from "./ScratchRuntimeManager";
import { ScratchSoundBank } from "./ScratchSounds";
import { ScratchSpriteClass } from "./ScratchSpriteClass";
import { ScratchTextClass } from "./ScratchTextClass";
import { ScratchTimerClass } from "./ScratchTimerClass";
import {
    beginScratchStages, IScratchStageLike, isScratchStageActive, registerScratchStage,
    scratchStagesRunning,
} from "./ScratchStages";
import { beginScratchProgram, desktopOnly, desktopOnlyValue } from "./ScratchUnsupported";
import { BooleanSupplierInterface } from "./BooleanSupplierInterface";
import { ScratchVector2Class } from "./ScratchVector2Class";
import { SRC } from "./ScratchLibraryComments";

/** Upstream's Text starts at 14pt, which is what display() is drawn in. */
const DISPLAY_FONT_SIZE = 14;

/**
 * A scene, mirroring org.openpatch.scratch.Stage (core subset).
 *
 * The first stage a program builds owns the IDE WorldClass singleton (created
 * lazily/async), resets the program timer and loads the built-in costume
 * atlases. Further stages share that world and wait off screen until
 * Window.setStage()/transitionToStage() brings them up; only the active stage
 * draws, runs its overridable run() every frame — via ActorClass — and receives
 * input. Coordinate system is Scratch's: centre origin, y up (conversion lives
 * in ScratchSpriteClass).
 */
export class ScratchStageClass extends ActorClass implements InternalMouseListener, IScratchStageLike {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: "org.openpatch.scratch", signature: "class Stage extends Actor", comment: SRC.stageClassComment },

        { type: "method", signature: "Stage()", java: ScratchStageClass.prototype._cj$_constructor_$Stage$, comment: SRC.stageConstructorComment },
        { type: "method", signature: "Stage(int width, int height)", java: ScratchStageClass.prototype._cj$_constructor_$Stage$int$int, comment: SRC.stageConstructor2Comment },
        { type: "method", signature: "Stage(int width, int height, string assets)", java: ScratchStageClass.prototype._cj$_constructor_$Stage$int$int$string, comment: SRC.stageConstructor3Comment },

        { type: "method", signature: "void run()", java: ScratchStageClass.prototype._mj$run$void$, comment: SRC.stageRunComment },

        // overridable event hooks
        { type: "method", signature: "void whenIReceive(String message)", java: ScratchStageClass.prototype._mj$whenIReceive$void$String, comment: SRC.stageWhenIReceiveComment },
        { type: "method", signature: "void whenKeyPressed(KeyCode key)", java: ScratchStageClass.prototype._mj$whenKeyPressed$void$KeyCode, comment: SRC.stageWhenKeyPressedComment },
        { type: "method", signature: "void whenKeyReleased(KeyCode key)", java: ScratchStageClass.prototype._mj$whenKeyReleased$void$KeyCode, comment: SRC.stageWhenKeyReleasedComment },
        { type: "method", signature: "void whenMouseClicked(MouseCode button)", java: ScratchStageClass.prototype._mj$whenMouseClicked$void$MouseCode, comment: SRC.stageWhenMouseClickedComment },
        { type: "method", signature: "void whenMouseMoved(double x, double y)", java: ScratchStageClass.prototype._mj$whenMouseMoved$void$double$double, comment: SRC.stageWhenMouseMovedComment },
        { type: "method", signature: "void whenMouseWheelMoved(int steps)", java: ScratchStageClass.prototype._mj$whenMouseWheelMoved$void$int, comment: SRC.stageWhenMouseWheelMovedComment },

        { type: "method", signature: "void whenBackdropSwitches(String name)", java: ScratchStageClass.prototype._mj$whenBackdropSwitches$void$String, comment: SRC.stageWhenBackdropSwitchesComment },

        { type: "method", signature: "void broadcast(String message)", native: ScratchStageClass.prototype._broadcast, comment: SRC.stageBroadcastComment },

        { type: "method", signature: "void add(Sprite sprite)", java: ScratchStageClass.prototype._mj$add$void$Sprite, comment: SRC.stageAddComment },
        { type: "method", signature: "void add(Pen pen)", native: ScratchStageClass.prototype._addPen, comment: SRC.stageAdd2Comment },
        { type: "method", signature: "void add(Text text)", java: ScratchStageClass.prototype._mj$add$void$Text, comment: SRC.stageAdd3Comment },
        { type: "method", signature: "void remove(Text text)", native: ScratchStageClass.prototype._removeText, comment: SRC.stageRemoveComment },
        { type: "method", signature: "void remove(Pen pen)", native: ScratchStageClass.prototype._removePen, comment: SRC.stageRemove2Comment },
        { type: "method", signature: "void remove(Sprite sprite)", native: ScratchStageClass.prototype._remove, comment: SRC.stageRemove3Comment },
        { type: "method", signature: "void removeAll()", native: ScratchStageClass.prototype._removeAll, comment: SRC.stageRemoveAllComment },
        { type: "method", signature: "void remove(Class<? extends Sprite> c)", native: ScratchStageClass.prototype._removeOfClass, comment: SRC.stageRemove4Comment },
        { type: "method", signature: "List<Sprite> getAll()", java: ScratchStageClass.prototype._mj$getAll$List$, comment: SRC.stageGetAllComment },
        { type: "method", signature: "<T extends Sprite> List<T> find(Class<T> c)", java: ScratchStageClass.prototype._mj$find$List$Class, comment: SRC.stageFindComment },
        { type: "method", signature: "<T extends Sprite> int count(Class<T> c)", native: ScratchStageClass.prototype._count, comment: SRC.stageCountComment },

        // backdrops
        { type: "method", signature: "void addBackdrop(string name)", java: ScratchStageClass.prototype._mj$addBackdrop$void$string, comment: SRC.stageAddBackdropComment },
        { type: "method", signature: "void addBackdrop(string name, string imagePath)", java: ScratchStageClass.prototype._mj$addBackdrop$void$string$string, comment: SRC.stageAddBackdrop2Comment },
        { type: "method", signature: "void addBackdrop(string name, string imagePath, boolean stretch)", java: ScratchStageClass.prototype._mj$addBackdrop$void$string$string$boolean, comment: SRC.stageAddBackdrop3Comment },
        { type: "method", signature: "void switchBackdrop(string name)", native: ScratchStageClass.prototype._switchBackdrop, comment: SRC.stageSwitchBackdropComment },
        { type: "method", signature: "void nextBackdrop()", native: ScratchStageClass.prototype._nextBackdrop, comment: SRC.stageNextBackdropComment },
        { type: "method", signature: "void previousBackdrop()", native: ScratchStageClass.prototype._previousBackdrop, comment: SRC.stagePreviousBackdropComment },
        { type: "method", signature: "void randomBackdrop()", native: ScratchStageClass.prototype._randomBackdrop, comment: SRC.stageRandomBackdropComment },
        { type: "method", signature: "string getCurrentBackdropName()", native: ScratchStageClass.prototype._getCurrentBackdropName, comment: SRC.stageGetCurrentBackdropNameComment },
        { type: "method", signature: "int getCurrentBackdropIndex()", native: ScratchStageClass.prototype._getCurrentBackdropIndex, comment: SRC.stageGetCurrentBackdropIndexComment },

        // sound
        { type: "method", signature: "void addSound(string name)", native: ScratchStageClass.prototype._addSound, comment: SRC.stageAddSoundComment },
        { type: "method", signature: "void addSound(string name, string soundPath)", native: ScratchStageClass.prototype._addSound2, comment: SRC.stageAddSound2Comment },
        { type: "method", signature: "void playSound(string name)", native: ScratchStageClass.prototype._playSound, comment: SRC.stagePlaySoundComment },
        { type: "method", signature: "void stopSound(string name)", native: ScratchStageClass.prototype._stopSound, comment: SRC.stageStopSoundComment },
        { type: "method", signature: "void stopAllSounds()", native: ScratchStageClass.prototype._stopAllSounds, comment: SRC.stageStopAllSoundsComment },
        { type: "method", signature: "boolean isSoundPlaying(string name)", native: ScratchStageClass.prototype._isSoundPlaying, comment: SRC.stageIsSoundPlayingComment },
        { type: "method", signature: "void setVolume(double percent)", native: ScratchStageClass.prototype._setVolume, comment: SRC.stageSetVolumeComment },
        { type: "method", signature: "void changeVolume(double step)", native: ScratchStageClass.prototype._changeVolume, comment: SRC.stageChangeVolumeComment },
        { type: "method", signature: "double getVolume()", native: ScratchStageClass.prototype._getVolume, comment: SRC.stageGetVolumeComment },

        // background colour
        { type: "method", signature: "void setColor(double h)", native: ScratchStageClass.prototype._setColorHue, comment: SRC.stageSetColorComment },
        { type: "method", signature: "void setColor(double r, double g, double b)", native: ScratchStageClass.prototype._setColorRGB, comment: SRC.stageSetColor2Comment },
        { type: "method", signature: "void setColor(Color c)", native: ScratchStageClass.prototype._setColorObj, comment: SRC.stageSetColor3Comment },
        { type: "method", signature: "Color getColor()", native: ScratchStageClass.prototype._getColor, comment: SRC.stageGetColorComment },
        { type: "method", signature: "void changeColor(double h)", native: ScratchStageClass.prototype._changeColor, comment: SRC.stageChangeColorComment },

        { type: "method", signature: "Camera getCamera()", native: ScratchStageClass.prototype._getCamera, comment: SRC.stageGetCameraComment },

        // backdrop tint and transparency
        { type: "method", signature: "void setTint(double r, double g, double b)", native: ScratchStageClass.prototype._setTintRGB, comment: SRC.stageSetTintComment },
        { type: "method", signature: "void setTint(double h)", native: ScratchStageClass.prototype._setTintHue, comment: SRC.stageSetTint2Comment },
        { type: "method", signature: "void changeTint(double step)", native: ScratchStageClass.prototype._changeTint, comment: SRC.stageChangeTintComment },
        { type: "method", signature: "void setTransparency(double transparency)", native: ScratchStageClass.prototype._setTransparency, comment: SRC.stageSetTransparencyComment },
        { type: "method", signature: "void changeTransparency(double step)", native: ScratchStageClass.prototype._changeTransparency, comment: SRC.stageChangeTransparencyComment },

        // debugging and program control
        { type: "method", signature: "void setDebug(boolean debug)", native: ScratchStageClass.prototype._setDebug, comment: SRC.stageSetDebugComment },
        { type: "method", signature: "boolean isDebug()", native: ScratchStageClass.prototype._isDebug, comment: SRC.stageIsDebugComment },
        { type: "method", signature: "void debug(Object... values)", native: ScratchStageClass.prototype._debug, comment: SRC.stageDebugComment },
        { type: "method", signature: "void waitUntil(BooleanSupplier condition)", java: ScratchStageClass.prototype._mj$waitUntil$void$BooleanSupplier, comment: SRC.stageWaitUntilComment },
        { type: "method", signature: "void exit()", native: ScratchStageClass.prototype._exit, comment: SRC.stageExitComment },
        { type: "method", signature: "void setCursor(string path)", native: ScratchStageClass.prototype._setCursor, comment: SRC.stageSetCursorComment },
        { type: "method", signature: "void setCursor(string path, int x, int y)", native: ScratchStageClass.prototype._setCursor3, comment: SRC.stageSetCursor2Comment },

        // desktop-only extensions
        { type: "method", signature: "Pixels getPixels()", native: ScratchStageClass.prototype._getPixels, comment: SRC.stageGetPixelsComment },
        { type: "method", signature: "Shaders getShaders()", native: ScratchStageClass.prototype._getShaders, comment: SRC.stageGetShadersComment },
        { type: "method", signature: "Sorting getSorting()", native: ScratchStageClass.prototype._getSorting, comment: SRC.stageGetSortingComment },
        { type: "method", signature: "int getWidth()", native: ScratchStageClass.prototype._getWidth, comment: SRC.stageGetWidthComment },
        { type: "method", signature: "int getHeight()", native: ScratchStageClass.prototype._getHeight, comment: SRC.stageGetHeightComment },

        { type: "method", signature: "boolean isKeyPressed(KeyCode key)", native: ScratchStageClass.prototype._isKeyPressed, comment: SRC.stageIsKeyPressedComment },
        { type: "method", signature: "double getMouseX()", native: ScratchStageClass.prototype._getMouseX, comment: SRC.stageGetMouseXComment },
        { type: "method", signature: "double getMouseY()", native: ScratchStageClass.prototype._getMouseY, comment: SRC.stageGetMouseYComment },
        { type: "method", signature: "Vector2 getMouse()", native: ScratchStageClass.prototype._getMouse, comment: SRC.stageGetMouseComment },
        { type: "method", signature: "boolean isMouseDown()", native: ScratchStageClass.prototype._isMouseDown, comment: SRC.stageIsMouseDownComment },

        { type: "method", signature: "Timer getTimer()", native: ScratchStageClass.prototype._getTimer, comment: SRC.stageGetTimerComment },
        { type: "method", signature: "Timer getTimer(string name)", native: ScratchStageClass.prototype._getNamedTimer, comment: SRC.stageGetTimer2Comment },
        { type: "method", signature: "double getDeltaTime()", native: ScratchStageClass.prototype._getDeltaTime, comment: SRC.stageGetDeltaTimeComment },
        { type: "method", signature: "double getFrameRate()", native: ScratchStageClass.prototype._getFrameRate, comment: SRC.stageGetFrameRateComment },

        { type: "method", signature: "void eraseAll()", native: ScratchStageClass.prototype._eraseAll, comment: SRC.stageEraseAllComment },
        { type: "method", signature: "void display(string text)", native: ScratchStageClass.prototype._display, comment: SRC.stageDisplayComment },
        { type: "method", signature: "void display(string text, int millis)", native: ScratchStageClass.prototype._displayFor, comment: SRC.stageDisplay2Comment },

        { type: "method", signature: "void wait(int millis)", java: ScratchStageClass.prototype._mj$wait$void$int, comment: SRC.stageWaitComment },

        { type: "method", signature: "void ask(string question)", native: ScratchStageClass.prototype._ask, comment: SRC.stageAskComment },
        { type: "method", signature: "string getAnswer()", native: ScratchStageClass.prototype._getAnswer, comment: SRC.stageGetAnswerComment },
        { type: "method", signature: "boolean isAsking()", native: ScratchStageClass.prototype._isAsking, comment: SRC.stageIsAskingComment },

        { type: "method", signature: "int pickRandom(int from, int to)", native: ScratchStageClass.prototype._pickRandom, comment: SRC.stagePickRandomComment },
    ];

    static type: NonPrimitiveType;

    world!: IWorld;
    sprites: ScratchSpriteClass[] = [];
    runtime!: ScratchRuntimeManager;

    /** Read by sprites and pens via scratchLayerOf(); see ScratchLayers.ts. */
    scratchLayers?: ScratchLayers;

    camera: ScratchCameraClass = new ScratchCameraClass();

    private backdrops: { name: string; texture: PIXI.Texture; stretch: boolean }[] = [];
    private currentBackdrop: number = -1;
    private soundBank: ScratchSoundBank = new ScratchSoundBank();
    private timers: Map<string, ScratchTimerClass> = new Map();

    _cj$_constructor_$Stage$(t: Thread, callback: CallbackParameter) {
        this._cj$_constructor_$Stage$int$int(t, callback, 480, 360);
    }

    /**
     * The assets path upstream reads images and sounds from. There is no such
     * folder in the browser — only the built-in names — so the path is accepted
     * and ignored, which at least lets a program written for the desktop run.
     */
    _cj$_constructor_$Stage$int$int$string(
        t: Thread, callback: CallbackParameter, width: number, height: number, _assets: string,
    ) {
        this._cj$_constructor_$Stage$int$int(t, callback, width, height);
    }

    _cj$_constructor_$Stage$int$int(t: Thread, callback: CallbackParameter, width: number, height: number) {
        const interpreter = t.scheduler.interpreter;

        const finish = (world: IWorld) => {
            this.world = world;
            // beginScratchStages tells the first stage of a run from a later one:
            // the World is new for every run, and the stages of the previous run
            // go with it
            const firstStageOfRun = beginScratchStages(world);
            if (firstStageOfRun) {
                beginScratchProgram(interpreter);
            }
            this.scratchLayers = createScratchLayers(world.app.stage);
            this.scratchLayers.root.visible = false;
            world.mouseManager.internalMouseListeners.push(this);
            this.runtime = ScratchRuntimeManager.forInterpreter(interpreter, world);
            // the first stage of the program goes on screen, as it does upstream,
            // where the Stage constructor calls setStage() while there is no window
            registerScratchStage(this);

            const oldState = t.state;
            t.state = ThreadState.waiting;
            // Sounds need no loading step: their URLs come from the bundler, and the
            // OGG files are fetched when a sound is first played.
            Promise.all([ScratchCostumes.load(), loadScratchFont()]).then(() => {
                // The clock starts where the program does, which is here and not
                // where the loading began: the thread is parked until the
                // spritesheets are there, and a clock started before that wait
                // counts it, so Timer.millis() is already that old in the program's
                // first frame. How much depends on what the browser had cached -
                // nothing on a cold load, which is where it was measured at 7s.
                if (firstStageOfRun) ScratchTimerClass.resetProgramStart();
                t.state = oldState;
                t.s.push(this);
                this.registerIfNobodyElseWill(t, callback);
                if (callback) callback();
            });
        };

        const existing = interpreter.retrieveObject("WorldClass") as IWorld;
        if (!existing) {
            new t.classes["World"]()._cj$_constructor_$World$int$int(t, () => {
                finish(t.s.pop());
            }, width, height);
        } else {
            // a second stage shares the window it finds, the same way upstream's
            // later stages get the size the window was created with
            finish(existing);
        }
    }

    // ---- being the stage on screen ----
    isActive(): boolean { return isScratchStageActive(this); }

    /**
     * Come on screen. Everything the stages share — the window's background
     * colour, the camera transform, which stage global lookups resolve to — has
     * to be (re-)established here, because the other stage just had it set to
     * its own values.
     */
    _activate(): void {
        if (this.scratchLayers) this.scratchLayers.root.visible = true;
        if (!this.world) return;
        this.applyBgColor();
        this._applyCamera();
    }

    _deactivate(): void {
        if (this.scratchLayers) this.scratchLayers.root.visible = false;
        if (this.debugEnabled) this.clearDebugOverlay();
    }

    // ---- per-frame ----
    /**
     * Only the stage on screen steps. Upstream reaches exactly one stage's render
     * loop per frame, and holds even that one still while a transition fades the
     * outgoing picture away.
     *
     * <p>run() must not be reached before the subclass constructor has finished.
     * The stage goes on screen from the base constructor — that is where upstream
     * puts the first stage of a program too — so between that moment and the end
     * of `new MyStage()` there is a stage on screen whose fields the program has
     * not assigned yet, and a run() touching one of them fails with a
     * NullPointerException. It showed up on the second run of a program, once the
     * costumes were in the cache and the constructor no longer waited for them.
     * listenersRegistered says the constructor is through: the compiler calls
     * _registerListeners once it is (TermCodeGenerator.invokeConstructor), and
     * where there is no subclass the base constructor does it itself.
     */
    _mj$act$void$(t: Thread, callback: CallbackParameter): void {
        if (!this.listenersRegistered || !this.isActive() || !scratchStagesRunning()) {
            if (callback) callback();
            return;
        }
        this._mj$run$void$(t, callback);
    }

    /**
     * Called from the PIXI ticker after the program's threads have had their
     * slice of the frame and before the renderer paints it (see startPreRender
     * in ScratchStages). Both of these describe where things are *now*, so they
     * have to be worked out here: done from act(), which runs at the start of
     * the frame, the camera and the debug overlay were a frame behind whatever
     * the program moved in between.
     */
    _preRender(): void {
        if (!this.isActive() || !this.world?.app) return;
        this._applyCamera();
        if (this.debugEnabled) this.renderDebugOverlay();
    }

    /** Push the camera's position/zoom onto the container that holds the world. */
    _applyCamera() {
        applyCameraTransform(this.scratchLayers, this.world.width, this.world.height,
            this.camera.x, this.camera.y, this.camera.zoom);
    }
    _mj$run$void$(_t: Thread, callback: CallbackParameter): void { if (callback) callback(); }

    // ---- overridable event hooks (empty defaults) ----
    _mj$whenIReceive$void$String(_t: Thread, callback: CallbackParameter, _message: StringClass): void { if (callback) callback(); }
    _mj$whenBackdropSwitches$void$String(_t: Thread, callback: CallbackParameter, _name: StringClass): void { if (callback) callback(); }
    _mj$whenKeyPressed$void$KeyCode(_t: Thread, callback: CallbackParameter, _key: KeyCodeEnum): void { if (callback) callback(); }
    _mj$whenKeyReleased$void$KeyCode(_t: Thread, callback: CallbackParameter, _key: KeyCodeEnum): void { if (callback) callback(); }
    _mj$whenMouseClicked$void$MouseCode(_t: Thread, callback: CallbackParameter, _code: MouseCodeEnum): void { if (callback) callback(); }
    _mj$whenMouseMoved$void$double$double(_t: Thread, callback: CallbackParameter, _x: number, _y: number): void { if (callback) callback(); }
    _mj$whenMouseWheelMoved$void$int(_t: Thread, callback: CallbackParameter, _steps: number): void { if (callback) callback(); }

    private listenersRegistered = false;

    /**
     * Registers this stage for act() and for the Scratch events, unless the
     * compiler is going to do it.
     *
     * <p>TermCodeGenerator.invokeConstructor only arranges that call for classes
     * the program itself declares — `!klassType.isLibraryType`. A program that
     * writes `new Stage(600, 240)` rather than subclassing therefore never
     * acted: the camera transform was never re-applied and setDebug(true) drew
     * nothing, because the debug overlay is painted once per frame from act().
     * It cannot be done in the constructor for a subclass, because act() must
     * not reach an object whose own constructor has not finished; but where no
     * callback came in there is no subclass constructor left to wait for.
     */
    private registerIfNobodyElseWill(t: Thread, callback: CallbackParameter) {
        if (!callback) this._registerListeners(t);
    }

    // Called by the compiler after the constructor completes; register overridden hooks.
    _registerListeners(t: Thread): void {
        if (this.listenersRegistered) return;
        this.listenersRegistered = true;
        super._registerListeners(t);
        this.runtime.register(this as IScratchEventReceiver, {
            iReceive: this._mj$whenIReceive$void$String !== ScratchStageClass.prototype._mj$whenIReceive$void$String,
            keyPressed: this._mj$whenKeyPressed$void$KeyCode !== ScratchStageClass.prototype._mj$whenKeyPressed$void$KeyCode,
            keyReleased: this._mj$whenKeyReleased$void$KeyCode !== ScratchStageClass.prototype._mj$whenKeyReleased$void$KeyCode,
            mouseClicked: this._mj$whenMouseClicked$void$MouseCode !== ScratchStageClass.prototype._mj$whenMouseClicked$void$MouseCode,
            backdropSwitches: this._mj$whenBackdropSwitches$void$String !== ScratchStageClass.prototype._mj$whenBackdropSwitches$void$String,
            mouseMoved: this._mj$whenMouseMoved$void$double$double !== ScratchStageClass.prototype._mj$whenMouseMoved$void$double$double,
            mouseWheelMoved: this._mj$whenMouseWheelMoved$void$int !== ScratchStageClass.prototype._mj$whenMouseWheelMoved$void$int,
        });
    }

    /** The stage an event receiver belongs to; for a stage, itself. */
    _scratchStage(): object { return this; }

    /**
     * Declared as `String message`, so the argument arrives boxed as a StringClass.
     * Upstream walks its own sprite list, so the message stays on this stage.
     */
    _broadcast(message: StringClass) { this.runtime.broadcast(message, this); }

    // ---- sprites ----
    /**
     * Upstream runs whenAddedToStage inside add(), so anything the program does
     * to the sprite on the next line already sees the costume. Running it on the
     * caller's thread keeps that order: the callback is only invoked once the
     * hook has finished, so `add(s); s.stamp();` behaves as written.
     */
    _mj$add$void$Sprite(t: Thread, callback: CallbackParameter, sprite: ScratchSpriteClass) {
        if (!sprite || this.sprites.indexOf(sprite) >= 0) {
            if (callback) callback();
            return;
        }
        this.sprites.push(sprite);
        // a sprite built before this stage was on screen drew itself into
        // whichever stage was, so it has to be moved over now
        sprite.attachToStage(this);
        const hook = (sprite as any)._mj$whenAddedToStage$void$;
        if (!hook) {
            if (callback) callback();
            return;
        }
        hook.call(sprite, t, callback);
    }

    /** A stage-owned Pen simply needs a world to draw into. */
    _addPen(pen: ScratchPenClass) {
        if (!pen) return;
        pen.stage = this;
        pen.attachToWorld(this.world);
    }

    /** Texts get the same treatment: their hooks run before add() returns. */
    _mj$add$void$Text(t: Thread, callback: CallbackParameter, text: ScratchTextClass) {
        if (!text) {
            if (callback) callback();
            return;
        }
        text.world = this.world;
        text.attachToStage(this);
        text._mj$addedToStage$void$Stage(t, callback, this);
    }
    _removeText(text: ScratchTextClass) {
        if (!text) return;
        text._remove();
        if (text.stage === this) text.stage = undefined;
    }
    _removePen(pen: ScratchPenClass) { pen?._eraseAll(); }
    _remove(sprite: ScratchSpriteClass) {
        const i = this.sprites.indexOf(sprite);
        if (i >= 0) this.sprites.splice(i, 1);
        if (sprite) sprite.stage = undefined;
        sprite?.destroy();
    }
    _removeAll() {
        for (const s of this.sprites.slice()) { s.stage = undefined; s.destroy(); }
        this.sprites.length = 0;
    }

    /**
     * A Java class literal arrives as a ClassClass, whose `type` carries the
     * generated JS constructor — a plain instanceof therefore matches subclasses
     * too, the same semantics as Class.isInstance().
     */
    private spritesOfClass(c: ClassClass): ScratchSpriteClass[] {
        const klass = c?.type?.runtimeClass;
        if (!klass) return [];
        return this.sprites.filter(s => !s.isDestroyed && s instanceof (klass as any));
    }

    _removeOfClass(c: ClassClass) {
        for (const s of this.spritesOfClass(c)) this._remove(s);
    }
    // java.util.List or, in the library "scratch-nrw", the nrw List; see scratchSpriteList
    _mj$getAll$List$(t: Thread, callback: CallbackParameter) {
        t.s.push(scratchSpriteList(t, this.sprites.slice()));
        if (callback) callback();
    }
    _mj$find$List$Class(t: Thread, callback: CallbackParameter, c: ClassClass) {
        t.s.push(scratchSpriteList(t, this.spritesOfClass(c)));
        if (callback) callback();
    }
    _count(c: ClassClass): number { return this.spritesOfClass(c).length; }

    // ---- backdrops ----
    /**
     * Backdrops are drawn full-stage behind everything else. `stretch` scales the
     * image to the stage size; otherwise it is centred at its natural size.
     */
    private backdropSprite?: PIXI.Sprite;

    _mj$addBackdrop$void$string(t: Thread, callback: CallbackParameter, name: string) {
        this.loadBackdrop(t, name, name, false, callback);
    }

    _mj$addBackdrop$void$string$string(t: Thread, callback: CallbackParameter, name: string, imagePath: string) {
        this.loadBackdrop(t, name, imagePath, false, callback);
    }

    _mj$addBackdrop$void$string$string$boolean(t: Thread, callback: CallbackParameter, name: string, imagePath: string, stretch: boolean) {
        this.loadBackdrop(t, name, imagePath, stretch, callback);
    }

    private loadBackdrop(t: Thread, name: string, imagePath: string, stretch: boolean, callback: CallbackParameter) {
        if (this.backdrops.some(b => b.name === name)) {
            if (callback) callback();
            return;
        }
        const oldState = t.state;
        t.state = ThreadState.waiting;
        ScratchCostumes.loadTexture(imagePath).then(texture => {
            this.backdrops.push({ name, texture, stretch });
            if (this.currentBackdrop < 0) this._applyBackdropIndex(this.backdrops.length - 1);
            t.state = oldState;
            if (callback) callback();
        }).catch(reason => {
            t.state = oldState;
            t.throwRuntimeExceptionOnLastExecutedStep(new RuntimeExceptionClass(
                `Bild konnte nicht geladen werden / could not load image '${imagePath}': ${reason}`
            ));
        });
    }

    private _applyBackdropIndex(index: number) {
        if (index < 0 || index >= this.backdrops.length) return;
        this.currentBackdrop = index;
        const bd = this.backdrops[index];

        if (this.backdropSprite && !this.backdropSprite.destroyed) this.backdropSprite.destroy();
        const sprite = new PIXI.Sprite(bd.texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(this.world.width / 2, this.world.height / 2);
        if (bd.stretch) {
            sprite.width = this.world.width;
            sprite.height = this.world.height;
        }
        // the backdrop layer sits below the pen and the background stamps
        (this.scratchLayers?.backdrop ?? this.world.app.stage).addChild(sprite);
        this.backdropSprite = sprite;
        // the sprite is brand new, so whatever was set on this backdrop before
        // has to be put back on it
        this.applyBackdropTint();
        this.applyBackdropTransparency();
        this.fireBackdropSwitch(bd.name);
    }

    /** Notify this stage and its sprites, if they override whenBackdropSwitches. */
    private fireBackdropSwitch(name: string) {
        this.runtime?.backdropSwitch(name, this);
    }

    _switchBackdrop(name: string) {
        const i = this.backdrops.findIndex(b => b.name === name);
        if (i < 0) {
            const available = this.backdrops.length ? this.backdrops.map(b => `'${b.name}'`).join(", ") : "none added";
            console.warn(`Scratch: backdrop '${name}' not found. Available backdrops: ${available}`);
            return;
        }
        this._applyBackdropIndex(i);
    }
    _nextBackdrop() { if (this.backdrops.length) this._applyBackdropIndex((this.currentBackdrop + 1) % this.backdrops.length); }
    _previousBackdrop() { if (this.backdrops.length) this._applyBackdropIndex((this.currentBackdrop - 1 + this.backdrops.length) % this.backdrops.length); }
    _randomBackdrop() { if (this.backdrops.length) this._applyBackdropIndex(this._pickRandom(0, this.backdrops.length - 1)); }
    // declared as lowercase `string`, so this must return a raw JS string —
    // returning a StringClass here would print as "[object Object]"
    _getCurrentBackdropName(): string {
        return this.currentBackdrop >= 0 ? this.backdrops[this.currentBackdrop].name : "";
    }
    _getCurrentBackdropIndex(): number { return this.currentBackdrop; }

    // ---- sound ----
    _addSound(name: string) { this.soundBank.add(name, name); }
    _addSound2(name: string, path: string) { this.soundBank.add(name, path); }
    _playSound(name: string) { this.soundBank.play(name); }
    _stopSound(name: string) { this.soundBank.stop(name); }
    _stopAllSounds() { this.soundBank.stopAll(); }
    _isSoundPlaying(name: string): boolean { return this.soundBank.isPlaying(name); }
    _setVolume(percent: number) { this.soundBank.setVolume(percent); }
    _changeVolume(step: number) { this.soundBank.setVolume(this.soundBank.getVolume() + step); }
    _getVolume(): number { return this.soundBank.getVolume(); }

    // ---- background colour ----
    private bgColor: ScratchColorClass = ScratchColorClass.defaultColor();

    private applyBgColor() {
        this.world._setBackgroundColor(this.bgColor._get() & 0xffffff);
    }
    _setColorHue(h: number) { this.bgColor = ScratchColorClass.fromHue(h); this.applyBgColor(); }
    _setColorRGB(r: number, g: number, b: number) { this.bgColor = ScratchColorClass.fromRGB(r, g, b); this.applyBgColor(); }
    _setColorObj(c: ScratchColorClass) { if (c) { this.bgColor = c; this.applyBgColor(); } }
    _getColor(): ScratchColorClass { return this.bgColor; }
    _changeColor(h: number) { this.bgColor._changeColor(h); this.applyBgColor(); }

    // ---- timers ----
    _getTimer(): ScratchTimerClass { return this._getNamedTimer("default"); }
    _getNamedTimer(name: string): ScratchTimerClass {
        let timer = this.timers.get(name);
        if (!timer) { timer = new ScratchTimerClass(); this.timers.set(name, timer); }
        return timer;
    }
    _getDeltaTime(): number {
        const fps = this._getFrameRate();
        return fps > 0 ? 1 / fps : 0;
    }
    _getFrameRate(): number {
        return (this.world as any).app?.ticker?.FPS ?? 30;
    }

    // ---- misc ----
    _eraseAll() { ScratchPenClass.eraseAllLayers(this.world, this); }

    _display(text: string) { this.displayText(text, undefined); }
    _displayFor(text: string, millis: number) { this.displayText(text, millis); }

    private displayContainer?: PIXI.Container;
    private displayTimeout?: any;

    /**
     * The band along the bottom of the stage that display() writes into.
     *
     * <p>Upstream this is a Text in the BOX style, built at (-width/2,
     * -height/2) and as wide as the stage: it sits on the bottom edge, reaches
     * from side to side and is rounded on its top two corners only. It used to
     * be a small box in the top left corner here, which is a different thing to
     * look at.
     */
    private displayText(text: string, millis?: number) {
        if (this.displayTimeout) { clearTimeout(this.displayTimeout); this.displayTimeout = undefined; }
        if (this.displayContainer) { this.displayContainer.destroy({ children: true }); this.displayContainer = undefined; }
        this.displayContainer = this.makeBottomBand(text);
        if (millis !== undefined) this.displayTimeout = setTimeout(() => this.displayText("", undefined), millis);
    }

    /**
     * Build the band and put it on the stage, or nothing for empty text.
     *
     * <p>Upstream this is a Text in the BOX style, built at (-width/2,
     * -height/2) and as wide as the stage: it sits on the bottom edge, reaches
     * from side to side and is rounded on its top two corners only. display()
     * and ask() both draw one, which is why this is shared.
     */
    private makeBottomBand(text: string): PIXI.Container | undefined {
        if (!text || text.length === 0) return undefined;

        const pad = 8;
        const width = this.world.width;
        const style = new PIXI.TextStyle({
            fontFamily: SCRATCH_FONT_FAMILY,
            fontSize: DISPLAY_FONT_SIZE,
            // upstream's Text defaults: grey on white, in a light grey frame
            fill: 0x787878,
            lineHeight: DISPLAY_FONT_SIZE + 4,
            wordWrap: true,
            wordWrapWidth: width - pad * 2,
        });
        const label = new PIXI.Text({ text, style });
        const height = label.height + pad * 2;
        const radius = 16;

        // Upstream rounds the top two corners and leaves the bottom two square.
        // The band sits on the bottom edge of the stage, so drawing it a corner
        // taller than it needs to be puts the rounded bottom off the canvas,
        // where it cannot be seen - and the square edge is what is left.
        const g = new PIXI.Graphics();
        g.roundRect(0, 0, width, height + radius, radius)
            .fill(0xffffff)
            .stroke({ width: 2, color: 0xdadada });

        label.position.set(pad, pad);
        const box = new PIXI.Container();
        box.addChild(g, label);
        box.position.set(0, this.world.height - height);
        // last child of the stage's own root, so it is on top of the stage but
        // still disappears with it
        (this.scratchLayers?.root ?? this.world.app.stage).addChild(box);
        return box;
    }

    // ---- ask / answer ----
    // Non-blocking, exactly like upstream: ask() puts the question up and returns
    // immediately; run() polls isAsking()/getAnswer().
    //
    // The question goes into a band at the bottom of the stage and is typed into
    // there, which is where Scratch and the desktop library both put it. It used
    // to be handed to the IDE's console instead: the learner had to look below
    // the stage for a question the tutorial said was on it, and the console's
    // input field stopped the act loop while it was open, so nothing the program
    // drew after the first answer ever appeared.
    private askQuestion?: string;
    private answer: string = "";
    private askInput: string = "";
    private askContainer?: PIXI.Container;
    private askKeyListener?: KeyDownListener;

    _ask(question: string) {
        this.askQuestion = question ?? "";
        this.answer = "";
        this.askInput = "";
        this.listenForAnswer();
        this.showAskBox();
    }
    _getAnswer(): string { return this.answer; }
    _isAsking(): boolean { return this.askQuestion !== undefined; }

    /** Puts the question and whatever has been typed so far on screen. */
    private showAskBox() {
        if (this.askContainer && !this.askContainer.destroyed) this.askContainer.destroy({ children: true });
        this.askContainer = this.askQuestion === undefined
            ? undefined
            : this.makeBottomBand(this.askQuestion + "\n> " + this.askInput);
    }

    private listenForAnswer() {
        if (this.askKeyListener) return;
        const km = (this.world as any).interpreter?.keyboardManager;
        if (!km) { this.askQuestion = undefined; return; }
        this.askKeyListener = (key: string) => this.typeIntoAnswer(key);
        km.addKeyDownListener(this.askKeyListener);
        this.focusStage();
    }

    /**
     * Put the keyboard on the stage, so the answer can be typed straight away.
     *
     * <p>The keyboard manager listens on <html>, and the editor swallows the
     * keys it gets — so with the caret still in the editor, which is where it is
     * when a program has just been started, every keystroke went to the code
     * instead of to the question.
     */
    private focusStage() {
        const canvas: HTMLCanvasElement | undefined = (this.world as any).app?.canvas;
        if (!canvas) return;
        canvas.tabIndex = -1;
        canvas.style.outline = "none";
        canvas.focus({ preventScroll: true });
    }

    private stopListeningForAnswer() {
        const km = (this.world as any).interpreter?.keyboardManager;
        if (km && this.askKeyListener) km.removeKeyDownListener(this.askKeyListener);
        this.askKeyListener = undefined;
    }

    /**
     * Handles one keypress while a question is waiting for an answer.
     *
     * <p>A browser reports a printable key as the character itself and everything
     * else — "Shift", "ArrowLeft", "F5" — under a name of its own, so a key of
     * length one is exactly upstream's `key >= ' ' && key != 65535` test.
     */
    private typeIntoAnswer(key: string) {
        // the keyboard manager outlives one stage, so a stage that went off
        // screen with a question still up must not eat the new stage's keys
        if (this.askQuestion === undefined || !this.isActive()) return;
        if (key === "Enter") {
            this.answer = this.askInput;
            this.askQuestion = undefined;
            this.askInput = "";
            this.stopListeningForAnswer();
            this.showAskBox();
            return;
        }
        if (key === "Backspace") {
            this.askInput = this.askInput.slice(0, -1);
            this.showAskBox();
            return;
        }
        if (key.length === 1) {
            this.askInput += key;
            this.showAskBox();
        }
    }

    _mj$wait$void$int(t: Thread, _callback: CallbackParameter, millis: number) {
        if (millis <= 0) return;
        t.scheduler.suspendThread(t);
        t.state = ThreadState.timedWaiting;
        setTimeout(() => t.scheduler.restoreThread(t), millis);
    }

    /**
     * Poll `condition` until it is true, pausing between checks so the rest of
     * the program keeps running — upstream loops with wait(16) for the same reason.
     */
    _mj$waitUntil$void$BooleanSupplier(t: Thread, callback: CallbackParameter, condition: BooleanSupplierInterface) {
        if (!condition) { if (callback) callback(); return; }

        const check = () => {
            condition._mj$getAsBoolean$boolean$(t, () => {
                if (t.s.pop()) {
                    if (callback) callback();
                    return;
                }
                t.scheduler.suspendThread(t);
                t.state = ThreadState.timedWaiting;
                setTimeout(() => {
                    t.scheduler.restoreThread(t);
                    check();
                }, 16);
            });
        };
        check();
    }

    // ---- backdrop tint and transparency ----
    // Both belong to the stage rather than to one backdrop, as they do in
    // Scratch, so switching backdrop does not undo them.
    private backdropTint?: ScratchColorClass;
    /** Scratch's ghost effect: 0 shows the backdrop, 100 hides it. */
    private backdropTransparency: number = 0;

    private applyBackdropTint() {
        if (this.backdropSprite && !this.backdropSprite.destroyed) {
            this.backdropSprite.tint = this.backdropTint ? (this.backdropTint._get() & 0xffffff) : 0xffffff;
        }
    }
    private applyBackdropTransparency() {
        if (this.backdropSprite && !this.backdropSprite.destroyed) {
            this.backdropSprite.alpha = 1 - this.backdropTransparency / 100;
        }
    }
    _setTintRGB(r: number, g: number, b: number) {
        this.backdropTint = ScratchColorClass.fromRGB(r, g, b);
        this.applyBackdropTint();
    }
    _setTintHue(h: number) {
        this.backdropTint = ScratchColorClass.fromHue(h);
        this.applyBackdropTint();
    }
    _changeTint(step: number) {
        if (!this.backdropTint) this.backdropTint = ScratchColorClass.defaultColor();
        this.backdropTint._changeColor(step);
        this.applyBackdropTint();
    }
    _setTransparency(ghost: number) {
        this.backdropTransparency = Math.max(0, Math.min(100, ghost));
        this.applyBackdropTransparency();
    }
    _changeTransparency(step: number) {
        this._setTransparency(this.backdropTransparency + step);
    }

    // ---- debugging and program control ----
    private debugEnabled: boolean = false;
    private debugGraphics?: PIXI.Graphics;
    private debugScreenGraphics?: PIXI.Graphics;
    /** Reused so the overlay does not rebuild a PIXI.Text every frame — that
     *  is expensive enough to distort the frame rate it is meant to report. */
    private debugLabels: PIXI.Text[] = [];
    private debugLabelsUsed: number = 0;

    _setDebug(debug: boolean) {
        this.debugEnabled = debug;
        if (!debug) this.clearDebugOverlay();
    }

    private clearDebugOverlay() {
        this.debugGraphics?.clear();
        this.debugScreenGraphics?.clear();
        for (const label of this.debugLabels) label.visible = false;
        this.debugLabelsUsed = 0;
    }

    /** Grab the next pooled label, creating one only when the pool runs out. */
    private debugLabel(text: string, x: number, y: number, centred: boolean, screenSpace: boolean) {
        let label = this.debugLabels[this.debugLabelsUsed];
        if (!label) {
            label = new PIXI.Text({
                text, style: new PIXI.TextStyle({
                    fontFamily: DEBUG_FONT_FAMILY, fontSize: DEBUG_FONT_SIZE, fill: DEBUG_COLOR,
                }),
            });
            this.debugLabels.push(label);
        }
        this.debugLabelsUsed++;
        if (label.text !== text) label.text = text;
        label.visible = true;
        label.anchor.set(centred ? 0.5 : 0, centred ? 0.5 : 0);
        label.position.set(x, y);
        const target = screenSpace ? this.scratchLayers?.debugScreen : this.scratchLayers?.debugWorld;
        if (target && label.parent !== target) target.addChild(label);
    }

    /**
     * The debug overlay, mirroring what org.openpatch.scratch.Stage draws when
     * debug is on: each sprite's hitbox, direction and position, a crosshair on
     * the mouse with its coordinates, the frame rate and the camera state.
     */
    private renderDebugOverlay() {
        const layers = this.scratchLayers;
        if (!layers) return;

        if (!this.debugGraphics || this.debugGraphics.destroyed) {
            this.debugGraphics = new PIXI.Graphics();
            layers.debugWorld.addChild(this.debugGraphics);
        }
        if (!this.debugScreenGraphics || this.debugScreenGraphics.destroyed) {
            this.debugScreenGraphics = new PIXI.Graphics();
            layers.debugScreen.addChild(this.debugScreenGraphics);
        }

        this.debugGraphics.clear();
        this.debugScreenGraphics.clear();
        for (const label of this.debugLabels) label.visible = false;
        this.debugLabelsUsed = 0;

        const W = this.world.width, H = this.world.height;

        // per sprite: UI sprites are measured in screen space, the rest move with the camera
        for (const sprite of this.sprites) {
            if (sprite.isDestroyed) continue;
            const ui = sprite.isUI();
            const g = ui ? this.debugScreenGraphics : this.debugGraphics;
            sprite.drawDebug(g, (text, x, y) => this.debugLabel(text, x, y, true, ui));
        }

        // crosshair on the mouse, in screen space
        const mouseX = this._getMouseX(), mouseY = this._getMouseY();
        const screenX = W / 2 + this.camera._toGlobalX(mouseX);
        const screenY = H / 2 - this.camera._toGlobalY(mouseY);
        this.debugScreenGraphics
            .moveTo(screenX, 0).lineTo(screenX, H)
            .moveTo(0, screenY).lineTo(W, screenY)
            .stroke({ width: 1, color: DEBUG_COLOR });
        this.debugLabel("(" + round2(mouseX) + ", " + round2(mouseY) + ")", screenX, screenY, false, true);

        this.debugLabel("FPS: " + roundInt(this._getFrameRate()), 20, 20, false, true);
        this.debugLabel("Camera: (" + round2(this.camera.x) + ", " + round2(this.camera.y) + ") "
            + roundInt(this.camera.zoom), 20, 40, false, true);
    }
    _isDebug(): boolean { return this.debugEnabled; }
    _debug(values: any[]) {
        if (!this.debugEnabled) return;
        const parts = (values ?? []).map(v => (v instanceof StringClass ? v.value : String(v)));
        const text = `[${this.constructor.name}] ${parts.join(" ")}`;
        const printManager = (this.world as any)?.interpreter?.printManager;
        if (printManager) printManager.print(text, true, 0x808080);
        else console.log(text);
    }

    _exit() {
        const interpreter = (this.world as any)?.interpreter;
        if (interpreter) interpreter.stop(false);
    }

    _setCursor(path: string) { this._setCursor3(path, 0, 0); }

    /**
     * Costumes live in a shared atlas, so the requested image is rendered out to
     * its own canvas first — a CSS cursor pointing at the atlas would show the
     * whole sheet.
     */
    _setCursor3(path: string, x: number, y: number) {
        const canvas = (this.world.app as any)?.canvas as HTMLCanvasElement | undefined;
        if (!canvas) return;
        const texture = ScratchCostumes.getTexture(path);
        if (!texture) throw new RuntimeExceptionClass("Unbekanntes Bild / unknown image: " + path);
        const extracted = this.world.app.renderer.extract.canvas(texture) as HTMLCanvasElement;
        if (!extracted?.toDataURL) {
            desktopOnly("Stage.setCursor()");
            return;
        }
        canvas.style.cursor = `url(${extracted.toDataURL()}) ${Math.round(x)} ${Math.round(y)}, auto`;
    }

    // ---- desktop-only extensions ----
    _getPixels() { return desktopOnlyValue("Stage.getPixels()", undefined, "Der Bildpuffer ist im Browser nicht zugänglich. / The pixel buffer is not reachable in the browser."); }
    _getShaders() { return desktopOnlyValue("Stage.getShaders()", undefined, "Shader brauchen OpenGL. / Shaders need OpenGL."); }
    _getSorting() { return desktopOnlyValue("Stage.getSorting()", undefined); }

    // ---- dimensions ----
    _getCamera(): ScratchCameraClass { return this.camera; }
    _getWidth(): number { return Math.round(this.world.width); }
    _getHeight(): number { return Math.round(this.world.height); }

    // ---- input ----
    _isKeyPressed(key: KeyCodeEnum): boolean {
        const km = (this.world as any).interpreter?.keyboardManager;
        if (!km || !key) return false;
        return key.browserKeys.some(k => km.isPressed(k));
    }
    _getMouseX(): number { return ScratchSpriteClass.mouseLogicalX(this.world); }
    _getMouseY(): number { return ScratchSpriteClass.mouseLogicalY(this.world); }
    _getMouse(): ScratchVector2Class { return new ScratchVector2Class(this._getMouseX(), this._getMouseY()); }
    _isMouseDown(): boolean { return ScratchSpriteClass.mouseDown; }

    _pickRandom(from: number, to: number): number {
        if (from > to) [from, to] = [to, from];
        return Math.floor(Math.random() * (to - from + 1)) + from;
    }

    // ---- InternalMouseListener ----
    onMouseEvent(kind: MouseEventKind, x: number, y: number): void {
        ScratchSpriteClass.mouseScreenX = x;
        ScratchSpriteClass.mouseScreenY = y;
        if (kind === "mousedown") ScratchSpriteClass.mouseDown = true;
        else if (kind === "mouseup") ScratchSpriteClass.mouseDown = false;
    }
}
