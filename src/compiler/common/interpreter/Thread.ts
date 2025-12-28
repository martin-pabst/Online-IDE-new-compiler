import { ReplReturnValue } from "../../java/parser/repl/ReplReturnValue.ts";
import { ArithmeticExceptionClass } from "../../java/runtime/system/javalang/ArithmeticExceptionClass.ts";
import { ClassCastExceptionClass } from "../../java/runtime/system/javalang/ClassCastExceptionClass.ts";
import { IndexOutOfBoundsExceptionClass } from "../../java/runtime/system/javalang/IndexOutOfBoundsExceptionClass.ts";
import { NullPointerExceptionClass } from "../../java/runtime/system/javalang/NullPointerExceptionClass.ts";
import { ObjectClass, StringClass } from "../../java/runtime/system/javalang/ObjectClassStringClass.ts";
import { RuntimeExceptionClass } from "../../java/runtime/system/javalang/RuntimeException.ts";
import { ThrowableClass } from "../../java/runtime/system/javalang/ThrowableClass.ts";
import { NonPrimitiveType } from "../../java/types/NonPrimitiveType.ts";
import { InterpreterMessages } from "../language/InterpreterMessages.ts";
import { IRange } from "../range/Range.ts";
import { ArrayToStringCaster, TextContainer } from "./ArrayToStringCaster.ts";
import { CallbackParameter } from "./CallbackParameter.ts";
import { CatchBlockInfo, Exception, ExceptionInfo } from "./ExceptionInfo.ts";
import { ExceptionPrinter } from "./ExceptionPrinter.ts";
import { Program } from "./Program";
import { Step } from "./Step.ts";
import { ProgramState } from "./ProgramState.ts";
import { Scheduler } from "./Scheduler";
import { CallbackFunction, KlassObjectRegistry } from "./StepFunction.ts";
import { SystemException } from "./SystemException.ts";
import { ThreadState } from "./ThreadState.ts";
import { IThrowable, Stacktrace } from "./ThrowableType.ts";


export type ThreadStateInfoAfterRun = {
    state: ThreadState,
    stepsExecuted: number;
}

export class Thread {
    s: any[] = [];  // stack
    programStack: ProgramState[] = [];

    currentProgramState!: ProgramState;  // also lies on top of programStack

    #lastRange?: IRange;

