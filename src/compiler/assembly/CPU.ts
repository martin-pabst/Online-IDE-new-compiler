import { DOM } from "../../tools/DOM";
import { Error } from "../common/Error";
import { IMain } from "../common/IMain";
import type { Interpreter } from "../common/interpreter/Interpreter";
import { Thread } from "../common/interpreter/Thread";
import { ThreadState } from "../common/interpreter/ThreadState";
import { CompilerFile } from "../common/module/CompilerFile";
import { IRange, Range } from "../common/range/Range";
import { AssemblyInstruction, AssemblyInstructionMap, AssemblyLabel, AssemblyParserResult, type AssemblyAssertion, type AssemblyCompletionItemRange } from "./AssemblyParser";
import { AssemblyParserMessages } from "./language/AssemblyParserMessages";
import { Memory } from "./Memory";


export type AssemblyBreakpoint = {
    programCounter: number;
    isOneTime: boolean;
}

export type Architecture = {
    identifier: string;
    localizedName: string;
}

export var _cpu: string = "__t.cpu.";

export abstract class CPU {

    abstract description: string;

    abstract flagNames: string[];
    abstract flagNamesShort: string[];
    abstract getFlags(): { [flagName: string]: boolean };

    abstract registerNames: string[];
    abstract registerNamesShort: string[];

    breakpointAddresses: Map<number, AssemblyBreakpoint> = new Map();

    /* This field is used to quickly check if a certain address is a code location, 
     * which is needed for the MemoryTab.
     */
    codeLocationsField: Uint8Array;

    abstract getRegisterValues(): { [registerName: string]: number };

    abstract getProgramCounter(): number;
    abstract getStatementLengthAtProgramCounter(): number;
    abstract getAddressOperandLocationOfCurrentStatement(): { location: number | undefined; indirectLocation: number | undefined; };

    /*
    * For code completion
     */
    abstract getTokensWithDescription(): { tokenIdentifier: string, description: () => string }[];
    abstract getPseudoDirectivesWithDescription(): { directiveIdentifier: string, description: () => string, insertText?: string }[];
    abstract getInstructions(): AssemblyInstruction[];
    

    abstract getMemory(): Memory;

    abstract reset(): void;

    // returns true on program end
    abstract executeNextStep(thread: Thread): boolean;

    abstract getDescriptionForCurrentInstruction(): string | undefined;

    abstract getArchitectureIdentifiers(): Architecture[];

    abstract getName(): string;

    constructor(protected assemblyParserResult: AssemblyParserResult, protected main: IMain) {
        this.initCodeLocationsField();
    }

    initCodeLocationsField(): void {
        let codeParts = this.assemblyParserResult.codeParts;
        let size = 0;
        for (const codePart of codeParts) {
            let lastCodeIndex = codePart.offset + codePart.code.length;
            if (lastCodeIndex + 1 > size) {
                size = lastCodeIndex + 1;
            }
        }

        this.codeLocationsField = new Uint8Array(size);
        this.codeLocationsField.fill(0);

        for (const codePart of codeParts) {
            for (let i = 0; i < codePart.code.length; i++) {
                let address = codePart.offset + i;
                this.codeLocationsField[address] = 1;
            }
        }
    }

    getLabels(): { identifier: string, address: number }[] {
        return this.assemblyParserResult.labels;
    }

    getLabelMap(): Map<number, { label: AssemblyLabel, range: IRange }[]> {
        return this.assemblyParserResult.labelMap;
    }

    getHoverEntries(): Map<number, { range: IRange, text: string }[]> {
        return this.assemblyParserResult.hoverEntries;
    }

    getInstructionMap(): AssemblyInstructionMap {
        return this.assemblyParserResult.instructionMap;
    }

    isCodeLocation(address: number): boolean {
        return this.codeLocationsField[address] === 1;
    }

    getStartOfFirstCodePart(): number | undefined {
        if (this.assemblyParserResult.codeParts.length > 0) {
            return this.assemblyParserResult.codeParts[0].offset;
        }
        return undefined;
    }

    getErrors(): Error[] {
        return this.assemblyParserResult ? this.assemblyParserResult.errors : [];
    }

    hasMainProgram(): boolean {
        return typeof this.assemblyParserResult.startAddress === "number";
    }

