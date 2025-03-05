import { Executable } from "../../../common/Executable.ts";
import { IMain } from "../../../common/IMain.ts";
import { DebuggerCallstackEntry } from "../../../common/debugger/DebuggerCallstackEntry.ts";
import { Interpreter } from "../../../common/interpreter/Interpreter.ts";
import { Program } from "../../../common/interpreter/Program.ts";
import { SchedulerState } from "../../../common/interpreter/SchedulerState.ts";
import { Thread } from "../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../common/interpreter/ThreadState.ts";
import { CompilerFile } from "../../../common/module/CompilerFile.ts";
import { EmptyRange } from "../../../common/range/Range.ts";
import { JavaCompiler } from "../../JavaCompiler.ts";
import { ExceptionTree } from "../../codegenerator/ExceptionTree.ts";
import { JavaSymbolTable } from "../../codegenerator/JavaSymbolTable.ts";
import { JavaCompiledModule } from "../../module/JavaCompiledModule.ts";
import { JavaCompiledModuleManager } from "../../module/JavaCompiledModuleManager.ts";
import { JavaReplCompiledModule } from "./JavaReplCompiledModule.ts";
import { JavaReplCompiler } from "./JavaReplCompiler.ts";
import { ReplReturnValue } from "./ReplReturnValue.ts";

type ProgramAndModule = { module: JavaReplCompiledModule, program: Program | undefined };

type ReplState = "standalone" | "none";

export class JavaRepl {

    /**
     * If REPL-Statements are executed outside a paused program context
     * then use this symbol table an this thread:
     */
    standaloneModule: JavaCompiledModule;
    standaloneSymbolTable: JavaSymbolTable;
    standaloneThread: Thread;
    standaloneExecutable: Executable;
    standaloneModuleManager: JavaCompiledModuleManager;

    standaloneStack: any[] = [];

    replCompiler: JavaReplCompiler;

    lastCompiledModule?: JavaCompiledModule;

    state: ReplState = "none";

    constructor(private main: IMain, private compiler: JavaCompiler) {

        this.replCompiler = new JavaReplCompiler();
        this.compiler.eventManager.on("compilationFinishedWithNewExecutable", (executable: Executable) => {
            setTimeout(() => {
                this.init(executable);
            }, 100);
        })

        this.getInterpreter().eventManager.on("resetRuntime", () => {
            this.state = "none";
            let executable = this.getInterpreter().executable;
            if(executable) this.init(executable);
        })
    }

    init(executable: Executable) {
        if(!executable){
            this.state = "none";
            this.main.hideDebugger();
            return;
        }
        let interpreter = this.getInterpreter();
        if (!interpreter) {
            console.error("JavaRepl constructor called before interpreter was created.");
        }

        this.standaloneModule = new JavaCompiledModule(new CompilerFile());
        this.standaloneSymbolTable = new JavaSymbolTable(this.standaloneModule, EmptyRange.instance, true);

        this.standaloneThread = interpreter.scheduler.createThread("Java REPL standalone thread");
        this.standaloneThread.classes = executable.classObjectRegistry;

        this.standaloneModuleManager = new JavaCompiledModuleManager();
        this.standaloneModuleManager.addModule(this.standaloneModule);

        for (let module of executable.moduleManager.modules) {
            this.standaloneModuleManager.addModule(module);
            module.registerTypesAtTypestore(this.standaloneModuleManager.typestore);
        }

        this.standaloneExecutable = new Executable(executable.classObjectRegistry, this.standaloneModuleManager,
            this.compiler.libraryModuleManager, [], new ExceptionTree(executable.libraryModuleManager.typestore, this.standaloneModuleManager.typestore)
        )

        this.standaloneStack = [];

        this.state = "none";
        this.main.hideDebugger();
        this.main.getBottomDiv()?.console?.detachValues();

    }

    getCurrentModule(): JavaCompiledModule | undefined {
        return this.lastCompiledModule;
    }

    private getInterpreter(): Interpreter {
        let interpreter = this.main.getInterpreter();
        if (!interpreter) console.error("JavaRepl.getInterpreter: Interpreter is missing!");
        return interpreter!;
    }


    compile(statement: string, withToStringCall: boolean): ProgramAndModule | undefined {
        let programAndModule: ProgramAndModule | undefined;
        let interpreter = this.getInterpreter();

        if (interpreter.scheduler.state == SchedulerState.paused) {
            // execute in current thread context
            let currentThread = interpreter.scheduler.getCurrentThread();
            if (interpreter.executable && currentThread && currentThread.programStack.length > 0) {

                let programState = currentThread.programStack[currentThread.programStack.length - 1];

                let debuggerCallstackEntry = new DebuggerCallstackEntry(programState);

                let symbolTable = debuggerCallstackEntry.symbolTable as JavaSymbolTable;

                if (symbolTable) {
                    let oldNumberOfChildTables = symbolTable.childTables.length;

                    programAndModule = this.replCompiler.compile(statement, symbolTable, interpreter.executable, withToStringCall, false);

                    symbolTable.childTables.splice(oldNumberOfChildTables, symbolTable.childTables.length - oldNumberOfChildTables);
                }

            }
        } else {
            // execute in REPL standalone context
            programAndModule = this.replCompiler.compile(statement, this.standaloneSymbolTable, this.standaloneExecutable, withToStringCall, true);
        }

        if (programAndModule) {
            this.lastCompiledModule = programAndModule.module;
        }

        return programAndModule;
    }

