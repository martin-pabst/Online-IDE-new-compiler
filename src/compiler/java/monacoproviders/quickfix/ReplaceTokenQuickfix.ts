import { editor } from "monaco-editor";
import { Quickfix } from "./Quickfix.ts";
import * as monaco from 'monaco-editor';

export class ReplaceTokenQuickfix extends Quickfix {

    constructor(private rangeToReplace: monaco.IRange, private replaceBy: string, message: string) {
        super(rangeToReplace);
        this.message = message;
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