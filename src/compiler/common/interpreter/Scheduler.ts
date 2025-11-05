import { JavaTypeStore } from "../../java/module/JavaTypeStore.ts";
import { JavaClass } from "../../java/types/JavaClass.ts";
import { JavaMethod } from "../../java/types/JavaMethod.ts";
import { Executable } from "../Executable.ts";
import { InterpreterMessages } from "../language/InterpreterMessages.ts";
import { ProgramPointerPositionInfo } from "../monacoproviders/ProgramPointerManager.ts";
import { Interpreter } from "./Interpreter";
import { Program } from "./Program";
import { Step } from "./Step.ts";
import { SchedulerExitState } from "./SchedulerExitState.ts";
import { SchedulerState } from "./SchedulerState.ts";
import { Helpers, KlassObjectRegistry, StepParams } from "./StepFunction.ts";
import { Thread, ThreadStateInfoAfterRun } from "./Thread";
import { ThreadState } from "./ThreadState.ts";
import { Module } from "../module/Module.ts";

export type SetOneTimeBreakpointAtFirstVisibleLineMode = "stepInto" | "stepOver" | "run";


export class Scheduler {
    runningThreads: Thread[] = [];
    #suspendedThreads: Thread[] = [];
    #storedThreads?: Thread[] = undefined;

    #currentThreadIndex: number = 0;
    state!: SchedulerState;

    keepThread: boolean = false;    // for single step mode

    classObjectRegistry: KlassObjectRegistry = {};

    #timeStampProgramStarted: number = 0;
    stepCountSinceStartOfProgram: number = 0;
    #libraryTypeStore?: JavaTypeStore;

    #lastTimeDebuggeroutputWritten: number = 0;
    #updateDebuggerEveryMs: number = 1000;

    // if pause button is pressed when there is no thread
    // and Program has actors then interpreter sets this callback:
    onStartingNextThreadCallback?: () => void;

    #callbackAfterProgramFinished?: () => void;

    callbackAfterReplProgramFinished?: () => void;

    runsSynchronously: boolean = false;


    constructor(public interpreter: Interpreter) {
        this.setState(SchedulerState.not_initialized);
    }


