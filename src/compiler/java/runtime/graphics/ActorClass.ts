import { Object3D } from "three";
import { GamepadTool } from "../../../../tools/GamepadTool";
import { CallbackParameter } from "../../../common/interpreter/CallbackParameter";
import { Interpreter } from "../../../common/interpreter/Interpreter";
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { NullPointerExceptionClass } from "../system/javalang/NullPointerExceptionClass";
import { ObjectClass, StringClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException";
import { ActorManager } from "./ActorManager";
import { IActor } from "./IActor";
import { IWorld } from "./IWorld";


// TODO: Gamepad support
/**
 * Base class of all Objects which have an act-method and kan sense keyboard or gamepad
 */
export class ActorClass extends ObjectClass implements IActor {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "abstract class Actor extends Object" },

        { type: "method", signature: "Actor()", java: ActorClass.prototype._cj$_constructor_$Actor$ },
        { type: "method", signature: "void act()", java: ActorClass.prototype._mj$act$void$, comment: JRC.actorActMethodComment },
        { type: "method", signature: "void act(double deltaTime)", java: ActorClass.prototype._mj$act$void$double, comment: JRC.actorActMethodComment2 },
        { type: "method", signature: "void onKeyTyped(String key)", java: ActorClass.prototype._mj$onKeyTyped$void$String, comment: JRC.actorOnKeyTypedComment },
        { type: "method", signature: "void onKeyUp(String key)", java: ActorClass.prototype._mj$onKeyUp$void$String, comment: JRC.actorOnKeyUpComment },
        { type: "method", signature: "void onKeyDown(String key)", java: ActorClass.prototype._mj$onKeyDown$void$String, comment: JRC.actorOnKeyDownComment },
        { type: "method", signature: "void destroy()", java: ActorClass.prototype._mj$destroy$void$ },
        { type: "method", signature: "final boolean isKeyUp(string key)", java: ActorClass.prototype._mj$isKeyUp$boolean$string, comment: JRC.actorIsKeyUpComment },
        { type: "method", signature: "final boolean isKeyDown(string key)", java: ActorClass.prototype._mj$isKeyDown$boolean$string, comment: JRC.actorIsKeyDownComment },
        { type: "method", signature: "final boolean isActing()", native: ActorClass.prototype._isActing, comment: JRC.actorIsActingComment },
        { type: "method", signature: "final boolean isDestroyed()", native: ActorClass.prototype._isDestroyed, comment: JRC.actorIsDestroyedComment },
        { type: "method", signature: "final void stopActing()", native: ActorClass.prototype._stopActing, comment: JRC.actorStopActingComment },
        { type: "method", signature: "final void restartActing()", native: ActorClass.prototype._restartActing, comment: JRC.actorRestartActingComment },

        { type: "method", signature: "final boolean isGamepadButtonDown(int gamepadIndex, int buttonIndex)", native: ActorClass.prototype._isGamepadButtonDown, comment: JRC.actorIsGamepadButtonDownComment },
        { type: "method", signature: "final boolean isGamepadConnected(int gamepadIndex)", native: ActorClass.prototype._isGamepadConnected, comment: JRC.actorIsGamepadConnectedComment },
        { type: "method", signature: "final double getGamepadAxisValue(int gamepadIndex, int axisIndex)", native: ActorClass.prototype._getGamepadAxisValue, comment: JRC.actorGetGamepadAxisValueComment },

        {type: "method", signature: "static void setActFrequency(int frequencyInHz)", java: ActorClass._mj$setCallActMethodFrequency$void$int$, comment: JRC.SystemToolsSetCallActMethodFrequency},

        { type: "method", signature: "void onMouseMovement(double dx, double dy)", java: ActorClass.prototype._mj$onMouseMovement$void$double$double, comment: JRC.actorOnMouseMovementComment },
        { type: "method", signature: "final void enablePointerLock()", java: ActorClass.prototype._mj$enablePointerLock$void$, comment: JRC.actorEnablePointerLockComment },
        { type: "method", signature: "final void disablePointerLock()", java: ActorClass.prototype._mj$disablePointerLock$void$, comment: JRC.actorDisablePointerLockComment },

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

        if (this._mj$onMouseMovement$void$double$double != ActorClass.prototype._mj$onMouseMovement$void$double$double) {
            this.actorManager.registerActor(this, "mouseMovement");
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

    _mj$onMouseMovement$void$double$double(t: Thread, callback: CallbackParameter, dx: number, dy: number): void {
    }

    _mj$enablePointerLock$void$(t: Thread, callback: CallbackParameter): void {
        let world = t.scheduler.interpreter.retrieveObject("WorldClass") as IWorld;
        world?.mouseManager.enablePointerLock();
        if (callback) callback();
    }

    _mj$disablePointerLock$void$(t: Thread, callback: CallbackParameter): void {
        let world = t.scheduler.interpreter.retrieveObject("WorldClass") as IWorld;
        world?.mouseManager.disablePointerLock();
        if (callback) callback();
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

    static _mj$setCallActMethodFrequency$void$int$(t: Thread, frequency: number){
        t.scheduler.interpreter.actorManager.setTimerFrequency(frequency);
    };

}