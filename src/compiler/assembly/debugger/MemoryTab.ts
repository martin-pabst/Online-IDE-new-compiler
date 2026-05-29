import { DOM } from "../../../tools/DOM";
import { Tab } from "../../../tools/TabManager";
import { CPU } from "../CPU";
import { AssemblyDebuggerMessages } from "../language/AssemblyDebuggerMessages";
import '/assets/css/memorytab.css';
import '/assets/css/debugger.css';
import { register } from "module";

class MemoryTab extends Tab {

    lastDisplayedCPU: CPU = null;
    heading1Div: HTMLDivElement;
    heading2Div: HTMLDivElement
    memoryViewDiv: HTMLDivElement;

    registerDivs: { [registerName: string]: HTMLDivElement } = {};
    flagDivs: { [flagName: string]: HTMLDivElement } = {};

    fromInput: HTMLInputElement;
    toInput: HTMLInputElement;
    baseSelect: HTMLSelectElement;

    from: number = 0;
    to: number = 2000;

    constructor() {
        super("Memory Tab", AssemblyDebuggerMessages.MemoryTabCaption(),
            ['jo_memorytab']);

    }

    update(cpu: CPU) {
        if (this.lastDisplayedCPU !== cpu) this.initialize(cpu);
    }

    initialize(cpu: CPU) {
        this.lastDisplayedCPU = cpu;
        this.bodyDiv.innerHTML = "";

        this.heading1Div = DOM.makeDiv(this.bodyDiv, "jo_memorytab_heading1");

        for (let i = 0; i < cpu.registerNames.length; i++) {
            let registerName = cpu.registerNames[i];
            let registerNameShort = cpu.registerNamesShort[i];
            let registerNameDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_register");
            registerNameDiv.textContent = registerNameShort;

            let registerDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_registervalue");
            this.registerDivs[registerName] = registerDiv;
            registerDiv.textContent = "0 (hex: 0x0)";
        }

        for (let i = 0; i < cpu.flagNames.length; i++) {
            let flagName = cpu.flagNames[i];
            let flagNameShort = cpu.flagNamesShort[i];
            let flagNameDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_flagname");
            flagNameDiv.textContent = flagNameShort;

            let flagDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_flagvalue");
            this.flagDivs[flagName] = flagDiv;
            flagDiv.textContent = "0 (hex: 0x0)";
        }

        this.heading2Div = DOM.makeDiv(this.bodyDiv, "jo_memorytab_heading2");

        DOM.makeDiv(this.heading2Div, "jo_memorytab_heading2text").textContent = AssemblyDebuggerMessages.MemoryTabFrom();
        this.fromInput = DOM.makeElement(this.heading2Div, "input", "jo_memorytab_frominput", "number") as HTMLInputElement;
        this.fromInput.value = this.from.toString();

        DOM.makeDiv(this.heading2Div, "jo_memorytab_heading2text").textContent = AssemblyDebuggerMessages.MemoryTabTo();
        this.toInput = DOM.makeElement(this.heading2Div, "input", "jo_memorytab_toinput", "number") as HTMLInputElement;
        this.toInput.value = this.to.toString();
        this.toInput.style.marginRight = "20px";

        this.baseSelect = DOM.makeElement(this.heading2Div, "select", "jo_memorytab_baseselect") as HTMLSelectElement;
        let optionDecimal = DOM.makeElement(this.baseSelect, "option") as HTMLOptionElement;
        optionDecimal.value = "decimal";
        optionDecimal.textContent = AssemblyDebuggerMessages.MemoryTabDecimal();
        let optionHexadecimal = DOM.makeElement(this.baseSelect, "option") as HTMLOptionElement;
        optionHexadecimal.value = "hexadecimal";
        optionHexadecimal.textContent = AssemblyDebuggerMessages.MemoryTabHexadecimal();

        let memoryView = DOM.makeDiv(this.bodyDiv, "jo_memoryView", "jo_scrollable");
        this.bodyDiv.appendChild(memoryView);





    }


}