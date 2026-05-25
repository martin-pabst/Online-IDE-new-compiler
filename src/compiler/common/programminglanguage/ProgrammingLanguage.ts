import { Settings } from "../../../client/settings/Settings";
import { JavaRepl } from "../../java/parser/repl/JavaRepl";
import { Compiler } from "../Compiler";
import { IMain } from "../IMain";
import { ErrorMarker } from "../monacoproviders/ErrorMarker";
import { LibraryManager } from "./LibraryManager";

export abstract class ProgrammingLanguage {

    #compilers: Map<IMain, Compiler> = new Map();
    #repls: Map<IMain, JavaRepl> = new Map();
    #settings: Map<IMain, Settings> = new Map();

    mains: Set<IMain> = new Set();

    constructor(public name: string, public fileEndingWithOutDot: string, public monacoLanguageSelector: string){

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

    public abstract registerMain(main: IMain, errorMarker: ErrorMarker);

    public abstract enable(main: IMain);

    public abstract disable(main: IMain);
    
    public abstract beforeWorkspaceChange(main: IMain);

    public abstract getLibraryManager(): LibraryManager;
}   