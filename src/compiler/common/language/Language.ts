import { JavaRepl } from "../../java/parser/repl/JavaRepl";
import { Compiler } from "./Compiler";
import { WebworkerCompiler } from "./WebworkerCompiler";
import { EventManager } from "../interpreter/EventManager";
import { Executable } from "../Executable";

export type CompilerEvents = "typesReadyForCodeCompletion" | "compilationFinished";

export abstract class Language {

    protected _compiler: Compiler;
    protected _repl: JavaRepl;
    protected _webworkerCompiler: WebworkerCompiler;

    public eventManager: EventManager<CompilerEvents> = new EventManager();

    protected lastUsedCompiler: WebworkerCompiler;

    constructor(public name: string, public fileEndingWithDot: string,
        public monacoLanguageSelector, protected withWebworker: boolean) {
    }

    get compiler() { return this._compiler };
    get repl() { return this._repl };
    get webworkerCompiler() { return this._webworkerCompiler };


    async triggerCompile(generateExecutable: boolean): Promise<Executable> {

        let promise: Promise<Executable> = new Promise((resolve) => {

            this.eventManager.once("compilationFinished", (executable: Executable) => {
                resolve(executable);
            })

            let comp: WebworkerCompiler = (this.withWebworker && !generateExecutable) ?
                this._webworkerCompiler : this._compiler
                this.lastUsedCompiler = comp;
    
            if(comp == this._compiler){
                console.log("Compiling in GUI Thread...");
            } else {
                console.log("Compiling in webworker...");
            }

            comp.triggerCompile()
        })

        return promise;
        
    }

    startableMainModuleExists(): boolean {
        if(!this.lastUsedCompiler) return false;
        return this.lastUsedCompiler.startableMainModuleExists();
    }

}