    /**
     * This method is called every tick by LoadController.tick and gets told how many steps it may execute. It distributes
     * this steps evenly among all running threads and calls their run-method.
     *
     * This one of three nested main loops:
     *
     * Outer loop: LoadController.tick
     * Middle loop: this one
     * Inner loop: Thread.run
     * @param numberOfStepsMax
     * @returns
     */
    run(numberOfStepsMax: number): SchedulerExitState {

        if (this.state != SchedulerState.running) return SchedulerExitState.nothingMoreToDo;

        // If pause button is pressed while no thread is in state running then noStartinNextThreadCallback is set to wait
        // for next running thread. This is neccessary because we we want to show program pointer immediately after program is paused.
        if (this.onStartingNextThreadCallback) {
            if (this.getNextStepPosition()) {
                this.onStartingNextThreadCallback();
                this.onStartingNextThreadCallback = undefined;
                return SchedulerExitState.nothingMoreToDo;
            }
        }

        let stepsPerThread = Math.ceil(numberOfStepsMax / this.runningThreads.length);

        let numberOfStepsInThisRun = 0;     // for displaying number of steps after program halt
        if (this.runningThreads.length == 0) return SchedulerExitState.nothingMoreToDo;

        let lastStoredStepsInThisRun = -1;          // watchdog uses this to decide if there's any runnable thread left

        let threadState: ThreadStateInfoAfterRun = {
            state: ThreadState.running,
            stepsExecuted: 0
        };

        while (numberOfStepsInThisRun < numberOfStepsMax && this.state == SchedulerState.running) {

            // watchdog: if all threads had beed run once and no one executed a step then exit the loop to avoid endless looping when there's nothing to do:
            if (this.#currentThreadIndex == 0) {
                if (lastStoredStepsInThisRun == numberOfStepsInThisRun || this.runningThreads.length == 0) {
                    break;
                }
                lastStoredStepsInThisRun = numberOfStepsInThisRun;
            }

            // fetch next thread (round robin)
            let currentThread = this.runningThreads[this.#currentThreadIndex];
            if (!currentThread) {
                if (this.runningThreads.length > 0) {
                    this.#currentThreadIndex = 0;
                    currentThread = this.runningThreads[0];
                    lastStoredStepsInThisRun = -1;
                } else {
                    return SchedulerExitState.nothingMoreToDo;
                }
            }

            // has current thread a speed limit?
            if (currentThread.maxStepsPerSecond && currentThread.fullspeedCounter == 0) {
                let t = performance.now();
                let msPerStep = 1000 / currentThread.maxStepsPerSecond;
                let elapsedTimeSinceLastThreadRun = t - currentThread.lastTimeThreadWasRun;
                let numberOfSteps = Math.min(elapsedTimeSinceLastThreadRun / msPerStep, stepsPerThread);
                if (numberOfSteps > 0) {

                    // run!
                    threadState = currentThread.run(numberOfSteps);

                    // compute lastTimeThreadWasRun in a way to achieve exact step frequency currentThread.maxStepsPerSecond
                    currentThread.lastTimeThreadWasRun =
                        currentThread.lastTimeThreadWasRun + threadState.stepsExecuted * msPerStep;
                    if (currentThread.maxStepsPerSecond < 20) {
                        this.interpreter.showProgramPointer(this.getNextStepPosition(currentThread));
                        this.interpreter.updateDebugger();
                    } else {
                        if (this.state == SchedulerState.running) this.interpreter.hideProgrampointerPosition();
                    }
                } else {
                    threadState.state = currentThread.state;  // this is crucial as threadState.state would otherwise have a stale value of last running thread
                    threadState.stepsExecuted = 0;
                    if (this.runningThreads.length == 1) {
                        return SchedulerExitState.nothingMoreToDo;
                    }
                }
            } else {
                // run in full speed!
                threadState = currentThread.run(stepsPerThread);
            }

            numberOfStepsInThisRun += threadState.stepsExecuted;  // to avoid endless loop and to keep statistics

            if (threadState.state != ThreadState.running) {
                switch (threadState.state) {
                    case ThreadState.terminated:
                    case ThreadState.terminatedWithException:
                        // TODO: Print Exception if present

                        this.runningThreads.splice(this.#currentThreadIndex, 1);
                        if (this.#currentThreadIndex > this.runningThreads.length - 1) {
                            this.#currentThreadIndex = -1;   // it gets incremented by 1 later on
                            this.keepThread = false;
                        }

                        if (!this.hasRunningOrWaitingThreads() && !this.interpreter.hasActorsOrPAppletOrRunningTimers()
                            || threadState.state == ThreadState.terminatedWithException) {

                            if (currentThread.maxStepsPerSecond) {
                                this.interpreter.hideProgrampointerPosition();
                            }

                            this.stepCountSinceStartOfProgram += numberOfStepsInThisRun;

                            this.interpreter.setState(SchedulerState.stopped);
                            if (threadState.state == ThreadState.terminatedWithException) {
                                this.interpreter.setState(SchedulerState.error);
                            }
                            if (this.#callbackAfterProgramFinished) {
                                let cb = this.#callbackAfterProgramFinished;
                                this.#callbackAfterProgramFinished = undefined;
                                cb();
                            }
                            return SchedulerExitState.nothingMoreToDo;
                        }
                        break;
                    case ThreadState.stoppedAtBreakpoint:
                        currentThread.state = ThreadState.running;
                        this.interpreter.pause();
                        break;
                    case ThreadState.immediatelyAfterReplStatement:
                        if (currentThread.programStack.length == 0) {
                            this.runningThreads.splice(this.runningThreads.indexOf(currentThread), 1);
                        }
                        if (this.callbackAfterReplProgramFinished) {
                            let cb = this.callbackAfterReplProgramFinished;
                            this.callbackAfterReplProgramFinished = undefined;
                            cb();
                        }

                        break;
                    case ThreadState.changeSpeedRequested:
                        currentThread.state = ThreadState.running;
                        this.stepCountSinceStartOfProgram += numberOfStepsInThisRun;
                        return SchedulerExitState.nothingMoreToDo
                }

            }

            // If user pressed stepOver or stepInto button then she/he expects
            // program pointer to stay inside current thread. Therefore keepThread == true is set in this case.
            if (!this.keepThread) {
                this.#currentThreadIndex++;
                if (this.#currentThreadIndex >= this.runningThreads.length) {
                    this.#currentThreadIndex = 0;
                }
            }
        }

        this.stepCountSinceStartOfProgram += numberOfStepsInThisRun;

        return SchedulerExitState.giveMeAdditionalTime;
    }

    hasRunningOrWaitingThreads(): boolean {
        if (this.runningThreads.length > 0) return true;
        for (let t of this.#suspendedThreads) {
            if (t.state == ThreadState.timedWaiting) return true;
        }
        return false;
    }

    setState(newState: SchedulerState) {
        switch (newState) {
            case SchedulerState.running:
                this.#timeStampProgramStarted = performance.now();
                this.stepCountSinceStartOfProgram = 0;
                break;
            case SchedulerState.stopped:
            case SchedulerState.error:
                if (this.state == SchedulerState.running) {
                    let printManager = this.interpreter.printManager;
                    if (!printManager.isTestPrintManager()) {
                        let dt = performance.now() - this.#timeStampProgramStarted;
                        let stepsPerSecond = Math.round(this.stepCountSinceStartOfProgram / dt * 1000);
                        this.interpreter.printManager.print("", true, undefined);
                        this.interpreter.printManager.print(InterpreterMessages.ExecutionTime() + ": " +
                            Math.round(dt * 100) / 100 + " ms, " +
                            this.stepCountSinceStartOfProgram + " steps, " +
                            this.#printMillions(stepsPerSecond) + " steps/s", true, undefined);
                    }
                }
                this.#terminateAllThreads();
                break;
        }
        this.state = newState;
    }

    #printMillions(n: number): string {
        if (n < 1e6) return "" + Math.trunc(n);

        n = Math.trunc(n / 1e3) * 1e3 / 1e6;

        return n + " million";
    }


    #terminateAllThreads() {
        this.runningThreads.forEach(t => t.state = ThreadState.terminated);
        this.#suspendedThreads.forEach(t => t.state = ThreadState.terminated);

        this.runningThreads.length = 0;
        this.#suspendedThreads.length = 0;
    }

    #ifBreakpointPresentDisableOnce() {
        let currentThread = this.runningThreads[this.#currentThreadIndex];
        if (currentThread) {
            let programState = currentThread.currentProgramState;
            let currentStep = programState?.currentStepList[programState.stepIndex];
            if (currentStep?.isBreakpoint()) {
                currentThread.haltAtNextBreakpoint = false;
            }
        }
    }

    runSingleStepKeepingThread(stepInto: boolean, callback: () => void) {
        this.keepThread = true;

        this.#ifBreakpointPresentDisableOnce();

        let thread = this.getCurrentThread();
        if (thread == null) return;

        if (stepInto) {
            if (this.state == SchedulerState.paused) {
                this.setState(SchedulerState.running);

                let finished: boolean = false;
                do {
                    this.run(1);
                    let step = this.getNextStep();
                    // skip steps for which position can't be shown to user:
                    finished = !(step && !step.getValidRangeOrUndefined() && thread.state == ThreadState.running)
                } while (!finished)

                this.setState(SchedulerState.paused);
            }
            callback();
        } else {

            thread.markSingleStepOver(() => {
                callback();
            });

            this.interpreter.setState(SchedulerState.running);
        }
    }

    stepOut(callback: () => void) {
        this.keepThread = true;
        const thread = this.runningThreads[this.#currentThreadIndex];
        if (thread == null) return;
        thread.markStepOut(() => {
            callback();
        });
    }

    /**
     * when pause-button is clicked while thread executes a single step then
     * cancel this single-step execution
     */
    unmarkCurrentlyExecutedSingleStep() {
        let thread = this.runningThreads[this.#currentThreadIndex];
        if (thread) thread.unmarkStep();
    }

    createThread(name: string, initialStack: any[] = [], randomPriority: boolean = false): Thread {
        let thread = new Thread(this, name, initialStack);
        if (randomPriority) {
            this.runningThreads.splice(Math.floor(Math.random() * this.runningThreads.length + 1), 0, thread);
        } else {
            this.runningThreads.push(thread);
        }

        if (thread.name != "act method-thread") {
            if (!this.interpreter.isMaxSpeed) {
                thread.maxStepsPerSecond = this.interpreter.stepsPerSecondGoal;
            }
        }

        return thread;
    }

    removeThread(thread: Thread) {
        this.runningThreads.splice(this.runningThreads.indexOf(thread), 1);
    }

    suspendThread(thread: Thread) {
        let index = this.runningThreads.indexOf(thread);
        if (index >= 0) {
            this.runningThreads.splice(index, 1);
            if (this.#currentThreadIndex > index) {
                this.#currentThreadIndex--;
            }
        }
        this.#suspendedThreads.push(thread);
    }

    restoreThread(thread: Thread) {
        if (thread.state >= ThreadState.terminated) return;

        thread.state = ThreadState.running;

        let index = this.#suspendedThreads.indexOf(thread);
        if (index >= 0) {
            this.#suspendedThreads.splice(index, 1);
        }

        this.runningThreads.push(thread);
    }

    getNextStep(currentThread?: Thread): Step | undefined {
        currentThread = currentThread || this.runningThreads[this.#currentThreadIndex];
        if (!currentThread) return undefined;
        let programState = currentThread.currentProgramState;
        let step = programState?.currentStepList[programState.stepIndex];
        return step || undefined;
    }

    /**
     * for displaying next program position in editor
     */
    getNextStepPosition(currentThread?: Thread): ProgramPointerPositionInfo | undefined {
        currentThread = currentThread || this.runningThreads[this.#currentThreadIndex];
        if (!currentThread) return undefined;
        let programState = currentThread.currentProgramState;
        let step = programState?.currentStepList[programState.stepIndex];
        if (!step) return undefined;

        return {
            programOrmoduleOrFile: programState.program,
            //@ts-ignore
            range: step.range,
        }
    }

    #initIntern(executable: Executable) {
        this.classObjectRegistry = executable.classObjectRegistry;
        this.#libraryTypeStore = executable.libraryModuleManager.typestore;

        this.runningThreads = [];
        this.#suspendedThreads = [];
        this.#currentThreadIndex = 0;

        this.keepThread = false;
    }

    init(executable: Executable, mainModule: Module, setOneTimeBreakpointAtFirstVisibleLineMode: SetOneTimeBreakpointAtFirstVisibleLineMode): Thread | undefined {

        this.#initIntern(executable);
        executable.initializeClassObjects();

        const mainThread = this.createThread("main thread");

        if (mainModule) {
            if (!mainModule?.startMainProgram(mainThread, setOneTimeBreakpointAtFirstVisibleLineMode == "stepOver")) {
                // TODO: Error "Main program not startable"
                return undefined
            }
        }

        for (const staticInitStep of executable.staticInitializationSequence) {
            mainThread.pushProgram(staticInitStep.program);
        }

        if (setOneTimeBreakpointAtFirstVisibleLineMode == "stepInto") {
            for (let i = mainThread.programStack.length - 1; i >= 0; i--) {
                let ps = mainThread.programStack[i]!;
                for (let step of ps.currentStepList) {
                    if (step.range?.startLineNumber >= 0) {
                        step.setBreakpoint(true);
                        i = -1; // break outer loop
                        break;
                    }
                }
            }
        }

        return mainThread;
    }

    initJUnitTestMethodAndReturnMainThread(executable: Executable | undefined, method: JavaMethod, callback: () => void): Thread | undefined {
        if (!executable) return undefined;

        this.#initIntern(executable);

        let mainThread = this.createThread("main thread");

        let klass = method.classEnumInterface as JavaClass;
        let program = new Program(klass.module, undefined, klass.identifier + ".testStub_" + method.identifier);

        // Step 1: instantiate object and call it's parameterless constructor
        let parameterlessConstructors = klass.getAllMethods().filter(m => m.isConstructor && m.parameters.length == 0);
        if (parameterlessConstructors.length == 0) {
            // this shouldn't happen:
            console.log("Couldn't find parameterless constrructor for class " + klass.identifier + ".");
            return undefined;
        }

        let parameterlessConstructor = parameterlessConstructors[0]!;

        let statement1 = `new ${Helpers.classes}["${klass.identifier}"]().${parameterlessConstructor.getInternalName("java")}(${StepParams.thread}, ${StepParams.stack}, undefined);
                          return 1;\n`;
        program.addStep(statement1);

        // Step 2: call test method
        let statement2 = `${Helpers.elementRelativeToStackbase(0)}.${method.getInternalName("java")}(${StepParams.thread}, undefined);
                          return 2; `;
        program.addStep(statement2);

        // Step 3: return
        let statement3 = `${Helpers.return}(); `;
        program.addStep(statement3);

        if (program.compileToJavascriptFunctions() != null) {
            // this error should be impossible:
            console.log("TestManager.executeSingleTest: Error compiling test method stub.");
            return undefined;
        }

        mainThread.pushProgram(program);
        this.#callbackAfterProgramFinished = callback;

        for (let staticInitStep of executable.staticInitializationSequence) {
            mainThread.pushProgram(staticInitStep.program);
        }

        return mainThread;

    }

    getCurrentThread(): Thread | undefined {
        return this.runningThreads[this.#currentThreadIndex];
    }

    resetLastTimeExecutedTimestamps() {
        this.runningThreads.filter(t => t.maxStepsPerSecond).forEach(t => t.lastTimeThreadWasRun = performance.now());
    }

    /**
     * 14.08.2024: Not used -> looking for better alternatives
     */
    // periodicallyUpdateDebugger() {
    //     if(this.runsSynchronously) return;
    //     if (this.state == SchedulerState.running &&
    //         performance.now() - this.lastTimeDebuggeroutputWritten > this.updateDebuggerEveryMs) {
    //         this.lastTimeDebuggeroutputWritten = performance.now();
    //         this.interpreter.updateDebugger();
    //     }
    // }


    setMaxSpeed(value: number, isMaxSpeed: boolean) {
        this.runningThreads.filter(t => t.name != 'act method-thread').forEach(t => t.maxStepsPerSecond = isMaxSpeed ? undefined : value);
    }

    #removeAllThreads() {
        this.runningThreads = [];
        this.#suspendedThreads = [];
    }

    setAsCurrentThread(standaloneThread: Thread) {
        let index = this.runningThreads.indexOf(standaloneThread);
        if (index >= 0) {
            this.#currentThreadIndex = index;
        } else {
            this.runningThreads.push(standaloneThread);
            this.#currentThreadIndex = this.runningThreads.length - 1;
        }
        standaloneThread.state = ThreadState.running;
    }

    saveAllThreadsBut(currentThread: Thread) {
        this.#storedThreads = this.runningThreads.filter(t => t != currentThread);
        this.runningThreads = [currentThread];
        this.#currentThreadIndex = 0;
    }

    retrieveThreads() {
        if (this.#storedThreads) {
            this.runningThreads = this.runningThreads.concat(this.#storedThreads);
            this.#currentThreadIndex = 0;
        }
    }

    exit(status: number) {
        console.log("Exited with status " + status);
        this.interpreter.printManager?.print("Exited with status " + status, true, 0xffffff);
        this.interpreter.stop(false);
        // this.setState(SchedulerState.stopped);
    }

    getAllThreads(): Thread[] {
        return this.runningThreads.concat(this.#suspendedThreads);
    }
}
