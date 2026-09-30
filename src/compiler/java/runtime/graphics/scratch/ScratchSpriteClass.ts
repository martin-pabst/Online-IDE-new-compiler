import * as PIXI from "pixi.js";
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ClassClass } from "../../system/ClassClass";
import { RuntimeExceptionClass } from "../../system/javalang/RuntimeException";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import { ShapeClass } from "../ShapeClass";
import { KeyCodeEnum } from "./KeyCodeEnum";
import { Layer, LayerEnum } from "./LayerEnum";
import { ScratchLayerName, scratchLayerOf, spriteLayerOf } from "./ScratchLayers";
import { activeScratchStage, isScratchStageActive, scratchStagesRunning } from "./ScratchStages";
import { MouseCodeEnum } from "./MouseCodeEnum";
import { RotationStyle, RotationStyleEnum } from "./RotationStyleEnum";
import { ScratchColorClass } from "./ScratchColorClass";
import { ScratchCostumes } from "./ScratchCostumes";
import { DEBUG_COLOR, round2 } from "./ScratchDebug";
import { ScratchHitboxClass } from "./ScratchHitboxClass";
import { scratchSpriteList } from "./ScratchLists";
import { ScratchPenClass } from "./ScratchPenClass";
import { IScratchEventReceiver, ScratchRuntimeManager } from "./ScratchRuntimeManager";
import { ScratchSoundBank } from "./ScratchSounds";
import { ScratchShapeClass } from "./ScratchShapeClasses";
import { ScratchTextClass } from "./ScratchTextClass";
import { ScratchTimerClass } from "./ScratchTimerClass";
import { desktopOnlyValue } from "./ScratchUnsupported";
import { ScratchVector2Class } from "./ScratchVector2Class";
import { SRC } from "./ScratchLibraryComments";

type Costume = { name: string; texture: PIXI.Texture };

/**
 * What a sprite needs from its stage. Typed structurally rather than importing
 * ScratchStageClass, which imports this module in turn.
 */
type ScratchStageLike = {
    _broadcast(message: StringClass): void;
    _ask(question: string): void;
    _getAnswer(): string;
    _isAsking(): boolean;
    _pickRandom(from: number, to: number): number;
    _getDeltaTime(): number;
    _debug(values: any[]): void;
    sprites: ScratchSpriteClass[];
};

/**
 * Interactive costumed object, mirroring org.openpatch.scratch.Sprite (core subset).
 *
 * Logical state (position/direction) uses the Scratch coordinate system: origin at
 * the stage centre, y pointing UP, direction 90 = right / 0 = up. This is converted
 * to the IDE world's top-left/y-down pixel space in applyState().
 */
