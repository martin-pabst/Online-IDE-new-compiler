import { DOM } from "../../../tools/DOM";
import { Tab } from "../../../tools/TabManager";
import { CPU } from "../CPU";
import { AssemblyDebuggerMessages } from "../language/AssemblyDebuggerMessages";
import '/assets/css/debugger.css';
import { IMain } from "../../common/IMain";
import { AssemblyCompiler } from "../AssemblyCompiler";
import { AssemblyModule } from "../AssemblyModule";
import "regular-table";
import '/assets/css/regular-table/material.css';
import '/assets/css/memorytab.css';
import { RegularTableElement } from "regular-table";
import { DataResponse } from "regular-table/dist/esm/types";
import { ContextMenuItem, openContextMenu } from "../../../tools/HtmlTools";

type RegularTableMetadata = {
    classes?: string[];
}

export class MemoryTab extends Tab {

    lastDisplayedCPU: CPU = null;
    heading1Div: HTMLDivElement;
    memoryViewDiv: HTMLDivElement;

    hamburgerButton: HTMLDivElement;

    registerDivs: { [registerName: string]: HTMLDivElement } = {};
    flagDivs: { [flagName: string]: HTMLDivElement } = {};

    memoryOuterDiv: HTMLDivElement;
    regularTableElement: RegularTableElement;

    columnsPerRow: number = 10;
    base: number = 10;

    compiler: AssemblyCompiler;

    constructor(private main: IMain) {
        super("Memory Tab", AssemblyDebuggerMessages.MemoryTabCaption(),
            ['jo_memorytab']);

    }

    update(cpu: CPU) {
        if (this.lastDisplayedCPU !== cpu) this.initialize(cpu);
        this.updateRegistersAndFlags(cpu);
        this.updateMemoryView(cpu);
    }

    listenToCompiler(compiler: AssemblyCompiler) {
        this.compiler = compiler;
        compiler.eventManager.on("compilationFinished", this.onCompilationFinished, this);
    }

    unlistenToCompiler() {
        this.compiler.eventManager.off(this.onCompilationFinished);
        this.compiler = null;
    }

    onCompilationFinished() {
        let file = this.main.getCurrentWorkspace()?.getCurrentlyEditedFile();
        if (!file) return;
        let module = this.compiler.findModuleByFile(file);
        if (!module) return;
        if (module instanceof AssemblyModule) {
            this.update(module.cpu);
        }
    }

    initialize(cpu: CPU) {
        this.lastDisplayedCPU = cpu;
        this.bodyDiv.innerHTML = "";

        this.heading1Div = DOM.makeDiv(this.bodyDiv, "jo_memorytab_heading1");

        let that: MemoryTab = this;
        this.hamburgerButton = DOM.makeDiv(this.heading1Div, "jo_memorytab_hamburger", "jo_button", "jo_active", "img_menu-three-bars");
        this.hamburgerButton.onclick = () => {
            let buttonBoundingRect = this.hamburgerButton.getBoundingClientRect();
            let contextMenuItems: ContextMenuItem[] = [];
            if (this.base === 10) {
                contextMenuItems.push({
                    caption: AssemblyDebuggerMessages.MemoryTabHexadecimal(),
                    callback() {
                        that.columnsPerRow = 16;
                        that.base = 16;
                        that.update(cpu);
                    }
                });
            } else {
                contextMenuItems.push({
                    caption: AssemblyDebuggerMessages.MemoryTabDecimal(),
                    callback() {
                        that.columnsPerRow = 10;
                        that.base = 10;
                        that.update(cpu);
                    }
                });
            }

            contextMenuItems.push({
                caption: AssemblyDebuggerMessages.MemoryTabShowProgramLocation(),
                callback() {
                    let firstCodePartStart = cpu.getStartOfFirstCodePart();
                    if (typeof firstCodePartStart === "number") {
                        let x = firstCodePartStart % that.columnsPerRow;
                        let y = Math.floor(firstCodePartStart / that.columnsPerRow);
                        that.regularTableElement.scrollToCell(x, y);
                    }
                }
            });

            openContextMenu(contextMenuItems, buttonBoundingRect.left, buttonBoundingRect.bottom);

        }

        for (let i = 0; i < cpu.registerNames.length; i++) {
            let registerName = cpu.registerNames[i];
            let registerNameShort = cpu.registerNamesShort[i];
            let registerNameDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_registername");
            registerNameDiv.textContent = registerNameShort + ":";

            let registerDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_registervalue");
            this.registerDivs[registerName] = registerDiv;
            registerDiv.textContent = "0 (hex: 0x0)";
        }

        for (let i = 0; i < cpu.flagNames.length; i++) {
            let flagName = cpu.flagNames[i];
            let flagNameShort = cpu.flagNamesShort[i];
            let flagNameDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_flagname");
            flagNameDiv.textContent = flagNameShort + ":";

            let flagDiv = DOM.makeDiv(this.heading1Div, "jo_memorytab_flagvalue");
            this.flagDivs[flagName] = flagDiv;
            flagDiv.textContent = "0";
        }

        this.memoryOuterDiv = DOM.makeDiv(this.bodyDiv, "jo_memorytab_memoryOuter");
        this.bodyDiv.appendChild(this.memoryOuterDiv);

        this.regularTableElement = <RegularTableElement>DOM.makeElement(this.memoryOuterDiv, "regular-table", "jo_memorytab_regulartable");
        this.regularTableElement.setDataListener(this.regularTableDataListener.bind(this), {
            virtual_mode: "both",
        });

        this.regularTableElement.addStyleListener(this.regularTableStyleListener.bind(this));

        this.onShow = () => {
            this.regularTableElement.draw();
        }

        const resizeObserver = new ResizeObserver((entries) => {
            this.regularTableElement.draw();
        });
        resizeObserver.observe(this.bodyDiv);

    }

