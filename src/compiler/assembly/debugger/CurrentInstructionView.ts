import { AccordionElement } from "../../../tools/components/treeview/AccordionElement";
import { TreeviewAccordion } from "../../../tools/components/treeview/TreeviewAccordion";
import { DOM } from "../../../tools/DOM";
import { ProgrammingLanguageData } from "../../common/programminglanguage/ProgrammingLanguageData";
import { CPU } from "../CPU";
import { AssemblyDebuggerMessages } from "../language/AssemblyDebuggerMessages";
import * as monaco from 'monaco-editor'


export class CurrentInstructionView extends AccordionElement {

    inMemoryHeading: HTMLDivElement;
    inMemoryDiv: HTMLDivElement;
    
    assemblyHeading: HTMLDivElement;
    assemblyDiv: HTMLDivElement;
    
    descriptionHeading: HTMLDivElement;
    descriptionDiv: HTMLDivElement;

    constructor(debuggerAccordion: TreeviewAccordion) {
        super(debuggerAccordion, {
            captionLine: {
                enabled: true,
                text: AssemblyDebuggerMessages.AssemblyDebuggerCurrentInstructionCaption()
            }
        });

    }

    updateView(cpu: CPU) {
        this.initView(cpu);
        let mem = cpu.getMemory().dump();
        let numberOfParameters = cpu.getStatementLengthAtProgramCounter() - 1;
        let opCodeAndParameters = mem.slice(cpu.getProgramCounter(), cpu.getProgramCounter() + 1 + numberOfParameters);

        if(opCodeAndParameters.length === 0) {
            this.noInstructionAtCurrentPosition();
            return;
        }
        
        this.inMemoryDiv.textContent = `${opCodeAndParameters.map((v): string => v.toString(10)).join(", ")}`;
        let description = cpu.getDescriptionForCurrentInstruction();
        description = description ? description : "";
        
        description = description.replaceAll("//", "");
        
        let colonIndex = description.indexOf(':');
        if(colonIndex > 0 && colonIndex < 30){
            let descriptionRight = description.substring(colonIndex + 1).trim();
            let descriptionLeft = description.substring(0, colonIndex).trim();
            this.descriptionDiv.textContent = descriptionRight;

            monaco.editor.colorize(descriptionLeft, ProgrammingLanguageData.ByAssembly.monacoLanguageSelector, {}).then(
            (html) => {this.assemblyDiv.innerHTML = html;}
        );

        } else {
            this.descriptionDiv.textContent = description;
            this.assemblyDiv.textContent = "";
        }

    }

    noInstructionAtCurrentPosition() {
        this.inMemoryDiv.textContent = AssemblyDebuggerMessages.NoInstructionAtCurrentPosition();
        this.descriptionDiv.textContent = "";
    }

    initView(cpu: CPU) {
        if(this.inMemoryDiv) return;
        this.innerDiv.classList.add("jo_assembly-current-instruction-view");    
        
        this.inMemoryHeading = DOM.makeDiv(this.innerDiv, "jo_assembly-inmemory-heading");
        this.inMemoryHeading.textContent = AssemblyDebuggerMessages.InMemory();
        this.inMemoryDiv = DOM.makeDiv(this.innerDiv, "jo_assembly-inmemory-div");

        this.assemblyHeading = DOM.makeDiv(this.innerDiv, "jo_assembly-assembly-heading");
        this.assemblyHeading.textContent = AssemblyDebuggerMessages.Assembly();
        this.assemblyDiv = DOM.makeDiv(this.innerDiv, "jo_assembly-assembly-div");
        

        this.descriptionHeading = DOM.makeDiv(this.innerDiv, "jo_assembly-statement-description-heading");
        this.descriptionHeading.textContent = AssemblyDebuggerMessages.Description();
        this.descriptionDiv = DOM.makeDiv(this.innerDiv, "jo_assembly-statement-description-div");
    }

}