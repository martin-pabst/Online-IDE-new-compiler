import { Module } from "../module/Module";
import { IRange, EmptyRange } from "../range/Range";
import { CatchBlockInfo } from "./ExceptionInfo";
import { StepFunction, Klass, StepParams } from "./StepFunction";
import { Thread } from "./Thread";
import { ThreadState } from "./ThreadState";




export class Step {
    // compiled function returns new programposition
    run?: StepFunction;

    #originalRun?: StepFunction; // if breakpoint present then this points to run function

    range!: { startLineNumber?: number; startColumn?: number; endLineNumber?: number; endColumn?: number; };
    codeAsString: string = "";

    catchBlockInfoList?: CatchBlockInfo[];
    finallyBlockIndex?: number;
    innerClass?: Klass; // if inner class is instantiated in this step
    lambdaObject?: any;

    constructor(public index: number, public module: Module) {
        this.range = { startLineNumber: undefined, startColumn: undefined, endLineNumber: undefined, endColumn: undefined };
    }

    getValidRangeOrUndefined(): IRange | undefined {
        const r = this.range;
        if (!r) return undefined;
        if (typeof r.startLineNumber != "undefined" && r.startLineNumber >= 0) {
            return <any>r;
        }
        return undefined;
    }

    setBreakpoint(clearBreakpointAfterReached: boolean = false) {
        const breakpointRunFunction = (thread: Thread, stack: any[], stackBase: number): number => {
            if (thread.haltAtNextBreakpoint) {
                thread.state = ThreadState.stoppedAtBreakpoint;
                thread.haltAtNextBreakpoint = false;
                if(clearBreakpointAfterReached){
                    this.clearBreakpoint();
                }
                return this.index;
            } else {
                thread.haltAtNextBreakpoint = true;
                return this.#originalRun!(thread, stack, stackBase);
            }
        };

        if (this.#originalRun) return; // breakpoint already set
        this.#originalRun = this.run;
        this.run = breakpointRunFunction;
    }

    clearBreakpoint() {
        if (this.#originalRun) {
            this.run = this.#originalRun;
            this.#originalRun = undefined;
        }
    }

    isEmpty(): boolean {
        return this.codeAsString.trim() == "";
    }

    setRangeStartIfUndefined(range?: IRange) {
        if (!this.range?.startLineNumber && range && range != EmptyRange.instance) {
            this.range = {
                startLineNumber: range.startLineNumber,
                startColumn: range.startColumn,
                endLineNumber: range.endLineNumber,
                endColumn: range.endColumn
            }
            // this.range.startLineNumber = range.startLineNumber;
            // this.range.startColumn = range.startColumn;
        }
    }

    adaptRangeEnd(range?: IRange) {
        if (range && range != EmptyRange.instance) {
            if (!this.range.endLineNumber) {
                this.range.endLineNumber = range.endLineNumber;
                this.range.endColumn = range.endColumn;
            } else if (this.range.endLineNumber < range.endLineNumber) {
                this.range.endLineNumber = range.endLineNumber;
                this.range.endColumn = range.endColumn;
            } else if (this.range.endLineNumber == range.endLineNumber && this.range.endColumn! < range.endColumn) {
                this.range.endColumn = range.endColumn;
            }
        }
    }

    compileToJavascriptFunction() {
        // console.log(this.codeAsString);
        // @ts-ignore
        this.run = new Function(StepParams.thread, StepParams.stack, StepParams.stackBase, this.codeAsString);
    }

    isBreakpoint(): boolean {
        return this.#originalRun ? true : false;
    }
}
