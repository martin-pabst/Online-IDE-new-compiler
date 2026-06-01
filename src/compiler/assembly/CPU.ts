import { Error } from "../common/Error";
import { IMain } from "../common/IMain";
import { Thread } from "../common/interpreter/Thread";
import { ThreadState } from "../common/interpreter/ThreadState";
import { CompilerFile } from "../common/module/CompilerFile";
import { IRange, Range } from "../common/range/Range";
import { AssemblyInstruction, AssemblyLabel, AssemblyParserResult } from "./AssemblyParser";
import { Memory } from "./Memory";


export type AssemblyBreakpoint = {
    programCounter: number;
    isOneTime: boolean;
}

export var _cpu: string = "__t.cpu.";

export abstract class CPU {

    abstract name: string;
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
    abstract getPseudoDirectivesWithDescription(): { directiveIdentifier: string, description: () => string }[];
    abstract getInstructions(): AssemblyInstruction[];

    abstract getMemory(): Memory;

    abstract reset(): void;

    // returns true on program end
    abstract executeNextStep(thread: Thread): boolean;

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

    getLabels(): { identifier: string, address: number }[]{
        return this.assemblyParserResult.labels;
    }

    getLabelMap(): Map<number, { label: AssemblyLabel, range: IRange }[]>{
        return this.assemblyParserResult.labelMap;
    }

    getHoverEntries(): Map<number, {range: IRange, text: string}[]> {
        return this.assemblyParserResult.hoverEntries;
    }

    getInstructionMap(): Map<number, { instruction: AssemblyInstruction, range: IRange }[]> {
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
            if(Range.containsPosition(commentRange, position)) {
                return true;
            }
        }
        return false;
    }
    
}