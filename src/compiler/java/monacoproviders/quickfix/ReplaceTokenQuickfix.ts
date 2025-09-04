import { editor } from "monaco-editor";
import { Quickfix } from "./Quickfix.ts";
import * as monaco from 'monaco-editor';
import { Error } from "../../../common/Error.ts";

export class ReplaceTokenQuickfix extends Quickfix {

    constructor(private rangeToReplace: monaco.IRange, private replaceBy: string, private message: string, error?: Error, public displayRange?: monaco.IRange) {
        super(displayRange ?? rangeToReplace, error);
    }

    provideCodeAction(model: editor.ITextModel): monaco.languages.CodeAction | undefined {
        return {
            title: this.message,
            diagnostics: [],
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