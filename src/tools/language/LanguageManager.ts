import { IMain } from "../../compiler/common/IMain";
import { openContextMenu } from "../HtmlTools";

type Language = {
    id: string,
    name: string,
    iconClass: string
}

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

export class LanguageManager {

    constructor(private main: IMain, private rootHtmlElement: HTMLElement){
        this.setupLanguageSelector();
    }

    setupLanguageSelector(){
        let selectorDivList = this.rootHtmlElement.getElementsByClassName('languageElement');
        if(selectorDivList.length == 0) return;
        let selectorDiv = <HTMLDivElement>selectorDivList.item(0);
        selectorDiv.classList.add('img_flag-german');

        selectorDiv.addEventListener('click', (ev) => {
            openContextMenu(languages.filter(la => la.id != currentLanguageId).map(la => {
                return {
                    callback: () => {},
                    caption: la.name,
                    iconClass: la.iconClass
                }
            }),
                ev.pageX + 2, ev.pageY + 2
            )
        })

    }

    setLanguage(languageAbbreviation: string){
        currentLanguageId = languageAbbreviation;

    }



}