import { ActorManager } from "../../java/runtime/graphics/ActorManager.ts";
import { IWorld } from "../../java/runtime/graphics/IWorld.ts";
import { IAssertionObserver } from "../../java/runtime/unittests/IAssertionObserver.ts";
import { BreakpointManager } from "../BreakpointManager.ts";
import { Debugger } from "../debugger/Debugger.ts";
import { Executable } from "../Executable.ts";
import { IMain } from "../IMain.ts";
import { Module } from "../module/Module.ts";
import { ProgramPointerManager, ProgramPointerPositionInfo } from "../monacoproviders/ProgramPointerManager.ts";
import { ActionManager } from "./ActionManager.ts";
import { CodeReachedAssertions } from "./CodeReachedAssertions.ts";
import { EventManager } from "./EventManager";
import { ExceptionMarker } from "./ExceptionMarker.ts";
import { GraphicsManager } from "./GraphicsManager.ts";
import { IFilesManager as IFileManager } from "./IFilesManager.ts";
import { IInputManager } from "./IInputManager.ts";
import { DummyPrintManager, IPrintManager } from "./IPrintManager.ts";
import { KeyboardManager } from "./KeyboardManager.ts";
import { LoadController } from "./LoadController";
import { Scheduler } from "./Scheduler";
import { SchedulerExitState } from "./SchedulerExitState.ts";
import { SchedulerState } from "./SchedulerState.ts";
import { Thread } from "./Thread.ts";
import { ThreadState } from "./ThreadState.ts";
import { InterpreterMessages } from './InterpreterMessages.ts';
import { GUIFile } from "../../../client/workspace/GUIFile.ts";


type InterpreterEvents = "stop" | "done" | "resetRuntime" | "stateChanged" |
    "showProgramPointer" | "hideProgramPointer" | "afterExcecutableInitialized";

export class Interpreter {

    #loadController: LoadController;
    scheduler: Scheduler;

    isExternalTimer: boolean = false;
    #timerId: any;
    #timerIntervalMs: number = 33;

    executable?: Executable;

    assertionObserverList: IAssertionObserver[] = [];
    codeReachedAssertions: CodeReachedAssertions = new CodeReachedAssertions();

    // inputManager: InputManager;

    // keyboardTool: KeyboardTool;
    // gamepadTool: GamepadTool;

    printManager: IPrintManager;

    eventManager: EventManager<InterpreterEvents> = new EventManager();

    actorManager: ActorManager;

    #objectStore: Map<string, any> = new Map();

