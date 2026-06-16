import { JavaLanguage } from "../../java/JavaLanguage";
import { IMain } from "../IMain";
import { ProgrammingLanguage } from "./ProgrammingLanguage";
import { ErrorMarker } from "../monacoproviders/ErrorMarker";
import { ByAssemblyLanguage } from "../../assembly/byassembly/ByAssemblyLanguage";
import { ProgrammingLanguageData } from "./ProgrammingLanguageData";

export class ProgrammingLanguageManager {
    private languages: ProgrammingLanguage[] = [];
    private static instance: ProgrammingLanguageManager;

    private constructor(){
        ProgrammingLanguageManager.instance = this;
        this.languages.push(JavaLanguage.getInstance());
        this.languages.push(ByAssemblyLanguage.getInstance());
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

    public getLanguagesSelection(main: IMain): ProgrammingLanguage[] {
        let settings = main.getSettings();
        let languages: ProgrammingLanguage[] = [
            this.getLanguageByName(ProgrammingLanguageData.Java.name)
        ];
        if(settings.getValue("programmingLanguages.ByAssembly.enabled") == "yes"){
            languages.push(this.getLanguageByName(ProgrammingLanguageData.ByAssembly.name));
        }
        return languages;
    }

}
