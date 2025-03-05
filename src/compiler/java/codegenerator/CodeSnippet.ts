import { Step } from "../../common/interpreter/Step";
import { Helpers, StepParams } from "../../common/interpreter/RuntimeConstants";
import { Module } from "../../common/module/Module";
import { IRange } from "../../common/range/Range";
import { JavaType } from "../types/JavaType";

export type ConstantValue = number | boolean | string | null;

export abstract class CodeSnippet {

    public stepIndex: number = -1;
    public range?: IRange;
    public type?: JavaType;
    isLefty: boolean = false; // can you assign a value to it?
    finalValueIsOnStack: boolean = false;

    isSuperKeywordWithLevel?: number;

    abstract emit(): string;
    abstract index(currentIndex: number): number;
    abstract emitToStep(currentStep: Step, steps: Step[], module: Module): Step;

    abstract flattenInto(flatList: CodeSnippet[]): void;

    allButLastPart(): CodeSnippet[] {
        return [this];
    }

    lastPartOrPop(): CodeSnippet {
        return this.finalValueIsOnStack ? new StringCodeSnippet(`${StepParams.stack}.pop()`, this.range) : this;
    }

    isPureTermWithoutPop() {
        return true;
    }

    isPureTerm() {
        return true;
    }

    alterPureTerm(newCode: string) {
        // standard implementation is empty
    }

    getPureTerm() {
        return "";
    }

    ensureFinalValueIsOnStack() {
        // standard implementation is empty
    }

    isConstant() {
        return false;
    }

    getConstantValue(): ConstantValue | undefined {
        return undefined;
    }

    endsWith(suffix: string) {
        return false;
    }

    getEmitToStepListeners(): EmitToStepListener[] {
        return [];
    }
}

export type EmitToStepListener = (step: Step) => void;

export class StringCodeSnippet extends CodeSnippet {

    private constantValue: ConstantValue | undefined;
    private emitToStepListeners: EmitToStepListener[] = [];

    constructor(public text: string, range?: IRange, type?: JavaType, constantValue?: ConstantValue) {
        super();
        this.range = range;
        this.type = type;
        this.constantValue = constantValue;
    }

    setConstantValue(value: ConstantValue){
        this.constantValue = value;
    }

    getConstantValue(): ConstantValue | undefined {
        return this.constantValue;
    }

    isConstant(): boolean {
        return typeof this.constantValue !== "undefined";
    }

    ensureFinalValueIsOnStack(): void {
        if(this.finalValueIsOnStack) return;
        if(this.text.endsWith(";\n")) this.text = this.text.substring(0, this.text.length - 2);
        this.text = `${StepParams.stack}.push(${this.text});\n`
        this.finalValueIsOnStack = true;
    }

    index(lastIndex: number): number {
        this.stepIndex = lastIndex;
        return lastIndex;
    }

    emit(): string {
        return this.text;
    }

    addEmitToStepListener(emitToStepListener: EmitToStepListener | EmitToStepListener[]) {
        if (!Array.isArray(emitToStepListener)) emitToStepListener = [emitToStepListener];
        this.emitToStepListeners.push(...emitToStepListener);
    }

    takeEmitToStepListenersFrom(snippets: CodeSnippet | CodeSnippet[]) {
        if(!Array.isArray(snippets)) snippets = [snippets];
        for (let sn of snippets) {
            this.emitToStepListeners = this.emitToStepListeners.concat(sn.getEmitToStepListeners());
        }
    }

    getEmitToStepListeners(): EmitToStepListener[] {
        return this.emitToStepListeners;
    }

    emitToStep(currentStep: Step, _steps: Step[]): Step {
        currentStep.codeAsString = currentStep.codeAsString + this.text;

        currentStep.setRangeStartIfUndefined(this.range);
        currentStep.adaptRangeEnd(this.range);

        this.emitToStepListeners.forEach(esl => esl(currentStep));

        return currentStep;
    }

    flattenInto(flatList: CodeSnippet[]): void {
        flatList.push(this);
    }

    isPureTerm() {
        return true;
    }

    alterPureTerm(newCode: string) {
        this.text = newCode;
        this.constantValue = undefined;
    }

    getPureTerm() {
        return this.text;
    }

    allButLastPart(): CodeSnippet[] {
        return this.finalValueIsOnStack ? [this] : [];
    }

    lastPartOrPop(): CodeSnippet {
        return this.finalValueIsOnStack ? new StringCodeSnippet(`${StepParams.stack}.pop()`, this.range) : this;
    }

    endsWith(suffix: string) {
        return this.text.endsWith(suffix);
    }


}