    #actions: string[] = ["start", "pause", "stop", "stepOver",
        "stepInto", "stepOut", "restart"];
    //SchedulerLstatus { done, running, paused, not_initialized }

    // buttonActiveMatrix[button][i] tells if button is active at
    // SchedulerState i
    // export enum SchedulerState { not_initialized, running, paused, stopped, error }

    #buttonActiveMatrix: { [buttonName: string]: boolean[] } = {
        "start": [false, false, true, true, true],
        "pause": [false, true, false, false, false],
        "stop": [false, true, true, false, false],
        "stepOver": [false, false, true, true, true],
        "stepInto": [false, false, true, true, true],
        "stepOut": [false, false, true, false, false],
        "restart": [false, true, true, false, false]
    }

    static #ProgramPointerIndentifier = "ProgramPointer";

    #mainThread?: Thread;
    public stepsPerSecondGoal: number | undefined = 1e8;
    public isMaxSpeed: boolean = true;


    constructor(
        printManager?: IPrintManager,
        private actionManager?: ActionManager,
        public graphicsManager?: GraphicsManager,
        public keyboardManager?: KeyboardManager,
        public breakpointManager?: BreakpointManager,
        public _debugger?: Debugger,
        public programPointerManager?: ProgramPointerManager,
        public inputManager?: IInputManager,
        public fileManager?: IFileManager,
        public exceptionMarker?: ExceptionMarker,
        private main?: IMain
    ) {
        this.printManager = printManager || new DummyPrintManager();

        this.graphicsManager?.setInterpreter(this);

        this.#registerActions();

        this.actorManager = new ActorManager(this);

        if (breakpointManager) breakpointManager.attachToInterpreter(this);

        this.scheduler = new Scheduler(this);
        this.#loadController = new LoadController(this.scheduler, this);
        this.#initTimer();
        this.setStepsPerSecond(1e8, true);
        this.setState(SchedulerState.not_initialized);
    }

    setExecutable(executable: Executable | undefined) {
        if (!executable){
            this.setState(SchedulerState.stopped);
            this.executable = undefined;
            return;
        } 

        this.executable = executable;
        executable.compileToJavascript();
        if (executable.isCompiledToJavascript) {
            this.#init(executable);
            this.setState(SchedulerState.stopped);
            this.eventManager.fire("afterExcecutableInitialized", executable);
        } else {
            this.setState(SchedulerState.not_initialized);
            this.executable = undefined;
        }
    }

    attachAssertionObserver(observer: IAssertionObserver) {
        this.assertionObserverList.push(observer);
    }

    #detachAssertionObserver(observer: IAssertionObserver) {
        let index = this.assertionObserverList.indexOf(observer);
        if (index >= 0) this.assertionObserverList.splice(index, 1);
    }

    #detachAllAssertionObservers() {
        this.assertionObserverList = [];
    }

    #initTimer() {
        let that = this;
        let periodicFunction = () => {

            if (!that.isExternalTimer) {
                that.timerFunction(that.#timerIntervalMs);
            }

        }

        this.#timerId = setInterval(periodicFunction, this.#timerIntervalMs);

    }

    timerFunction(timerIntervalMs: number) {
        this.actorManager.callActMethods(33);
        this.#loadController.tick(timerIntervalMs);
    }

    async executeOneStep(stepInto: boolean) {

        if (this.scheduler.state != SchedulerState.paused) {
            if (this.scheduler.state == SchedulerState.not_initialized) {
                return;
            }
            this.printManager.clear();
            if(!this.executable){
                await this.main.getLanguage().triggerCompile(true);
            } else {

                this.#init(this.executable!);
            }
            this.#resetRuntime();
            this.showProgramPointer(this.scheduler.getNextStepPosition());
            this.updateDebugger();
            this.setState(SchedulerState.paused);
            return;
        }
        this.scheduler.runSingleStepKeepingThread(stepInto, () => {
            this.pause();
            this.showProgramPointer(this.scheduler.getNextStepPosition());
        });
    }

    showProgramPointer(_textPositionWithModule?: ProgramPointerPositionInfo, tag?: string) {
        if (this.programPointerManager) {
            if (!_textPositionWithModule) {

                _textPositionWithModule = this.scheduler.getNextStepPosition();

                if (!this.programPointerManager.fileIsCurrentlyShownInEditor((<Module>_textPositionWithModule?.programOrmoduleOrFile)?.file)) {
                    _textPositionWithModule = undefined;
                }

            }
            if (_textPositionWithModule?.range) {
                this.eventManager.fire("showProgramPointer");
                if (_textPositionWithModule.range.startLineNumber >= 0) {

                    this.programPointerManager.show(_textPositionWithModule, {
                        key: tag || Interpreter.#ProgramPointerIndentifier,
                        isWholeLine: true,
                        className: "jo_revealProgramPointer",
                        rulerColor: "#6fd61b",
                        minimapColor: "#6fd61b",
                        beforeContentClassName: "jo_revealProgramPointerBefore"
                    })

                }
            } else {
                this.programPointerManager.hide(tag || Interpreter.#ProgramPointerIndentifier);
            }

        }
    }

    pause() {
        if (this.scheduler.getNextStepPosition()) {
            this.#pauseIntern();
        } else {
            if (this.hasActorsOrPApplet()) {
                this.scheduler.onStartingNextThreadCallback = () => {
                    this.#pauseIntern();
                }
            }
        }
    }

    #pauseIntern() {
        this.setState(SchedulerState.paused);
        this.scheduler.keepThread = true;
        this.scheduler.unmarkCurrentlyExecutedSingleStep();
        this.showProgramPointer(this.scheduler.getNextStepPosition());
        this.updateDebugger();
    }

    updateDebugger() {
        this._debugger?.showCurrentThreadState();
    }

    #goto(lineNo: number) {
        const thread = this.scheduler.getCurrentThread()
        const programState = thread.currentProgramState

        if (this.main.getCurrentWorkspace().getCurrentlyEditedModule() != programState.program.module) {
            alert(InterpreterMessages.CantJumpToLine());
            return;
        }

        const stepNo = programState.currentStepList.find(s => s.range.startLineNumber <= lineNo && s.range.endLineNumber >= lineNo)?.index
        if (!stepNo) {
            alert(InterpreterMessages.CantJumpToLine());
            return;
        }

        programState.stepIndex = stepNo

        this.showProgramPointer(this.scheduler.getNextStepPosition(thread));
    }

    stop(restart: boolean) {

        this.hideProgrampointerPosition();
        this.inputManager?.hide();

        // this.inputManager.hide();
        this.setState(SchedulerState.stopped);
        this.scheduler.unmarkCurrentlyExecutedSingleStep();

        // Beware: originally this was after this.getTimerClass().stopTimer();
        // if Bitmap caching doesn't work, we need two events...
        // if (this.worldHelper != null) {
        //     this.worldHelper.cacheAsBitmap();
        // }


        setTimeout(() => {
            this.hideProgrampointerPosition();
            if (restart) {
                this.start();
            }
        }, 500);


    }

    async start(fileToStart?: GUIFile) {
        // this.main.getBottomDiv()?.console?.clearErrors();

        this.main?.getBottomDiv()?.errorManager?.hideAllErrorDecorations();
        this.keyboardManager?.clearPressedKeys();
        this.graphicsManager?.shrinkGraphicsDiv();

        if(!this.executable){
            await this.main.getLanguage().triggerCompile(true)
        }

        if (this.scheduler.state != SchedulerState.paused) {
            this.printManager.clear();
            this.#init(this.executable, fileToStart);
            this.#resetRuntime();
        }

        this.hideProgrampointerPosition();

        this.scheduler.keepThread = false;
        this.scheduler.resetLastTimeExecutedTimestamps();

        this.setState(SchedulerState.running);

        // this.getTimerClass().startTimer();
    }

    runMainProgramSynchronously() {
        this.start();
        this.runREPLSynchronously();
    }

    runREPLSynchronously() {
        this.scheduler.runsSynchronously = true;
        this.scheduler.setState(SchedulerState.running);
        try {
            while (this.scheduler.state == SchedulerState.running) {
                if (this.scheduler.run(100) == SchedulerExitState.nothingMoreToDo) {
                    break;
                };
            }
        } finally {
            this.scheduler.runsSynchronously = false;
        }
    }

    #stepOut() {
        this.scheduler.stepOut(() => {
            this.pause();
        })
        this.setState(SchedulerState.running);
    }

    #registerActions() {
        if (!this.actionManager) return;

        this.actionManager.registerAction("interpreter.start", ['F5'], "Programm starten",
            () => {
                if (this.actionManager!.isActive("interpreter.start")) {
                    this.start();
                } else {
                    this.pause();
                }

            });

        this.actionManager.registerAction("interpreter.pause", ['F5'], "Pause",
            () => {
                if (this.actionManager!.isActive("interpreter.start")) {
                    this.start();
                } else {
                    this.pause(); 
                }

            });

        this.actionManager.registerAction("interpreter.stop", [], "Programm anhalten",
            () => {
                if(this.main?.getRepl().state == "standalone"){
                    this.main?.getRepl().init(this.executable);
                    this.setState(SchedulerState.stopped);
                } else {
                    this.stop(false);
                }
            });

        this.actionManager.registerAction("interpreter.toggleBreakpoint", ['F9'], "Haltepunkt an/aus",
            () => {
                this.breakpointManager.toggleBreakpoint(this.main.getMainEditor().getSelection().startLineNumber);
            });

        this.actionManager.registerAction("interpreter.stepOver", ['F10'], "Einzelschritt (Step over)",
            () => {
                this.executeOneStep(false);
            });

        this.actionManager.registerAction("interpreter.stepInto", ['F11'], "Einzelschritt (Step into)",
            () => {
                this.executeOneStep(true);
            });

        this.actionManager.registerAction("interpreter.stepOut", [], "Step out",
            () => {
                this.#stepOut();
            });

        this.actionManager.registerAction("interpreter.restart", [], "Neu starten",
            () => {
                this.stop(true);
            });

        this.actionManager.registerAction("interpreter.goto", [], "Goto",
            () => {
                this.#goto(this.main.getMainEditor().getSelection().startLineNumber)
            });
    }

    #executableHasTests(): boolean {
        return this.executable != null && this.executable.hasTests();
    }

    #findStartableModule(): Module | undefined {
        return this.executable?.findStartableModule(this.main?.getCurrentWorkspace()?.getCurrentlyEditedModule())
    }

    onFileSelected(){
        this.#enableButtonsAccordingToState(this.scheduler.state);
    }

    setState(state: SchedulerState) {
        if (state == SchedulerState.running) {
            this.exceptionMarker?.removeExceptionMarker();
            if (this.main && !this.main.isEmbedded()) {
                (<HTMLDivElement>document.getElementById('jo_runtab'))?.focus();
            }
        }

        if (state == SchedulerState.stopped) {
            this.hideProgrampointerPosition();
            this.eventManager.fire("stop");
            this.keyboardManager?.unsubscribeAllListeners();
            this.actorManager.clear();
            this.actorManager.registerKeyboardListeners(this);
            // TODO
            // this.closeAllWebsockets();
        }

        this.#enableButtonsAccordingToState(state);

        if (state == SchedulerState.stopped) {
            this.eventManager.fire("done");

        }

        let runningStates: SchedulerState[] = [SchedulerState.paused, SchedulerState.running];
        if (runningStates.indexOf(this.scheduler.state) >= 0 && runningStates.indexOf(state) < 0) {
            this.keyboardManager?.unsubscribeAllListeners();
            if(this.main?.getRepl().state != "standalone"){
                this.main?.hideDebugger();
            }
        }

        if (runningStates.indexOf(this.scheduler.state) < 0 && runningStates.indexOf(state) >= 0) {
            this.main?.showDebugger();
        }

        this.eventManager.fire("stateChanged", this.scheduler.state, state);

        this.scheduler.setState(state);
    }

    #enableButtonsAccordingToState(state: SchedulerState) {
        if (this.actionManager) {
            for (let actionId of this.#actions) {
                this.actionManager.setActive("interpreter." + actionId, this.#buttonActiveMatrix[actionId][state]);
            }

            if(this.main?.getRepl()?.state == "standalone"){
                this.actionManager.setActive("interpreter.stop", true);
            }

            const mainModuleExists = this.main?.getLanguage()?.startableMainModuleExists();
            let mainModuleExistsOrTestIsRunning = mainModuleExists || (state == 2 && this.scheduler.state <= 2);

            let buttonStartActive = this.#buttonActiveMatrix['start'][state];
            buttonStartActive = buttonStartActive && mainModuleExistsOrTestIsRunning;

            let buttonRestartActive = this.#buttonActiveMatrix['restart'][state];
            buttonRestartActive = buttonRestartActive && mainModuleExists;

            let buttonStepOverActive = this.#buttonActiveMatrix['stepOver'][state];
            buttonStepOverActive = buttonStepOverActive && mainModuleExistsOrTestIsRunning;

            let buttonStepIntoActive = this.#buttonActiveMatrix['stepInto'][state];
            buttonStepIntoActive = buttonStepIntoActive && mainModuleExistsOrTestIsRunning;

            this.actionManager.showHideButtons("interpreter.start", buttonStartActive);
            this.actionManager.showHideButtons("interpreter.pause", !buttonStartActive);

            this.actionManager.setActive("interpreter.restart", buttonRestartActive);
            this.actionManager.setActive("interpreter.stepOver", buttonStepOverActive);
            this.actionManager.setActive("interpreter.stepInto", buttonStepIntoActive);
            this.actionManager.setActive("interpreter.startTests", this.#executableHasTests() && state == SchedulerState.stopped);

            Object.values(SchedulerState).filter(v => typeof v == 'string').forEach((key) => {
                this.actionManager.setEditorContext("Scheduler_" + key, SchedulerState[key] == state);
            });

        }

        let currentWorkspace = this.main.getCurrentWorkspace();
        if(currentWorkspace){
            let startableFiles: GUIFile[] = currentWorkspace.getFiles().filter(f => f.isStartable);
            this.main?.markFilesAsStartable(startableFiles, state >= 3);
        }

        // if(this.executable){
        //     for(let module of this.executable.moduleManager.modules){
        //         if(module.isStartable()) startableFiles.push(<GUIFile>module.file);
        //     }
        // }

    }

    #resetRuntime() {
        this.eventManager.fire("resetRuntime");

        this.main?.getBottomDiv()?.console?.detachValues();

        // this.printManager.clear();
        // this.worldHelper?.destroyWorld();
        // this.processingHelper?.destroyWorld();
        // this.gngEreignisbehandlungHelper?.detachEvents();
        // this.gngEreignisbehandlungHelper = null;
    }

    async #init(executable: Executable | undefined, fileToStart?: GUIFile) {

        let mainModule = this.#findStartableModule();
        if(fileToStart){
            for(let module of executable.moduleManager.modules){
                if(module.file == fileToStart) mainModule = module;                
            }
        }

        this.setState(SchedulerState.stopped);
        this.#mainThread = this.scheduler.init(executable, mainModule);

        if (this.#mainThread) {
            this.codeReachedAssertions.init(executable.moduleManager);
            this.#mainThread.maxStepsPerSecond = this.stepsPerSecondGoal;
            this.#mainThread.state = ThreadState.running; // this statement actually makes the program run
        }
    }

    hideProgrampointerPosition(tag?: string) {
        this.programPointerManager?.hideAll();
        // this.programPointerManager?.hide(tag || Interpreter.#ProgramPointerIndentifier);
        this.eventManager.fire("hideProgramPointer");
    }

    registerCodeReached(key: string) {
        this.codeReachedAssertions.registerAssertionReached(key);
    }

    isRunningOrPaused(): boolean {
        return this.scheduler.state == SchedulerState.running ||
            this.scheduler.state == SchedulerState.paused;
    }

    hasActorsOrPApplet(): boolean {
        if (this.retrieveObject("PAppletClass")) return true;

        let world: IWorld = this.retrieveObject("WorldClass");
        return this.actorManager.hasActors() || world?.hasActors();
    }

    setStepsPerSecond(value: number, isMaxSpeed: boolean) {
        this.stepsPerSecondGoal = isMaxSpeed ? undefined : value;
        this.isMaxSpeed = isMaxSpeed;
        if (this.#mainThread) {
            this.#mainThread.maxStepsPerSecond = isMaxSpeed ? undefined : value;
        }

        this.scheduler.setMaxSpeed(value, isMaxSpeed);

        if (!isMaxSpeed && this.stepsPerSecondGoal! > 20) {
            this.hideProgrampointerPosition();
        }
    }

    getStepsPerSecond(): number {
        return this.isMaxSpeed ? -1 : this.stepsPerSecondGoal!;
    }

    runsEmbedded(): boolean {
        return false; // TODO
    }

    storeObject(classIdentifier: string, object: any) {
        this.#objectStore.set(classIdentifier, object);
    }

    retrieveObject(classIdentifier: string) {
        return this.#objectStore.get(classIdentifier);
    }

    deleteObject(classIdentifier: string) {
        this.#objectStore.delete(classIdentifier);
    }

    getMain(): IMain | undefined {
        return this.main;
    }
}