    executeSynchronously(statement: string): ReplReturnValue {

        let interpreter = this.getInterpreter();
        let programAndModule = this.compile(statement, false);

        if (!programAndModule) {
            return undefined;
        }

        let threadBefore = this.getInterpreter().scheduler.getCurrentThread();
        let stackSizeBefore = threadBefore?.s.length;
        let currentProgramState = threadBefore?.currentProgramState;
        let lastExecutedStep = currentProgramState?.lastExecutedStep;


        let thread = this.prepareThread(programAndModule);
        if (!thread) {
            return undefined;
        }

        try {

            interpreter.runREPLSynchronously();

            if (currentProgramState) currentProgramState.lastExecutedStep = lastExecutedStep;
            if (stackSizeBefore) threadBefore?.s.splice(stackSizeBefore, threadBefore?.s.length - stackSizeBefore);

        } catch (ex) {
            console.log(ex);
            return undefined;
        }

        return thread.replReturnValue;

    }

    async executeAsync(statement: string, withMaxSpeed: boolean): Promise<ReplReturnValue> {

        let interpreter = this.getInterpreter();
        let programAndModule = this.compile(statement, true);

        let threadBefore = interpreter.scheduler.getCurrentThread();
        let stackSizeBefore = threadBefore?.s.length;
        let currentProgramState = threadBefore?.currentProgramState;
        let lastExecutedStep = currentProgramState?.lastExecutedStep;


        if (!programAndModule) {
            return undefined;
        }

        if(programAndModule.module.errors.find(error => error.level == "error")){
            return {
                errors: programAndModule.module.errors,
                text: null,
                type: undefined,
                value: undefined
            }
        }

        this.state = this.getInterpreter().scheduler.state == SchedulerState.paused ? "none" : "standalone";


        let p = new Promise<any>((resolve, reject) => {

            let thread: Thread | undefined;

            let callback = (returnValue: ReplReturnValue) => {

                if (currentProgramState) currentProgramState.lastExecutedStep = lastExecutedStep;
                if (stackSizeBefore) threadBefore?.s.splice(stackSizeBefore, threadBefore?.s.length - stackSizeBefore);
                if (returnValue) {
                    returnValue.errors = programAndModule?.module?.errors;

                    resolve(returnValue);
                    interpreter.updateDebugger();
                }
            }

            thread = this.prepareThread(programAndModule!, callback, withMaxSpeed);

            if (!thread) {
                resolve(undefined);
                return;
            }


            interpreter.setState(SchedulerState.running);

        })


        return p;

    }

    prepareThread(programAndModule: { module: JavaReplCompiledModule; program: Program | undefined; },
        callback?: (returnValue: ReplReturnValue) => void,
        withMaxSpeed: boolean = true): Thread | undefined {

        let interpreter = this.getInterpreter();
        let scheduler = interpreter.scheduler;

        if (programAndModule.module.hasErrors()) {
            return undefined;
        }

        if (!programAndModule.program) {
            return undefined;
        }

        programAndModule.program.compileToJavascriptFunctions();
        programAndModule.program.isReplProgram = true;

        let noProgramIsRunning = [SchedulerState.running, SchedulerState.paused].indexOf(scheduler.state) < 0;
        let currentThread = scheduler.getCurrentThread()!;
        if (noProgramIsRunning) {
            scheduler.setAsCurrentThread(this.standaloneThread);
            currentThread = this.standaloneThread;
            let numberOfLocalVariables = this.standaloneSymbolTable.getStackFrame().numberOfLocalVariables;
            while (this.standaloneThread.s.length < numberOfLocalVariables) this.standaloneThread.s.push(null);
        }

        scheduler.saveAllThreadsBut(currentThread);

        let saveMaxStepsPerSecond = currentThread.maxStepsPerSecond;
        if (withMaxSpeed) {
            currentThread.maxStepsPerSecond = undefined;
        } else {
            currentThread.maxStepsPerSecond = interpreter.isMaxSpeed ? undefined : interpreter.stepsPerSecondGoal;
        }

        currentThread.lastTimeThreadWasRun = performance.now();

        let oldState = scheduler.state;

        scheduler.callbackAfterReplProgramFinished = () => {
            currentThread.maxStepsPerSecond = saveMaxStepsPerSecond;
            currentThread.state = ThreadState.running;
            currentThread.lastTimeThreadWasRun = performance.now();
            interpreter.setState(oldState);
            scheduler.retrieveThreads();
            if (callback) callback(currentThread.replReturnValue);
        }
        currentThread.pushReplProgram(programAndModule.program);

        return currentThread;
    }


}