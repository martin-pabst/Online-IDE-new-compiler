import { IMain } from "../../compiler/common/IMain.js";
import { ActionManager } from "../../compiler/common/interpreter/ActionManager.js";
import { CompilerWorkspace } from "../../compiler/common/module/CompilerWorkspace.js";
import { GUIFile } from "../workspace/File.js";
import { BottomDiv } from "./gui/BottomDiv.js";
import { RightDiv } from "./gui/RightDiv.js";
import { Debugger } from "../../compiler/common/debugger/Debugger.js";

export interface MainBase extends IMain {
    drawClassDiagrams(onlyUpdateIdentifiers: boolean);

    getRightDiv(): RightDiv;
    getBottomDiv(): BottomDiv;
    getActionManager(): ActionManager;
    setFileActive(file: GUIFile);
    isEmbedded(): boolean;


    addWorkspace(ws: CompilerWorkspace): void;

}