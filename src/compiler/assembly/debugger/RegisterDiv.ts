import { DOM } from "../../../tools/DOM";

export class RegisterDiv {

    private valueDiv: HTMLDivElement;

    constructor(parentDiv: HTMLDivElement, registerName: string) {
        let registerDiv = DOM.makeDiv(parentDiv, "jo_register-div");

        let registerNameDiv = DOM.makeDiv(registerDiv, "jo_register-name-div");
        registerNameDiv.textContent = registerName;

        this.valueDiv = DOM.makeDiv(registerDiv, "jo_register-value-div");
        this.valueDiv.textContent = "0";

    }

    setValue(value: number, base: number = 10) {
        if (base === 16) {
            this.valueDiv.textContent = "0x" + value.toString(16).toUpperCase();
        } else {
            this.valueDiv.textContent = value.toString();
        }
    }
}