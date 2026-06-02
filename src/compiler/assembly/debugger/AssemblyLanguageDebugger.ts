import { Debugger } from "../../common/debugger/Debugger";
import { IMain } from "../../common/IMain";
import { CurrentInstructionView } from "./CurrentInstructionView";
import { MemoryTab } from "./MemoryTab";
import { RegistersView } from "./RegistersView";

export class AssemblyLanguageDebugger extends Debugger {

    private registerView: RegistersView;
    private currentInstructionView: CurrentInstructionView;

    constructor(debuggerDiv: HTMLDivElement, withFileTreeview: boolean, main: IMain) {
        super(debuggerDiv, main);

        this.registerView = new RegistersView(this.treeviewAccordion);
        this.currentInstructionView = new CurrentInstructionView(this.treeviewAccordion);

        if (withFileTreeview) {
            this.initFileTreeview();
        }

    }

    public updateView(): void {
        let currentThread = this.main.getInterpreter().scheduler.getCurrentThread();
        if (!currentThread) return;
        let cpu = currentThread.__cpu;
        if(!cpu) return;

        this.registerView.updateView(cpu);
        this.currentInstructionView.updateView(cpu);
        
        let memoryTab = <MemoryTab>this.main.getRightDiv().memoryTab;
        if (memoryTab) {
            memoryTab.update(cpu);
        }
    }

}