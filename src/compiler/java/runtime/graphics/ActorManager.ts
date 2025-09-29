import * as PIXI from 'pixi.js';
import { Interpreter } from "../../../common/interpreter/Interpreter";
import { KeyDownListener, KeyPressedListener, KeyUpListener, KeyboardManager } from "../../../common/interpreter/KeyboardManager";
import { Thread } from "../../../common/interpreter/Thread";
import { ThreadState } from "../../../common/interpreter/ThreadState";
import { StringClass } from "../system/javalang/ObjectClassStringClass";
import { ActorType, ActorTypes, IActor } from "./IActor";
import { ShapeClass } from './ShapeClass';
import { ContainerProxy } from './ContainerProxy';

export class ActorManager {
    
    is30HzFrequency: boolean = true;
    #timerId: any = null;
    timerFrequency: number = 30;

    actors: Record<ActorType, IActor[]> = {
        "act": [],
        "actWithTime": [],
        "keyDown": [],
        "keyUp": [],
        "keyPressed": []
    };

    keyDownListener: KeyDownListener = (key: string, isShift: boolean, isCtrl: boolean, isAlt: boolean) => {
        this.onKeyDown(key, isShift, isCtrl, isAlt);
    }

    keyUpListener: KeyUpListener = (key: string) => {
        this.onKeyUp(key);
    }

    keyTypedListener: KeyPressedListener = (key: string) => {
        this.onKeyPressed(key);
    }

    shapesToDestroySafely: ShapeClass[] = [];

    constructor(private interpreter: Interpreter) {
        this.clear();
        this.registerKeyboardListeners(interpreter);
        interpreter.eventManager.on("stop", () => {
            this.setTimerFrequency(30);
        })
    }

    registerKeyboardListeners(interpreter: Interpreter){
        if (interpreter.keyboardManager) {
            interpreter.keyboardManager.addKeyDownListener(this.keyDownListener);
            interpreter.keyboardManager.addKeyUpListener(this.keyUpListener);
            interpreter.keyboardManager.addKeyPressedListener(this.keyTypedListener);
        }
    }

    destroy() {
        if (this.interpreter.keyboardManager) {
            this.interpreter.keyboardManager.removeKeyDownListener(this.keyDownListener);
            this.interpreter.keyboardManager.removeKeyUpListener(this.keyUpListener);
            this.interpreter.keyboardManager.removeKeyPressedListener(this.keyTypedListener);
        }
    }

    registerActor(actor: IActor, type: ActorType): void {
        let list = this.actors[type];
        list.push(actor);
    }

    callActMethods(dt: number) {
        if (this.is30HzFrequency) {
            this.#callActMethodsIntern(dt);
        }
    }

    setTimerFrequency(frequencyHz: number) {
        if (this.#timerId) {
            clearInterval(this.#timerId);
            this.#timerId = null;
        }
        
        this.timerFrequency = frequencyHz;

        if(frequencyHz == 30){
            this.is30HzFrequency = true;
            return;
        }

        this.is30HzFrequency = false;
        this.#timerId = setInterval(() => {
            this.#callActMethodsIntern(1000/frequencyHz);
        }, 1000/frequencyHz);
    }

    runningactThread?: Thread;
    tickHappenedWhenThreadNotEmpty: boolean = false;
    #callActMethodsIntern(dt: number) {
        if (this.runningactThread && [ThreadState.running, ThreadState.waiting].indexOf(this.runningactThread.state) >= 0 ) {
            this.tickHappenedWhenThreadNotEmpty = true;
            return;
        }

        this.shapesToDestroySafely.forEach( shape => {
            shape.container.destroy();
            shape.container = ContainerProxy.instance;
        });
        this.shapesToDestroySafely = [];

        this.tickHappenedWhenThreadNotEmpty = false;

        if (this.actors["act"].length == 0 && this.actors["actWithTime"].length == 0) return;

        this.runningactThread = this.interpreter.scheduler.createThread("act method-thread");
        for (let actor of this.actors["act"]) {
            if (actor.isActing) actor._mj$act$void$(this.runningactThread, undefined);
        }
        for (let actor of this.actors["actWithTime"]) {
            if (actor.isActing) actor._mj$act$void$double(this.runningactThread, undefined, dt);
        }

        if (this.runningactThread.programStack.length > 0) {
            this.runningactThread.state = ThreadState.running;
            this.runningactThread.callbackAfterTerminated = () => {
                if(this.tickHappenedWhenThreadNotEmpty){
                    this.callActMethods(dt);
                }
            }
        } else {
            this.interpreter.scheduler.removeThread(this.runningactThread);
            this.runningactThread = undefined;
        }

    }

    clear() {
        ActorTypes.forEach(at => this.actors[at] = []);
    }

    unregisterActor(actor: IActor) {
        ActorTypes.forEach(at => {
            let actorList = this.actors[at];
            let index = actorList.indexOf(actor);
            if (index >= 0) actorList.splice(index, 1);
        });

    }

    hasActors(): boolean {
        for (let at of ActorTypes) {
            if (this.actors[at].length > 0) {
                return true;
            }
        }
        return false;
    }

    onKeyPressed(key: string): void {
        if (this.actors["keyPressed"].length == 0) return;
        let t = this.interpreter.scheduler.createThread("key pressed event thread");

        for (let actor of this.actors["keyPressed"]) {
            actor._mj$onKeyTyped$void$String(t, undefined, new StringClass(key));
        }
        t.state = ThreadState.running;
    }

    onKeyUp(key: string): void {
        if (this.actors["keyUp"].length == 0) return;
        let t = this.interpreter.scheduler.createThread("key up event thread");

        for (let actor of this.actors["keyUp"]) {
            actor._mj$onKeyUp$void$String(t, undefined, new StringClass(key));
        }
        t.state = ThreadState.running;
    }

    onKeyDown(key: string, isShift: boolean, isCtrl: boolean, isAlt: boolean): void {
        if (this.actors["keyDown"].length == 0) return;
        let t = this.interpreter.scheduler.createThread("key down event thread");

        for (let actor of this.actors["keyDown"]) {
            actor._mj$onKeyDown$void$String(t, undefined, new StringClass(key));
        }
        t.state = ThreadState.running;

    }
}