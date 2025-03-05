import type { BottomDiv } from "../../client/main/gui/BottomDiv.ts";
import type { GUIFile } from "../../client/workspace/GUIFile.ts";
import type { Workspace } from "../../client/workspace/Workspace.ts";
import type { Compiler } from "../common/Compiler.ts";
import type { JavaRepl } from "../java/parser/repl/JavaRepl.ts";
import type { JavaWebworkerCompilerController } from "../java/webworker/JavaWebworkerCompilerController.ts";
import type { Disassembler } from "./disassembler/Disassembler.ts";
import type { ActionManager } from "./interpreter/ActionManager.ts";
import type { Interpreter } from "./interpreter/Interpreter.ts";
import type { Language } from "./Language.ts";
import type { CompilerFile } from "./module/CompilerFile.ts";
import type { IPosition } from "./range/Position.ts";
import type { IRange } from "./range/Range.ts";
import type * as monaco from 'monaco-editor'


export interface IMain {

    isEmbedded(): boolean;

    getInterpreter(): Interpreter;

    getLanguage(): Language;

    getCompiler(): Compiler;
    getWebworkerCompiler(): JavaWebworkerCompilerController;

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


}