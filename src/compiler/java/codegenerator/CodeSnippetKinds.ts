import { Step } from "../../common/interpreter/Step";
import { StepParams } from "../../common/interpreter/RuntimeConstants";
import { Module } from "../../common/module/Module";
import { EmptyRange, IRange } from "../../common/range/Range";
import { JavaType } from "../types/JavaType";
import { CodeSnippet, ConstantValue, EmitToStepListener, StringCodeSnippet } from "./CodeSnippet";
import { LabelCodeSnippet } from "./LabelManager";




export class CodeSnippetContainer extends CodeSnippet {
    parts: CodeSnippet[] = [];

    //@ts-ignore
    declare range: { startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number };

    constructor(parts: CodeSnippet | CodeSnippet[], range?: IRange, type?: JavaType) {
        super();

        if (range) {
            this.range = { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.endColumn };
        } else {
            this.range = { startLineNumber: -1, startColumn: -1, endLineNumber: -1, endColumn: -1 }
        }

        this.addParts(parts);

        if (type) {
            this.type = type;
        }


    }

    getEmitToStepListeners(): EmitToStepListener[] {
        let listeners: EmitToStepListener[] = [];
        this.parts.forEach(part => listeners = listeners.concat(part.getEmitToStepListeners()));
        return listeners;
    }

    setRangeStartIfUndefined(range?: IRange) {
        if (this.range.startLineNumber < 0 && range) {
            this.range.startLineNumber = range.startLineNumber;
            this.range.startColumn = range.startColumn;
        }
    }