    #state: ThreadState = ThreadState.new;
    get state() { return this.#state } // setter: see below

    exception?: Exception;
    stackTrace?: Stacktrace;

    #stepEndsWhenProgramstackLengthLowerOrEqual: number = -1;
    #stepEndsWhenStepIndexIsNotEqualTo: number = Number.MAX_SAFE_INTEGER;

    haltAtNextBreakpoint: boolean = true;

    #stepCallback!: () => void;

    classes: KlassObjectRegistry;

    maxStepsPerSecond?: number;
    lastTimeThreadWasRun: number = performance.now();

    #isExecutingReplProgram: boolean = false;
    #stacksizeBeforeREPLProgram: number = 0;
    replReturnValue?: ReplReturnValue;

    numberOfSteps: number = 0;

    #lastCheckedArrays: any[][] = [];

    callbackAfterTerminated?: () => void;

    threadObject?: any;     // For java: type is ThreadClass

    lastReentrenceCounter?: number;

    /**
     * counts how many times a method with @Fullspeed annotation was entered.
     * As long as this counter is > 0, this thread is executing in fullspeed-mode
     */
    fullspeedCounter: number = 0; 

    get assertionObservers() {
        return this.scheduler.interpreter.assertionObserverList;
    }

    constructor(public scheduler: Scheduler, public name: string, initialStack: any[]) {
        this.s = initialStack;
        this.classes = scheduler.classObjectRegistry;
    }

    /**
     * returns true if Thread exits
     */
    run(maxNumberOfSteps: number): ThreadStateInfoAfterRun {
        this.numberOfSteps = 0;
        let stack = this.s; // for performance reasons
        let step: Step;
        let currentProgramState!: ProgramState;
        let stepIndex!: number;

        if (!this.currentProgramState) {
            this.state = ThreadState.terminated;
            return {
                state: this.state,
                stepsExecuted: 0
            };
        }

        try {
            //@ts-ignore
            while (this.numberOfSteps < maxNumberOfSteps && this.state == ThreadState.running) {
                // For performance reasons: store all necessary data in local variables
                currentProgramState = this.currentProgramState;
                stepIndex = currentProgramState.stepIndex;
                let currentStepList = currentProgramState.currentStepList;
                let stackBase = currentProgramState.stackBase;

                if (this.#stepEndsWhenProgramstackLengthLowerOrEqual >= 0) {
                    // singlestep-mode (slower...)
                    while (this.numberOfSteps < maxNumberOfSteps &&
                        this.state == ThreadState.running && !this.#isSingleStepCompleted()) {
                        step = currentStepList[stepIndex];

                        /**
                         * Behold, here the steps run!
                         */
                        stepIndex = step.run!(this, stack, stackBase);
                        if (currentProgramState != this.currentProgramState) {
                            currentProgramState.stepIndex = stepIndex;

                            currentProgramState = this.currentProgramState;
                            stepIndex = currentProgramState.stepIndex;
                            currentStepList = currentProgramState.currentStepList;
                            stackBase = currentProgramState.stackBase;
                        }

                        this.currentProgramState.stepIndex = stepIndex;
                        this.numberOfSteps++;
                        this.#lastRange = step.range as IRange;
                    }
                    if (this.#isSingleStepCompleted()) {
                        if (currentProgramState) currentProgramState.lastExecutedStep = step!;
                        this.#stepCallback();
                        return { state: this.#state, stepsExecuted: this.numberOfSteps }
                    }

                } else {
                    // not in singlestep-mode (faster!)
                    while (this.numberOfSteps < maxNumberOfSteps && this.state == ThreadState.running) {
                        step = currentStepList[stepIndex];

                        /**
                         * Behold, here the steps run!
                         * parameter identifers inside function:
                         *                    t, s, sb, h
                         */

                        // console.log(step.codeAsString);

                        stepIndex = step.run!(this, stack, stackBase);

                        if (currentProgramState != this.currentProgramState) {
                            currentProgramState.stepIndex = stepIndex;

                            currentProgramState.lastExecutedStep = step; // for Exception printing

                            currentProgramState = this.currentProgramState;
                            stepIndex = currentProgramState.stepIndex;
                            currentStepList = currentProgramState.currentStepList;
                            stackBase = currentProgramState.stackBase;
                        }

                        this.numberOfSteps++;
                    }
                }


                currentProgramState.stepIndex = stepIndex;
                // this.currentProgram might by now not be the same as before this inner while-loop
                // because callMethod or returnFromMethod may have been called since from within
                // step.run
            }

            if (currentProgramState) currentProgramState.lastExecutedStep = step!;

        } catch (exception) {
            if (currentProgramState) currentProgramState.stepIndex = stepIndex;

            if (exception instanceof ThrowableClass) {
                this.#throwException(exception, step!);
            } else {
                if (this.#state != ThreadState.terminatedWithException) {
                    this.#handleSystemException(exception, step!, currentProgramState);
                }
            }

        }

        return { state: this.#state, stepsExecuted: this.numberOfSteps }
    }

    /**
     * We use this method if we are in a call chain outside of Thread.run-method, e.g.
     * called by a network-event in database-classes.
     */
    throwRuntimeExceptionOnLastExecutedStep(exception: Exception & IThrowable) {
        let lastExcecutedStep = this.currentProgramState!.lastExecutedStep;
        if (!lastExcecutedStep) {
            lastExcecutedStep = this.currentProgramState.currentStepList[this.currentProgramState.stepIndex];
        }
        this.#throwException(exception, lastExcecutedStep);
    }

    #handleSystemException(exception: any, step: Step, currentProgramState: ProgramState) {
        console.log(exception);
        console.log(step!.codeAsString);
        //@ts-ignore
        this.#throwException(new SystemException("SystemException", InterpreterMessages.SystemException() + exception), step!);
    }

    public set state(state: ThreadState) {
        this.#state = state;
        if (state == ThreadState.terminated && this.callbackAfterTerminated) {
            this.callbackAfterTerminated();
            this.callbackAfterTerminated = undefined;
        }
    }

    #isSingleStepCompleted() {
        // if step to execute is on same position in program text as next step: execute both!
        if (this.programStack.length == this.#stepEndsWhenProgramstackLengthLowerOrEqual) {
            let nextStep = this.currentProgramState.program.stepsSingle[this.currentProgramState.stepIndex];
            if (nextStep && nextStep.range && this.#lastRange) {
                if (this.#lastRange.startLineNumber == nextStep.range.startLineNumber && this.#lastRange.startColumn == nextStep.range.startColumn) {
                    return false;
                }
            }
        }

        return this.programStack.length < this.#stepEndsWhenProgramstackLengthLowerOrEqual ||
            this.programStack.length == this.#stepEndsWhenProgramstackLengthLowerOrEqual &&
            this.currentProgramState.stepIndex != this.#stepEndsWhenStepIndexIsNotEqualTo;
    }

    markSingleStepOver(callbackWhenSingleStepOverEnds: () => void) {

        this.#stepEndsWhenProgramstackLengthLowerOrEqual = this.programStack.length;
        this.#stepEndsWhenStepIndexIsNotEqualTo = this.currentProgramState.stepIndex;

        this.#stepCallback = () => {
            this.#stepEndsWhenProgramstackLengthLowerOrEqual = -1;
            callbackWhenSingleStepOverEnds();
        };

    }

