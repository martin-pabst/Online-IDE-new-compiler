/**
 * @link https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.State.html
 */

export enum ThreadState {
    new,// A thread that has not yet started is in this state.
    running,// A thread executing in the Java virtual machine is in this state.
    stoppedAtBreakpoint,
    runnable,// A thread that is blocked waiting for a monitor lock (semaphor!) is in this state.
    waiting,
    timedWaiting,
    terminated,// A thread that has exited is in this state.
    terminatedWithException,
    immediatelyAfterReplStatement,
    changeSpeedRequested // for SystemTools.setSpeed
}