export class ScratchSpriteClass extends ShapeClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: "org.openpatch.scratch", signature: "class Sprite extends Actor", comment: SRC.spriteClassComment },

        { type: "method", signature: "Sprite()", java: ScratchSpriteClass.prototype._cj$_constructor_$Sprite$, comment: SRC.spriteConstructorComment },
        { type: "method", signature: "Sprite(string name, string imagePath)", java: ScratchSpriteClass.prototype._cj$_constructor_$Sprite$string$string, comment: SRC.spriteConstructor2Comment },
        { type: "method", signature: "Sprite(Sprite s)", java: ScratchSpriteClass.prototype._cj$_constructor_$Sprite$Sprite, comment: SRC.spriteConstructor3Comment },

        // per-frame hook (Scratch: runs every frame)
        { type: "method", signature: "void run()", java: ScratchSpriteClass.prototype._mj$run$void$, comment: SRC.spriteRunComment },

        // overridable event hooks
        { type: "method", signature: "void whenAddedToStage()", java: ScratchSpriteClass.prototype._mj$whenAddedToStage$void$, comment: SRC.spriteWhenAddedToStageComment },
        { type: "method", signature: "void whenRemovedFromStage()", java: ScratchSpriteClass.prototype._mj$whenRemovedFromStage$void$, comment: SRC.spriteWhenRemovedFromStageComment },
        { type: "method", signature: "void whenClicked()", java: ScratchSpriteClass.prototype._mj$whenClicked$void$, comment: SRC.spriteWhenClickedComment },
        { type: "method", signature: "void whenKeyPressed(KeyCode key)", java: ScratchSpriteClass.prototype._mj$whenKeyPressed$void$KeyCode, comment: SRC.spriteWhenKeyPressedComment },
        { type: "method", signature: "void whenKeyReleased(KeyCode key)", java: ScratchSpriteClass.prototype._mj$whenKeyReleased$void$KeyCode, comment: SRC.spriteWhenKeyReleasedComment },
        { type: "method", signature: "void whenMouseClicked(MouseCode button)", java: ScratchSpriteClass.prototype._mj$whenMouseClicked$void$MouseCode, comment: SRC.spriteWhenMouseClickedComment },
        { type: "method", signature: "void whenMouseMoved(double x, double y)", java: ScratchSpriteClass.prototype._mj$whenMouseMoved$void$double$double, comment: SRC.spriteWhenMouseMovedComment },
        { type: "method", signature: "void whenIReceive(String message)", java: ScratchSpriteClass.prototype._mj$whenIReceive$void$String, comment: SRC.spriteWhenIReceiveComment },
        { type: "method", signature: "void whenBackdropSwitches(String name)", java: ScratchSpriteClass.prototype._mj$whenBackdropSwitches$void$String, comment: SRC.spriteWhenBackdropSwitchesComment },

        // speech
        { type: "method", signature: "void say(string text)", native: ScratchSpriteClass.prototype._say, comment: SRC.spriteSayComment },
        { type: "method", signature: "void say(string text, int millis)", native: ScratchSpriteClass.prototype._sayFor, comment: SRC.spriteSay2Comment },
        { type: "method", signature: "void think(string text)", native: ScratchSpriteClass.prototype._think, comment: SRC.spriteThinkComment },
        { type: "method", signature: "void think(string text, int millis)", native: ScratchSpriteClass.prototype._thinkFor, comment: SRC.spriteThink2Comment },

        // costumes
        { type: "method", signature: "void addCostume(string name)", java: ScratchSpriteClass.prototype._mj$addCostume$void$string, comment: SRC.spriteAddCostumeComment },
        { type: "method", signature: "void addCostume(string name, string imagePath)", java: ScratchSpriteClass.prototype._mj$addCostume$void$string$string, comment: SRC.spriteAddCostume2Comment },
        { type: "method", signature: "void addCostume(string name, string spriteSheetPath, int x, int y, int width, int height)", native: ScratchSpriteClass.prototype._addCostumeFromSheet, comment: SRC.spriteAddCostume3Comment },
        { type: "method", signature: "void addCostumes(string prefix, string spriteSheet, int tileWidth, int tileHeight)", native: ScratchSpriteClass.prototype._addCostumes, comment: SRC.spriteAddCostumesComment },
        { type: "method", signature: "void switchCostume(string name)", native: ScratchSpriteClass.prototype._switchCostumeByName, comment: SRC.spriteSwitchCostumeComment },
        { type: "method", signature: "void switchCostume(double index)", native: ScratchSpriteClass.prototype._switchCostumeByIndex, comment: SRC.spriteSwitchCostume2Comment },
        { type: "method", signature: "void nextCostume()", native: ScratchSpriteClass.prototype._nextCostume, comment: SRC.spriteNextCostumeComment },
        { type: "method", signature: "void previousCostume()", native: ScratchSpriteClass.prototype._previousCostume, comment: SRC.spritePreviousCostumeComment },
        { type: "method", signature: "string getCurrentCostumeName()", native: ScratchSpriteClass.prototype._getCurrentCostumeName, comment: SRC.spriteGetCurrentCostumeNameComment },
        { type: "method", signature: "int getCurrentCostumeIndex()", native: ScratchSpriteClass.prototype._getCurrentCostumeIndex, comment: SRC.spriteGetCurrentCostumeIndexComment },

        // sound
        { type: "method", signature: "void addSound(string name)", native: ScratchSpriteClass.prototype._addSound, comment: SRC.spriteAddSoundComment },
        { type: "method", signature: "void addSound(string name, string soundPath)", native: ScratchSpriteClass.prototype._addSound2, comment: SRC.spriteAddSound2Comment },
        { type: "method", signature: "void playSound(string name)", native: ScratchSpriteClass.prototype._playSound, comment: SRC.spritePlaySoundComment },
        { type: "method", signature: "void stopSound(string name)", native: ScratchSpriteClass.prototype._stopSound, comment: SRC.spriteStopSoundComment },
        { type: "method", signature: "void stopAllSounds()", native: ScratchSpriteClass.prototype._stopAllSounds, comment: SRC.spriteStopAllSoundsComment },
        { type: "method", signature: "boolean isSoundPlaying(string name)", native: ScratchSpriteClass.prototype._isSoundPlaying, comment: SRC.spriteIsSoundPlayingComment },
        { type: "method", signature: "void setVolume(double percent)", native: ScratchSpriteClass.prototype._setVolume, comment: SRC.spriteSetVolumeComment },
        { type: "method", signature: "void changeVolume(double step)", native: ScratchSpriteClass.prototype._changeVolume, comment: SRC.spriteChangeVolumeComment },
        { type: "method", signature: "double getVolume()", native: ScratchSpriteClass.prototype._getVolume, comment: SRC.spriteGetVolumeComment },

        // movement
        { type: "method", signature: "void move(double steps)", native: ScratchSpriteClass.prototype._move2, comment: SRC.spriteMoveComment },
        { type: "method", signature: "void move(Vector2 v)", native: ScratchSpriteClass.prototype._moveV, comment: SRC.spriteMove2Comment },
        { type: "method", signature: "void setPosition(double x, double y)", native: ScratchSpriteClass.prototype._setPosition, comment: SRC.spriteSetPositionComment },
        { type: "method", signature: "void setPosition(Vector2 v)", native: ScratchSpriteClass.prototype._setPositionV, comment: SRC.spriteSetPosition2Comment },
        { type: "method", signature: "void changePosition(double x, double y)", native: ScratchSpriteClass.prototype._changePosition, comment: SRC.spriteChangePositionComment },
        { type: "method", signature: "void changePosition(Vector2 v)", native: ScratchSpriteClass.prototype._changePositionV, comment: SRC.spriteChangePosition2Comment },
        { type: "method", signature: "Vector2 getPosition()", native: ScratchSpriteClass.prototype._getPosition, comment: SRC.spriteGetPositionComment },
        { type: "method", signature: "void glide(double seconds, double x, double y)", native: ScratchSpriteClass.prototype._glide, comment: SRC.spriteGlideComment },
        { type: "method", signature: "boolean isGliding()", native: ScratchSpriteClass.prototype._isGliding, comment: SRC.spriteIsGlidingComment },
        { type: "method", signature: "void goToMousePointer()", native: ScratchSpriteClass.prototype._goToMousePointer, comment: SRC.spriteGoToMousePointerComment },
        { type: "method", signature: "double getX()", native: ScratchSpriteClass.prototype._getX, comment: SRC.spriteGetXComment },
        { type: "method", signature: "double getY()", native: ScratchSpriteClass.prototype._getY, comment: SRC.spriteGetYComment },
        { type: "method", signature: "void setX(double x)", native: ScratchSpriteClass.prototype._setX2, comment: SRC.spriteSetXComment },
        { type: "method", signature: "void setY(double y)", native: ScratchSpriteClass.prototype._setY2, comment: SRC.spriteSetYComment },
        { type: "method", signature: "void changeX(double x)", native: ScratchSpriteClass.prototype._changeX, comment: SRC.spriteChangeXComment },
        { type: "method", signature: "void changeY(double y)", native: ScratchSpriteClass.prototype._changeY, comment: SRC.spriteChangeYComment },
        { type: "method", signature: "void goToRandomPosition()", native: ScratchSpriteClass.prototype._goToRandomPosition, comment: SRC.spriteGoToRandomPositionComment },
        { type: "method", signature: "void ifOnEdgeBounce()", native: ScratchSpriteClass.prototype._ifOnEdgeBounce, comment: SRC.spriteIfOnEdgeBounceComment },

        // rotation
        { type: "method", signature: "void turnRight(double degrees)", native: ScratchSpriteClass.prototype._turnRight, comment: SRC.spriteTurnRightComment },
        { type: "method", signature: "void turnLeft(double degrees)", native: ScratchSpriteClass.prototype._turnLeft, comment: SRC.spriteTurnLeftComment },
        { type: "method", signature: "void setDirection(double degrees)", native: ScratchSpriteClass.prototype._setDirection, comment: SRC.spriteSetDirectionComment },
        { type: "method", signature: "void setDirection(Vector2 v)", native: ScratchSpriteClass.prototype._setDirectionV, comment: SRC.spriteSetDirection2Comment },
        { type: "method", signature: "void goToSprite(Sprite sprite)", native: ScratchSpriteClass.prototype._goToSprite, comment: SRC.spriteGoToSpriteComment },
        { type: "method", signature: "void pointInDirection(double degrees)", native: ScratchSpriteClass.prototype._setDirection, comment: SRC.spritePointInDirectionComment },
        { type: "method", signature: "void pointInDirection(Vector2 v)", native: ScratchSpriteClass.prototype._pointInDirectionV, comment: SRC.spritePointInDirection2Comment },
        { type: "method", signature: "void pointTowardsMousePointer()", native: ScratchSpriteClass.prototype._pointTowardsMousePointer, comment: SRC.spritePointTowardsMousePointerComment },
        { type: "method", signature: "void pointTowardsSprite(Sprite other)", native: ScratchSpriteClass.prototype._pointTowardsSprite, comment: SRC.spritePointTowardsSpriteComment },
        { type: "method", signature: "double getDirection()", native: ScratchSpriteClass.prototype._getDirection, comment: SRC.spriteGetDirectionComment },
        { type: "method", signature: "void setRotationStyle(RotationStyle style)", native: ScratchSpriteClass.prototype._setRotationStyle, comment: SRC.spriteSetRotationStyleComment },

        // appearance
        { type: "method", signature: "void show()", native: ScratchSpriteClass.prototype._show, comment: SRC.spriteShowComment },
        { type: "method", signature: "void hide()", native: ScratchSpriteClass.prototype._hide, comment: SRC.spriteHideComment },
        { type: "method", signature: "boolean isVisible()", native: ScratchSpriteClass.prototype._isVisibleScratch, comment: SRC.spriteIsVisibleComment },
        { type: "method", signature: "void setSize(double percentage)", native: ScratchSpriteClass.prototype._setSize, comment: SRC.spriteSetSizeComment },
        { type: "method", signature: "void changeSize(double amount)", native: ScratchSpriteClass.prototype._changeSize, comment: SRC.spriteChangeSizeComment },
        { type: "method", signature: "double getSize()", native: ScratchSpriteClass.prototype._getSize, comment: SRC.spriteGetSizeComment },
        { type: "method", signature: "void setTransparency(double percentage)", native: ScratchSpriteClass.prototype._setTransparency, comment: SRC.spriteSetTransparencyComment },
        { type: "method", signature: "void changeTransparency(double step)", native: ScratchSpriteClass.prototype._changeTransparency, comment: SRC.spriteChangeTransparencyComment },
        { type: "method", signature: "double getTransparency()", native: ScratchSpriteClass.prototype._getTransparency, comment: SRC.spriteGetTransparencyComment },
        // int, not double: upstream reports the costume's pixels, which are whole
        { type: "method", signature: "int getWidth()", native: ScratchSpriteClass.prototype._getSpriteWidth, comment: SRC.spriteGetWidthComment },
        { type: "method", signature: "int getHeight()", native: ScratchSpriteClass.prototype._getSpriteHeight, comment: SRC.spriteGetHeightComment },
        { type: "method", signature: "void setTint(Color c)", native: ScratchSpriteClass.prototype._setTintObj, comment: SRC.spriteSetTintComment },
        { type: "method", signature: "void setTint(double h)", native: ScratchSpriteClass.prototype._setTintHue, comment: SRC.spriteSetTint2Comment },
        { type: "method", signature: "void setTint(double r, double g, double b)", native: ScratchSpriteClass.prototype._setTintRGB, comment: SRC.spriteSetTint3Comment },
        { type: "method", signature: "void changeTint(double step)", native: ScratchSpriteClass.prototype._changeTint, comment: SRC.spriteChangeTintComment },
        { type: "method", signature: "Color getTint()", native: ScratchSpriteClass.prototype._getTint, comment: SRC.spriteGetTintComment },

        // layering
        { type: "method", signature: "void goToFrontLayer()", native: ScratchSpriteClass.prototype._goToFrontLayer, comment: SRC.spriteGoToFrontLayerComment },
        { type: "method", signature: "void goToBackLayer()", native: ScratchSpriteClass.prototype._goToBackLayer, comment: SRC.spriteGoToBackLayerComment },
        { type: "method", signature: "void goLayersForwards(int number)", native: ScratchSpriteClass.prototype._goLayersForwards, comment: SRC.spriteGoLayersForwardsComment },
        { type: "method", signature: "void goLayersBackwards(int number)", native: ScratchSpriteClass.prototype._goLayersBackwards, comment: SRC.spriteGoLayersBackwardsComment },

        // sensing
        { type: "method", signature: "boolean isTouchingSprite(Sprite other)", native: ScratchSpriteClass.prototype._isTouchingSprite, comment: SRC.spriteIsTouchingSpriteComment },
        { type: "method", signature: "boolean isTouchingSprite(Class<? extends Sprite> c)", native: ScratchSpriteClass.prototype._isTouchingSpriteOfClass, comment: SRC.spriteIsTouchingSprite2Comment },
        { type: "method", signature: "<T extends Sprite> T getTouchingSprite(Class<T> c)", native: ScratchSpriteClass.prototype._getTouchingSprite, comment: SRC.spriteGetTouchingSpriteComment },
        { type: "method", signature: "<T extends Sprite> List<T> getTouchingSprites(Class<T> c)", java: ScratchSpriteClass.prototype._mj$getTouchingSprites$List$Class, comment: SRC.spriteGetTouchingSpritesComment },
        { type: "method", signature: "boolean isTouchingEdge()", native: ScratchSpriteClass.prototype._isTouchingEdge, comment: SRC.spriteIsTouchingEdgeComment },
        { type: "method", signature: "boolean isTouchingMousePointer()", native: ScratchSpriteClass.prototype._isTouchingMousePointer, comment: SRC.spriteIsTouchingMousePointerComment },
        { type: "method", signature: "boolean isKeyPressed(KeyCode key)", native: ScratchSpriteClass.prototype._isKeyPressed, comment: SRC.spriteIsKeyPressedComment },
        { type: "method", signature: "double getMouseX()", native: ScratchSpriteClass.prototype._getMouseX, comment: SRC.spriteGetMouseXComment },
        { type: "method", signature: "double getMouseY()", native: ScratchSpriteClass.prototype._getMouseY, comment: SRC.spriteGetMouseYComment },
        { type: "method", signature: "Vector2 getMouse()", native: ScratchSpriteClass.prototype._getMouse, comment: SRC.spriteGetMouseComment },
        { type: "method", signature: "boolean isMouseDown()", native: ScratchSpriteClass.prototype._isMouseDown, comment: SRC.spriteIsMouseDownComment },
        { type: "method", signature: "double distanceToSprite(Sprite other)", native: ScratchSpriteClass.prototype._distanceToSprite, comment: SRC.spriteDistanceToSpriteComment },
        { type: "method", signature: "double distanceToMousePointer()", native: ScratchSpriteClass.prototype._distanceToMousePointer, comment: SRC.spriteDistanceToMousePointerComment },

        // things the sprite asks its stage for
        { type: "method", signature: "Stage getStage()", native: ScratchSpriteClass.prototype._getStage, comment: SRC.spriteGetStageComment },
        { type: "method", signature: "void broadcast(String message)", native: ScratchSpriteClass.prototype._broadcast, comment: SRC.spriteBroadcastComment },
        { type: "method", signature: "void ask(string question)", native: ScratchSpriteClass.prototype._ask, comment: SRC.spriteAskComment },
        { type: "method", signature: "string getAnswer()", native: ScratchSpriteClass.prototype._getAnswer, comment: SRC.spriteGetAnswerComment },
        { type: "method", signature: "boolean isAsking()", native: ScratchSpriteClass.prototype._isAsking, comment: SRC.spriteIsAskingComment },
        { type: "method", signature: "int pickRandom(int from, int to)", native: ScratchSpriteClass.prototype._pickRandom, comment: SRC.spritePickRandomComment },
        { type: "method", signature: "double getDeltaTime()", native: ScratchSpriteClass.prototype._getDeltaTime, comment: SRC.spriteGetDeltaTimeComment },
        { type: "method", signature: "Text getText()", native: ScratchSpriteClass.prototype._getText, comment: SRC.spriteGetTextComment },
        { type: "method", signature: "void debug(Object... values)", native: ScratchSpriteClass.prototype._debug, comment: SRC.spriteDebugComment },

        { type: "method", signature: "Timer getTimer()", native: ScratchSpriteClass.prototype._getTimer, comment: SRC.spriteGetTimerComment },
        { type: "method", signature: "Timer getTimer(string name)", native: ScratchSpriteClass.prototype._getNamedTimer, comment: SRC.spriteGetTimer2Comment },

        { type: "method", signature: "void setHitbox(double... points)", native: ScratchSpriteClass.prototype._setHitbox, comment: SRC.spriteSetHitboxComment },
        { type: "method", signature: "void setHitbox(Shape shape)", native: ScratchSpriteClass.prototype._setHitboxShape, comment: SRC.spriteSetHitbox2Comment },
        { type: "method", signature: "Hitbox getHitbox()", native: ScratchSpriteClass.prototype._getHitbox, comment: SRC.spriteGetHitboxComment },
        { type: "method", signature: "void enableHitbox()", native: ScratchSpriteClass.prototype._enableHitbox, comment: SRC.spriteEnableHitboxComment },
        { type: "method", signature: "void disableHitbox()", native: ScratchSpriteClass.prototype._disableHitbox, comment: SRC.spriteDisableHitboxComment },
        { type: "method", signature: "void stamp()", native: ScratchSpriteClass.prototype._stamp, comment: SRC.spriteStampComment },
        { type: "method", signature: "void stamp(Layer layer)", native: ScratchSpriteClass.prototype._stampOnLayer, comment: SRC.spriteStamp2Comment },

        { type: "method", signature: "Pen getPen()", native: ScratchSpriteClass.prototype._getPen, comment: SRC.spriteGetPenComment },

        { type: "method", signature: "void remove()", native: ScratchSpriteClass.prototype._remove, comment: SRC.spriteRemoveComment },

        { type: "method", signature: "Sprite clone()", java: ScratchSpriteClass.prototype._mj$copy$Shape$, comment: SRC.spriteCloneComment },
        { type: "method", signature: "Shaders getShaders()", native: ScratchSpriteClass.prototype._getShaders, comment: SRC.spriteGetShadersComment },
    ];

    static type: NonPrimitiveType;

    // logical Scratch state
    sx: number = 0;               // centre-origin x, right = +
    sy: number = 0;               // centre-origin y, UP = +
    direction: number = 90;       // 90 = right, 0 = up
    size: number = 100;           // percent
    rotationStyle: RotationStyle = RotationStyle.ALL_AROUND;

    costumes: Costume[] = [];
    currentCostume: number = -1;

    penObj?: ScratchPenClass;
    /** Created on demand by getText(); not used by say()/think(). */
    spriteText?: ScratchTextClass;
    /** Upstream's Text bubble constants, so both renders agree. */
    static readonly BUBBLE_FONT_SIZE = 14;
    static readonly SPEAK_BUBBLE_MAX_LIMIT = 330;
    static readonly SPEAK_BUBBLE_MIN_LIMIT = 80;
    private speechBubbleHeight: number = 0;
    /** Stamps taken before the sprite had a costume; see _stampOnLayer. */
    private pendingStamps: { layerName: ScratchLayerName, matrix: PIXI.Matrix, alpha: number, tint: number }[] = [];
    /** disableHitbox() takes the sprite out of all collision checks. */
    hitboxEnabled: boolean = true;
    /** Raw setHitbox() points, relative to the costume's top-left corner. */
    private customHitboxPoints?: { x: number, y: number }[];
    /** Set once the sprite has registered its event hooks. */
    runtime?: ScratchRuntimeManager;

    _cj$_constructor_$Sprite$(t: Thread, callback: CallbackParameter) {
        this._cj$_constructor_$Shape$(t, () => {
            // Shape's constructor pushed `this` and set up this.world
            this.container = new PIXI.Container();
            // UI sprites go into the layer the camera does not move
            (spriteLayerOf(this, this.isUI()) ?? this.world.app.stage).addChild(this.container);
            this.centerXInitial = 0;
            this.centerYInitial = 0;
            this.penObj = new ScratchPenClass();
            this.penObj.sprite = this;      // so pen.stamp() knows what to print
            this.penObj.attachToWorld(this.world as any);
            this.penObj.px = this.sx;
            this.penObj.py = this.sy;
            this.addToDefaultGroupAndSetDefaultVisibility();
            this.applyState();
            this.registerIfNobodyElseWill(t, callback);
            if (callback) callback();
        });
    }

    /** Upstream's `new Sprite(name, path)` — the costume is there right away. */
    _cj$_constructor_$Sprite$string$string(t: Thread, callback: CallbackParameter, name: string, imagePath: string) {
        this._cj$_constructor_$Sprite$(t, () => {
            t.s.pop();
            this.loadCostume(t, name, imagePath, () => {
                t.s.push(this);
                this.registerIfNobodyElseWill(t, callback);
                if (callback) callback();
            });
        });
    }

    /** Upstream's copy constructor. */
    _cj$_constructor_$Sprite$Sprite(t: Thread, callback: CallbackParameter, other: ScratchSpriteClass) {
        this._cj$_constructor_$Sprite$(t, () => {
            t.s.pop();
            if (other) {
                this.costumes = other.costumes.slice();
                this.sx = other.sx; this.sy = other.sy;
                this.direction = other.direction;
                this.size = other.size;
                this.rotationStyle = other.rotationStyle;
                if (other.currentCostume >= 0) this._applyCostumeIndex(other.currentCostume);
                this.applyState();
            }
            t.s.push(this);
            this.registerIfNobodyElseWill(t, callback);
            if (callback) callback();
        });
    }

    _getPen(): ScratchPenClass {
        if (!this.penObj) {
            this.penObj = new ScratchPenClass();
            this.penObj.sprite = this;      // so pen.stamp() knows what to print
            this.penObj.stage = this.stage; // and draws on the sprite's own stage
            this.penObj.attachToWorld(this.world as any);
            this.penObj.px = this.sx;
            this.penObj.py = this.sy;
        }
        return this.penObj;
    }

    // ---- per-frame ----
    /**
     * Sprites step with the stage they are on: a sprite waiting on a stage that
     * is off screen holds still, as it does upstream, where only the stage the
     * applet is showing has its sprites updated.
     */
    _mj$act$void$(t: Thread, callback: CallbackParameter): void {
        if (this.stage && !isScratchStageActive(this.stage as any)) {
            if (callback) callback();
            return;
        }
        if (!scratchStagesRunning()) {
            if (callback) callback();
            return;
        }
        this.stepGlide();
        this._mj$run$void$(t, callback);
    }
    _mj$run$void$(_t: Thread, callback: CallbackParameter): void { if (callback) callback(); }

    // ---- overridable event hooks (empty defaults) ----
    _mj$whenAddedToStage$void$(_t: Thread, callback: CallbackParameter): void { if (callback) callback(); }
    _mj$whenRemovedFromStage$void$(_t: Thread, callback: CallbackParameter): void { if (callback) callback(); }
    _mj$whenClicked$void$(_t: Thread, callback: CallbackParameter): void { if (callback) callback(); }
    _mj$whenKeyPressed$void$KeyCode(_t: Thread, callback: CallbackParameter, _key: KeyCodeEnum): void { if (callback) callback(); }
    _mj$whenKeyReleased$void$KeyCode(_t: Thread, callback: CallbackParameter, _key: KeyCodeEnum): void { if (callback) callback(); }
    _mj$whenMouseClicked$void$MouseCode(_t: Thread, callback: CallbackParameter, _code: MouseCodeEnum): void { if (callback) callback(); }
    _mj$whenMouseMoved$void$double$double(_t: Thread, callback: CallbackParameter, _x: number, _y: number): void { if (callback) callback(); }
    _mj$whenIReceive$void$String(_t: Thread, callback: CallbackParameter, _message: StringClass): void { if (callback) callback(); }
    _mj$whenBackdropSwitches$void$String(_t: Thread, callback: CallbackParameter, _name: StringClass): void { if (callback) callback(); }

    private listenersRegistered = false;

    /**
     * Registers this sprite for act() and for the Scratch events, unless the
     * compiler is going to do it.
     *
     * <p>TermCodeGenerator.invokeConstructor only arranges that call for classes
     * the program itself declares — `!klassType.isLibraryType`. A program that
     * writes `new Sprite("player", "slimeGreen")` rather than subclassing
     * therefore never acted at all, and glide() sat still. It cannot be done in
     * the constructor for a subclass, because act() must not reach an object
     * whose own constructor has not finished; but where no callback came in
     * there is no subclass constructor left to wait for.
     */
    protected registerIfNobodyElseWill(t: Thread, callback: CallbackParameter) {
        if (!callback) this._registerListeners(t);
    }

    _registerListeners(t: Thread): void {
        if (this.listenersRegistered) return;
        this.listenersRegistered = true;
        super._registerListeners(t);
        const interpreter = (this.world as any).interpreter;
        if (!interpreter) return;
        const runtime = ScratchRuntimeManager.forInterpreter(interpreter, this.world as any);
        this.runtime = runtime;
        const proto = ScratchSpriteClass.prototype;
        runtime.register(this as unknown as IScratchEventReceiver, {
            iReceive: this._mj$whenIReceive$void$String !== proto._mj$whenIReceive$void$String,
            keyPressed: this._mj$whenKeyPressed$void$KeyCode !== proto._mj$whenKeyPressed$void$KeyCode,
            keyReleased: this._mj$whenKeyReleased$void$KeyCode !== proto._mj$whenKeyReleased$void$KeyCode,
            clicked: this._mj$whenClicked$void$ !== proto._mj$whenClicked$void$,
            mouseClicked: this._mj$whenMouseClicked$void$MouseCode !== proto._mj$whenMouseClicked$void$MouseCode,
            backdropSwitches: this._mj$whenBackdropSwitches$void$String !== proto._mj$whenBackdropSwitches$void$String,
            mouseMoved: this._mj$whenMouseMoved$void$double$double !== proto._mj$whenMouseMoved$void$double$double,
        });
    }

    // ---- speech / thought bubbles ----
    private speechBubble?: PIXI.Container;
    private speechTimeout?: any;

    /**
     * Speech and thought bubbles, matching org.openpatch.scratch.Text#drawBubble:
     * UbuntuMono 14, white fill, light grey border, grey text, 16px corners, and
     * 8px padding. A speech bubble gets a triangular tail at its bottom left, a
     * thought bubble three shrinking circles. The numbers below are upstream's.
     */
    private showSpeech(text: string, think: boolean) {
        this.clearSpeech();
        if (!text || text.length === 0) return;

        const style = new PIXI.TextStyle({
            fontFamily: "UbuntuMono, monospace",
            fontSize: ScratchSpriteClass.BUBBLE_FONT_SIZE,
            fill: 0x787878,                                  // Color(120, 120, 120)
            // `leading` is the gap BETWEEN lines, which is what Processing's
            // textLeading(textSize + 4) means; lineHeight would instead centre
            // every line in an 18px box and push the first one down
            leading: 4,
            wordWrap: true,
            wordWrapWidth: ScratchSpriteClass.SPEAK_BUBBLE_MAX_LIMIT,
        });
        const label = new PIXI.Text({ text, style });

        const lines = Math.max(1, text.split("\n").length, Math.round(label.height / (ScratchSpriteClass.BUBBLE_FONT_SIZE + 4)));
        const bw = Math.max(label.width, ScratchSpriteClass.SPEAK_BUBBLE_MIN_LIMIT) + 16;
        const bh = (ScratchSpriteClass.BUBBLE_FONT_SIZE + 4) * lines + 16;

        const g = new PIXI.Graphics();
        g.roundRect(0, 0, bw, bh, 16).fill(0xffffff).stroke({ width: 1, color: 0xdadada });
        if (think) {
            // circle(x, y, d) upstream takes a diameter, so these are radii
            g.circle(20, bh, 5).fill(0xffffff).stroke({ width: 1, color: 0xdadada });
            g.circle(7, bh + 7, 3).fill(0xffffff).stroke({ width: 1, color: 0xdadada });
            g.circle(0, bh + 10, 2).fill(0xffffff).stroke({ width: 1, color: 0xdadada });
        } else {
            // Outlined like the bubble it hangs off. Filled only, it was a
            // white triangle on a white stage and the bubble looked tail-less.
            g.moveTo(10, bh + 20).lineTo(10, bh).lineTo(30, bh).closePath()
                .fill(0xffffff).stroke({ width: 1, color: 0xdadada });
            // hides the seam where the tail meets the border, as upstream does
            g.moveTo(12, bh).lineTo(26, bh).stroke({ width: 3, color: 0xffffff });
        }

        // 8,8 upstream; PIXI puts the glyph box a few pixels lower than
        // Processing does, so the y is nudged to make the two renders line up
        label.position.set(8, 4);
        const bubble = new PIXI.Container();
        bubble.addChild(g);
        bubble.addChild(label);
        // the bubble belongs with its sprite, so the camera moves it too
        (spriteLayerOf(this, this.isUI()) ?? this.world.app.stage).addChild(bubble);
        this.speechBubble = bubble;
        this.speechBubbleHeight = bh;
        this.positionSpeech();
    }

    /**
     * Anchor the bubble the way upstream's drawBubble does: its bottom-left
     * corner sits on the top-right corner of the sprite's hitbox, so that the
     * tail points back at the sprite however big its costume canvas is.
     *
     * The sprite's own state is used rather than the transformed hit polygon,
     * because that is derived from the PIXI world transform, which is only valid
     * once a frame has been rendered — a say() in the Stage constructor would
     * otherwise pin every bubble to the top-left corner. This repeats upstream's
     * getHitbox() arithmetic instead: the painted part of the costume, scaled,
     * and turned with the sprite when it turns at all.
     */
    private positionSpeech() {
        if (!this.speechBubble || !this.container || this.container.destroyed) return;
        const W = this.world.width, H = this.world.height;
        const size = this.currentTextureSize();
        const scaleX = Math.abs(this.scaleMagnitudeX());
        const scaleY = Math.abs(this.scaleMagnitudeY());

        // the painted part of the costume, around the costume's centre, in
        // stage pixels and with y pointing down as the hitbox has it
        const texture = this.currentCostume >= 0 ? this.costumes[this.currentCostume].texture : undefined;
        const content = texture
            ? ScratchCostumes.contentBounds(texture, this.world?.app?.renderer)
            : { x: 0, y: 0, width: size.w, height: size.h };
        const left = (content.x - size.w / 2) * scaleX;
        const top = (content.y - size.h / 2) * scaleY;
        const right = left + content.width * scaleX;
        const bottom = top + content.height * scaleY;

        // LEFT_RIGHT and DONT keep the costume upright, exactly as getHitbox does
        const degrees = this.rotationStyle === RotationStyle.ALL_AROUND ? this.direction - 90 : 0;
        const radians = degrees * Math.PI / 180;
        const cos = Math.cos(radians), sin = Math.sin(radians);
        let anchorRight = -Infinity, anchorTop = Infinity;
        for (const [cx, cy] of [[left, top], [right, top], [right, bottom], [left, bottom]]) {
            const x = cx * cos - cy * sin;
            const y = cx * sin + cy * cos;
            if (x > anchorRight) anchorRight = x;
            if (y < anchorTop) anchorTop = y;
        }

        this.speechBubble.position.set(
            W / 2 + this.sx + anchorRight,
            H / 2 - this.sy + anchorTop - this.speechBubbleHeight);
    }

    private clearSpeech() {
        if (this.speechTimeout) { clearTimeout(this.speechTimeout); this.speechTimeout = undefined; }
        if (this.speechBubble) { this.speechBubble.destroy({ children: true }); this.speechBubble = undefined; }
    }

    _say(text: string) { this.showSpeech(text, false); }
    _think(text: string) { this.showSpeech(text, true); }
    _sayFor(text: string, millis: number) { this.showSpeech(text, false); this.speechTimeout = setTimeout(() => this.clearSpeech(), millis); }
    _thinkFor(text: string, millis: number) { this.showSpeech(text, true); this.speechTimeout = setTimeout(() => this.clearSpeech(), millis); }

    // ---- coordinate conversion + transform ----
    // scaleMagnitudeX/Y give the (positive) scale of the costume container.
    // A normal sprite scales uniformly by size%; UISprite overrides these to size
    // its costume in pixels. The LEFT_RIGHT flip and rotation are applied on top.
    protected scaleMagnitudeX(): number { return this.size / 100; }
    protected scaleMagnitudeY(): number { return this.size / 100; }

    protected applyState() {
        if (!this.container || this.container.destroyed) return;
        const W = this.world.width, H = this.world.height;
        const screenX = W / 2 + this.sx;
        const screenY = H / 2 - this.sy;
        const scaleX = this.scaleMagnitudeX();
        const scaleY = this.scaleMagnitudeY();

        let sxScale = scaleX, syScale = scaleY, rotDeg = 0;
        if (this.rotationStyle === RotationStyle.ALL_AROUND) {
            rotDeg = this.direction - 90;
        } else if (this.rotationStyle === RotationStyle.LEFT_RIGHT) {
            if (this.direction > 180 && this.direction < 360) sxScale = -scaleX; // facing left
        }

        const m = new PIXI.Matrix();
        m.scale(sxScale, syScale);
        m.rotate(rotDeg * Math.PI / 180);
        m.translate(screenX, screenY);
        this.container.setFromMatrix(m);
        this.container.updateLocalTransform();
        //@ts-ignore
        this.container._didLocalTransformChangeId = this.container._didChangeId;

        this.angle = rotDeg;
        this.scaleFactor = scaleX;
        this.directionRad = rotDeg * Math.PI / 180;
        this.setWorldTransformAndHitPolygonDirty();
        this.positionSpeech();
        // pen follows the sprite (draws a segment when the pen is down)
        this.penObj?._setPosition(this.sx, this.sy);
    }

    // ---- things the stage owns ----
    /**
     * The stage this sprite was added to. Undefined until then, which is what
     * upstream's getStage() returns as null.
     */
    stage?: ScratchStageLike;

    /**
     * Called by Stage.add(): take on that stage and move everything the sprite
     * draws into its layers. A sprite built while another stage was on screen put
     * its costume, bubbles and pen there, because that is all it could know about.
     */
    attachToStage(stage: ScratchStageLike) {
        if (this.stage === stage) return;
        this.stage = stage;
        if (this.penObj) this.penObj.stage = stage;
        const layer = spriteLayerOf(this, this.isUI());
        if (layer && this.container && !this.container.destroyed) layer.addChild(this.container);
        if (this.speechBubble && !this.speechBubble.destroyed) layer?.addChild(this.speechBubble);
        this.spriteText?.attachToStage(stage as object);
    }

    /** The stage that answers for this sprite: its own, or the one on screen. */
    private ownerStage(): ScratchStageLike | undefined {
        return this.stage ?? activeScratchStage<ScratchStageLike>();
    }

    /** Which stage's events reach this sprite; see ScratchRuntimeManager. */
    _scratchStage(): object | undefined { return this.stage as object | undefined; }

    _getStage(): ScratchStageLike | undefined { return this.stage; }
    _broadcast(message: StringClass) { this.ownerStage()?._broadcast(message); }
    _ask(question: string) { this.ownerStage()?._ask(question); }
    _getAnswer(): string { return this.ownerStage()?._getAnswer() ?? ""; }
    _isAsking(): boolean { return this.ownerStage()?._isAsking() ?? false; }
    _pickRandom(from: number, to: number): number { return this.ownerStage()?._pickRandom(from, to) ?? from; }
    _getDeltaTime(): number { return this.ownerStage()?._getDeltaTime() ?? 0; }
    _debug(values: any[]) { this.ownerStage()?._debug(values); }

    /**
     * The Text drawn with the sprite. Upstream say()/think() write into this
     * object; here the bubbles are drawn directly, so this is a separate Text
     * that follows the sprite and is yours to position and style.
     */
    _getText(): ScratchTextClass {
        if (!this.spriteText) {
            this.spriteText = new ScratchTextClass();
            this.spriteText.world = this.world as any;
            this.spriteText._setPosition(this.sx, this.sy);
        }
        return this.spriteText;
    }

    _getShaders(): ObjectClass | undefined {
        return desktopOnlyValue("Sprite.getShaders()", undefined,
            "Shader brauchen OpenGL. / Shaders need OpenGL.");
    }

    // ---- costumes ----
    _mj$addCostume$void$string(t: Thread, callback: CallbackParameter, name: string) {
        this.loadCostume(t, name, name, callback);
    }

    _mj$addCostume$void$string$string(t: Thread, callback: CallbackParameter, name: string, imagePath: string) {
        this.loadCostume(t, name, imagePath, callback);
    }

    private loadCostume(t: Thread, name: string, imagePath: string, callback: CallbackParameter) {
        if (this.costumes.some(c => c.name === name)) {
            if (callback) callback();
            return;
        }
        const oldState = t.state;
        t.state = ThreadState.waiting;
        ScratchCostumes.loadTexture(imagePath).then(texture => {
            this.costumes.push({ name, texture });
            if (this.currentCostume < 0) this._applyCostumeIndex(this.costumes.length - 1);
            t.state = oldState;
            if (callback) callback();
        }).catch(reason => {
            t.state = oldState;
            t.throwRuntimeExceptionOnLastExecutedStep(new RuntimeExceptionClass(
                `Bild konnte nicht geladen werden / could not load image '${imagePath}': ${reason}`
            ));
        });
    }

    /** Cut one costume out of a larger image, like upstream's 6-argument form. */
    _addCostumeFromSheet(name: string, spriteSheetPath: string, x: number, y: number, width: number, height: number) {
        if (this.costumes.some(c => c.name === name)) return;
        const texture = ScratchSpriteClass.subTexture(spriteSheetPath, x, y, width, height);
        this.costumes.push({ name, texture });
        if (this.currentCostume < 0) this._applyCostumeIndex(0);
    }

    /**
     * Slice an image into equally sized tiles and add them all. Costume names
     * are the prefix plus the tile's index, matching upstream — including its
     * `x * nx + y` indexing, which is only the row-major order people expect
     * when the sheet is square.
     */
    _addCostumes(prefix: string, spriteSheet: string, tileWidth: number, tileHeight: number) {
        const base = ScratchCostumes.getTexture(spriteSheet);
        if (!base) throw new RuntimeExceptionClass("Unbekanntes Bild / unknown image: " + spriteSheet);
        const nx = Math.floor(base.width / tileWidth);
        const ny = Math.floor(base.height / tileHeight);
        for (let y = 0; y < ny; y++) {
            for (let x = 0; x < nx; x++) {
                const index = x * nx + y;
                const texture = ScratchSpriteClass.subTexture(spriteSheet, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                this.costumes.push({ name: prefix + index, texture });
            }
        }
        if (this.currentCostume < 0 && this.costumes.length > 0) this._applyCostumeIndex(0);
    }

    /** Cut a rectangle out of an atlas texture, relative to its own frame. */
    private static subTexture(imagePath: string, x: number, y: number, width: number, height: number): PIXI.Texture {
        const base = ScratchCostumes.getTexture(imagePath);
        if (!base) throw new RuntimeExceptionClass("Unbekanntes Bild / unknown image: " + imagePath);
        const frame = new PIXI.Rectangle(base.frame.x + x, base.frame.y + y, width, height);
        return new PIXI.Texture({ source: base.source, frame });
    }

    /**
     * Add a costume under `name`, taking the image from `imagePath` — a built-in
     * costume name (mirroring the desktop library's Image.ofNameOrPath). Adding a
     * costume whose name already exists does nothing, as upstream.
     */
    _addCostume2(name: string, imagePath: string) {
        if (this.costumes.some(c => c.name === name)) return;
        const texture = ScratchCostumes.getTexture(imagePath);
        if (!texture) throw new RuntimeExceptionClass("Unbekanntes Kostüm / unknown costume: " + imagePath);
        this.costumes.push({ name, texture });
        if (this.currentCostume < 0) this._applyCostumeIndex(this.costumes.length - 1);
    }

    /** Natural (unscaled) size of the current costume, for pixel-based sizing. */
    protected currentTextureSize(): { w: number, h: number } {
        if (this.currentCostume < 0) return { w: 0, h: 0 };
        const t = this.costumes[this.currentCostume].texture;
        return { w: t.width, h: t.height };
    }

    /** Build the PIXI display object for a costume. UISprite overrides for nine-slice. */
    protected createCostumeDisplay(texture: PIXI.Texture): PIXI.Container {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        return sprite;
    }

    protected _applyCostumeIndex(index: number) {
        if (index < 0 || index >= this.costumes.length) return;
        this.currentCostume = index;
        const texture = this.costumes[index].texture;

        const parent = this.container?.parent;
        const sprite = this.createCostumeDisplay(texture);
        // put the new display object exactly where the old one was, so switching
        // costume does not shuffle the sprite to the front of its layer
        if (parent) {
            const index = parent.getChildIndex(this.container);
            parent.addChildAt(sprite, index);
        }
        if (this.container && !this.container.destroyed) this.container.destroy();
        this.container = sprite;

        this.centerXInitial = 0;
        this.centerYInitial = 0;
        // Only fall back to the costume's rectangle while the sprite still has
        // the default outline. A setHitbox() right after add() lands before
        // whenAddedToStage adds the costume, and must not be undone here.
        //
        // The rectangle is the painted part of the costume, not the whole
        // canvas it was drawn into - the same thing upstream's getHitbox() does
        // with Image#getContentBounds. A costume is often much emptier than it
        // is big, and colliding with that empty space looks like a bug.
        const w = texture.width, h = texture.height;
        const content = ScratchCostumes.contentBounds(texture, this.world?.app?.renderer);
        const left = content.x - w / 2;
        const top = content.y - h / 2;
        const right = left + content.width;
        const bottom = top + content.height;
        this.hitPolygonInitial = [
            { x: left, y: top }, { x: right, y: top },
            { x: right, y: bottom }, { x: left, y: bottom },
        ];
        this.hitPolygonDirty = true;
        // a custom outline set before the costume arrived wins, and its offset
        // depends on this costume's size, so re-derive it here
        this.applyCustomHitbox();
        // the display object is brand new, so tint and transparency set earlier
        // have to be put back on it — whenAddedToStage runs on its own thread,
        // so a setTint() right after add() lands before the costume exists
        this.applyTint();
        this.applyTransparency();
        this.applyState();
        this.flushPendingStamps(texture);
    }

    _switchCostumeByName(name: string) {
        const i = this.costumes.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
        if (i >= 0) this._applyCostumeIndex(i);
    }
    /**
     * Declared with a double index, as upstream is, so that a costume counter
     * held in a double still selects a costume. Upstream truncates and wraps.
     */
    _switchCostumeByIndex(index: number) {
        if (!this.costumes.length) return;
        this._applyCostumeIndex(Math.trunc(index) % this.costumes.length);
    }
    _nextCostume() { if (this.costumes.length) this._applyCostumeIndex((this.currentCostume + 1) % this.costumes.length); }
    _previousCostume() { if (this.costumes.length) this._applyCostumeIndex((this.currentCostume - 1 + this.costumes.length) % this.costumes.length); }
    // declared as lowercase `string`, so this must return a raw JS string —
    // returning a StringClass here would print as "[object Object]"
    _getCurrentCostumeName(): string { return this.currentCostume >= 0 ? this.costumes[this.currentCostume].name : ""; }
    _getCurrentCostumeIndex(): number { return this.currentCostume; }

    // ---- movement ----
    _move2(steps: number) {
        const a = (this.direction - 90) * Math.PI / 180;
        this.sx += steps * Math.cos(a);
        this.sy += steps * -Math.sin(a);
        this.applyState();
    }
    _setPosition(x: number, y: number) { this.sx = x; this.sy = y; this.applyState(); }
    _setPositionV(v: ScratchVector2Class) { if (v) this._setPosition(v.x, v.y); }
    _changePosition(x: number, y: number) { this.sx += x; this.sy += y; this.applyState(); }
    _changePositionV(v: ScratchVector2Class) { if (v) this._changePosition(v.x, v.y); }
    _getPosition(): ScratchVector2Class { return new ScratchVector2Class(this.sx, this.sy); }

    // ---- glide ----
    // Interpolated over wall-clock time and advanced once per frame from act().
    private glideFromX = 0; private glideFromY = 0;
    private glideToX = 0; private glideToY = 0;
    private glideMillis = 0;
    private glideStart = -1;   // -1 = not gliding

    _glide(seconds: number, x: number, y: number) {
        if (seconds <= 0) { this._setPosition(x, y); this.glideStart = -1; return; }
        this.glideFromX = this.sx; this.glideFromY = this.sy;
        this.glideToX = x; this.glideToY = y;
        this.glideMillis = seconds * 1000;
        this.glideStart = performance.now();
    }
    _isGliding(): boolean { return this.glideStart >= 0; }

    /** Advance an in-progress glide; called once per frame from act(). */
    private stepGlide() {
        if (this.glideStart < 0) return;
        const elapsed = performance.now() - this.glideStart;
        if (elapsed >= this.glideMillis) {
            this.glideStart = -1;
            this._setPosition(this.glideToX, this.glideToY);
            return;
        }
        const f = elapsed / this.glideMillis;
        this._setPosition(
            this.glideFromX + (this.glideToX - this.glideFromX) * f,
            this.glideFromY + (this.glideToY - this.glideFromY) * f,
        );
    }

    _goToMousePointer() { this._setPosition(this._getMouseX(), this._getMouseY()); }
    _getX(): number { return this.sx; }
    _getY(): number { return this.sy; }
    _setX2(x: number) { this.sx = x; this.applyState(); }
    _setY2(y: number) { this.sy = y; this.applyState(); }
    _changeX(x: number) { this.sx += x; this.applyState(); }
    _changeY(y: number) { this.sy += y; this.applyState(); }
    _goToRandomPosition() {
        const W = this.world.width, H = this.world.height;
        this.sx = Math.round((Math.random() - 0.5) * W);
        this.sy = Math.round((Math.random() - 0.5) * H);
        this.applyState();
    }
    /**
     * How far the sprite's hitbox reaches over each of the stage's four borders,
     * in the stage coordinates upstream's Bounds uses: origin in the middle,
     * y pointing down. Zero on a side the sprite is still inside of.
     *
     * The hitbox is asked for rather than the display object's PIXI bounds:
     * container.getBounds() measures the whole costume canvas — transparent
     * padding included — and, because it walks up the parent chain, it is also
     * moved and scaled by the camera. Neither is true of a collision outline,
     * which is why upstream works in hitbox space here as well.
     */
    private edgeOverlap(): { left: number, right: number, top: number, bottom: number } {
        const bounds = this._getHitbox()._getBounds();
        const halfWidth = this.world.width / 2, halfHeight = this.world.height / 2;
        return {
            left: Math.max(0, -halfWidth - bounds.bx),
            right: Math.max(0, bounds.bx + bounds.bwidth - halfWidth),
            top: Math.max(0, -halfHeight - bounds.by),
            bottom: Math.max(0, bounds.by + bounds.bheight - halfHeight),
        };
    }

    /**
     * Turn away from any stage border the sprite pokes over, mirroring
     * org.openpatch.scratch.Sprite#ifOnEdgeBounce.
     *
     * A border reflects the component of the heading that runs across it: the
     * left and right borders flip the x component, which for a Scratch bearing
     * (90 = right, 0 = up) is `-direction`; the top and bottom ones flip the y
     * component, which is `-direction - 180`. The sprite is then pushed back in
     * by exactly how far its hitbox stuck out, so a hitbox that does not sit in
     * the middle of the costume still ends up flush with the border.
     */
    _ifOnEdgeBounce() {
        // upstream leaves the same three cases alone: a sprite without a
        // collision outline, a UI sprite, and one not on a stage yet
        if (!this.hitboxEnabled || this.isUI() || !this.stage) return;

        // measured once, as upstream does, so that a sprite wider than the
        // stage bounces off both opposite borders and keeps its heading
        const over = this.edgeOverlap();

        if (over.left > 0) {
            this._setDirection(-this.direction);
            this._setX2(this.sx + over.left);
        }
        if (over.right > 0) {
            this._setDirection(-this.direction);
            this._setX2(this.sx - over.right);
        }
        if (over.top > 0) {
            this._setDirection(-this.direction - 180);
            this._setY2(this.sy - over.top);
        }
        if (over.bottom > 0) {
            this._setDirection(-this.direction - 180);
            this._setY2(this.sy + over.bottom);
        }
    }

    // ---- rotation ----
    _turnRight(deg: number) { this._setDirection(this.direction + deg); }
    _turnLeft(deg: number) { this._setDirection(this.direction - deg); }
    _setDirection(deg: number) {
        deg = deg % 360;
        if (deg < 0) deg += 360;
        // -360 % 360 is -0 here and 0.0 upstream, where the branch above runs
        // first. ifOnEdgeBounce() reaches it every time a sprite bounces off the
        // bottom border, and getDirection() would go on reading -0.0 from then on.
        this.direction = deg === 0 ? 0 : deg;
        this.applyState();
    }
    _getDirection(): number { return this.direction; }
    /** Point along a vector. Scratch direction 90 = +x, 0 = +y, so bearing = 90 - atan2(y,x). */
    _pointInDirectionV(v: ScratchVector2Class) {
        if (!v) return;
        this._setDirection(90 - Math.atan2(v.y, v.x) * 180 / Math.PI);
    }
    _pointTowardsMousePointer() {
        this._pointInDirectionV(new ScratchVector2Class(this._getMouseX() - this.sx, this._getMouseY() - this.sy));
    }
    _pointTowardsSprite(other: ScratchSpriteClass) {
        if (!other) return;
        this._pointInDirectionV(new ScratchVector2Class(other.sx - this.sx, other.sy - this.sy));
    }
    _setDirectionV(v: ScratchVector2Class) { this._pointInDirectionV(v); }
    _moveV(v: ScratchVector2Class) { if (v) this._setPosition(this.sx + v.x, this.sy + v.y); }
    _goToSprite(other: ScratchSpriteClass) { if (other) this._setPosition(other.sx, other.sy); }
    _setRotationStyle(style: RotationStyleEnum) {
        this.rotationStyle = style.ordinal as RotationStyle;
        this.applyState();
    }

    // ---- appearance ----
    _show() { this.container.visible = true; }
    _hide() { this.container.visible = false; }
    _isVisibleScratch(): boolean { return this.container.visible; }
    _setSize(percentage: number) { this.size = percentage; this.applyState(); }
    _changeSize(amount: number) { this._setSize(this.size + amount); }
    _changeTransparency(step: number) { this._setTransparency(this.transparency + step); }
    _getTransparency(): number { return this.transparency; }
    _getSize(): number { return this.size; }
    /** Scratch's ghost effect: 0 shows the sprite, 100 hides it. */
    private transparency: number = 0;
    _setTransparency(ghost: number) {
        this.transparency = Math.max(0, Math.min(100, ghost));
        this.applyTransparency();
    }
    private applyTransparency() {
        if (this.container && !this.container.destroyed) {
            this.container.alpha = 1 - this.transparency / 100;
        }
    }
    /**
     * The current costume's size, as upstream's Sprite.getWidth() reports it:
     * the costume's pixels scaled by setSize(), never the rotated bounding box.
     */
    _getSpriteWidth(): number { return this.costumeSize().width; }
    _getSpriteHeight(): number { return this.costumeSize().height; }
    private costumeSize(): { width: number, height: number } {
        const costume = this.costumes[this.currentCostume];
        if (!costume) {
            // upstream casts the pen size to an int here, as it does everywhere
            const pen = Math.trunc(this.penObj?._getSize() ?? 1);
            return { width: pen, height: pen };
        }
        const scale = this.size / 100;
        return {
            width: Math.round(costume.texture.width * scale),
            height: Math.round(costume.texture.height * scale),
        };
    }

    // ---- tint ----
    // named tintColor: ShapeClass already has a tint() method
    private tintColor?: ScratchColorClass;
    private applyTint() {
        // not ShapeClass.tint(): it skips the assignment when container.tint is
        // falsy, which is the case for a plain Container that has no tint at all
        if (this.container && !this.container.destroyed) {
            (this.container as any).tint = this.tintColor ? (this.tintColor._get() & 0xffffff) : 0xffffff;
        }
    }
    _setTintObj(c: ScratchColorClass) { this.tintColor = c; this.applyTint(); }
    _setTintHue(h: number) { this.tintColor = ScratchColorClass.fromHue(h); this.applyTint(); }
    _setTintRGB(r: number, g: number, b: number) { this.tintColor = ScratchColorClass.fromRGB(r, g, b); this.applyTint(); }
    _changeTint(step: number) {
        if (!this.tintColor) this.tintColor = ScratchColorClass.defaultColor();
        this.tintColor._changeColor(step);
        this.applyTint();
    }
    _getTint(): ScratchColorClass {
        if (!this.tintColor) this.tintColor = ScratchColorClass.defaultColor();
        return this.tintColor;
    }

    // ---- layering ----
    private get siblings(): PIXI.Container | undefined { return this.container?.parent ?? undefined; }
    _goToFrontLayer() { const p = this.siblings; if (p) p.setChildIndex(this.container, p.children.length - 1); }
    _goToBackLayer() { const p = this.siblings; if (p) p.setChildIndex(this.container, 0); }
    private moveLayers(delta: number) {
        const p = this.siblings;
        if (!p) return;
        const index = p.getChildIndex(this.container);
        p.setChildIndex(this.container, Math.max(0, Math.min(p.children.length - 1, index + delta)));
    }
    _goLayersForwards(n: number) { this.moveLayers(n); }
    _goLayersBackwards(n: number) { this.moveLayers(-n); }

    // ---- sound ----
    private soundBank: ScratchSoundBank = new ScratchSoundBank();
    _addSound(name: string) { this.soundBank.add(name, name); }
    _addSound2(name: string, path: string) { this.soundBank.add(name, path); }
    _playSound(name: string) { this.soundBank.play(name); }
    _stopSound(name: string) { this.soundBank.stop(name); }
    _stopAllSounds() { this.soundBank.stopAll(); }
    _isSoundPlaying(name: string): boolean { return this.soundBank.isPlaying(name); }
    _setVolume(percent: number) { this.soundBank.setVolume(percent); }
    _changeVolume(step: number) { this.soundBank.setVolume(this.soundBank.getVolume() + step); }
    _getVolume(): number { return this.soundBank.getVolume(); }

    // ---- timers ----
    private timers: Map<string, ScratchTimerClass> = new Map();
    _getTimer(): ScratchTimerClass { return this._getNamedTimer("default"); }
    _getNamedTimer(name: string): ScratchTimerClass {
        let timer = this.timers.get(name);
        if (!timer) { timer = new ScratchTimerClass(); this.timers.set(name, timer); }
        return timer;
    }

    // ---- sensing ----
    /** UISprites are interface elements and never take part in collisions (as upstream). */
    isUI(): boolean { return false; }

    _isTouchingSprite(other: ScratchSpriteClass): boolean {
        if (!other || !other.container) return false;
        if (this.isUI() || other.isUI()) return false;
        if (!this.hitboxEnabled || !other.hitboxEnabled) return false;
        return this._collidesWith(other);
    }
    /**
     * Upstream asks the hitbox whether it reaches any of the four border strips
     * the stage keeps just outside its edges, so a sprite counts as touching the
     * edge once its collision outline — not its costume canvas — leaves the
     * stage. edgeOverlap() answers the same question; see ifOnEdgeBounce.
     */
    _isTouchingEdge(): boolean {
        if (!this.hitboxEnabled) return false;
        const over = this.edgeOverlap();
        return over.left > 0 || over.right > 0 || over.top > 0 || over.bottom > 0;
    }
    _isKeyPressed(key: KeyCodeEnum): boolean {
        const km = (this.world as any).interpreter?.keyboardManager;
        if (!km || !key) return false;
        return key.browserKeys.some(k => km.isPressed(k));
    }
    /**
     * The class-based sensing methods mirror upstream's Class<? extends Sprite>
     * overloads. A Java class literal arrives as a ClassClass, whose `type`
     * carries the generated JS constructor, so a plain instanceof covers
     * subclasses too — the same semantics as Class.isInstance().
     */
    private spritesOfClass(c: ClassClass): ScratchSpriteClass[] {
        const stage = this.ownerStage();
        const klass = c?.type?.runtimeClass;
        if (!stage || !klass) return [];
        // A removed sprite's container is a throwing proxy, so exclude destroyed ones.
        return stage.sprites.filter(s => s !== this && !s.isDestroyed && s instanceof (klass as any));
    }

    _isTouchingSpriteOfClass(c: ClassClass): boolean {
        return this.spritesOfClass(c).some(s => s.container.visible && this._isTouchingSprite(s));
    }
    _getTouchingSprite(c: ClassClass): ScratchSpriteClass | null {
        return this.spritesOfClass(c).find(s => s.container.visible && this._isTouchingSprite(s)) ?? null;
    }
    // java.util.List or, in the library "scratch-nrw", the nrw List; see scratchSpriteList
    _mj$getTouchingSprites$List$Class(t: Thread, callback: CallbackParameter, c: ClassClass) {
        t.s.push(scratchSpriteList(t, this.spritesOfClass(c).filter(s => this._isTouchingSprite(s))));
        if (callback) callback();
    }

    _isTouchingMousePointer(): boolean {
        return this._containsPoint(ScratchSpriteClass.mouseScreenX, ScratchSpriteClass.mouseScreenY);
    }
    _getMouseX(): number { return ScratchSpriteClass.mouseLogicalX(this.world); }
    _getMouseY(): number { return ScratchSpriteClass.mouseLogicalY(this.world); }
    _getMouse(): ScratchVector2Class { return new ScratchVector2Class(this._getMouseX(), this._getMouseY()); }
    _isMouseDown(): boolean { return ScratchSpriteClass.mouseDown; }
    _distanceToSprite(other: ScratchSpriteClass): number {
        if (!other) return 0;
        const dx = other.sx - this.sx, dy = other.sy - this.sy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    _distanceToMousePointer(): number {
        const dx = this._getMouseX() - this.sx, dy = this._getMouseY() - this.sy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Replace the collision outline with the given x/y pairs.
     *
     * Coordinates are measured from the costume's TOP-LEFT corner in unscaled
     * costume pixels, which is how upstream reads them: it translates the shape
     * by (x - spriteWidth/2, -y - spriteHeight/2). Reading them off the costume
     * image is the point — the same numbers a paint program shows.
     */
    _setHitbox(points: number[]) {
        if (!points || points.length < 6 || points.length % 2 !== 0) {
            throw new RuntimeExceptionClass(
                "setHitbox braucht mindestens 3 Punkte als x/y-Paare / setHitbox needs at least 3 points as x/y pairs");
        }
        const polygon: { x: number, y: number }[] = [];
        for (let i = 0; i < points.length; i += 2) {
            polygon.push({ x: points[i], y: points[i + 1] });
        }
        this.customHitboxPoints = polygon;
        this.applyCustomHitbox();
    }

    /** Same convention as setHitbox(double...): relative to the top-left corner. */
    _setHitboxShape(shape: ScratchShapeClass) {
        if (!shape || shape.points.length < 3) {
            throw new RuntimeExceptionClass(
                "setHitbox braucht eine Form mit mindestens 3 Punkten / setHitbox needs a shape with at least 3 points");
        }
        this.customHitboxPoints = shape.points.map(p => ({ x: p.x, y: p.y }));
        this.applyCustomHitbox();
    }

    /**
     * Move the custom outline into the centre-origin space the transform uses.
     * Re-run whenever the costume changes, because the offset depends on the
     * costume's size — and because whenAddedToStage runs on its own thread, the
     * costume usually arrives after setHitbox() was called.
     */
    private applyCustomHitbox() {
        if (!this.customHitboxPoints) return;
        const size = this.currentTextureSize();
        this.hitPolygonInitial = this.customHitboxPoints.map(p => ({
            x: p.x - size.w / 2,
            y: p.y - size.h / 2,
        }));
        this.hitPolygonDirty = true;
    }

    /**
     * The current collision outline. Built fresh from the sprite's transformed
     * hit polygon, so it reflects where the sprite is right now.
     */
    _getHitbox(): ScratchHitboxClass {
        // marking it dirty only schedules the work, so force it through here
        this.setWorldTransformAndHitPolygonDirty();
        this.transformHitPolygon();
        const polygon = this.hitPolygonTransformed?.length ? this.hitPolygonTransformed : (this.hitPolygonInitial ?? []);
        // The polygon is kept in world pixels, with the origin in the top-left,
        // because that is what PIXI draws in. Upstream hands out a hitbox around
        // the middle of the stage instead - getHitbox().getBounds().x() has to
        // read the same in both - so shift it back before anyone sees it. y still
        // points down, which is the convention upstream's Hitbox uses too.
        const cx = (this.world?.width ?? 0) / 2, cy = (this.world?.height ?? 0) / 2;
        return new ScratchHitboxClass(polygon.map(p => ({ x: p.x - cx, y: p.y - cy })));
    }

    _enableHitbox() { this.hitboxEnabled = true; }
    _disableHitbox() { this.hitboxEnabled = false; }

    /**
     * Debug overlay for one sprite, mirroring org.openpatch.scratch.Sprite#drawDebug:
     * the hitbox outline (unless it is disabled) plus the sprite's direction and
     * position. `label` is called with each line of text and where to centre it.
     */
    drawDebug(g: PIXI.Graphics, label: (text: string, x: number, y: number) => void) {
        if (this.hitboxEnabled) {
            this.setWorldTransformAndHitPolygonDirty();
            this.transformHitPolygon();
            const outline = this.hitPolygonTransformed?.length ? this.hitPolygonTransformed : this.hitPolygonInitial;
            if (outline && outline.length >= 3) {
                g.moveTo(outline[0].x, outline[0].y);
                for (let i = 1; i < outline.length; i++) g.lineTo(outline[i].x, outline[i].y);
                g.closePath();
                g.stroke({ width: 2, color: DEBUG_COLOR });
            }
        }

        if (this.currentCostume < 0 || !this.container?.visible) return;
        const W = this.world.width, H = this.world.height;
        const screenX = W / 2 + this.sx;
        const screenY = H / 2 - this.sy;
        const height = this.currentTextureSize().h * Math.abs(this.scaleMagnitudeY());
        label("Direction: " + round2(this.direction), screenX, screenY - height / 2 - 10);
        label("(" + round2(this.sx) + ", " + round2(this.sy) + ")", screenX, screenY);
    }

    // ---- stamps ----
    _stamp() { this._stampOnLayer(undefined); }
    /** Used by Pen.stamp() when the pen has been sent to the foreground. */
    _stampForeground() { this._stampOnLayer(LayerEnum.values[Layer.FOREGROUND]); }

    /**
     * Draw a static, non-interactive copy of the sprite where it currently is.
     * Like upstream, the no-argument stamp() goes to the BACKGROUND, i.e. behind
     * every sprite; FOREGROUND and UI go on top of them.
     */
    _stampOnLayer(layer?: LayerEnum) {
        const where = (layer?.ordinal ?? Layer.BACKGROUND) as Layer;
        const layerName: ScratchLayerName = where === Layer.BACKGROUND ? "backgroundStamps"
            : where === Layer.UI ? "ui" : "foregroundStamps";

        // A stamp right after add() arrives before whenAddedToStage has run and
        // given the sprite its costume — that hook runs on its own thread here,
        // where upstream calls it synchronously. Remember the transform now and
        // print it as soon as there is something to print.
        if (this.currentCostume < 0) {
            this.pendingStamps.push({
                layerName,
                matrix: this.container.localTransform.clone(),
                alpha: this.container.alpha,
                tint: (this.container as any).tint ?? 0xffffff,
            });
            return;
        }
        this.printStamp(this.costumes[this.currentCostume].texture, layerName,
            this.container.localTransform.clone(), this.container.alpha,
            (this.container as any).tint ?? 0xffffff);
    }

    private printStamp(texture: PIXI.Texture, layerName: ScratchLayerName,
        matrix: PIXI.Matrix, alpha: number, tint: number) {
        const stamp = new PIXI.Sprite(texture);
        stamp.anchor.set(0.5, 0.5);
        stamp.setFromMatrix(matrix);
        stamp.alpha = alpha;
        stamp.tint = tint;
        (scratchLayerOf(this, layerName) ?? this.world.app.stage).addChild(stamp);
    }

    private flushPendingStamps(texture: PIXI.Texture) {
        if (this.pendingStamps.length === 0) return;
        const queued = this.pendingStamps;
        this.pendingStamps = [];
        for (const s of queued) this.printStamp(texture, s.layerName, s.matrix, s.alpha, s.tint);
    }

    _remove() {
        // let the sprite react while it is still intact
        this.runtime?.fireRemovedFromStage(this as IScratchEventReceiver);
        this.clearSpeech();
        this.spriteText?._remove();
        // Take the sprite out of the stage's list too, so it stops being iterated
        // by the per-frame loop and the class-based sensing methods.
        const stage = this.ownerStage();
        if (stage) {
            const i = stage.sprites.indexOf(this);
            if (i >= 0) stage.sprites.splice(i, 1);
        }
        this.stage = undefined;
        this.destroy();
    }

    _mj$copy$Shape$(t: Thread, callback: CallbackParameter) {
        // minimal copy: shares costume list
        const copy = new ScratchSpriteClass();
        copy._cj$_constructor_$Sprite$(t, () => {
            copy.costumes = this.costumes.slice();
            copy.sx = this.sx; copy.sy = this.sy; copy.direction = this.direction;
            copy.size = this.size; copy.rotationStyle = this.rotationStyle;
            if (this.currentCostume >= 0) copy._applyCostumeIndex(this.currentCostume);
            t.s.push(copy);
            if (callback) callback();
        });
    }

    // shared mouse state, updated by ScratchStage's mouse listener
    static mouseScreenX: number = 0;
    static mouseScreenY: number = 0;
    static mouseDown: boolean = false;
    /**
     * Mouse position in stage coordinates. The pointer is reported in screen
     * pixels, so a panned or zoomed camera has to be undone first — the same
     * camera.toLocal* step upstream applies before it stores mouseX/mouseY.
     */
    static mouseLogicalX(world: any): number {
        const raw = ScratchSpriteClass.mouseScreenX - world.width / 2;
        const camera = ScratchSpriteClass.cameraOf(world);
        return camera ? raw / (camera.zoom / 100) + camera.x : raw;
    }

    static mouseLogicalY(world: any): number {
        const raw = world.height / 2 - ScratchSpriteClass.mouseScreenY;
        const camera = ScratchSpriteClass.cameraOf(world);
        return camera ? raw / (camera.zoom / 100) + camera.y : raw;
    }

    private static cameraOf(_world: any): { x: number, y: number, zoom: number } | undefined {
        const stage = activeScratchStage<{ camera?: { x: number, y: number, zoom: number } }>();
        return stage?.camera;
    }
}
