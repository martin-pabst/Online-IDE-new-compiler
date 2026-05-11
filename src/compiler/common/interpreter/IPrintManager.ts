export abstract class IPrintManager {

    #log: string = "";
    #isLogging: boolean = false;

    print(text: string | undefined, withNewline: boolean, color: number | undefined): void {
        this.printIntern(text, withNewline, color);
        if(this.#isLogging){
            this.#log += text;
            if(withNewline) this.#log += "\n";
        }
    }
    
    abstract printIntern(text: string | undefined, withNewline: boolean, color: number | undefined): void;

    abstract flush(): void;

    abstract clear(): void;

    abstract printHtmlElement(htmlElement: HTMLElement): void;

    abstract isTestPrintManager(): boolean;

    startLogging(): void {
        this.#log = "";
        this.#isLogging = true;
    }

    stopLogging(): void {
        this.#isLogging = false;
    }

    getLog(): string {
        return this.#log;
    }

}

export class DummyPrintManager extends IPrintManager {

    printHtmlElement(htmlElement: HTMLElement): void {
        throw new Error("Method not implemented.");
    }

    printIntern(text: string | undefined, withNewline: boolean, color: number | undefined): void {
    }

    flush(): void {

    }

    clear(): void {
    }

    isTestPrintManager(): boolean {
        return false;
    }

}