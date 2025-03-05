import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { Exception } from "../../../../common/interpreter/ExceptionInfo.ts";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../../common/interpreter/ThreadState.ts";
import { IThrowable, Stacktrace } from "../../../../common/interpreter/ThrowableType.ts";
import { IRange } from "../../../../common/range/Range.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { EnumClass } from "./EnumClass.ts";
import { ObjectClass, StringClass } from "./ObjectClassStringClass.ts";
import { RunnableInterface } from "./RunnableInterface.ts";
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter.ts";



export class SemaphoreClass extends ObjectClass {

    private permitsAvailable = 1;

    private waitingThreads1: Thread[] = [];

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Semaphore extends Object" , comment: JRC.semaphoreClassComment},
        { type: "method", signature: "public Semaphore(int permits)", java: SemaphoreClass.prototype._jconstructor , comment: JRC.semaphoreConstructorComment},
        { type: "method", signature: "public final int availablePermits()", native: SemaphoreClass.prototype._nAvailablePermits , comment: JRC.semaphoreAvailablePermitsComment},
        { type: "method", signature: "public void acquire()", java: SemaphoreClass.prototype._mj$acquire$void , comment: JRC.semaphoreAcquireComment},
        { type: "method", signature: "public void release()", java: SemaphoreClass.prototype._mj$release$void , comment: JRC.semaphoreReleaseComment},
    ]


    static type: NonPrimitiveType;

    constructor() {
        super();
    }

    _jconstructor(t: Thread, callback: CallbackParameter, permits: number) {
        t.s.push(this);
        this.permitsAvailable = permits;
    }

    _nAvailablePermits(): number {
        return this.permitsAvailable;
    }

    _mj$acquire$void(t: Thread, callback: CallbackFunction){
        if(this.permitsAvailable > 0){
            this.permitsAvailable--;
        } else {
            t.state = ThreadState.runnable;
            t.scheduler.suspendThread(t);
            this.waitingThreads1.push(t);
        }

        if(callback) callback();
    }

    _mj$release$void(t: Thread, callback: CallbackFunction){
        this.permitsAvailable++;

        let threadToUnblock = this.waitingThreads1.shift();

        if(threadToUnblock){
            t.scheduler.restoreThread(threadToUnblock);
        }
    }

}