import { editor, languages } from "monaco-editor";
import { Quickfix } from "./Quickfix.ts";
import * as monaco from 'monaco-editor';
import { IJavaClass, JavaClass } from "../../types/JavaClass.ts";
import { JavaMethod } from "../../types/JavaMethod.ts";
import { IJavaInterface } from "../../types/JavaInterface.ts";
import { Error } from "../../../common/Error.ts";


export class ImplementInterfaceOrAbstractClassQuickfix extends Quickfix {

    constructor(private klass: JavaClass, private notImplementedMethods: JavaMethod[], private javaInterfaceOrAbstractClass: IJavaInterface | IJavaClass, error: Error) {
        super(klass.identifierRange, error);
    }
    
    provideCodeAction(model: editor.ITextModel): monaco.languages.CodeAction | undefined {
        let message = this.javaInterfaceOrAbstractClass instanceof IJavaInterface ?
            "Nicht-implementierte Methoden des Interfaces " + this.javaInterfaceOrAbstractClass.identifier + " ergänzen" :
            "Nicht-implementierte Methoden der abstrakten Klasse " + this.javaInterfaceOrAbstractClass.identifier + " ergänzen";

        let klassRange = this.klass.range;
        if(!klassRange) return;

        return {
            title: message,
            diagnostics: [],
            kind: 'quickfix',
            edit: {
                edits: [
                    {
                        resource: model.uri,
                        textEdit: {
                            range: {startLineNumber: klassRange.endLineNumber, startColumn: 0, endLineNumber: klassRange.endLineNumber, endColumn: 0},
                            text: this.notImplementedMethods.map(m => "\t" + m.getDeclaration() + "{\n\t\t//TODO!\n\t}\n").join("\n")
                        },
                        versionId: model.getVersionId()
                    }
                ]
            }
        }


    }

}