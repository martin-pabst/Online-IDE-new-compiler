import { DOM } from "../../../tools/DOM";
import { CPU } from "../CPU";
import { AssemblyDebuggerMessages } from "../language/AssemblyDebuggerMessages";

export class StatusRegisterDiv {

    private registerNameDiv: HTMLDivElement;
    private valueDivs: { [flagName: string]: HTMLDivElement };
    private registerDiv: HTMLDivElement;

    constructor(parentDiv: HTMLDivElement, cpu: CPU) {
        this.registerDiv = DOM.makeDiv(parentDiv, "jo_register-div");

        this.registerNameDiv = DOM.makeDiv(this.registerDiv, "jo_register-name-div");
        this.registerNameDiv.textContent = AssemblyDebuggerMessages.StatusRegisterCaption();

    }

    updateValues(cpu: CPU) {
        this.initValueDivs(cpu);
        for(let i = 0; i < cpu.flagNames.length; i++) {
            let flagName = cpu.flagNames[i];
            let flagValue = cpu.getFlags()[flagName];
            let valueDiv = this.valueDivs[flagName];
            valueDiv.textContent = flagValue ? "1" : "0";
        }
    }

    initValueDivs(cpu: CPU) {
        if(this.valueDivs) return;
        this.valueDivs = {};
        for(let i = 0; i < cpu.flagNames.length; i++) {
            let flagName = cpu.flagNames[i];
            let flagNameShort = cpu.flagNamesShort[i];
            let flagDiv = DOM.makeDiv(this.registerDiv, "jo_flagdiv");
            let flagNameDiv = DOM.makeDiv(flagDiv, "jo_flag-name-div");
            flagNameDiv.textContent = AssemblyDebuggerMessages.FlagString(flagNameShort);
            let valueDiv = DOM.makeDiv(flagDiv, "jo_flag-value-div");
            valueDiv.textContent = "0";
            this.valueDivs[flagName] = valueDiv;
        }
    }
}