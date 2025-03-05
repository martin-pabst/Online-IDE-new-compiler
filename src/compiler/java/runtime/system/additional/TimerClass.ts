import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { SchedulerState } from "../../../../common/interpreter/SchedulerState.ts";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass.ts";
import { RunnableInterface } from "../javalang/RunnableInterface.ts";

type TimerState = "running" | "paused" | "stopped";

export class TimerClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Timer extends Object", comment: JRC.TimerClassComment},
        {type: "method", signature: "static void repeat(Runnable runnable, int deltaTimeMilliseconds)", java: TimerClass._mj$repeat$void$Runnable$int, comment: JRC.TimerClassRepeatComment},
        {type: "method", signature: "static void executeLater(Runnable runnable, int deltaTimeMilliseconds)", java: TimerClass._mj$executeLater$void$Runnable$int, comment: JRC.TimerClassExecuteLaterComment},
        {type: "method", signature: "void repeat(Runnable runnable, int deltaTimeMilliseconds)", java: TimerClass.prototype._mj$repeat$void$Runnable$int, comment: JRC.TimerClassRepeatComment},
        {type: "method", signature: "void pause()", native: TimerClass.prototype._pause, comment: JRC.TimerClassPauseComment},
        {type: "method", signature: "void restart()", native: TimerClass.prototype._restart, comment: JRC.TimerClassRestartComment}
    ];

    static type: NonPrimitiveType;

    state: TimerState = "running";
    intervalIds: any[] = [];

    isCurrentlyRunning: boolean[] = [];


    static _mj$repeat$void$Runnable$int(t: Thread, runnable: RunnableInterface, dt: number){
        let timer = new TimerClass();
        timer._mj$repeat$void$Runnable$int(t, undefined, runnable, dt);
    }

    static _mj$executeLater$void$Runnable$int(t: Thread, runnable: RunnableInterface, dt: number){
        setTimeout(() => {
            if([SchedulerState.running, SchedulerState.paused].indexOf(t.scheduler.state) < 0) return;
            let newThread = t.scheduler.createThread("timer-thread");
            runnable._mj$run$void$(newThread, undefined);
            newThread.startIfNotEmptyOrDestroy();
        }, dt);
    }


    _mj$repeat$void$Runnable$int(t: Thread, callback: CallbackFunction, runnable: RunnableInterface, dt: number){

        if(this.intervalIds.length == 0){
            t.scheduler.interpreter.eventManager.once("stop", () => {
                this.intervalIds.forEach(id => clearInterval(id))
            })
        }

        let index = this.intervalIds.length;
        this.isCurrentlyRunning.push(false);
        let that = this;

        this.intervalIds.push(setInterval(() => {
            if(t.scheduler.state == SchedulerState.running && that.state == "running" && !that.isCurrentlyRunning[index]){
                let newThread = t.scheduler.createThread("timer-thread");
                runnable._mj$run$void$(newThread, undefined);
                newThread.callbackAfterTerminated = () => {
                    that.isCurrentlyRunning[index] = false;
                }
                that.isCurrentlyRunning[index] = true;
                newThread.startIfNotEmptyOrDestroy();
            }
        }, dt));

    }

    _pause(){
        this.state = "paused";
    }

    _restart(){
        this.state = "running";
    }


}