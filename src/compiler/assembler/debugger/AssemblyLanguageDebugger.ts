import { Debugger } from "../../common/debugger/Debugger";
import { IMain } from "../../common/IMain";
import { RegistersView } from "./RegistersView";

export class AssemblyLanguageDebugger extends Debugger {

    private registerView: RegistersView;

    constructor(debuggerDiv: HTMLDivElement, withFileTreeview: boolean, main: IMain) {
        super(debuggerDiv, main);

        this.registerView = new RegistersView(this.treeviewAccordion);

        if (withFileTreeview) {
            this.initFileTreeview();
        }

    }

    public updateView(): void {
        let currentThread = this.main.getInterpreter().scheduler.getCurrentThread();
        if (!currentThread) return;
        let cpu = currentThread.cpu;
        if(!cpu) return;

        this.registerView.updateView(cpu);
    }

}