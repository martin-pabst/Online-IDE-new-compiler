import { Main } from "../../client/main/Main";
import { openContextMenu } from "../HtmlTools";
import { LanguageManagerMessages } from "./LanguagemanagerMessages";

type Language = {
    id: string,
    name: string,
    iconClass: string
}

export type TranslatedText = () => string;

export var currentLanguageId: string = "de";
export var languages: Language[] = [
    {
        id: 'de',
        name: 'deutsch',
        iconClass: 'img_flag-german'
    }, {
        id: 'en',
        name: "english",
        iconClass: 'img_flag-english'
    }
]

export type ErrormessageWithId = {
    message: string,
    id: string
}

export function lm(map: Record<string, string>): string {
    let template = map[currentLanguageId];
    if(!template){
        for(let lang of languages){
            template = map[lang.id];
            if(template) break;
        }
        if(!template){
            return "Missing template for language " + currentLanguageId;
        }
    }

    return template;
}

export function le(map: Record<string, string>): ErrormessageWithId {
    let template = map[currentLanguageId];
    if(!template){
        for(let lang of languages){
            template = map[lang.id];
            if(template) break;
        }
        if(!template){
            return {
                id: "MissingTemplate",
                message: "Missing template for language " + currentLanguageId
            }
        }
    }

    let id = map["id"] || "no id";

    return {
        message: template,
        id: id
    }
}

export function setLanguageId(lang: string){
    currentLanguageId = lang;
}

export class LanguageManager {

    selectorDivEventListener: (ev: MouseEvent) => void;

    constructor(private main: Main, private rootHtmlElement: HTMLElement){
    }

    setupLanguageSelector(){
        let selectorDivList = this.rootHtmlElement.getElementsByClassName('languageElement');
        if(selectorDivList.length == 0) return;
        let selectorDiv = <HTMLDivElement>selectorDivList.item(0);

        let language: Language = languages.find(lang => lang.id == currentLanguageId);
        selectorDiv.classList.add(language.iconClass);
        
        if(this.selectorDivEventListener){
            selectorDiv.removeEventListener('click', this.selectorDivEventListener);
            this.selectorDivEventListener = undefined;
        }

        selectorDiv.addEventListener('click', 
            this.selectorDivEventListener = (ev) => {
            openContextMenu(languages.filter(la => la.id != currentLanguageId).map(la => {
                return {
                    callback: () => {
                        this.setLanguage(la.id);
                        alert(LanguageManagerMessages.alertMessage());
                    },
                    caption: la.name,
                    iconClass: la.iconClass
                }
            }),
                ev.pageX + 2, ev.pageY + 2
            )
        })

    }

    setLanguage(languageAbbreviation: string | undefined){

        let language = languages[0];
        if(languageAbbreviation){
            language = languages.find(lang => lang.id.toLowerCase() == languageAbbreviation.toLowerCase());
        }

        currentLanguageId = language.id;

        this.setupLanguageSelector();

        if(this.main.user.gui_state.language != language.id){
            this.main.user.gui_state.language = language.id;
            this.main.gui_state_dirty = true;
        }
    }

}