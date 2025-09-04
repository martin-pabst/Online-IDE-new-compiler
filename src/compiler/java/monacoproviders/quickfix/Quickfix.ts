import * as monaco from 'monaco-editor';


export abstract class Quickfix implements monaco.editor.IMarkerData {
    code?: string | { value: string; target: monaco.Uri; };
    severity: monaco.MarkerSeverity = monaco.MarkerSeverity.Error;
    message: string;
    source?: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    modelVersionId?: number;
    relatedInformation?: monaco.editor.IRelatedInformation[];
    tags?: monaco.MarkerTag[];

    abstract provideCodeAction(model: monaco.editor.ITextModel): monaco.languages.CodeAction | undefined;

    constructor(range: monaco.IRange){
        Object.assign(this, range);
    }

}