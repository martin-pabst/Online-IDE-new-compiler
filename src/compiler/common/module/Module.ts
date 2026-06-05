import { Quickfix } from "../../java/monacoproviders/quickfix/Quickfix.ts";
import { JavaType } from "../../java/types/JavaType.ts";
import { Error, ErrorLevel } from "../Error";
import { UsagePosition, UsageTracker } from "../UsagePosition";
import { CodeFragment } from "../disassembler/CodeFragment.ts";
import { Program } from "../interpreter/Program";
import { Step } from "../interpreter/Step.ts";
import { Thread } from "../interpreter/Thread";
import { Position } from "../range/Position.ts";
import { IRange, Range } from "../range/Range.ts";
import { CompilerFile } from "./CompilerFile";
import type * as monaco from 'monaco-editor'


export abstract class Module {

    errors: Error[] = [];
    bracketError?: string;
    colorInformation: monaco.languages.IColorInformation[] = [];

    quickfixes: Quickfix[] = [];

    private lastCompiledMonacoVersion: number = -2;

    programsToCompileToFunctions: Program[] = [];

    compiledSymbolsUsageTracker: UsageTracker = new UsageTracker(this);

    systemSymbolsUsageTracker: UsageTracker = new UsageTracker(this);

    returnType?: JavaType;  // for use with Repl

    dependsOnModuleWithErrorsFlag: boolean = false;



    constructor(public file: CompilerFile, public isLibraryModule: boolean) {

    }

    abstract hasMainProgram(): boolean;

    /**
     * Push first program onto given thread's program stack
     * @param thread inject program to start into this thread
     * @param setOneTimeBreakpointAtFirstVisibleLine if program is started via "Step Over" or "Step Into" action then this parameter is true
     */
    abstract startMainProgram(thread: Thread, setOneTimeBreakpointAtFirstVisibleLine: boolean): boolean;

    abstract isReplModule(): boolean;

    /**
     * Used by Disassembler
     */
    abstract getCodeFragments(): CodeFragment[];

    abstract clearAllBreakpoints(): void;

    isStartable(): boolean {
        if (this.hasMainProgram()) {
            return !this.hasErrors() && !this.isDirty() && !this.dependsOnModuleWithErrorsFlag;
        }

        return false;
    }

    hasErrors(): boolean {
        return this.errors.find(error => error.level == "error") ? true : false;
    }

    getLastCompiledMonacoVersion() {
        return this.lastCompiledMonacoVersion;
    }

    findSymbolAtPosition(position: Position): UsagePosition | undefined {
        let symbol = this.compiledSymbolsUsageTracker.findSymbolAtPosition(position);
        if (symbol) return symbol;
        return this.systemSymbolsUsageTracker.findSymbolAtPosition(position);
    }

    registerTypeUsage(type: JavaType, range: IRange) {
        if (type.module.isLibraryModule) {
            this.systemSymbolsUsageTracker.registerUsagePosition(type, this.file,
                range);
        } else {
            this.compiledSymbolsUsageTracker.registerUsagePosition(type, this.file,
                range);
        }
    }

    findStep(lineNumber: number): Step | undefined {
        let nearestStep: Step | undefined;

        for (let program of this.programsToCompileToFunctions) {
            let step = program.findStep(lineNumber);
            if (step) {
                if (nearestStep) {
                    if (Math.abs(step.range.startLineNumber! - lineNumber) < Math.abs(nearestStep.range.startLineNumber! - lineNumber)) {
                        nearestStep = step;
                    }
                } else {
                    nearestStep = step;
                }
            }
        }
        return nearestStep;
    }

    /**
     * A module is dirty if it's program code or the program code of other modules
     * it depends on has changed since last compilation run.
     */
    isDirty(): boolean {
        return this.file.getLocalVersion() != this.lastCompiledMonacoVersion;
    }

    isMoreThanOneVersionAheadOfLastCompilation(): boolean {
        return this.file.getLocalVersion() - this.lastCompiledMonacoVersion > 1;
    }

    /**
     * Set this modules' dirty-status"
     */
    setDirty(dirty: boolean) {
        if (dirty) {
            this.lastCompiledMonacoVersion = this.file.getLocalVersion() - 1;
        } else {
            this.lastCompiledMonacoVersion = this.file.getLocalVersion();
        }
    }

    getSortedAndFilteredErrors(): Error[] {

        const list: Error[] = this.errors.slice();

        list.sort((a, b) => {
            return Range.compareRangesUsingStarts(a.range, b.range);
        });

        for (let i = 0; i < list.length - 1; i++) {
            const e1 = list[i];
            const e2 = list[i + 1];
            if (e1.range.startLineNumber == e2.range.startLineNumber && e1.range.startColumn + 10 > e2.range.startColumn) {
                if (this.#errorLevelCompare(e1.level, e2.level) == 1) {
                    list.splice(i + 1, 1);
                } else {
                    list.splice(i, 1);
                }
                i--;
            }
        }

        return list;
    }

    #errorLevelCompare(level1: ErrorLevel, level2: ErrorLevel): number {
        if (level1 == "error") return 1;
        if (level2 == "error") return -1;
        if (level1 == "warning") return 1;
        if (level2 == "warning") return -1;
        return 1;
    }

    
}