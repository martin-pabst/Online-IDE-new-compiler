import { TreeviewAccordion } from "../../tools/components/treeview/TreeviewAccordion";
import { Debugger } from "../common/debugger/Debugger";
import { IMain } from "../common/IMain";

export class AssemblyLanguageDebugger extends Debugger {
    
    private treeviewAccordion: TreeviewAccordion;

    constructor(private debuggerDiv: HTMLDivElement, private withFileTreeview: boolean,
        public main: IMain) {
        super();
    }

    public hide(): void {
        throw new Error("Method not implemented.");
    }
    public show(): void {
        throw new Error("Method not implemented.");
    }
    public updateView(): void {
        throw new Error("Method not implemented.");
    }
}