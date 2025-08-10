import { Debugger } from "../../compiler/common/debugger/Debugger.js";
import { IMain } from "../../compiler/common/IMain.js";
import { ActionManager } from "../../compiler/common/interpreter/ActionManager.js";
import { CompilerFile } from "../../compiler/common/module/CompilerFile.js";
import { CompilerWorkspace } from "../../compiler/common/module/CompilerWorkspace.js";
import { IRange } from "../../compiler/common/range/Range.js";
import { Settings } from "../settings/Settings.js";
import { GUIFile } from "../workspace/File.js";
import { BottomDiv } from "./gui/BottomDiv.js";
import { RightDiv } from "./gui/RightDiv.js";

export interface MainBase extends IMain {
    drawClassDiagrams(onlyUpdateIdentifiers: boolean);

    getDebugger(): Debugger;
    getRightDiv(): RightDiv;
    getBottomDiv(): BottomDiv;
    getActionManager(): ActionManager;
    setFileActive(file: GUIFile);
    isEmbedded(): boolean;


    addWorkspace(ws: CompilerWorkspace): void;

}