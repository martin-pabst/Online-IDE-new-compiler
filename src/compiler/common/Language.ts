import { Settings } from "../../client/settings/Settings";
import { JavaRepl } from "../java/parser/repl/JavaRepl";
import { Compiler } from "./Compiler";
import { IMain } from "./IMain";

export abstract class Language {

    #compilers: Map<IMain, Compiler> = new Map();
    #repls: Map<IMain, JavaRepl> = new Map();
    #settings: Map<IMain, Settings> = new Map();

    mains: Set<IMain> = new Set();

    constructor(public name: string, public fileEndingWithDot: string, public monacoLanguageSelector){

    }

    getCompiler(main: IMain): Compiler {
        return this.#compilers.get(main);
    }

    getRepl(main: IMain): JavaRepl {   // TODO: Base Repl class
        return this.#repls.get(main);
    } 
    
    getSettings(main: IMain): Settings {
        return this.#settings.get(main);
    }

    protected registerCompiler(main: IMain, compiler: Compiler){
        this.#compilers.set(main, compiler);
        this.mains.add(main);
    }
    
    protected registerRepl(main: IMain, repl: JavaRepl){
        this.#repls.set(main, repl);
        this.mains.add(main);
    }

    protected registerSettings(main: IMain, settings: Settings) {
        this.#settings.set(main, settings);
        this.mains.add(main);
    }
}