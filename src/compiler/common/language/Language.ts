import { JavaRepl } from "../../java/parser/repl/JavaRepl";
import { Compiler } from "./Compiler";
import { IMain } from "../IMain";
import { WebworkerCompiler } from "./WebworkerCompiler";

export abstract class Language {

    #compilers: Map<IMain, Compiler> = new Map();
    #repls: Map<IMain, JavaRepl> = new Map();
    #webworkerCompilers: Map<IMain, WebworkerCompiler> = new Map();

    mains: Set<IMain> = new Set();

    constructor(public name: string, public fileEndingWithDot: string, public monacoLanguageSelector, protected withWebworker: boolean){

    }

    getCompiler(main: IMain): Compiler {
        return this.#compilers.get(main);
    }

    getRepl(main: IMain): JavaRepl {   // TODO: Base Repl class
        return this.#repls.get(main);
    } 

    triggerCompile(main: IMain, generateExecutable: boolean){
        let comp: WebworkerCompiler = (this.withWebworker && !generateExecutable) ? 
            this.#webworkerCompilers.get(main) : this.#compilers.get(main);
        comp.triggerCompile(() => {
            
        })
    }    

    protected registerCompiler(main: IMain, compiler: Compiler){
        this.#compilers.set(main, compiler);
        this.mains.add(main);
    }
    
    protected registerWebworkerCompiler(main: IMain, webworkercompiler: WebworkerCompiler){
        this.#webworkerCompilers.set(main, webworkercompiler);
        this.mains.add(main);
    }
    
    protected registerRepl(main: IMain, repl: JavaRepl){
        this.#repls.set(main, repl);
        this.mains.add(main);
    }

}