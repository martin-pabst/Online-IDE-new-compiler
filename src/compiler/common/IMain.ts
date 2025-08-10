import { BottomDiv } from "../../client/main/gui/BottomDiv.ts";
import { Settings } from "../../client/settings/Settings.ts";
import { GUIFile } from "../../client/workspace/File.ts";
import { Workspace } from "../../client/workspace/Workspace.ts";
import { Compiler } from "../common/Compiler.ts";
import { JavaRepl } from "../java/parser/repl/JavaRepl.ts";
import { Disassembler } from "./disassembler/Disassembler.ts";
import { ActionManager } from "./interpreter/ActionManager.ts";
import { Interpreter } from "./interpreter/Interpreter.ts";
import { Language } from "./Language.ts";
import { CompilerFile } from "./module/CompilerFile.ts";
import { IPosition } from "./range/Position.ts";
import { IRange } from "./range/Range.ts";
import type * as monaco from 'monaco-editor'


export interface IMain {

    isEmbedded(): boolean;

    getInterpreter(): Interpreter;

    getLanguage(): Language;

    getCompiler(): Compiler;

    getRepl(): JavaRepl;


    getMainEditor(): monaco.editor.IStandaloneCodeEditor;

    getReplEditor(): monaco.editor.IStandaloneCodeEditor;


    getCurrentWorkspace(): Workspace | undefined;

    adjustWidthToWorld(): void;

    showFile(file?: CompilerFile): void;

    showProgramPosition(file?: CompilerFile, positionOrRange?: IPosition | IRange, setCursor?: boolean): void;

    getDisassembler(): Disassembler | undefined;

    getActionManager(): ActionManager;

    showJUnitDiv(): void;

    getBottomDiv(): BottomDiv;

    markFilesAsStartable(files: GUIFile[], active: boolean);

    onStartFileClicked(file: GUIFile);

    hideDebugger(): void;
    showDebugger(): void;

    getSettings(): Settings;


}