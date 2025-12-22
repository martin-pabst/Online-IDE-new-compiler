import { SymbolTable } from "typescript";
import { BaseStackframe, BaseSymbol, BaseSymbolTable, SymbolOnStackframe as SymbolOnStack, SymbolOnStackframe } from "../../common/BaseSymbolTable";
import { IRange } from "../../common/range/Range";
import { TokenType } from "../TokenType.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaClass } from "../types/JavaClass";
import { JavaEnum } from "../types/JavaEnum";
import { JavaField } from "../types/JavaField.ts";
import { JavaInterface } from "../types/JavaInterface.ts";
import { JavaMethod } from "../types/JavaMethod.ts";
import { JavaParameter } from "../types/JavaParameter.ts";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType.ts";
import { Visibility } from "../types/Visibility.ts";
import { JavaLocalVariable } from "./JavaLocalVariable";
import * as monaco from 'monaco-editor'


export type LocalVariableInformation = {
    symbol: JavaLocalVariable | JavaField,
    outerClassLevel: number,
    symbolTable: BaseSymbolTable | null
}


export class JavaSymbolTable extends BaseSymbolTable {

    declare childTables: JavaSymbolTable[];

    declare parent?: JavaSymbolTable;

    declare identifierToSymbolMap: Map<string, JavaLocalVariable>;

    constructor(public module: JavaCompiledModule, range: IRange, withStackFrame: boolean,
        parent?: BaseSymbolTable,
        public classContext?: JavaClass | JavaEnum | JavaInterface | StaticNonPrimitiveType | undefined,
        public methodContext?: JavaMethod) {

        super(range, parent);

        if (parent) {
            if (!classContext) this.classContext = (<JavaSymbolTable>parent).classContext;
            if (!methodContext) this.methodContext = (<JavaSymbolTable>parent).methodContext;
        }

        if (!parent) {
            module.symbolTables.push(this);
        }

        if (withStackFrame) {
            // inside non-static java-methods: 1st element on stack is this
            this.stackframe = new BaseStackframe(classContext ? 1 : 0);
        }
    }

    getSymbolsOnStackframeForDebugger(): SymbolOnStackframe[] {
        let symbols: SymbolOnStackframe[] = [];
        this.identifierToSymbolMap.forEach((symbol, identifier) => { symbols.push(symbol) });
        if (this.classContext && this.classContext != this.parent?.classContext && !(this.classContext instanceof StaticNonPrimitiveType)) {
            let thisVariable = new JavaLocalVariable("this", this.classContext.identifierRange,
                this.classContext, this);
            thisVariable.stackframePosition = 0;
            symbols.push(thisVariable);
        }

        return symbols;
    }


    findSymbolButNotInParentScopes(identifier: string): JavaLocalVariable | undefined {
        return this.identifierToSymbolMap.get(identifier);
    }

    findSymbol(identifier: string): LocalVariableInformation | undefined {
        return this.findSymbolIntern(identifier, TokenType.keywordPrivate, true, 0);
    }

    private findSymbolIntern(identifier: string, upToVisibility: Visibility, searchForFields: boolean, outerClassLevel: number): LocalVariableInformation | undefined {
        // local variable?
        let symbol = this.identifierToSymbolMap.get(identifier);
        if (symbol) return {
            symbol: symbol,
            outerClassLevel: outerClassLevel,
            symbolTable: this
        }

        // parameter?
        // Topmost Symbol table inside method has parameters...
        let methodContext = this.methodContext;
        if (methodContext != null) {
            let parent: JavaSymbolTable | undefined = this.parent;
            while (parent && parent.methodContext == methodContext) {
                symbol = parent.identifierToSymbolMap.get(identifier);
                if (symbol) {
                    return {
                        symbol: symbol,
                        outerClassLevel: outerClassLevel,
                        symbolTable: parent
                    }
                }
                parent = parent.parent;
            }
        }

        if (this.classContext && searchForFields) {
            let field = this.classContext.getField(identifier, TokenType.keywordPrivate);
            if (field) {
                return {
                    symbol: field,
                    outerClassLevel: outerClassLevel,
                    symbolTable: null
                }
            }

        }

        if (this.parent) {
            if (this.parent.classContext == this.classContext) {
                return this.parent.findSymbolIntern(identifier, upToVisibility, false, outerClassLevel);
            } else {
                return this.parent.findSymbolIntern(identifier, TokenType.keywordProtected, true, outerClassLevel + 1);
            }
        }

        return undefined;
    }

    public addSymbol(symbol: BaseSymbol): void {
        super.addSymbol(symbol);
        if (symbol instanceof SymbolOnStack) {
            this.getStackFrame()?.addSymbol(symbol, symbol instanceof JavaParameter ? "parameter" : "localVariable");
        }
    }

    public addSymbolWithoutAddingToStackframe(symbol: BaseSymbol) {
        super.addSymbol(symbol);
    }

    public insertInvisibleParameter() {
        this.getStackFrame()?.insertInvisibleParameter();
    }

    getStackFrame(): BaseStackframe | undefined {
        let st: JavaSymbolTable = this;
        while (!st.stackframe && st.parent) {
            st = st.parent;
        }
        return st.stackframe;
    }

    getLocalVariableCompletionItems(rangeToReplace: monaco.IRange): monaco.languages.CompletionItem[] {
        let items: monaco.languages.CompletionItem[] = [];
        this.identifierToSymbolMap.forEach((symbol, identifier) => {
            items.push({
                label: symbol.identifier,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: symbol.getDeclaration(),
                insertText: symbol.identifier,
                filterText: symbol.identifier,
                range: rangeToReplace
            })

            if (symbol.type["dimension"] !== undefined) {
                let dimension: number = symbol.type["dimension"];
                items.push({
                    label: symbol.identifier + "[]".repeat(dimension),
                    kind: monaco.languages.CompletionItemKind.Variable,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: symbol.getDeclaration(),
                    insertText: symbol.identifier + this.getArraySnippetEnding(dimension),
                    filterText: symbol.identifier,
                    range: rangeToReplace
                })
            }
        })

        if (this.parent) {
            let newItems = this.parent.getLocalVariableCompletionItems(rangeToReplace).filter(newItem => items.findIndex(item => item.insertText == newItem.insertText) == -1);
            items = items.concat(newItems);
        }

        return items;
    }

    getArraySnippetEnding(dimension: number): string {
        let snippetEnding: string = ""; 
        for (let i = 0; i < dimension; i++) {
            snippetEnding += "[$" + (i + 1) + "]";
        }
        return snippetEnding + "$0";
    }

}



