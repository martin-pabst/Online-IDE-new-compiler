import { IMain } from "../IMain.ts";
import * as monaco from 'monaco-editor'
import { Language } from "../language/Language.ts";


export class BaseMonacoProvider {

    constructor(public language: Language){

    }

    protected findMainForModel(model: monaco.editor.ITextModel){
        let editor = monaco.editor.getEditors().find(e => e.getModel() == model);
        for(let main of this.language.mains){
            if(main.getMainEditor() == editor || main.getReplEditor() == editor){
                return main;
            }
        }
    }



}