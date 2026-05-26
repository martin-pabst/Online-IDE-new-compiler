import { Settings } from "../../../client/settings/Settings";
import { Compiler } from "../Compiler";
import { Debugger } from "../debugger/Debugger";
import { IMain } from "../IMain";
import { ErrorMarker } from "../monacoproviders/ErrorMarker";
import { Repl } from "../repl/Repl";
import { LibraryManager } from "./LibraryManager";

export abstract class ProgrammingLanguage {

    #compilers: Map<IMain, Compiler> = new Map();
    #repls: Map<IMain, Repl> = new Map();
    #settings: Map<IMain, Settings> = new Map();

    mains: Set<IMain> = new Set();

    constructor(public name: string, public fileEndingWithOutDot: string, public monacoLanguageSelector: string){

    }

    getCompiler(main: IMain): Compiler {
        return this.#compilers.get(main);
    }

    getRepl(main: IMain): Repl {   // TODO: Base Repl class
        return this.#repls.get(main);
    } 
    
    getSettings(main: IMain): Settings {
        return this.#settings.get(main);
    }

    protected registerCompiler(main: IMain, compiler: Compiler){
        this.#compilers.set(main, compiler);
        this.mains.add(main);
    }
    
    protected registerRepl(main: IMain, repl: Repl){
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

    /**
     * This is a bad solution, but returning a Debugger object lead to circular dependencies. 
     * So instead, the Main creates the Debugger and the ProgrammingLanguage only returns the type of the Debugger.
     */
    public abstract getDebuggerType(): "java" | "assembler";
}   