    getCurrentPosition(): { programOrmoduleOrFile: CompilerFile, range: IRange } | undefined {
        let pc = this.getProgramCounter();
        let sourceMapEntry = this.assemblyParserResult.sourceMap.get(pc);
        if (!sourceMapEntry) return undefined;
        return {
            programOrmoduleOrFile: this.assemblyParserResult.file,
            range: {
                startLineNumber: sourceMapEntry.lineNumber,
                startColumn: sourceMapEntry.column,
                endLineNumber: sourceMapEntry.lineNumber,
                endColumn: sourceMapEntry.column + 1
            }
        }
    }

    setBreakpoint(address: number, isOneTime: boolean) {
        this.breakpointAddresses.set(address, { isOneTime: isOneTime, programCounter: address });
    }

    removeBreakpoint(address: number) {
        this.breakpointAddresses.delete(address);
    }

    setBreakpointAtFirstProgramStatement(isOneTime: boolean) {
        let firstAddress = this.assemblyParserResult.startAddress;
        if (typeof firstAddress === "number") {
            this.setBreakpoint(firstAddress, isOneTime);
        }
    }

    setBreakpointAtLine(lineNumber: number, isOneTime: boolean) {
        this.assemblyParserResult.sourceMap.forEach((value, address) => {
            if (value.lineNumber === lineNumber) {
                this.setBreakpoint(address, isOneTime);
                return;
            }
        });
    }

    clearBreakpointAtLine(lineNumber: number) {
        this.assemblyParserResult.sourceMap.forEach((value, address) => {
            if (value.lineNumber === lineNumber) {
                this.removeBreakpoint(address);
            }
        });
    }

    breakpointReachedShouldIExecute(breakpoint: AssemblyBreakpoint, thread: Thread): boolean {
        if (thread.haltAtNextBreakpoint) {
            thread.state = ThreadState.stoppedAtBreakpoint;
            if (breakpoint.isOneTime) {
                this.removeBreakpoint(breakpoint.programCounter);
            } else {
                thread.haltAtNextBreakpoint = false;
            }
            return false;
        } else {
            thread.haltAtNextBreakpoint = true;
            return true;
        }
    }

    positionIsInsideComment(position: { lineNumber: number, column: number }): boolean {
        for (const commentRange of this.assemblyParserResult.commentRanges) {
            if (Range.containsPosition(commentRange, position)) {
                return true;
            }
        }
        return false;
    }

    getRangeOfCurrentInstruction(): IRange | undefined {
        let pc = this.getProgramCounter();
        let sourceMapEntry = this.assemblyParserResult.sourceMap.get(pc);
        if (!sourceMapEntry) return undefined;
        return {
            startLineNumber: sourceMapEntry.lineNumber,
            startColumn: sourceMapEntry.column,
            endLineNumber: sourceMapEntry.lineNumber,
            endColumn: sourceMapEntry.column + 1
        }
    }