    adaptRangeEnd(range?: IRange) {
        if (range) {
            if (this.range.endLineNumber < 0) {
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

    enforceNewStepBeforeSnippet() {
        this.parts.unshift(new NextStepMark());
    }

    removeNextStepBeforeSnippetMark(){
        if(this.parts.length > 0 && this.parts[0] instanceof NextStepMark){
            this.parts.shift();
            if(this.parts.length > 0 && this.parts[0] instanceof CodeSnippetContainer) this.parts[0].removeNextStepBeforeSnippetMark();
        }
    }

    isConstant(): boolean {
        return this.isPureTerm() && (<StringCodeSnippet> this.parts[0]).isConstant();
    }

    getConstantValue(): ConstantValue | undefined {
        return (<StringCodeSnippet> this.parts[0]).getConstantValue();
    }

    isPureTermWithoutPop(){
        return this.isPureTerm() && (<StringCodeSnippet>this.parts[0]).text.indexOf('pop()') < 0;
    }

    isPureTerm(): boolean {
        return !this.finalValueIsOnStack && this.parts.length == 1 && (this.parts[0] instanceof StringCodeSnippet);
    }

    getPureTerm(): string {
        return this.parts[0].emit();
    }

    alterPureTerm(newCode: string) {
        (<StringCodeSnippet>this.parts[0]).text = newCode;
    }

    emit(): string {
        let ret: string = "";
        for (let part of this.parts) {
            ret += part.emit();
        }
        return ret;
    }

    flattenInto(flatList: CodeSnippet[]): void {
        if (this.parts.length == 0) return;

        if (this.parts[0] instanceof NextStepMark) {
            if (flatList.length == 0 || flatList[flatList.length - 1] instanceof NextStepMark) {
                this.parts.shift();
            }
        }

        if (this.parts.length == 0) return;

        if (!this.parts[0].range) this.parts[0].range = this.range;
        //        flatList.push(new StartPositionMark(this.range));

        for (let part of this.parts) {
            part.flattenInto(flatList);
        }

        if (!this.parts[this.parts.length - 1].range) this.parts[this.parts.length - 1].range = this.range;
        // flatList.push(new EndPositionMark(this.range));

    }

    endsWithNextStepMark(): boolean {
        return this.parts.length > 0 && this.parts[this.parts.length - 1] instanceof NextStepMark;
    }

    endsWith(suffix: string){
        for(let i = this.parts.length - 1; i >= 0; i--){
            if(this.parts[i] instanceof StringCodeSnippet){
                return this.parts[i].endsWith(suffix);
            }
        }

        return false;
    }



    /**
     * not used
     * @param currentStep
     * @param steps
     * @returns
     */
    emitToStep(currentStep: Step, steps: Step[], module: Module): Step {

        currentStep.setRangeStartIfUndefined(this.range);

        let lastCurrentStep = currentStep;
        for (let part of this.parts) {
            if (lastCurrentStep != currentStep) {
                currentStep.setRangeStartIfUndefined(part.range);
                lastCurrentStep = currentStep;
            }
            currentStep = part.emitToStep(currentStep, steps, module);
        }

        currentStep.adaptRangeEnd(this.range);
        return currentStep;
    }


    public static applyMethod(object: CodeSnippetContainer, methodIdentifier: string, parameters: CodeSnippetContainer[], range: IRange, type: JavaType) {
        let snipp = new CodeSnippetContainer([], range);
        snipp.type = type;

        let lastParts: CodeSnippet[] = [];


        for (let i = parameters.length - 1; i >= 0; i--) {
            let p = parameters[i];
            snipp.parts = snipp.parts.concat(p.finalValueIsOnStack ? p : p.allButLastPart());
        }

        for (let p of parameters) {
            lastParts.push(p.lastPartOrPop());
        }

        snipp.parts = snipp.parts.concat(object.finalValueIsOnStack ? object : object.allButLastPart());
        let objectTerm = object.lastPartOrPop();

        snipp.addStringPart(objectTerm.emit() + "." + methodIdentifier + "(" + lastParts.map(lp => lp.emit()).join(", ") + ")", range);

        return snipp;
    }

    addNextStepMark() {
        this.parts.push(new NextStepMark());
    }

    addStringPart(part: string, range?: IRange, type?: JavaType, takeListenersFromParts?: CodeSnippet[]) {
        let newPart = new StringCodeSnippet(part, range, type);

        if(takeListenersFromParts){
            takeListenersFromParts.forEach(part => newPart.addEmitToStepListener(part.getEmitToStepListeners()));
        }

        this.addParts([newPart]);
        return newPart;
    }

    addParts(parts: CodeSnippet | CodeSnippet[] | undefined) {
        if(!parts) return;
        if(!Array.isArray(parts)) parts = [parts];

        if (parts.length == 0) return;
        if (this.parts.length == 0) this.setRangeStartIfUndefined(parts[0].range)
        let lastPart = parts[parts.length - 1];
        this.adaptRangeEnd(lastPart.range);
        this.parts = this.parts.concat(parts);

        for(let part of parts){
            if(part && part.type){
                this.type = part.type;
                this.finalValueIsOnStack = part.finalValueIsOnStack;
            }
        }

    }

    allButLastPart(): CodeSnippet[] {
        if (this.parts.length < 2) return [];
        return this.finalValueIsOnStack ? this.parts : this.parts.slice(0, this.parts.length - 1);
    }

    lastPartOrPop(): CodeSnippet {
        if (this.parts.length == 0) return new EmptyPart(); // shouldn't occur

        return this.finalValueIsOnStack ? new StringCodeSnippet(`${StepParams.stack}.pop()`, this.range) : this.parts[this.parts.length - 1];
    }

    ensureFinalValueIsOnStack() {
        if (this.finalValueIsOnStack) return;
        if (this.parts.length == 0) return;
        let part = this.getLastPartWithType();

        if(part instanceof StringCodeSnippet){
            part.ensureFinalValueIsOnStack();
            return;
        }

        if(part instanceof CodeSnippetContainer){
            part.ensureFinalValueIsOnStack();
        }

    }

    getLastPartWithType(): CodeSnippet | undefined {
        for(let i = this.parts.length - 1; i >= 0; i--){
            let part = this.parts[i];
            if(part && part.type) return part;
        }
        console.log("Error in CodeSnippetContainer.getLastPartWithType: Didn't find last part with type!");
        return undefined;
    }

    index(currentIndex: number): number {

        this.stepIndex = currentIndex;

        let i = currentIndex;

        for (let part of this.parts) {
            i = part.index(i);
        }

        return i;
    }


}

export class NextStepMark extends CodeSnippet {
    emit(): string {
        return "";
    }

    index(currentIndex: number): number {
        this.stepIndex = currentIndex;
        return currentIndex + 1;
    }

    emitToStep(currentStep: Step, steps: Step[], module: Module): Step {
        // does current step already end with return statement?
        let lastReturnIndex = currentStep.codeAsString.lastIndexOf("return");
        let stringAfterReturn = currentStep.codeAsString.substring(lastReturnIndex);
        if(lastReturnIndex < 0 ||  !stringAfterReturn.match(/return\ \d*;\n?$/) ){
            currentStep.codeAsString += "return " + (this.stepIndex + 1) + ";";
        }
        steps.push(currentStep);
        return new Step(this.stepIndex + 1, module);
    }

    flattenInto(flatList: CodeSnippet[]): void {
        if (flatList.length > 0 && flatList[flatList.length - 1] instanceof NextStepMark) return;

        if (flatList.length > 1 && flatList[flatList.length - 1] instanceof LabelCodeSnippet
            && flatList[flatList.length - 2] instanceof NextStepMark) return;
        flatList.push(this);
    }
}



export class EmptyPart extends CodeSnippet {
    constructor() {
        super();
        this.range = EmptyRange.instance;
    }

    emitToStep(currentStep: Step, _steps: Step[]): Step {
        return currentStep;
    }

    index(lastIndex: number): number {
        this.stepIndex = lastIndex;
        return lastIndex;
    }

    emit(): string {
        return "";
    }

    flattenInto(flatList: CodeSnippet[]): void {
        // nothing to do
    }
}

class StartPositionMark extends CodeSnippet {

    emit(): string {
        return "";
    }

    index(currentIndex: number): number {
        return currentIndex;
    }

    emitToStep(currentStep: Step, steps: Step[]): Step {
        if (this.range) {
            currentStep.setRangeStartIfUndefined()
        }
        return currentStep;
    }

    flattenInto(flatList: CodeSnippet[]): void {
        flatList.push(this);
    }

    constructor(range?: IRange) {
        super();
        this.range = range;
    }
}

class EndPositionMark extends CodeSnippet {

    emit(): string {
        return "";
    }

    index(currentIndex: number): number {
        return currentIndex;
    }

    emitToStep(currentStep: Step, steps: Step[]): Step {
        if (this.range) {
            currentStep.adaptRangeEnd()
        }
        return currentStep;
    }

    flattenInto(flatList: CodeSnippet[]): void {
        flatList.push(this);
    }

    constructor(range?: IRange) {
        super();
        this.range = range;
    }
}