import { editor, languages } from "monaco-editor";
import { Quickfix } from "./Quickfix";
import { JavaField } from "../../types/JavaField";
import { ASTClassDefinitionNode, ASTMethodDeclarationNode } from "../../parser/AST";


class GenerateGetterAndSetterQuickfix extends Quickfix {

    constructor(private field: JavaField, private lineToInsert: number, private type: "getter" | "setter" | "both") {
        super(field.identifierRange);
        this.severity = undefined;
        this.message = "";
    }

    provideCodeAction(model: editor.ITextModel): languages.CodeAction | undefined {
        let firstLetterUppercaseIdentifier = this.field.identifier[0].toLocaleUpperCase() + this.field.identifier.substring(1);

        let title = "";
        let text = "";
        let getterText = `\n\t${this.field.type.toString()} get${firstLetterUppercaseIdentifier}(){\n\t\treturn ${this.field.identifier};\n\t}\n`;
        let setterText = `\n\tvoid set${firstLetterUppercaseIdentifier}(${this.field.type.toString()} ${this.field.identifier}){\n\t\tthis.${this.field.identifier} = ${this.field.identifier};\n\t}\n`;

        switch (this.type) {
            case "getter":
                title = "Getter-Methode für " + this.field.identifier + " ergänzen";
                text = getterText;
                break;
            case "setter": 
                title = "Setter-Methode für " + this.field.identifier + " ergänzen";
                text = setterText;
                break;
            case "both": 
                title = "Getter- und Setter-Methode für " + this.field.identifier + " ergänzen";
                text = getterText + setterText;
                break;
        }


        return {
            title: title, //this.message,
            diagnostics: [this],
            kind: 'quickfix',
            edit: {
                edits: [
                    {
                        resource: model.uri,
                        textEdit: {
                            range: { startLineNumber: this.lineToInsert, startColumn: 0, endLineNumber: this.lineToInsert, endColumn: 0 },
                            text: text
                        },
                        versionId: model.getVersionId()
                    }
                ]
            }
        }


    }



}


export class GenerateGetterAndSetterQuickfixHelper {


    static start(fields: JavaField[], classNode: ASTClassDefinitionNode): void {
        let methodMap: Map<string, ASTMethodDeclarationNode> = new Map();

        if (classNode.fieldsOrInstanceInitializers.length == 0) return;

        classNode.methods.forEach(m => methodMap.set(m.identifier, m));

        let lineToInsert = classNode.fieldsOrInstanceInitializers[classNode.fieldsOrInstanceInitializers.length - 1].range.endLineNumber + 1;
        let lastConstructor = methodMap.get(classNode.identifier);
        if (lastConstructor) lineToInsert = Math.max(lineToInsert, lastConstructor.range.endLineNumber + 1);

        for (let field of fields) {
            if (field.identifier == 'class') continue;
            let firstLetterUppercaseIdentifier = field.identifier[0].toLocaleUpperCase() + field.identifier.substring(1);
            let getterNeeded = !methodMap.get("get" + firstLetterUppercaseIdentifier)
            let setterNeeded = !methodMap.get("set" + firstLetterUppercaseIdentifier)

            if (getterNeeded) {
                classNode.module.quickfixes.push(new GenerateGetterAndSetterQuickfix(field, lineToInsert, "getter"));
            }
            if (setterNeeded) {
                classNode.module.quickfixes.push(new GenerateGetterAndSetterQuickfix(field, lineToInsert, "setter"));
            }
            if (getterNeeded && setterNeeded) {
                classNode.module.quickfixes.push(new GenerateGetterAndSetterQuickfix(field, lineToInsert, "both"));
            }
        }


    }

}