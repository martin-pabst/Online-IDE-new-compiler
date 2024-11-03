import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { Exception } from "../../../../common/interpreter/ExceptionInfo.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../../common/interpreter/ThreadState.ts";
import { IThrowable, Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { IRange } from "../../../../common/range/Range.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { EnumClass } from "./EnumClass.ts";
import { ObjectClass, StringClass } from "./ObjectClassStringClass.ts";
import { RunnableInterface } from "./RunnableInterface.ts";
import { RuntimeExceptionClass } from "./RuntimeException.ts";


export class ThreadStateClass extends EnumClass {

    static values: ThreadStateClass[] = [
    new ThreadStateClass("new", ThreadState.new),
    new ThreadStateClass("runnable", ThreadState.runnable),
    new ThreadStateClass("blocked", ThreadState.blocked),
    new ThreadStateClass("waiting", ThreadState.waiting),
    new ThreadStateClass("timed_waiting", ThreadState.timedWaiting),
    new ThreadStateClass("terminated", ThreadState.terminated)];

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "enum Thread.State" }
    ]

    static type: NonPrimitiveType;

    static _values(): ThreadStateClass[] {
        return ThreadStateClass.values;
    }

    /**
     * NEW
     * A thread that has not yet started is in this state.
     * RUNNABLE
     * A thread executing in the Java virtual machine is in this state.
     * BLOCKED
     * A thread that is blocked waiting for a monitor lock is in this state.
     * WAITING
     * A thread that is waiting indefinitely for another thread to perform a particular action is in this state.
     * (see Object.wait(), Object.notify(), Object.notifyAll())
     * TIMED_WAITING
     * A thread that is waiting for another thread to perform an action for up to a specified waiting time is in this state.
     * TERMINATED
     * A thread that has exited is in this state.
     */



}



export class ThreadClass extends ObjectClass implements RunnableInterface {

    stacktrace: Stacktrace = [];
    range?: IRange;

    thread?: Thread;
    runnable?: RunnableInterface;
    name?: string;

    maxStepsPerSecond?: number;

    threadsToJoinWhenFinished: Thread[] = [];

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Thread extends Object implements Runnable" , comment: JRC.threadClassComment},
        { type: "method", signature: "public Thread()", java: ThreadClass.prototype._jconstructor , comment: JRC.threadConstructorComment},
        { type: "method", signature: "public Thread(Runnable runnable)", java: ThreadClass.prototype._jconstructor , comment: JRC.threadConstructorRunnableComment},
        { type: "method", signature: "public Thread(Runnable runnable, string name)", java: ThreadClass.prototype._jconstructor , comment: JRC.threadConstructorRunnableComment},
        { type: "method", signature: "public Thread(string name)", java: ThreadClass.prototype._jconstructor1 , comment: JRC.threadConstructorComment},
        { type: "method", signature: "public Thread.State getState()", java: ThreadClass.prototype._mj$getState$Thread_State$ , comment: JRC.threadGetStateComment },
        { type: "method", signature: "public void run()", java: ThreadClass.prototype._mj$run$void$ , comment: JRC.threadRunComment},
        { type: "method", signature: "public void start()", java: ThreadClass.prototype._mj$start$void$ , comment: JRC.threadStartComment},
        { type: "method", signature: "public void join()", java: ThreadClass.prototype._mj$join , comment: JRC.threadJoinComment},
        { type: "method", signature: "public void join(int milliseconds)", java: ThreadClass.prototype._mj$join , comment: JRC.threadJoinComment2},
        { type: "method", signature: "public string getName()", template: `§1.name` , comment: JRC.threadGetNameComment},
        { type: "method", signature: "public void setName(string name)", native: ThreadClass.prototype._setName , comment: JRC.threadSetNameComment},
        { type: "method", signature: "public void setSpeed(int maxStepsPerSecond)", java: ThreadClass.prototype._setSpeed , comment: JRC.threadSetSpeedComment},
        { type: "method", signature: "public static void sleep(int milliseconds)", java: ThreadClass._sleep , comment: JRC.threadSleepComment},
        { type: "method", signature: "public static Thread currentThread()", java: ThreadClass._currentThread , comment: JRC.threadCurrentThreadComment},
    ]


    static type: NonPrimitiveType;

    constructor() {
        super();
    }

    _jconstructor(t: Thread, callback?: CallbackFunction, runnable?: RunnableInterface, name?: string) {
        t.s.push(this);
        this.runnable = runnable;
        this.name = name || "user generated thread";

    }

    _jconstructor1(t: Thread, callback?: CallbackFunction, name?: string) {
        t.s.push(this);
        this.name = name || "user generated thread";

    }

    _mj$getState$Thread_State$(t: Thread, callback: CallbackFunction){

        let state: ThreadStateClass = ThreadStateClass._values()[0];
        if(this.thread){
            state = ThreadStateClass._values()[this.thread.state];
        }

        t.s.push(state);
        if(callback) callback;
    }

    _mj$run$void$(t: Thread, callback: CallbackFunction): void {
        if(callback) callback();   // do nothing!
    }

    _mj$start$void$(t: Thread, callback: CallbackFunction): void {

        if(!this.thread){

            let runnable = this.runnable;
            if(!runnable) runnable = this;

            this.thread = t.scheduler.createThread(this.name || "user generated thread", []);
            this.thread.threadObject = this;

            let that = this;
            runnable._mj$run$void$(this.thread, () => {
                that.callbackWhenThreadFinished();
            })

            this.thread.startIfNotEmptyOrDestroy();
        }

        if(callback) callback();
    }

    callbackWhenThreadFinished(){
        for (let t of this.threadsToJoinWhenFinished){
            t.scheduler.restoreThread(t);
        }
        this.threadsToJoinWhenFinished.length = 0;
    }

    _mj$join(t: Thread, callback: CallbackFunction, milliseconds?: number){

        // only other thread can join this thread
        if(!this.thread || this.thread == t || this.thread.state >= ThreadState.terminated){
            if(callback) callback();
            return;
        }

        let that = this;

        if(milliseconds){

            setTimeout(() => {
                let index = that.threadsToJoinWhenFinished.indexOf(t);
                if(index >= 0) that.threadsToJoinWhenFinished.splice(index, 1);
                t.scheduler.restoreThread(t);
            }, milliseconds);

            t.state = ThreadState.timedWaiting;
        } else {
            t.state = ThreadState.waiting;
        }

        this.threadsToJoinWhenFinished.push(t);
        t.scheduler.suspendThread(t);

        if(callback) callback();
    }

    _toString() {
        return new StringClass(this.getClassName() + ": ");
    }

    _setName(name: string){
        this.name = name;
        if(this.thread) this.thread.name = name;
    }

    _setSpeed(maxStepsPerSecond: number){
        this.maxStepsPerSecond = maxStepsPerSecond > 0 ? maxStepsPerSecond : undefined;
        if(this.thread) this.thread.maxStepsPerSecond = this.maxStepsPerSecond;
    }

    static _sleep(t: Thread, callback: CallbackFunction, milliseconds: number){
        if(milliseconds < 0){
            throw new RuntimeExceptionClass(JRC.millisecondsNotPositiveError());
        }

        t.scheduler.suspendThread(t);
        t.state = ThreadState.timedWaiting;

        setTimeout(() => {
            t.scheduler.restoreThread(t);
        }, milliseconds);

        if(callback) callback();
    }

    static _currentThread(t: Thread, callback: CallbackFunction){
        if(!t.threadObject) t.threadObject = new ThreadClass();
        (<ThreadClass>t.threadObject).thread = t;
        t.s.push(t.threadObject);
        if(callback) callback();
    }


}