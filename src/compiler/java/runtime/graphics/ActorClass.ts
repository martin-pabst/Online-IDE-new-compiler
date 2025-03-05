import { Object3D } from "three";
import { GamepadTool } from "../../../../tools/GamepadTool";
import { CallbackParameter } from "../../../common/interpreter/CallbackParameter";
import { Interpreter } from "../../../common/interpreter/Interpreter";
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { NullPointerExceptionClass } from "../system/javalang/NullPointerExceptionClass";
import { ObjectClass, StringClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException";
import { ActorManager } from "./ActorManager";
import { IActor } from "./IActor";
import { IWorld } from "./IWorld";

// TODO: Gampad support
/**
 * Base class of all Objects which have a act-method and kan sense keyboard or gamepad
 */
export class ActorClass extends ObjectClass implements IActor {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "abstract class Actor extends Object" },

        { type: "method", signature: "Actor()", java: ActorClass.prototype._cj$_constructor_$Actor$ },
        { type: "method", signature: "void act()", java: ActorClass.prototype._mj$act$void$, comment: JRC.actorActMethodComment },
        { type: "method", signature: "void act(double deltaTime)", java: ActorClass.prototype._mj$act$void$double, comment: JRC.actorActMethodComment2 },
        { type: "method", signature: "void onKeyTyped(String key)", java: ActorClass.prototype._mj$onKeyTyped$void$String, comment: JRC.actorOnKeyTypedComment },
        { type: "method", signature: "void onKeyUp(String key)", java: ActorClass.prototype._mj$onKeyUp$void$String },
        { type: "method", signature: "void onKeyDown(String key)", java: ActorClass.prototype._mj$onKeyDown$void$String },
        { type: "method", signature: "void destroy()", java: ActorClass.prototype._mj$destroy$void$ },
        { type: "method", signature: "final boolean isKeyUp(string key)", java: ActorClass.prototype._mj$isKeyUp$boolean$string, comment: JRC.actorOnKeyUpComment },
        { type: "method", signature: "final boolean isKeyDown(string key)", java: ActorClass.prototype._mj$isKeyDown$boolean$string, comment: JRC.actorOnKeyDownComment },
        { type: "method", signature: "final boolean isActing()", native: ActorClass.prototype._isActing, comment: JRC.actorIsActingComment },
        { type: "method", signature: "final boolean isDestroyed()", native: ActorClass.prototype._isDestroyed, comment: JRC.actorIsDestroyedComment },
        { type: "method", signature: "final void stopActing()", native: ActorClass.prototype._stopActing, comment: JRC.actorStopActingComment },
        { type: "method", signature: "final void restartActing()", native: ActorClass.prototype._restartActing, comment: JRC.actorRestartActingComment },

        { type: "method", signature: "final boolean isGamepadButtonDown(int gamepadIndex, int buttonIndex)", native: ActorClass.prototype._isGamepadButtonDown, comment: JRC.actorIsGamepadButtonDownComment },
        { type: "method", signature: "final boolean isGamepadConnected(int gamepadIndex)", native: ActorClass.prototype._isGamepadConnected, comment: JRC.actorIsGamepadConnectedComment },
        { type: "method", signature: "final double getGamepadAxisValue(int gamepadIndex, int axisIndex)", native: ActorClass.prototype._getGamepadAxisValue, comment: JRC.actorGetGamepadAxisValueComment },



    ]

    static type: NonPrimitiveType;

    static gamepadTool?: GamepadTool = (typeof window === 'undefined') ? undefined : new GamepadTool();

    isActing: boolean = true;

    isDestroyed: boolean = false;

    actorManager: ActorManager;

    copyFrom(otherActor: ActorClass) {
        this.isActing = otherActor.isActing;
        this.isDestroyed = otherActor.isDestroyed;
    }

    /*
    * TermCodeGenerator.invokeConstructor does compiler magic to ensure that this method is called AFTER the constructor
    * of the child class of actor is FULLY finished
    */
    _registerListeners(t: Thread) {
        this.actorManager = t.scheduler.interpreter.actorManager;
        if (this._mj$act$void$ != ActorClass.prototype._mj$act$void$) {
            this.actorManager.registerActor(this, "act");
        }

        if (this._mj$act$void$double != ActorClass.prototype._mj$act$void$double) {
            this.actorManager.registerActor(this, "actWithTime");
        }

        if (this._mj$onKeyDown$void$String != ActorClass.prototype._mj$onKeyDown$void$String) {
            this.actorManager.registerActor(this, "keyDown");
        }

        if (this._mj$onKeyTyped$void$String != ActorClass.prototype._mj$onKeyTyped$void$String) {
            this.actorManager.registerActor(this, "keyPressed");
        }

        if (this._mj$onKeyUp$void$String != ActorClass.prototype._mj$onKeyUp$void$String) {
            this.actorManager.registerActor(this, "keyUp");
        }

    }

    _cj$_constructor_$Actor$(t: Thread, callback: CallbackParameter) {
        t.s.push(this);
        if(callback) callback();
    }

    _mj$act$void$(t: Thread, callback: () => {}): void {

    }

    _mj$act$void$double(t: Thread, callback: () => {}, dt: number): void {

    }

    _mj$onKeyTyped$void$String(t: Thread, callback: CallbackParameter, key: StringClass): void {

    }

    _mj$onKeyUp$void$String(t: Thread, callback: CallbackParameter, key: StringClass): void {

    }

    _mj$onKeyDown$void$String(t: Thread, callback: CallbackParameter, key: StringClass): void {
    }

    _mj$destroy$void$(t: Thread) {
        this.destroy();
    }

    _mj$isKeyUp$boolean$string(t: Thread, callback: CallbackParameter, key: string) {
        let keyboardManager = t.scheduler.interpreter.keyboardManager;
        if (!keyboardManager) {
            t.s.push(true);
            return;
        }
        t.s.push(!keyboardManager.isPressed(key));
    }

    _mj$isKeyDown$boolean$string(t: Thread, callback: CallbackParameter, key: string) {
        let keyboardManager = t.scheduler.interpreter.keyboardManager;
        if (!keyboardManager) {
            t.s.push(false);
            return;
        }
        t.s.push(keyboardManager.isPressed(key));
    }


    _isDestroyed(): boolean {
        return this.isDestroyed;
    }

    _isActing(): boolean {
        return this.isActing;
    }

    _stopActing(): void {
        this.isActing = false;
    }

    _restartActing(): void {
        this.isActing = true;
    }

    destroy() {
        this.actorManager?.unregisterActor(this);
        this.isDestroyed = true;
    }

    _isGamepadButtonDown(gamepadIndex: number, buttonIndex: number){
        if(!ActorClass.gamepadTool) return false;
        return ActorClass.gamepadTool.isGamepadButtonPressed(gamepadIndex, buttonIndex);
    }

    _isGamepadConnected(gamepadIndex: number): boolean {
        if(!ActorClass.gamepadTool) return false;
        return ActorClass.gamepadTool.isGamepadConnected(gamepadIndex);
    }

    _getGamepadAxisValue(gamepadIndex: number, axisIndex: number): number {
        if(!ActorClass.gamepadTool) return 0.0;
        return ActorClass.gamepadTool.getGamepadAxisValue(gamepadIndex, axisIndex);
    }
}