    assert(interpreter: Interpreter): void {
        let assertion = this.assemblyParserResult.assertionMap.get(this.getProgramCounter() - 1);
        if (!assertion || assertion.assertionParts.length === 0) return;

        let allWell = true;
        for (let assertionPart of assertion.assertionParts) {
            switch (assertionPart.type) {
                case "flag":
                    let flags = this.getFlags();
                    let flagIndex = this.flagNamesShort.findIndex(name => name.toLocaleLowerCase() === assertionPart.shortFlagName.toLocaleLowerCase());
                    let currentFlagValue = flags[this.flagNames[flagIndex]];
                    if (currentFlagValue !== assertionPart.flagValue) {
                        allWell = false;
                    }
                    break;
                case "memory":
                    let mem = this.getMemory().dump();
                    for (let i = 0; i < assertionPart.expectedMemoryValues.length; i++) {
                        if (mem[assertionPart.startAddress + i] !== assertionPart.expectedMemoryValues[i]) {
                            allWell = false;
                            break;
                        }
                    }
                    break;
                case "register":
                    let registers = this.getRegisterValues();
                    let registerIndex = this.registerNamesShort.findIndex(name => name.toLocaleLowerCase() === assertionPart.shortRegisterName.toLocaleLowerCase());
                    let currentRegisterValue = registers[this.registerNames[registerIndex]];
                    if (currentRegisterValue !== assertionPart.registerValue) {
                        allWell = false;
                    }
                    break;
            }
            if (!allWell) break;
        }

        if (!allWell) {
            let valuesExpected = "{ " + assertion.assertionParts.map(part => {
                switch (part.type) {
                    case "flag":
                        return part.shortFlagName + ": " + (part.flagValue ? "1" : "0");
                    case "memory":
                        return part.startAddress + ": [" + part.expectedMemoryValues.join(", ") + "]";
                    case "register":
                        return part.shortRegisterName + ": " + part.registerValue;
                }
            }).join(', ') + " }";

            let valuesActual = "{ " + assertion.assertionParts.map(part => {
                switch (part.type) {
                    case "flag":
                        let flags = this.getFlags();
                        let flagIndex = this.flagNamesShort.findIndex(name => name.toLocaleLowerCase() === part.shortFlagName.toLocaleLowerCase());
                        let currentFlagValue = flags[this.flagNames[flagIndex]];
                        return part.shortFlagName.toUpperCase() + ": " + (currentFlagValue ? "1" : "0");
                    case "memory":
                        let mem = this.getMemory().dump();
                        return part.startAddress + ": [" + mem.slice(part.startAddress, part.startAddress + part.expectedMemoryValues.length).join(", ") + "]";
                    case "register":
                        let registers = this.getRegisterValues();
                        let registerIndex = this.registerNamesShort.findIndex(name => name.toLocaleLowerCase() === part.shortRegisterName.toLocaleLowerCase());
                        let currentRegisterValue = registers[this.registerNames[registerIndex]];
                        return part.shortRegisterName + ": " + currentRegisterValue;
                }
            }).join(', ') + " }";

            for (let assertionObserver of interpreter.assertionObserverList) {
                assertionObserver.notifyOnAssemblyAssertion(interpreter.scheduler.getCurrentThread(), null, valuesExpected, valuesActual, assertion.message ?? "");
            }

            if (interpreter.getMain()) {
                this.printAssertionFailureInOutputTab(interpreter.getMain()!, valuesExpected, valuesActual, assertion.message ?? "");
            }

        }

    }

    printAssertionFailureInOutputTab(main: IMain, valuesExpected: string, valuesActual: string, message: string): void {
        let outerDiv = DOM.makeDiv(undefined, 'jo_exceptionPrinter_outer');
        let headingDiv = DOM.makeDiv(outerDiv, 'jo_exceptionPrinter_heading');
        let headingDivLeftSpan = DOM.makeSpan(headingDiv);
        let headingDivRightSpan = DOM.makeSpan(headingDiv);
        headingDivLeftSpan.textContent = AssemblyParserMessages.AssertionFailed("");
        headingDivRightSpan.textContent = message;
        headingDivRightSpan.style.fontStyle = "italic";
        headingDivRightSpan.style.marginLeft = "5px";

        let range = this.assemblyParserResult.sourceMap.get(this.getProgramCounter() - 1);
        if (range) {
            let atLineDiv = DOM.makeDiv(outerDiv, 'jo_exceptionPrinter_stacktrace');
            DOM.makeSpan(atLineDiv).textContent = "at ";
            DOM.makeSpan(atLineDiv, "jo_stacktraceLink").textContent = `File ${this.assemblyParserResult.file.name} (${range.lineNumber}:${range.column})`;
            atLineDiv.addEventListener("click", () => {
                main.showProgramPosition(this.assemblyParserResult.file, {
                    startLineNumber: range.lineNumber,
                    startColumn: range.column,
                    endLineNumber: range.lineNumber,
                    endColumn: range.column + 1
                });
            });
        }

        let detailsDiv = DOM.makeDiv(outerDiv, 'jo_exceptionPrinter_stacktrace');
        DOM.makeSpan(detailsDiv).textContent = AssemblyParserMessages.Expected();
        DOM.makeSpan(detailsDiv, 'jo_junitExpected').textContent = valuesExpected;
        DOM.makeElement( detailsDiv, 'br');
        DOM.makeSpan(detailsDiv).textContent = AssemblyParserMessages.Actual();
        DOM.makeSpan(detailsDiv, 'jo_junitActual').textContent = valuesActual;
        detailsDiv.style.marginBottom = "5px";


        main.getInterpreter().printManager.printHtmlElement(outerDiv);

    }

    getCompletionItemRanges(): AssemblyCompletionItemRange[] {
        return this.assemblyParserResult.completionItemRanges;
    }
}