    updateMemoryView(cpu: CPU) {
        this.regularTableElement.draw();
    }

    regularTableDataListener(x0: number, y0: number, x1: number, y1: number): DataResponse {
        // console.log("Requesting memory data for columns " + x0 + "-" + x1 + " and rows " + y0 + "-" + y1);
        let data: string[][] = [];
        let metadata: RegularTableMetadata[][] = [];

        let memory = this.lastDisplayedCPU.getMemory().dump();
        x1 = Math.min(x1, this.columnsPerRow);
        y1 = isNaN(y1) ? Math.ceil(memory.length / this.columnsPerRow) : Math.min(y1, Math.ceil(memory.length / this.columnsPerRow));

        let statementStartAddress = this.lastDisplayedCPU.getProgramCounter();
        let statementEndAddress = statementStartAddress + this.lastDisplayedCPU.getStatementLengthAtProgramCounter();

        let { location, indirectLocation } = this.lastDisplayedCPU.getAddressOperandLocationOfCurrentStatement();

        for (let column = x0; column < x1; column++) {
            let columnData: string[] = [];
            let columnMetadata: RegularTableMetadata[] = [];
            for (let row = y0; row < y1; row++) {
                let address = row * this.columnsPerRow + column;
                columnData.push("" + (this.num(memory[address]) ?? "---"));
                
                let metadataEntry: RegularTableMetadata = { classes: [] };
                if (address >= statementStartAddress && address < statementEndAddress) {
                    metadataEntry.classes.push("jo_memorytab_currentstatement");
                } else if (this.lastDisplayedCPU.isCodeLocation(address)) {
                    metadataEntry.classes.push("jo_memorytab_programlocation");
                }

                if (location === address) {
                    metadataEntry.classes.push("jo_memorytab_addressoperand");
                }
                if (indirectLocation === address) {
                    metadataEntry.classes.push("jo_memorytab_indirectoperand");
                }

                columnMetadata.push(metadataEntry);
            }
            data.push(columnData);
            metadata.push(columnMetadata);
        }

        let columnHeaders: string[][] = [];
        for (let column = x0; column < x1; column++) {
            columnHeaders.push(["+" + this.num(column)]);
        }

        let rowHeaders: string[][] = [];
        for (let row = y0; row < y1; row++) {
            rowHeaders.push([this.num(row * this.columnsPerRow)]);
        }

        return {
            data: data,
            num_columns: this.columnsPerRow,
            num_rows: Math.ceil(memory.length / this.columnsPerRow),
            column_headers: columnHeaders,
            row_headers: rowHeaders,
            metadata: metadata
        };
    }

    regularTableStyleListener(event) {
        let cells = this.regularTableElement.querySelectorAll("td");
        for (const td of cells) {
            let meta = this.regularTableElement.getMeta(td).user as RegularTableMetadata;
            td.setAttribute("class", "");
            if (meta && meta.classes.length > 0) {
                td.classList.add(...meta.classes);
            } 
        }
    }

    updateRegistersAndFlags(cpu: CPU) {
        for (let registerName of cpu.registerNames) {
            let value = cpu.getRegisterValues()[registerName];
            let registerDiv = this.registerDivs[registerName];
            registerDiv.textContent = this.num(value);
        }

        for (let flagName of cpu.flagNames) {
            let value = cpu.getFlags()[flagName];
            let flagDiv = this.flagDivs[flagName];
            flagDiv.textContent = value ? "1" : "0";
        }
    }

    num(value: number): string {
        if (typeof value !== "number") {
            return "---";
        }
        if (this.base === 16) {
            let v = value >= 0 ? value : 0x10000 + value; // Convert to unsigned for display
            return v.toString(16);
        } else {
            return value.toString();
        }
    }

}