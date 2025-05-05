import { editor } from "monaco-editor";
import { Quickfix } from "./Quickfix.ts";
import * as monaco from 'monaco-editor';

export class ReplaceTokenQuickfix extends Quickfix {

    constructor(private rangeToReplace: monaco.IRange, private replaceBy: string, message: string, markerSeverity: monaco.MarkerSeverity = monaco.MarkerSeverity.Error) {
        super(rangeToReplace);
        this.message = message;
        this.severity = markerSeverity;
    }

    provideCodeAction(model: editor.ITextModel): monaco.languages.CodeAction | undefined {
        return {
            title: this.message,
            diagnostics: [this],
            kind: 'quickfix',
            edit: {
                edits: [
                    {
                        resource: model.uri,
                        textEdit: {
                            range: this.rangeToReplace,
                            text: this.replaceBy
                        },
                        versionId: model.getVersionId()
                    }
                ]
            }
        }


    }

}