    unmarkStep() {
        this.#stepEndsWhenProgramstackLengthLowerOrEqual = -1;
    }

    markStepOut(callbackWhenStepOutEnds: () => void) {

        this.#stepEndsWhenProgramstackLengthLowerOrEqual = this.programStack.length - 1;
        this.#stepEndsWhenStepIndexIsNotEqualTo = -1;
        this.#stepCallback = () => {
            this.#stepEndsWhenProgramstackLengthLowerOrEqual = -1;
            callbackWhenStepOutEnds();
        };
    }

    startIfNotEmptyOrDestroy() {
        if (this.programStack.length == 0) {
            this.scheduler.removeThread(this);
            this.return;
        }
        if ([ThreadState.new, ThreadState.runnable].indexOf(this.state) >= 0) {
            this.state = ThreadState.running;
        }
    }

    #throwException(exception: Exception & IThrowable, step: Step) {

        exception.file = this.currentProgramState.program.module.file;
        exception.range = exception.range || step.getValidRangeOrUndefined();
        exception.thread = this;

        let classNames = exception.getExtendedImplementedIdentifiers().slice();
        classNames.push(exception.getIdentifier());

        let rawStackTrace: ProgramState[] = [];
        let newProgramStates: ProgramState[] = [];
        let foundCatchBlockInfo: CatchBlockInfo | undefined;

        do {

            let ps = this.programStack[this.programStack.length - 1];

            while (ps?.exceptionInfoList.length > 0) {
                let exInfo = ps.exceptionInfoList.pop()!;

                if (exInfo.aquiredObjectLocks) {
                    while (exInfo.aquiredObjectLocks.length > 0) this.#leaveSynchronizedBlock(exInfo.aquiredObjectLocks.pop()!);
                }

                for (let cn of classNames) {
                    for (let catchBlockInfo of exInfo.catchBlockInfos) {
                        if (catchBlockInfo.exceptionTypes[cn]) {
                            foundCatchBlockInfo = catchBlockInfo;
                            break;
                        }
                    }
                    if (foundCatchBlockInfo) break;
                }

                if (foundCatchBlockInfo) {
                    rawStackTrace.push(Object.assign({}, ps));
                    exception.stacktrace = rawStackTrace.map(state => {
                        return {
                            methodIdentifierWithClass: state.program.methodIdentifierWithClass,
                            range: <IRange>state.currentStepList[state.stepIndex].range,
                            file: state.program.module.file
                        }
                    });

                    // prepare stack and program stack for executing catch block:
                    let ps1 = Object.assign({}, ps);
                    ps1.stepIndex = foundCatchBlockInfo.catchBlockBeginsWithStepIndex;
                    ps1.recentlyThrownException = exception;
                    ps1.afterExceptionTrimStackToSize = exInfo.stackSize;
                    newProgramStates.push(ps1);

                    break;
                } else {
                    if (exInfo.finallyBlockIndex) {
                        let ps2 = Object.assign({}, ps);
                        ps2.stepIndex = exInfo.finallyBlockIndex;
                        ps2.recentlyThrownException = exception;
                        ps2.afterExceptionTrimStackToSize = exInfo.stackSize;
                        newProgramStates.push(ps2);
                    }
                }
            }

            if (ps?.aquiredObjectLocks) {
                while (ps.aquiredObjectLocks.length > 0) this.#leaveSynchronizedBlock(ps.aquiredObjectLocks.pop()!);
            }

            rawStackTrace.push(ps);
            this.programStack.pop();

        } while (this.programStack.length > 0 && !foundCatchBlockInfo)

        if (this.programStack.length == 0 && !foundCatchBlockInfo) {
            this.stackTrace = rawStackTrace.filter(ste => ste != null).map(ste => {

                return {
                    range: ste.lastExecutedStep ? ste.lastExecutedStep.getValidRangeOrUndefined() : ste.currentStepList[ste.stepIndex].getValidRangeOrUndefined(),
                    methodIdentifierWithClass: ste.program.methodIdentifierWithClass,
                    file: ste.program.module.file
                }

            });
            this.stackTrace[0].range = exception.range;
            this.exception = exception;
            // ExceptionPrinter.print(exception, this.stackTrace, this.scheduler.interpreter.printManager);
            ExceptionPrinter.printWithLinks(exception, this.stackTrace, this.scheduler.interpreter.printManager,
                this.scheduler.interpreter.breakpointManager?.main);

            this.scheduler.interpreter.exceptionMarker?.markException(exception, step)

            this.state = ThreadState.terminatedWithException;

            //@ts-ignore
            this.currentProgramState = undefined;
        } else {
            while (newProgramStates.length > 0) this.programStack.push(newProgramStates.pop()!);
            this.currentProgramState = this.programStack[this.programStack.length - 1];
        }

        if (this.#isExecutingReplProgram) this.returnFromREPLProgram(exception, step);

    }

    getExceptionAndTrimStack(removeException: boolean): Exception | undefined {
        let exception = this.currentProgramState.recentlyThrownException;
        if (!exception) return undefined;
        if (removeException) this.currentProgramState.recentlyThrownException = undefined;
        this.s.length = this.currentProgramState.afterExceptionTrimStackToSize!;
        return exception;
    }

    beginTryBlock(exceptionInfo: ExceptionInfo) {
        exceptionInfo.stackSize = this.s.length;
        this.currentProgramState.exceptionInfoList.push(exceptionInfo);
    }

    endCatchTryBlock() {
        this.currentProgramState.exceptionInfoList.pop();
    }


    /**
     * return is called from within the step function
     */
    return(returnValue: any) {
        while (this.s.length > this.currentProgramState.stackBase) {
            this.s.pop();
        }

        let callback = this.programStack.pop()?.callbackAfterFinished;
        if (typeof returnValue !== "undefined") this.s.push(returnValue);
        if (callback != null) {
            callback();
        }

        if (this.programStack.length > 0) {
            this.currentProgramState = this.programStack[this.programStack.length - 1];
            // if (this.scheduler.executeMode == ExecuteMode.singleSteps &&
            //     this.currentProgramState.currentStepList == this.currentProgramState.program.stepsMultiple) {
            //     this.switchFromMultipleToSingleStep(this.currentProgramState);
            // }
        } else {
            this.state = ThreadState.terminated;
        }
    }

    startREPLProgram() {
        this.#stacksizeBeforeREPLProgram = this.s.length;
        this.#isExecutingReplProgram = true;
    }

    /**
     * return from REPL-Program
     */
    returnFromREPLProgram(exception?: Exception & IThrowable, step?: Step) {
        this.#isExecutingReplProgram = false;

        // TODO: getStacktrace and get exception to the output...
        let replProgram = this.programStack.pop();
        while (replProgram && !replProgram.program.isReplProgram) {
            replProgram = this.programStack.pop();
        }

        this.replReturnValue = undefined;

        let text = this.s.length > this.#stacksizeBeforeREPLProgram + 1 ? this.s.pop() : undefined;
        let value = this.s.length > this.#stacksizeBeforeREPLProgram ? this.s.pop() : undefined;

        this.replReturnValue = {
            value: value,
            text: text,
            type: replProgram?.program.module.returnType
        }

        // shouldn't be necessary:
        while (this.s.length > this.#stacksizeBeforeREPLProgram) {
            this.s.pop();
        }

        if (replProgram?.callbackAfterFinished) {
            replProgram.callbackAfterFinished();
        }


        this.currentProgramState = this.programStack[this.programStack.length - 1];
        this.state = ThreadState.immediatelyAfterReplStatement;

        if (!this.currentProgramState) {
            this.currentProgramState = {
                currentStepList: [],
                stepIndex: 0,
                exceptionInfoList: [],
                //@ts-ignore
                program: undefined,
                stackBase: 0
            }
        }

    }


    /**
     * call a java method which is executed by this thread
     * @param program
     */
    pushProgram(program: Program, callback?: CallbackFunction) {
        // Object creation is faster than Object.assign, see
        // https://measurethat.net/Benchmarks/Show/18401/0/objectassign-vs-creating-new-objects3
        let state: ProgramState = {
            program: program,
            currentStepList: program.stepsSingle,
            // currentStepList: this.scheduler.executeMode == NExecuteMode.singleSteps ? program.stepsSingle : program.stepsMultiple,
            stackBase: this.s.length - program.numberOfParameters - program.numberOfThisObjects,  // 1 because of [this, parameter 1, ..., parameter n]
            stepIndex: 0,
            callbackAfterFinished: callback,
            exceptionInfoList: []
        }

        for (let i = 0; i < program.numberOfLocalVariables; i++) {
            this.s.push(null);
        }

        this.programStack.push(state);
        this.currentProgramState = state;
    }

    /**
     * call a java method which is executed by this thread
     * @param program
     */
    pushReplProgram(program: Program, callback?: CallbackFunction) {

        // Object creation is faster than Object.assign, see
        // https://measurethat.net/Benchmarks/Show/18401/0/objectassign-vs-creating-new-objects3
        let state: ProgramState = {
            program: program,
            currentStepList: program.stepsSingle,
            // currentStepList: this.scheduler.executeMode == NExecuteMode.singleSteps ? program.stepsSingle : program.stepsMultiple,
            stackBase: this.currentProgramState ? this.currentProgramState.stackBase : 0,
            stepIndex: 0,
            callbackAfterFinished: callback,
            exceptionInfoList: []
        }

        this.programStack.push(state);
        this.currentProgramState = state;
    }

    newArray(defaultValue: any, ...dimensions: number[]): Array<any> {
        let n0 = dimensions[0];

        if (n0 < 0) {
            throw new RuntimeExceptionClass(InterpreterMessages.ArrayLengthNegative());
        }

        if (dimensions.length == 1) {
            return Array(n0).fill(defaultValue);
        }
        else {
            let array = [];
            let subdimensions = dimensions.slice(1);
            // Recursive call
            for (let i = 0; i < n0; i++) {
                array.push(this.newArray(defaultValue, ...subdimensions));
            }
            return array;
        }

    }


    print(text: string | undefined, color: number | undefined) {
        if (text == null) text = "null";
        this.scheduler.interpreter.printManager.print(text, false, color);
    }

    println(text: string | undefined, color: number | undefined) {
        if (text == null && typeof text != "undefined") text = "null";
        this.scheduler.interpreter.printManager.print(text, true, color);
    }

    clearScreen() {
        this.scheduler.interpreter.printManager.clear();
    }

    /**
     * Runtime method to throw Arithmetic exception
     * @param message
     * @param startLineNumber
     * @param startColumn
     * @param endLineNumber
     * @param endColumn
     */
    AE(message: string, startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {

        let range: IRange = {
            startLineNumber: startLineNumber,
            startColumn: startColumn,
            endLineNumber: endLineNumber,
            endColumn: endColumn
        }

        let exception = new ArithmeticExceptionClass(message);
        exception.range = range;

        throw exception;
    }

    NPE(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {

        let range: IRange = {
            startLineNumber: startLineNumber,
            startColumn: startColumn,
            endLineNumber: endLineNumber,
            endColumn: endColumn
        }

        let exception = new NullPointerExceptionClass(InterpreterMessages.NullPointerException());
        exception.range = range;

        throw exception;
    }

    CheckCast(object: ObjectClass, destType: string, startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number): ObjectClass {
        if (object == null) return object;

        let type = object.getType() as NonPrimitiveType;

        if (type.fastExtendsImplements(destType)) return object;

        let range: IRange = {
            startLineNumber: startLineNumber,
            startColumn: startColumn,
            endLineNumber: endLineNumber,
            endColumn: endColumn
        }

        let exception = new ClassCastExceptionClass(InterpreterMessages.ClassCastException(type.identifier, destType));
        exception.range = range;

        throw exception;
    }

    CheckCastToArray(object: ObjectClass, startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number): ObjectClass {
        if (object == null) return object;
        if(Array.isArray(object)) return object;

        let type = object.getType() as NonPrimitiveType;

       let range: IRange = {
            startLineNumber: startLineNumber,
            startColumn: startColumn,
            endLineNumber: endLineNumber,
            endColumn: endColumn
        }

        let exception = new ClassCastExceptionClass(InterpreterMessages.CastToArrayException(type.identifier));
        exception.range = range;

        throw exception;

    }


    Instanceof(object: ObjectClass, type: string, stackOffsetForPatternIdentifier?: number): boolean {
        if (object == null) return false;
        let objType = object.getType() as NonPrimitiveType;
        let ret = objType.fastExtendsImplements(type);
        if (stackOffsetForPatternIdentifier) {
            this.s[stackOffsetForPatternIdentifier] = ret ? object : null;
        }
        return ret;
    }

    ToString(t: Thread, callback: CallbackParameter, object: ObjectClass, maximumLength: number = 200) {
        if (object == null) {
            t.s.push(null);
            if (callback) callback();
            return;
        }

        if (Array.isArray(object)) {
            this._arrayOfObjectsToString(object, () => {
                this.s.push(new StringClass(this.s.pop()));
                if (callback) callback();
            }, maximumLength);
            return;
        }

        if (typeof object == "object") {
            object._mj$toString$String$(t, callback);
            return;
        }

        t.s.push("" + object);    // parameter object is indeed no object
        if (callback) callback();
        return;
    }

    NullstringIfNull(s: StringClass): string {
        return s == null ? "null" : s.value;
    }

    EnterFullspeedMode() {
        this.fullspeedCounter++;
    }

    ExitFullspeedMode() {
        this.fullspeedCounter--;
        if (this.fullspeedCounter == 0){
            this.state = ThreadState.changeSpeedRequested;
        }
    }

    exit() {
        this.state = ThreadState.terminated;
    }

    registerCodeReached(key: string) {
        this.scheduler.interpreter.registerCodeReached(key);
    }

    registerEnteringSynchronizedBlock(aquiredLock: ObjectClass) {
        let ps = this.programStack[this.programStack.length - 1];
        if (ps.exceptionInfoList.length > 0) {
            let ei = ps.exceptionInfoList[ps.exceptionInfoList.length - 1];
            if (!ei.aquiredObjectLocks) ei.aquiredObjectLocks = [];
            ei.aquiredObjectLocks.push(aquiredLock);
        } else {
            if (!ps.aquiredObjectLocks) ps.aquiredObjectLocks = [];
            ps.aquiredObjectLocks.push(aquiredLock);
        }
    }

    registerLeavingSynchronizedBlock() {
        let ps = this.programStack[this.programStack.length - 1];
        if (ps.exceptionInfoList.length > 0) {
            let ei = ps.exceptionInfoList[ps.exceptionInfoList.length - 1];
            if (ei.aquiredObjectLocks && ei.aquiredObjectLocks.length > 0) ei.aquiredObjectLocks.pop();
        } else {
            if (ps.aquiredObjectLocks && ps.aquiredObjectLocks.length > 0) ps.aquiredObjectLocks.pop();
        }

    }

    leaveAllSynchronizedBlocksInCurrentMethod() {
        let ps = this.programStack[this.programStack.length - 1];

        while (ps?.exceptionInfoList.length > 0) {
            let exInfo = ps.exceptionInfoList.pop()!;

            if (exInfo.aquiredObjectLocks) {
                while (exInfo.aquiredObjectLocks.length > 0) exInfo.aquiredObjectLocks.pop().leaveSynchronizedBlock(this, false);
            }

        }

        if (ps.aquiredObjectLocks) {
            while (ps.aquiredObjectLocks.length > 0) {
                ps.aquiredObjectLocks.pop().leaveSynchronizedBlock(this, false);
            }
        }

    }

    #leaveSynchronizedBlock(aquiredLock: ObjectClass) {
        aquiredLock.leaveSynchronizedBlock(this);
    }

    _arrayOfObjectsToString(array: any[], callback?: CallbackParameter, maximumLength: number = 200) {
        let textContainer: TextContainer = { text: "" };
        ArrayToStringCaster.arrayOfObjectsToString(textContainer, this, array, () => {
            this.s.push(textContainer.text);
            if (callback) callback();
        }, maximumLength);
    }

    _primitiveElementOrArrayToString(element: any): string {
        if (Array.isArray(element)) {
            return "[" + element.map(e => this._primitiveElementOrArrayToString(e)).join(", ") + "]";
        }

        if (typeof element == "string") return '"' + element + '"';

        return "" + element;
    }

    /*
     * The following methods are used to check array indices, see TermCodeGenerator.compileSelectArrayElement
     *  java: 17 + a[3][4]   -> javascript: 17 + __t.ArrayValue2(a, 3, 4)
     *
     *  java: a[4] = 17 -> javascript: (__t.lastCheckedArray = a)[__t.CheckLastIndex(4)] = 17   (__t stores result of __t.Array1(a, 3))
     *  java: a[3][4] = 17 -> javascript: __t.Array1(a, 3)[__t.CheckLastIndex(4)] = 17   (__t stores result of __t.Array1(a, 3))
     *  java: a[3][4][5] = 17 -> javascript: __t.Array2(a, 3, 4)[__t.CheckLastIndex(5)] = 17 (__t stores result of __t.Array2(a, 3, 4))
     */
    IOBE(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {
        let range: IRange = {
            startLineNumber: startLineNumber,
            startColumn: startColumn,
            endLineNumber: endLineNumber,
            endColumn: endColumn
        }
        let exception = new IndexOutOfBoundsExceptionClass(InterpreterMessages.SimpleArrayIndexOutOfBoundsException());
        exception.range = range;
        throw exception;
    }

    ArrayValue1(array: any[], index: number) {
        if (index < 0 || index >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index, array.length, 1));
        return array[index];
    }

    ArrayValue2(array: any[][], index1: number, index2: number) {
        if (index1 < 0 || index1 >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index1, array.length, 1));
        let a2 = array[index1];
        if (index2 < 0 || index2 >= a2.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index2, a2.length, 2));
        return a2[index2];
    }

    ArrayValue3(array: any[], index1: number, index2: number, index3: number) {
        if (index1 < 0 || index1 >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index1, array.length, 1));
        let a2 = array[index1];
        if (index2 < 0 || index2 >= a2.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index2, a2.length, 2));
        a2 = a2[index2];
        if (index3 < 0 || index3 >= a2.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index3, a2.length, 3));
        return a2[index3];
    }

    ArrayValueN(array: any[], ...indices: number[]) {
        for (let i = 0; i < indices.length; i++) {
            let index = indices[i];
            if (index < 0 || index >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index, array.length, i + 1));
            array = array[index];
        }
        return array;
    }

    Array0(array: any[]) {
        this.#lastCheckedArrays.push(array);
        return array;
    }

    Array1(array: any[], index: number) {
        if (index < 0 || index >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index, array.length, 1));
        let ret = array[index];
        this.#lastCheckedArrays.push(ret);
        return ret;
    }

    Array2(array: any[][], index1: number, index2: number) {
        if (index1 < 0 || index1 >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index1, array.length, 1));
        let a2 = array[index1];
        if (index2 < 0 || index2 >= a2.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index2, a2.length, 2));

        let ret = a2[index2];
        this.#lastCheckedArrays.push(ret);
        return ret;

    }

    ArrayN(array: any[], ...indices: number[]) {
        for (let i = 0; i < indices.length; i++) {
            let index = indices[i];
            if (index < 0 || index >= array.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index, array.length, i + 1));
            array = array[index];
        }

        let ret = array;
        this.#lastCheckedArrays.push(ret);
        return ret;
    }

    primitiveStringToStringObject(s: string | null): StringClass {
        if (s == null) return null;
        return new StringClass(s);
    }


    CheckLastIndex(index: number, dimension: number): number {
        let array = this.#lastCheckedArrays.pop();
        if (index < 0 || index >= array!.length) throw new IndexOutOfBoundsExceptionClass(InterpreterMessages.ArrayIndexOutOfBoundsException(index, array!.length, dimension));
        return index;
    }

}