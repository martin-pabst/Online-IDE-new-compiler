import { BaseSymbolTable } from "../BaseSymbolTable";
import { Module } from "../module/Module";
import { EmptyRange, IRange } from "../range/Range";
import { Klass, StepFunction, StepParams } from "./StepFunction.ts";
import { CodePrinter } from "../../java/codegenerator/CodePrinter.ts";
import { CatchBlockInfo } from "./ExceptionInfo.ts";
import { Thread } from "./Thread.ts";
import { ThreadState } from "./ThreadState.ts";
import chalk from "chalk";
import { getLine, threeDez } from "../../../tools/StringTools.ts";



export class Step {
    // compiled function returns new programposition
    run?: StepFunction;

    originalRun?: StepFunction; // if breakpoint present then this points to run function

    range!: { startLineNumber?: number, startColumn?: number, endLineNumber?: number, endColumn?: number };
    codeAsString: string = "";
    stopStepOverBeforeStep: boolean = false;

    catchBlockInfoList?: CatchBlockInfo[];
    finallyBlockIndex?: number;
    innerClass?: Klass;         // if inner class is instantiated in this step
    lambdaObject?: any;

    constructor(public index: number, public module: Module) {
        this.range = { startLineNumber: undefined, startColumn: undefined, endLineNumber: undefined, endColumn: undefined };
    }

    getValidRangeOrUndefined(): IRange | undefined {
        let r = this.range;
        if(typeof r.startLineNumber != "undefined" && r.startLineNumber >= 0){
            return <any>r;
        }
        return undefined;
    }

    setBreakpoint() {
        if (this.originalRun) return; // breakpoint already set

        const breakpointRunFunction = (thread: Thread, stack: any[], stackBase: number): number => {
            if (thread.haltAtNextBreakpoint) {
                thread.state = ThreadState.stoppedAtBreakpoint;
                thread.haltAtNextBreakpoint = false;
                return this.index;
            } else {
                thread.haltAtNextBreakpoint = true;
                return this.originalRun!(thread, stack, stackBase);
            }
        }

        this.originalRun = this.run;
        this.run = breakpointRunFunction;
    }

    clearBreakpoint() {
        if (this.originalRun) {
            this.run = this.originalRun;
            this.originalRun = undefined;
        }
    }

    isEmpty(): boolean {
        return this.codeAsString.trim() == "";
    }

    setRangeStartIfUndefined(range?: IRange) {
        if (!this.range?.startLineNumber && range && range != EmptyRange.instance) {
            this.range.startLineNumber = range.startLineNumber;
            this.range.startColumn = range.startColumn;
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
        return this.originalRun ? true : false;
    }

}

export class Program {

    numberOfThisObjects: number = 0;
    numberOfParameters: number = 0;         // without "this"
    numberOfLocalVariables: number = 0;

    stepsSingle: Step[] = [];
    stepsMultiple: Step[] = [];

    isReplProgram?: boolean;

    constructor(public module: Module, public symbolTable: BaseSymbolTable | undefined,
        public methodIdentifierWithClass: string) {

        module.programsToCompileToFunctions.push(this);

        let stackFrame = symbolTable?.stackframe;
        if (stackFrame) {
            this.numberOfThisObjects = stackFrame.numberOfThisObjects;
            this.numberOfParameters = stackFrame.numberOfParameters;
            this.numberOfLocalVariables = stackFrame.numberOfLocalVariables;
        }

    }

    compileToJavascriptFunctions(): boolean {
        let i = 0;
        let stepList: Step[] = this.stepsSingle;
        try {
            for (let step of this.stepsSingle) {
                step.compileToJavascriptFunction();
                i++;
            }
            i = 0
            stepList = this.stepsMultiple;
            for (let step of this.stepsMultiple) {
                step.compileToJavascriptFunction();
                i++;
            }
        } catch (ex) {
            let message = "";
            message += chalk.red("Error compiling program to javascript functions: ") + ex + "\n";
            message += chalk.gray("file: ") + this.module.file.name + chalk.gray(", steplist: ") + (stepList == this.stepsSingle ? "stepsSingle" : "stepsMultiple") + "\n";
            let step = stepList[i];
            message += chalk.gray("at java sourcecode position line ") + chalk.blue(step.range.startLineNumber) + chalk.gray(", column ") + chalk.blue(step.range.startColumn) + "\n";
            message += chalk.blue("\njava-code:") + "\n";
            message += this.printCode(this.module.file.getText(), step.range.startLineNumber!, 0);

            message += chalk.blue("\njavascript-code:") + "\n";
            message += this.printSteps(stepList, i);
            console.error(message);
            return false;
        }

        return true;

    }

    printCode(code: string, errorLine: number, lineOffset: number): string {
        let message = "";

        for(let i = -4; i <= 2; i++){
            let line = errorLine + i;
            if(i == 0){
                message += chalk.blue(threeDez(line + lineOffset) + ": ") + chalk.italic.white(getLine(code, line)) + "\n";
            } else {
                message += chalk.blue(threeDez(line + lineOffset) + ": ") + chalk.gray(getLine(code, line)) + "\n";
            }
        }

        return message;
    }

    printSteps(stepList: Step[], errorIndex: number){
        let message = "";

        for(let i = -2; i <= 2; i++){
            let index = errorIndex + i;
            if(index < 0 || index >= stepList.length) continue;
            if(i == 0){
                message += chalk.white("Step ") + chalk.blue(threeDez(index) + ": ") + chalk.italic.white(stepList[index].codeAsString) + "\n";
            } else {
                message += chalk.white("Step ") + chalk.blue(threeDez(index) + ": ") + chalk.gray(stepList[index].codeAsString) + "\n";
            }
        }

        return message;
    }

    logAllSteps(){
        let i: number = 0;
        for(let step of this.stepsSingle){
            console.log((i++) + step.codeAsString);
        }
    }

    addStep(statement: string) {
        let step = new Step(this.stepsSingle.length, this.module);
        step.codeAsString = statement;
        this.stepsSingle.push(step);
    }

    getSourcecode(): string {
        return new CodePrinter().printProgram(this);
    }

    findStep(line: number): Step | undefined {

        let nearestStep: Step | undefined;

        for (let step of this.stepsSingle) {
            let range = step.range;
            if (range) {
                if (range.startLineNumber! <= line && line <= range.endLineNumber!) {
                    if(nearestStep){
                        if(Math.abs(step.range.startLineNumber! - line) < Math.abs(nearestStep.range.startLineNumber! - line)){
                            nearestStep = step;
                        }
                    } else {
                        nearestStep = step;
                    }
                }
            }
        }
        return nearestStep;
    }

}