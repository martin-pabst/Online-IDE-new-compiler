import { editor, languages } from "monaco-editor";
import { Quickfix } from "./Quickfix";
import { JavaField } from "../../types/JavaField";
import { ASTClassDefinitionNode, ASTFieldDeclarationNode, ASTMethodDeclarationNode } from "../../parser/AST";
import { JavaCompiledModule } from "../../module/JavaCompiledModule";
import { TokenType } from "../../TokenType";


class GenerateGetterAndSetterQuickfix extends Quickfix {

    constructor(private fieldNode: ASTFieldDeclarationNode, private field: JavaField, private lineToInsert: number, private type: "getter" | "setter" | "both") {
        super({
            startLineNumber: field.identifierRange.startLineNumber,
            startColumn: 0,
            endLineNumber: field.identifierRange.endLineNumber,
            endColumn: field.identifierRange.endColumn
        });
    }

    provideCodeAction(model: editor.ITextModel): languages.CodeAction | undefined {
        let firstLetterUppercaseIdentifier = this.field.identifier[0].toLocaleUpperCase() + this.field.identifier.substring(1);

        let title = "";
        let text = "";
        let getterText = `\n\tpublic ${this.field.type.toString()} get${firstLetterUppercaseIdentifier}(){\n\t\treturn ${this.field.identifier};\n\t}\n`;
        let setterText = `\n\tpublic void set${firstLetterUppercaseIdentifier}(${this.field.type.toString()} ${this.field.identifier}){\n\t\tthis.${this.field.identifier} = ${this.field.identifier};\n\t}\n`;

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

        let edits: languages.IWorkspaceTextEdit[] = [
            {
                resource: model.uri,
                textEdit: {
                    range: { startLineNumber: this.lineToInsert, startColumn: 0, endLineNumber: this.lineToInsert, endColumn: 0 },
                    text: text
                },
                versionId: model.getVersionId()
            }
        ]

        if(this.field.visibility == TokenType.keywordPublic){
            let range = this.fieldNode.type?.range;
            if(range){
                edits.push({
                    resource: model.uri,
                    textEdit: {
                        range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: this.field.identifierRange.startLineNumber, endColumn: range.startColumn },
                        text: "private "
                    },
                    versionId: model.getVersionId()
                })
            }
        }

        return {
            title: title, //this.message,
            diagnostics: [],
            kind: 'quickfix',
            edit: {
                edits: edits
            }
        }


    }



}


export class GenerateGetterAndSetterQuickfixHelper {
    static start(module: JavaCompiledModule) {
        for (let klassNode of module.ast.innerTypes.filter(ast => ast.kind == TokenType.keywordClass && !ast.isMainClass)) {
            klassNode = klassNode as ASTClassDefinitionNode;
            let klass = klassNode.resolvedType;
            if (!klass) continue;
            let methodMap: Map<string, ASTMethodDeclarationNode> = new Map();
            klassNode.methods.forEach(m => methodMap.set(m.identifier, m));
            GenerateGetterAndSetterQuickfixHelper.generateQuickfixesForField(klassNode, methodMap);
        }
    }

    static generateQuickfixesForField(classNode: ASTClassDefinitionNode, methodMap: Map<string, ASTMethodDeclarationNode>): void {

        if (classNode.fieldsOrInstanceInitializers.length == 0) return;

        let lineToInsert = classNode.fieldsOrInstanceInitializers[classNode.fieldsOrInstanceInitializers.length - 1].range.endLineNumber + 1;
        let lastConstructor = methodMap.get(classNode.identifier);
        if (lastConstructor) lineToInsert = Math.max(lineToInsert, lastConstructor.range.endLineNumber + 1);

        for (let fieldNode of classNode.fieldsOrInstanceInitializers.filter(node => node.kind == TokenType.fieldDeclaration)) {
            let field = fieldNode.resolvedField;
            if(!field) continue;
            if (field.identifier == 'class') continue;
            let firstLetterUppercaseIdentifier = field.identifier[0].toLocaleUpperCase() + field.identifier.substring(1);
            let getterNeeded = !methodMap.get("get" + firstLetterUppercaseIdentifier)
            let setterNeeded = !methodMap.get("set" + firstLetterUppercaseIdentifier)

            if (getterNeeded) {
                classNode.module.quickfixes.push(new GenerateGetterAndSetterQuickfix(fieldNode, field, lineToInsert, "getter"));
            }
            if (setterNeeded) {
                classNode.module.quickfixes.push(new GenerateGetterAndSetterQuickfix(fieldNode, field, lineToInsert, "setter"));
            }
            if (getterNeeded && setterNeeded) {
                classNode.module.quickfixes.push(new GenerateGetterAndSetterQuickfix(fieldNode, field, lineToInsert, "both"));
            }
        }


    }

}