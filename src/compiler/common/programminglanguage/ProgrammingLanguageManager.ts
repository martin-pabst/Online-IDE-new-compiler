import { JavaLanguage } from "../../java/JavaLanguage";
import { IMain } from "../IMain";
import { ProgrammingLanguage } from "./ProgrammingLanguage";
import { ErrorMarker } from "../monacoproviders/ErrorMarker";
import { AssemblyLanguage } from "../../assembly/AssemblyLanguage";

export class ProgrammingLanguageManager {
    private languages: ProgrammingLanguage[] = [];
    private static instance: ProgrammingLanguageManager;

    private constructor(){
        ProgrammingLanguageManager.instance = this;
        this.languages.push(JavaLanguage.getInstance());
        this.languages.push(AssemblyLanguage.getInstance());
    }

    public static getInstance(): ProgrammingLanguageManager {
        if(!ProgrammingLanguageManager.instance) new ProgrammingLanguageManager();
        return ProgrammingLanguageManager.instance;
    }

    public registerMain(main: IMain, errorMarker: ErrorMarker){
        for(let language of this.languages){
            language.registerMain(main, errorMarker);
        }
    }

    getLanguages(): ProgrammingLanguage[] {
        return this.languages;
    }

    getLanguageByName(name: string): ProgrammingLanguage {
        for(let language of this.languages){
            if(language.name == name) return language;
        }
        if(typeof name !== 'undefined') {
            console.error("No language found with name " + name);
        }
        return JavaLanguage.getInstance();
    }

}
