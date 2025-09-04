import * as monaco from 'monaco-editor';
import { Error } from '../../../common/Error';


export abstract class Quickfix {

    abstract provideCodeAction(model: monaco.editor.ITextModel): monaco.languages.CodeAction | undefined;

    constructor(public range: monaco.IRange, public error?: Error){
        
    }

}