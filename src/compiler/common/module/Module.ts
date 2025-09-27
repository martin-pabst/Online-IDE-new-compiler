import { GUIFile } from "../../../client/workspace/File.ts";
import { Quickfix } from "../../java/monacoproviders/quickfix/Quickfix.ts";
import { JavaType } from "../../java/types/JavaType.ts";
import { Error } from "../Error";
import { UsagePosition, UsageTracker } from "../UsagePosition";
import { CodeFragment } from "../disassembler/CodeFragment.ts";
import { Program } from "../interpreter/Program";
import { Step } from "../interpreter/Step.ts";
import { Thread } from "../interpreter/Thread";
import { Position } from "../range/Position.ts";
import { IRange } from "../range/Range.ts";
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

    abstract startMainProgram(thread: Thread, setOneTimeBreakpointAtFirstVisibleLine: boolean): boolean;

    abstract isReplModule(): boolean;

    abstract getCodeFragments(): CodeFragment[];

    isStartable(): boolean {
        if (this.hasMainProgram()) {
            return !this.hasErrors() && !this.isDirty() && !this.dependsOnModuleWithErrorsFlag;
        }

        return false;
    }

    hasErrors(): boolean {
        return this.errors.find(error => error.level == "error") ? true : false;
    }

    getLastCompiledMonacoVersion(){
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

        for(let program of this.programsToCompileToFunctions){
            let step = program.findStep(lineNumber);
            if(step){
                if(nearestStep){
                    if(Math.abs(step.range.startLineNumber! - lineNumber) < Math.abs(nearestStep.range.startLineNumber! - lineNumber)){
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
        if(dirty){
            this.lastCompiledMonacoVersion = this.file.getLocalVersion() - 1;
        } else {
            this.lastCompiledMonacoVersion = this.file.getLocalVersion();
        }
    }

}