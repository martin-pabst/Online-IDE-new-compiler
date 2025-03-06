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

    protected eventManager: EventManager<CompilerEvents> = new EventManager();

    constructor(public name: string, public fileEndingWithDot: string, 
        public monacoLanguageSelector, protected withWebworker: boolean){
    }

    get compiler(){return this._compiler};
    get repl(){return this._repl};
    get webworkerCompiler(){return this._webworkerCompiler};


    triggerCompile(main: IMain, generateExecutable: boolean){
        let comp: WebworkerCompiler = (this.withWebworker && !generateExecutable) ? 
            this.#webworkerCompilers.get(main) : this.#compilers.get(main);
        comp.triggerCompile()
    }    

    protected registerCompiler(main: IMain, compiler: Compiler){
        this.#compilers.set(main, compiler);
        this.#mains.add(main);
    }
    
    protected registerWebworkerCompiler(main: IMain, webworkercompiler: WebworkerCompiler){
        this.#webworkerCompilers.set(main, webworkercompiler);
        this.#mains.add(main);
    }
    
    protected registerRepl(main: IMain, repl: JavaRepl){
        this.#repls.set(main, repl);
        this.#mains.add(main);
    }

}