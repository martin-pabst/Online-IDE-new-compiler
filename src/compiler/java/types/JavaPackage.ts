import type { IRange } from "monaco-editor";
import { JavaType } from "./JavaType";
import type { JavaBaseModule } from "../module/JavaBaseModule";
import type { GenericTypeParameter } from "./GenericTypeParameter";
import * as monaco from 'monaco-editor'
import type { TokenType } from "../TokenType";
import { NonPrimitiveType } from "./NonPrimitiveType";

export class JavaPackage extends JavaType {

    childrenList: JavaType[] = [];
    childrenMap: Map<string, JavaType> = new Map();

    constructor(identifier: string, identifierRange: IRange, module: JavaBaseModule, public basePackage: JavaPackage | undefined) {
        super(identifier, identifierRange, module);
        if (basePackage) {
            basePackage.childrenList.push(this);
            basePackage.childrenMap.set(identifier, this);
        }
    }

    getCopyWithConcreteType(typeMap: Map<GenericTypeParameter, JavaType>): JavaType {
        return this;
    }

    getDefaultValue() {
    }

    toString(): string {
        let name = "";
        if (this.basePackage) {
            name = this.basePackage.toString() + ".";
        }
        return name + this.identifier;
    }

    getAbsoluteName(): string {
        return this.toString();
    }

    getCompletionItemDetail(): string {
        return "package " + this.getAbsoluteName();
    }

    getDeclaration(): string {
        return "package " + this.getAbsoluteName() + ";";
    }

    getChildTypeByIdentifier(identifier: string): JavaType | undefined {
        return this.childrenMap.get(identifier);
    }

    getPath(): string[] {
        if(this.basePackage){
            return [...this.basePackage.getPath(), this.identifier];
        } else return [this.identifier];
    }

    getCompletionItems(visibility: TokenType, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string, rangeToReplace: IRange, typeMap: Map<GenericTypeParameter, JavaType> | undefined): monaco.languages.CompletionItem[] {
        let items: monaco.languages.CompletionItem[] = [];

        for (let child of this.childrenList) {
            if (child instanceof JavaPackage) {
                items.push({
                    label: child.identifier,
                    kind: monaco.languages.CompletionItemKind.Module,
                    detail: child.getCompletionItemDetail(),
                    insertText: child.identifier,
                    documentation: child.getDocumentation(),
                    range: rangeToReplace
                });
            } else if (child instanceof NonPrimitiveType) {
                items.push({
                    label: child.identifier,
                    kind: monaco.languages.CompletionItemKind.Class,
                    detail: child.getCompletionItemDetail(),
                    insertText: child.identifier,
                    documentation: child.getDocumentation(),
                    range: rangeToReplace
                });
            }
        }

        return items;
    }


}