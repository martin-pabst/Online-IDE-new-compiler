import { IPrintManager } from "../compiler/common/interpreter/IPrintManager";

export class StoreOutputPrintManager extends IPrintManager {

    output: string = "";

    isTestPrintManager(): boolean {
        return true;
    }

    printHtmlElement(htmlElement: HTMLElement): void {

    }

    printIntern(text: string | undefined, withNewline: boolean, color: number | undefined): void {
        if (!text) return;
        if (text.startsWith("Execution")) return;
        this.output += text;
        if (withNewline) this.output += "\n";
    }
    clear(): void {
        this.output = "";
    }

    flush(): void {

    }
}