import { AccordionElement } from "../../../tools/components/treeview/AccordionElement";
import { TreeviewAccordion } from "../../../tools/components/treeview/TreeviewAccordion";
import { CPU } from "../CPU";
import { AssemblyDebuggerMessages } from "../language/AssemblyDebuggerMessages";
import { RegisterDiv } from "./RegisterDiv";
import { StatusRegisterDiv } from "./StatusRegisterDiv";

export class RegistersView extends AccordionElement {

    registerDivs: { [registerName: string]: RegisterDiv } = {};
    statusRegisterDiv: StatusRegisterDiv;

    constructor(debuggerAccordion: TreeviewAccordion) {
        super(debuggerAccordion, {
            captionLine: {
                enabled: true,
                text: AssemblyDebuggerMessages.AssemblyDebuggerRegistersCaption()
            }
        });

    }

    updateView(cpu: CPU) {
        this.initRegisterDivs(cpu);
        for(let registerName of cpu.registerNamesShort) {
            let registerValue = cpu.getRegisterValues()[registerName];
            this.registerDivs[registerName].setValue(registerValue, 16);
        }
        this.statusRegisterDiv.updateValues(cpu);
    }

    initRegisterDivs(cpu: CPU) {
        if(this.registerDivs) return;
        for(let registerName of cpu.registerNames) {
            this.registerDivs[registerName] = new RegisterDiv(this.innerDiv, registerName);
        }

        this.statusRegisterDiv = new StatusRegisterDiv(this.innerDiv, cpu);
    }


}