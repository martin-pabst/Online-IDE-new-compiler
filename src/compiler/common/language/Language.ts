import { JavaRepl } from "../../java/parser/repl/JavaRepl";
import { Compiler } from "./Compiler";
import { IMain } from "../IMain";
import { WebworkerCompiler } from "./WebworkerCompiler";
import { EventManager } from "../interpreter/EventManager";

export type CompilerEvents = "typesReadyForCodeCompletion" | "compilationFinishedWithNewExecutable" | "compilationFinished";

export abstract class Language {

    protected _compiler: Compiler;
    protected _repl: JavaRepl;
    protected _webworkerCompiler: WebworkerCompiler;

    public eventManager: EventManager<CompilerEvents> = new EventManager();

    constructor(public name: string, public fileEndingWithDot: string,
        public monacoLanguageSelector, protected withWebworker: boolean) {
    }

    get compiler() { return this._compiler };
    get repl() { return this._repl };
    get webworkerCompiler() { return this._webworkerCompiler };


    triggerCompile(generateExecutable: boolean) {
        let comp: WebworkerCompiler = (this.withWebworker && !generateExecutable) ?
            this._webworkerCompiler : this._compiler
        comp.triggerCompile()
    }


}