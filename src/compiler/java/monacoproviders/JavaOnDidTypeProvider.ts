import { IPosition } from "../../common/range/Position";
import * as monaco from 'monaco-editor'


export class JavaOnDidTypeProvider {
    static configureEditor(editor: monaco.editor.IStandaloneCodeEditor) {
        //@ts-ignore
        editor.onDidType((text: string) => {

            if(editor.getModel()?.getLanguageId() != 'myJava') return;

            const insertTextAndSetCursor = (pos:IPosition, insertText: string, newLine: number, newColumn: number) => {
                const range = new monaco.Range(
                    pos.lineNumber,
                    pos.column,
                    pos.lineNumber,
                    pos.column
                );
                editor.executeEdits("new-bullets", [
                    { range, text: insertText }
                ]);

                // Set position after bulletText
                editor.setPosition({
                    lineNumber: newLine,
                    column: newColumn
                });
            };

            if (text === "\n") {
                const model = editor.getModel()!;
                const position = editor.getPosition()!;
                const prevLine = model.getLineContent(position.lineNumber - 1);
                if (prevLine.trim().indexOf("/*") === 0 && !prevLine.trimEnd().endsWith("*/")) {
                    const nextLine = position.lineNumber < model.getLineCount() ? model.getLineContent(position.lineNumber + 1) : "";
                    if(!nextLine.trim().startsWith("*")){
                        let spacesAtBeginningOfLine: string = prevLine.substr(0, prevLine.length - prevLine.trimLeft().length);
                        if (prevLine.trim().indexOf("/**") === 0) {
                            insertTextAndSetCursor(position, "\n" + spacesAtBeginningOfLine + " */", position.lineNumber, position.column + 3 + spacesAtBeginningOfLine.length);
                        } else {
                            insertTextAndSetCursor(position, " * \n" + spacesAtBeginningOfLine + " */", position.lineNumber, position.column + 3 + spacesAtBeginningOfLine.length);
                        }
                    }
                }
            } 
            // else if(text == '"'){    // && this.currentlyEditedModuleIsJava()) {
            //     //a: x| -> x"|"
            //     //d: "|x -> ""|x
            //     //c: "|" -> """\n|\n"""
            //     const model = editor.getModel()!;
            //     const position = editor.getPosition()!;
            //     const selection = editor.getSelection()!;

            //     const isSelected = selection.startColumn != selection.endColumn || selection.startLineNumber != selection.endLineNumber;

            //     const line = model.getLineContent(position.lineNumber);
            //     let doInsert: boolean = true;
            //     let charBefore1: string = "x";
            //     if (position.column > 3) {
            //         charBefore1 = line.charAt(position.column - 3);
            //     }
            //     let charAfter: string = "x";
            //     if (position.column - 1 < line.length) {
            //         charAfter = line.charAt(position.column - 1);
            //     }

            //     if (!isSelected) {
            //         if (charBefore1 != '"' && charAfter != '"') {
            //             insertTextAndSetCursor(position, '"', position.lineNumber, position.column);
            //         }
            //         else if (charAfter == '"') {
            //             let pos1 = { ...position, column: position.column + 1 };
            //             // insertTextAndSetCursor(pos1, '', position.lineNumber, position.column + 1);
            //             const range = new monaco.Range(
            //                 pos1.lineNumber,
            //                 pos1.column - 1,
            //                 pos1.lineNumber,
            //                 pos1.column + 2
            //             );
            //             editor.executeEdits("new-bullets", [
            //                 { range, text: '' }
            //             ]);

            //         }
            //     }


            // }

         });
    }
}