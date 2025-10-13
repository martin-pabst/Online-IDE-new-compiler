import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { ObjectClass, StringClass } from "../javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../javalang/RuntimeException";
import { KeyListenerInterface } from "./KeyListenerInterface";
import { SchedulerState } from "../../../../common/interpreter/SchedulerState";

export class SystemToolsClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class SystemTools extends Object", comment: JRC.SystemToolsClassComment   },

        {type: "method", signature: "static void clearScreen()", java: SystemToolsClass._mj$clearScreen$void$, comment: JRC.SystemToolsClearScreenComment},
        {type: "method", signature: "static void setSpeed(int stepsPerSecond)", java: SystemToolsClass._mj$setSpeed$void$int, comment: JRC.SystemToolsSetSpeedComment},
        {type: "method", signature: "static int getSpeed()", java: SystemToolsClass._mj$getSpeed$int$, comment: JRC.SystemToolsGetSpeedComment},
        {type: "method", signature: "static void pause(int milliseconds)", java: SystemToolsClass._mj$pause$void$int, comment: JRC.SystemToolsPauseComment},
        {type: "method", signature: "static int getStepCount()", java: SystemToolsClass._mj$getStepCount$int$, comment: JRC.SystemToolsGetStepCountComment},
        {type: "method", signature: "static void addKeyListener(KeyListener keyListener)", java: SystemToolsClass._mj$addKeyListener$void$KeyListener, comment: JRC.SystemToolsAddKeyListenerComment},
        {type: "method", signature: "static int getNumberOfProcessorCores()", java: SystemToolsClass._mj$getNumberOfProcessorCores$int$, comment: JRC.SystemToolsGetNumberOfProcessorCoresComment},

    ]

    static _mj$clearScreen$void$(t: Thread){
        t.clearScreen();
    }

    static _mj$setSpeed$void$int(t: Thread, stepsPerSecond: number){
        let interpreter = t.scheduler.interpreter;
        if(interpreter.scheduler.state == SchedulerState.running){
            t.scheduler.interpreter.setStepsPerSecond(stepsPerSecond, stepsPerSecond < 0);
        }
        t.state = ThreadState.changeSpeedRequested;
    }

    static _mj$getSpeed$int$(t: Thread) {
        t.s.push(t.scheduler.interpreter.getStepsPerSecond())
    }

    static _mj$getNumberOfProcessorCores$int$(t: Thread) {
        t.s.push(navigator.hardwareConcurrency);
    }

    static _mj$pause$void$int(t: Thread, milliseconds: number){
        if(milliseconds < 0){
            throw new RuntimeExceptionClass(JRC.SystemToolsPauseTimeLower0())
        }
        if(milliseconds == 0) return;
        t.state = ThreadState.timedWaiting;
        setTimeout(() => {
            if(t.state == ThreadState.timedWaiting){
                t.state = ThreadState.running;
            }
        }, milliseconds);
    }

    static _mj$getStepCount$int$(t: Thread) {
        t.s.push(t.scheduler.stepCountSinceStartOfProgram + t.numberOfSteps + 1);
    }

    static _mj$addKeyListener$void$KeyListener(t: Thread, keyListener: KeyListenerInterface){
        t.scheduler.interpreter.keyboardManager?.addKeyPressedListener((key) => {
            let newThread = t.scheduler.createThread("Keyboard listener thread", []);
            keyListener._mj$onKeyTyped$void$String(newThread, undefined, new StringClass(key));
            newThread.startIfNotEmptyOrDestroy();
        })
    }
}

