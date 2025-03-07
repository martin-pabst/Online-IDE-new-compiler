import { IMain } from "../../common/IMain.ts";
import { MonacoConstants } from "../../common/monacoproviders/MonacoConstants.ts";
import { IRange, Range } from "../../common/range/Range";
import { JavaCompiler } from "../JavaCompiler.ts";
import { JavaLanguage } from "../JavaLanguage.ts";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { JavaSymbolTable } from "../codegenerator/JavaSymbolTable";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { JavaArrayType } from "../types/JavaArrayType";
import { IJavaClass, JavaClass } from "../types/JavaClass";
import { JavaEnum } from "../types/JavaEnum.ts";
import { IJavaInterface } from "../types/JavaInterface";
import { JavaMethod } from "../types/JavaMethod";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import { getVisibilityUpTo } from "../types/VisibilityTools";
import { MonacoProviderLanguage } from "./MonacoProviderLanguage.ts";
import * as monaco from 'monaco-editor'


export class JavaCompletionItemProvider implements monaco.languages.CompletionItemProvider {

    isConsole: boolean = false;

    public triggerCharacters: string[] = ['.', 'abcdefghijklmnopqrstuvwxyzäöüß_ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ', ' '];

    constructor(languageSelector: string) {
        monaco.languages.registerCompletionItemProvider(languageSelector, this);
    }

    first: boolean = true;
    async provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.CompletionContext,
        token: monaco.CancellationToken): Promise<monaco.languages.CompletionList> {

        let main = JavaLanguage.findMainForModel(model);
        if (!main) return;

        let module: JavaCompiledModule;

        let onlineIDEConsole = main.getBottomDiv()?.console;
        if (onlineIDEConsole?.editor?.getModel() == model) {
            onlineIDEConsole.compile();
            module = main.getRepl().getCurrentModule();
        } else {
            module = <JavaCompiledModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
            if (module?.isMoreThanOneVersionAheadOfLastCompilation()) {
                await main.getCompiler().interruptAndStartOverAgain(true);
                module = <JavaCompiledModule>main.getCurrentWorkspace()?.getModuleForMonacoModel(model);
            }
        }

        if (module == null) {
            return null;
        }


        let symbolTable = module.findSymbolTableAtPosition(position);
        let classContext = symbolTable == null ? undefined : symbolTable.classContext;


        let zeroLengthRange: IRange = Range.fromPositions(position);

        if (this.isStringLiteral(module, position)) return null;

        let textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
        let textAfterPosition = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber + 5, endColumn: 1 });

        let newMatch = textUntilPosition.match(/.*(new )([\wöäüÖÄÜß]*)$/);
        if (newMatch != null) {
            let rangeToReplace: IRange = zeroLengthRange;
            if (newMatch[2]?.length > 0) {
                rangeToReplace = {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column - newMatch[2].length,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                }
            }
            return this.getCompletionItemsAfterNew(main, classContext instanceof NonPrimitiveType ? classContext : undefined, rangeToReplace);
        }

        if (context.triggerCharacter == " ") {
            let classMatch = textUntilPosition.match(/.*(class )[\wöäüÖÄÜß<> ,]*[\wöäüÖÄÜß<> ] $/);
            if (classMatch != null) {

                let classIndex = textUntilPosition.lastIndexOf('class');
                let countLower = 0;
                let countGreater = 0;
                for (let i = classIndex; i < textUntilPosition.length; i++) {
                    let c = textUntilPosition.charAt(i);
                    switch (c) {
                        case '<': countLower++; break;
                        case '>': countGreater++; break;
                    }
                }

                return this.getCompletionItemsAfterClass(module, countLower > countGreater, textAfterPosition, zeroLengthRange);
            }
            return null;
        }

        // Cursor inside identifier, optionally followed by left bracket?
        let ibMatch = textAfterPosition.match(/^([\wöäüÖÄÜß]*\(?)/);
        let identifierAndBracketAfterCursor = "";
        if (ibMatch != null && ibMatch.length > 0) {
            identifierAndBracketAfterCursor = ibMatch[0];
        }

        let leftBracketAlreadyThere = identifierAndBracketAfterCursor.endsWith("(");

        // First guess:  dot followed by part of Identifier?
        let dotMatch = textUntilPosition.match(/.*(\.)([\wöäüÖÄÜß]*)$/);

        // let symbolTable = this.isConsole ? this.main.getDebugger().lastSymboltable : module.findSymbolTableAtPosition(position.lineNumber, position.column);

        if (dotMatch != null) {

            symbolTable = module.findSymbolTableAtPosition(position);
            classContext = symbolTable == null ? undefined : symbolTable.classContext;
            return this.getCompletionItemsAfterDot(dotMatch, position, module, main,
                identifierAndBracketAfterCursor, classContext, leftBracketAlreadyThere);
        }

        // inside variable or class identifier?
        let varOrClassMatch = textUntilPosition.match(/.*[^\wöäüÖÄÜß]([\wöäüÖÄÜß]*)$/);

        if (varOrClassMatch == null) {
            varOrClassMatch = textUntilPosition.match(/^([\wöäüÖÄÜß]*)$/);
        }

        if (varOrClassMatch != null) {


            return this.getCompletionItemsInsideIdentifier(main, varOrClassMatch, position, module,
                identifierAndBracketAfterCursor, classContext, leftBracketAlreadyThere, symbolTable);

        }


    }

    isStringLiteral(module: JavaCompiledModule, position: monaco.Position) {

        let tokenList = module.tokens;
        if (tokenList == null || tokenList.length == 0) return false;

        let posMin = 0;
        let posMax = tokenList.length - 1;
        let pos: number = 0;

        let watchDog = 1000;

        while (true) {
            let posOld = pos;
            pos = Math.round((posMax + posMin) / 2);

            if (posOld == pos) return false;

            watchDog--;
            if (watchDog == 0) return false;

            let t = tokenList[pos];
            let p = t.range;

            if (position.lineNumber > p.endLineNumber || position.lineNumber == p.endLineNumber && position.column > p.endColumn) {
                posMin = pos;
                continue;
            }

            if (position.lineNumber < p.startLineNumber || position.lineNumber == p.startLineNumber && position.column < p.startColumn) {
                posMax = pos;
                continue;
            }

            return t.tt == TokenType.stringLiteral;

        }

    }

    getCompletionItemsAfterNew(main: IMain, classContext: NonPrimitiveType | undefined, range: IRange): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        let completionItems: monaco.languages.CompletionItem[] = [];

        let compiler = <JavaCompiler>main.getCompiler();

        completionItems = completionItems.concat(compiler.libraryModuleManager.typestore.getTypeCompletionItems(classContext, range, true, false));
        completionItems = completionItems.concat(compiler.moduleManager.typestore.getTypeCompletionItems(classContext, range, true, false));

        this.upvoteItemsWithSameFirstCharacterCasing(completionItems, "A");

        return Promise.resolve({
            suggestions: completionItems
        });
    }

    getCompletionItemsAfterClass(module: JavaCompiledModule, insideGenericParameterDefinition: boolean, textAfterPosition: string, range: IRange): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        let completionItems: monaco.languages.CompletionItem[] = [];

        let startsWithCurlyBrace: boolean = textAfterPosition.trimLeft().startsWith("{");

        completionItems = completionItems.concat([
            {
                label: "extends",
                insertText: "extends $1" + (insideGenericParameterDefinition || startsWithCurlyBrace ? "" : " {\n\t$0\n}"),
                detail: "extends",
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Snippet,
                range: range,
                command: {
                    id: "editor.action.triggerSuggest",
                    title: '123',
                    arguments: []
                }
            },
            {
                label: "implements",
                insertText: "implements $1" + (insideGenericParameterDefinition || startsWithCurlyBrace ? "" : " {\n\t$0\n}"),
                detail: "implements",
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Snippet,
                range: range,
                command: {
                    id: "editor.action.triggerSuggest",
                    title: '123',
                    arguments: []
                }
            },
            {
                label: "{}",
                insertText: "{\n\t$0\n}",
                detail: "empty block",
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Snippet,
                range: range
            },
        ]);

        // completionItems = completionItems.concat(this.main.getCurrentWorkspace().moduleStore.getTypeCompletionItems(module, undefined));

        return Promise.resolve({
            suggestions: completionItems
        });
    }

    getCompletionItemsInsideIdentifier(main: IMain, varOrClassMatch: RegExpMatchArray, position: monaco.Position, module: JavaCompiledModule, identifierAndBracketAfterCursor: string,
        classContext: NonPrimitiveType | StaticNonPrimitiveType | undefined,
        leftBracketAlreadyThere: boolean, symbolTable: JavaSymbolTable | undefined): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

        if (!symbolTable) {
            return Promise.resolve({
                suggestions: []
            });
        }

        let text = varOrClassMatch[1];

        let rangeToReplace: monaco.IRange =
        {
            startLineNumber: position.lineNumber, startColumn: position.column - text.length,
            endLineNumber: position.lineNumber, endColumn: position.column + identifierAndBracketAfterCursor.length
        }

        let completionItems: monaco.languages.CompletionItem[] = [];

        if (symbolTable.classContext && !symbolTable.methodContext && (symbolTable.classContext instanceof IJavaClass || symbolTable.classContext instanceof JavaEnum)) {
            let range = symbolTable.range;
            if (range.startLineNumber < range.endLineNumber) {
                completionItems = completionItems.concat(this.getOverridableMethodsCompletion(symbolTable.classContext, rangeToReplace));
                completionItems = completionItems.concat(this.getConstructorCompletion(symbolTable.classContext, rangeToReplace));

                if (varOrClassMatch[1]?.startsWith('g')) {
                    completionItems = completionItems.concat(this.getGetter(symbolTable.classContext, rangeToReplace, 'get'));
                    completionItems = completionItems.concat(this.getGetter(symbolTable.classContext, rangeToReplace, 'gib'));
                } else
                if (varOrClassMatch[1]?.startsWith('s')) {
                    completionItems = completionItems.concat(this.getSetter(symbolTable.classContext, rangeToReplace, 'set'));
                    completionItems = completionItems.concat(this.getSetter(symbolTable.classContext, rangeToReplace, 'setze'));
                } 
            }
        }

        if (symbolTable != null) {
            completionItems = completionItems.concat(symbolTable.getLocalVariableCompletionItems(rangeToReplace).map(ci => {
                ci.sortText = "aaa" + ci.label;
                return ci;
            }));
        }

        let compiler = <JavaCompiler>main.getCompiler();

        completionItems = completionItems.concat(compiler.libraryModuleManager.getTypeCompletionItems(rangeToReplace));
        completionItems = completionItems.concat(compiler.moduleManager.getTypeCompletionItems(module, rangeToReplace, classContext));

        let methodContext = symbolTable?.methodContext;
        if (methodContext != null) {

            if (methodContext.isMainMethod()) {
                completionItems = completionItems.filter(item => item.filterText != 'args');
            }

            completionItems = completionItems.concat(this.getAssertMethods(methodContext, rangeToReplace));

            if (classContext != null) {
                // don't show class completion items (methods, fields) in main class
                let fieldsAndMethods = classContext.getCompletionItems(TokenType.keywordPrivate, leftBracketAlreadyThere,
                    identifierAndBracketAfterCursor, rangeToReplace, symbolTable.methodContext)
                    .map(ci => {
                        ci.sortText = "aa" + ci.label;
                        return ci;
                    }).filter(newItem => completionItems.findIndex(oldItem => oldItem.insertText == newItem.insertText) < 0);

                completionItems = completionItems.concat(fieldsAndMethods);

                completionItems.push(
                    {
                        label: "this",
                        filterText: "this",
                        insertText: "this.",
                        detail: MonacoProviderLanguage.accessToFieldOrMethodOfThisClass(),
                        insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                        kind: MonacoConstants.CompletionItemKind.Snippet,
                        range: rangeToReplace,
                        command: {
                            id: "editor.action.triggerSuggest",
                            title: '123',
                            arguments: []
                        }
                    }
                );

                if (!symbolTable.methodContext.isStatic) {
                    completionItems.push(
                        {
                            label: "super",
                            filterText: "super",
                            insertText: "super.",
                            detail: MonacoProviderLanguage.useSuperToCallBaseClassMethod(),
                            insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                            kind: MonacoConstants.CompletionItemKind.Snippet,
                            range: rangeToReplace,
                            command: {
                                id: "editor.action.triggerSuggest",
                                title: '123',
                                arguments: []
                            }
                        }
                    )
                }
            }
        } else {
            if (classContext == null) {
                // Use filename to generate completion-item for class ... ?
                let name = module.file?.name;
                if (name != null) {
                    if (name.endsWith(".java")) name = name.substring(0, name.indexOf(".java"));
                    let m = name.match(/([\wöäüÖÄÜß]*)$/);
                    if (module.types.find(t => t.identifier == name) == null && m != null && m.length > 0 && m[0] == name && name.length > 0) {
                        name = name.charAt(0).toUpperCase() + name.substring(1);
                        completionItems.push({
                            label: "class " + name,
                            filterText: "class",
                            insertText: "class ${1:" + name + "} {\n\t$0\n}\n",
                            detail: MonacoProviderLanguage.definitionOfClass(name),
                            insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                            kind: MonacoConstants.CompletionItemKind.Snippet,
                            range: rangeToReplace
                        },
                        )
                    }
                }
            } else {
                // TODO: only if inside initial value of field definition...
                // completionItems = completionItems.concat(classContext.getCompletionItems(TokenType.keywordPrivate, leftBracketAlreadyThere, identifierAndBracketAfterCursor, rangeToReplace, undefined, false));
            }
        }

        completionItems = completionItems.concat(this.getKeywordCompletion(symbolTable, rangeToReplace, module));
        completionItems = this.deleteDoublesWithIdenticalInsertText(completionItems);

        // console.log("Complete variable/Class/Keyword " + text);

        this.upvoteItemsWithSameFirstCharacterCasing(completionItems, text);

        return Promise.resolve({
            suggestions: completionItems
        });
    }

    getGetter(classContext: JavaClass | JavaEnum, rangeToReplace: monaco.IRange, getPraefix: String): ConcatArray<monaco.languages.CompletionItem> {
        rangeToReplace = { startLineNumber: rangeToReplace.startLineNumber, startColumn: 0, endLineNumber: rangeToReplace.endLineNumber, endColumn: rangeToReplace.endColumn }

        let itemList: monaco.languages.CompletionItem[] = classContext.fields.filter(field =>
            typeof classContext.getOwnMethods().find(m => m.identifier == getPraefix + field.identifier) == 'undefined'
            && field.identifier != 'class' && field.type
        ).map(field => {
            let id = `${field.type.toString()} ${getPraefix + this.firstCharacterToUpperCase(field.identifier)}()`;
            return {
                kind: MonacoConstants.CompletionItemKind.Method,
                insertText: `\t${id}{\n\t\treturn ${field.identifier};\n\t}\n\n\t`,
                label: `${id}`,
                detail: '-> Getter-Methode ergänzen',
                range: rangeToReplace,
                documentation: `${id}{\n\t\treturn ${field.identifier};\n\t}\n`,
                filterText: `${getPraefix + this.firstCharacterToUpperCase(field.identifier)}()`
            }
        })
        
        return itemList;
    }
    
    getSetter(classContext: JavaClass | JavaEnum, rangeToReplace: monaco.IRange, setPraefix: string): ConcatArray<monaco.languages.CompletionItem> {
        rangeToReplace = { startLineNumber: rangeToReplace.startLineNumber, startColumn: 0, endLineNumber: rangeToReplace.endLineNumber, endColumn: rangeToReplace.endColumn }
        
        let itemList: monaco.languages.CompletionItem[] = classContext.fields.filter(field =>
            typeof classContext.getOwnMethods().find(m => m.identifier == setPraefix + field.identifier) == 'undefined'
            && field.identifier != 'class' && field.type
        ).map(field => {
            let id = `void ${setPraefix + this.firstCharacterToUpperCase(field.identifier)}(${field.type.toString()} ${field.identifier})`;
            return {
                kind: MonacoConstants.CompletionItemKind.Method,
                insertText: `\t${id}{\n\t\tthis.${field.identifier} = ${field.identifier};\n\t}\n\n\t`,
                label: `${id}`,
                detail: '-> Setter-Methode ergänzen',
                range: rangeToReplace,
                documentation: `${id}{\n\t\treturn ${field.identifier};\n\t}\n`,
                filterText: `${setPraefix + this.firstCharacterToUpperCase(field.identifier)}()`
            }
        })

        return itemList;
    }




    deleteDoublesWithIdenticalInsertText(itemList: monaco.languages.CompletionItem[]): monaco.languages.CompletionItem[] {
        let seenTexts: Set<string> = new Set();

        itemList = itemList.filter(item => {
            //@ts-ignore
            let insertText: string = item.insertText // item.signature;
            if (seenTexts.has(insertText)) return false;
            seenTexts.add(insertText);
            return true;
        })

        return itemList;

    }


    getCompletionItemsAfterDot(dotMatch: RegExpMatchArray, position: monaco.Position, module: JavaCompiledModule,
        main: IMain,
        identifierAndBracketAfterCursor: string, classContext: NonPrimitiveType | StaticNonPrimitiveType | undefined,
        leftBracketAlreadyThere: boolean): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

        let textAfterDot = dotMatch[2];
        let dotColumn = position.column - textAfterDot.length - 1;
        let type = module.getTypeAtPosition(position.lineNumber, dotColumn);
        let rangeToReplace: monaco.IRange =
        {
            startLineNumber: position.lineNumber, startColumn: position.column - textAfterDot.length,
            endLineNumber: position.lineNumber, endColumn: position.column + identifierAndBracketAfterCursor.length
        }

        // console.log("Complete element.praefix; praefix: " + textAfterDot + ", Type: " + (type == null ? null : type.identifier));


        if (type instanceof IJavaClass || type instanceof StaticNonPrimitiveType
            || type instanceof JavaEnum
        ) {

            let visibilityUpTo = getVisibilityUpTo(type, classContext);

            return Promise.resolve({
                suggestions: this.deleteDoublesWithIdenticalInsertText(type.getCompletionItems(visibilityUpTo, leftBracketAlreadyThere,
                    identifierAndBracketAfterCursor, rangeToReplace, undefined))
            });
        }

        if (type instanceof IJavaInterface || type instanceof GenericTypeParameter) {
            let items = type.getCompletionItems(TokenType.keywordPublic, leftBracketAlreadyThere,
                identifierAndBracketAfterCursor, rangeToReplace, undefined);

            let objectClassType = <JavaClass>main.getInterpreter().scheduler.classObjectRegistry["Object"].type;

            items = items.concat(objectClassType.getCompletionItems(TokenType.keywordPublic, leftBracketAlreadyThere,
                identifierAndBracketAfterCursor, rangeToReplace, undefined))

            items = this.deleteDoublesWithIdenticalInsertText(items);

            return Promise.resolve({
                suggestions: items
            });
        }

        if (type instanceof JavaArrayType) {
            return Promise.resolve({
                suggestions: [
                    {
                        label: "length",
                        filterText: "length",
                        kind: MonacoConstants.CompletionItemKind.Field,
                        insertText: "length",
                        range: rangeToReplace,
                        documentation: {
                            value: MonacoProviderLanguage.numberOfElementsInThisArray()
                        }
                    }
                ]
            });
        }

        return null;
    }

    getAssertMethods(methodContext: JavaMethod, range: monaco.IRange): monaco.languages.CompletionItem[] {

        if (methodContext.annotations.find(annotation => annotation.identifier == "Test") == null) return [];

        let keywordCompletionItems: monaco.languages.CompletionItem[] = [];
        keywordCompletionItems = keywordCompletionItems.concat([
            {
                label: "assertEquals(expected, actual, message)",
                insertText: "assertEquals($1, $2, $3);\n$0",
                detail: MonacoProviderLanguage.assertEquals(),
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Method,
                range: range,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                }
            },
            {
                label: "assertCodeReached(message)",
                insertText: "assertCodeReached($1);\n$0",
                detail: MonacoProviderLanguage.assertCodeReached(),
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Method,
                range: range,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                }
            },
            {
                label: "assertTrue(value, message)",
                insertText: "assertTrue($1, $2);\n$0",
                detail: MonacoProviderLanguage.assertTrue(),
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Method,
                range: range,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                }
            },
            {
                label: "assertFalse(value, message)",
                insertText: "assertFalse($1, $2);\n$0",
                detail: MonacoProviderLanguage.assertFalse(),
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Method,
                range: range,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                }
            },
            {
                label: "fail(message)",
                insertText: "fail($1);\n$0",
                detail: MonacoProviderLanguage.fail(),
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Method,
                range: range,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                }
            },
        ]);

        return keywordCompletionItems;
    }

    getKeywordCompletion(symbolTable: JavaSymbolTable, range: monaco.IRange, module: JavaCompiledModule): monaco.languages.CompletionItem[] {
        let keywordCompletionItems: monaco.languages.CompletionItem[] = [];
        if (!this.isConsole && (symbolTable?.classContext == null || symbolTable?.methodContext != null))
            keywordCompletionItems = keywordCompletionItems.concat([
                {
                    label: "while(Bedingung){Anweisungen}",
                    detail: "while-loop",
                    filterText: 'while',
                    // insertText: "while(${1:Bedingung}){\n\t$0\n}",
                    insertText: "while($1){\n\t$0\n}",
                    command: {
                        id: "editor.action.triggerSuggest",
                        title: '123',
                        arguments: []
                    },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "for(){}",
                    // insertText: "for(${1:Startanweisung};${2:Solange-Bedingung};${3:Nach_jeder_Wiederholung}){\n\t${0:Anweisungen}\n}",
                    insertText: "for( $1 ; $2 ; $3 ){\n\t$0\n}",
                    detail: "for-loop",
                    filterText: 'for',
                    // command: {
                    //     id: "editor.action.triggerParameterHints",
                    //     title: '123',
                    //     arguments: []
                    // },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "for(int i = 0; i < 10; i++){}",
                    // insertText: "for(${1:Startanweisung};${2:Solange-Bedingung};${3:Nach_jeder_Wiederholung}){\n\t${0:Anweisungen}\n}",
                    insertText: "for(int ${1:i} = 0; ${1:i} < ${2:10}; ${1:i}++){\n\t$0\n}",
                    detail: MonacoProviderLanguage.countingForLoop(),
                    filterText: 'for',
                    // command: {
                    //     id: "editor.action.triggerParameterHints",
                    //     title: '123',
                    //     arguments: []
                    // },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "switch(){case...}",
                    // insertText: "switch(${1:Selektor}){\n\tcase ${2:Wert_1}: {\n\t\t ${3:Anweisungen}\n\t\t}\n\tcase ${4:Wert_2}: {\n\t\t ${0:Anweisungen}\n\t\t}\n}",
                    insertText: "switch($1){\n\tcase $2:\n\t\t $3\n\t\tbreak;\n\tcase $4:\n\t\t $5\n\t\tbreak;\n\tdefault:\n\t\t $0\n}",
                    detail: MonacoProviderLanguage.switchStatement(),
                    filterText: 'switch',
                    command: {
                        id: "editor.action.triggerSuggest",
                        title: '123',
                        arguments: []
                    },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "if(){}",
                    // insertText: "if(${1:Bedingung}){\n\t${0:Anweisungen}\n}",
                    insertText: "if($1){\n\t$0\n}",
                    detail: MonacoProviderLanguage.ifClause(),
                    filterText: 'if',
                    command: {
                        id: "editor.action.triggerSuggest",
                        title: '123',
                        arguments: []
                    },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "if(){} else {}",
                    insertText: "if($1){\n\t$2\n}\nelse {\n\t$0\n}",
                    detail: MonacoProviderLanguage.doubleSidedIfClause(),
                    filterText: 'if',
                    command: {
                        id: "editor.action.triggerSuggest",
                        title: '123',
                        arguments: []
                    },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "else {}",
                    insertText: "else {\n\t$0\n}",
                    detail: "else",
                    filterText: 'else',
                    sortText: 'aelse',
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
            ]);

        if (symbolTable?.classContext == null || symbolTable?.methodContext != null) {

            keywordCompletionItems = keywordCompletionItems.concat([
                {
                    label: "instanceof",
                    insertText: "instanceof $0",
                    detail: "instanceof-Operator",
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "print",
                    insertText: "print($1);$0",
                    detail: MonacoProviderLanguage.printStatement(),
                    command: {
                        id: "editor.action.triggerParameterHints",
                        title: '123',
                        arguments: []
                    },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "println",
                    insertText: "println($1);$0",
                    detail: MonacoProviderLanguage.printlnStatement(),
                    command: {
                        id: "editor.action.triggerParameterHints",
                        title: '123',
                        arguments: []
                    },
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },

            ]);
        }

        if (!this.isConsole && (symbolTable == null || symbolTable.classContext == null || symbolTable.classContext.isMainClass)) {

            let identifier = MonacoProviderLanguage.identifier();
            let classIdentifierForLabel: string = "";
            if(module.file.getText().trim().length < 5){
                identifier = module.file.name.replace('.java', '');
                classIdentifierForLabel = " " + identifier;
            }

            keywordCompletionItems = keywordCompletionItems.concat([
                {
                    label: "class" + classIdentifierForLabel,
                    filterText: "class",
                    insertText: "class ${1:" + identifier + "} {\n\t$0\n}\n",
                    detail: MonacoProviderLanguage.classDefinition(),
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "public class",
                    filterText: "public class",
                    insertText: "public class ${1:" + MonacoProviderLanguage.identifier() + "} {\n\t$0\n}\n",
                    detail: MonacoProviderLanguage.classDefinition(),
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                }

            ]);
        } else if (!this.isConsole && symbolTable?.methodContext == null) {
            keywordCompletionItems = keywordCompletionItems.concat([
                {
                    label: "public",
                    filterText: "public",
                    insertText: "public ",
                    detail: "public",
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "public void method(){}",
                    filterText: "public",
                    insertText: "public ${1:void} ${2:" + MonacoProviderLanguage.identifier() + "}(${3:" + MonacoProviderLanguage.parameter() + "}) {\n\t$0\n}\n",
                    detail: MonacoProviderLanguage.methodDefinition(),
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "protected",
                    filterText: "protected",
                    insertText: "protected ",
                    detail: "protected",
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "static",
                    filterText: "static",
                    insertText: "static ",
                    detail: "static",
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                },
                {
                    label: "private",
                    filterText: "private",
                    insertText: "private ",
                    detail: "private",
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                }
            ]);
        }

        if (symbolTable != null && symbolTable.methodContext != null && symbolTable.classContext?.identifier != '') {
            keywordCompletionItems = keywordCompletionItems.concat([
                {
                    label: "return",
                    filterText: "return",
                    insertText: "return",
                    detail: "return",
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                }
            ]);
        }

        return keywordCompletionItems;

    }

    getOverridableMethodsCompletion(classContext: IJavaClass | JavaEnum, range: IRange) {

        let keywordCompletionItems: monaco.languages.CompletionItem[] = [];

        let methods: JavaMethod[] = [];
        let c = classContext.getExtends();
        while (c != null) {
            methods = methods.concat(c.getOwnMethods().filter((m) => {
                if (m.isAbstract || m.program == null || m.identifier.startsWith('onMouse') || m.identifier.startsWith('onKey')
                    || m.identifier.startsWith('onChange')) {
                    return true;
                }
                return false;
            }));
            c = c.getExtends();
        }

        for (let i of classContext.getImplements()) {
            methods = methods.concat(i.getAllMethods());
        }

        for (let m of methods) {

            if (m.isConstructor) continue;

            let alreadyImplemented = false;
            for (let m1 of classContext.getOwnMethods()) {
                if (m1.getSignature() == m.getSignature()) {
                    alreadyImplemented = true;
                    break;
                }
            }

            if (alreadyImplemented) continue;

            let label: string = (m.isAbstract ? "implement " : "override ") + m.getCompletionLabel(false);
            let filterText = m.identifier;
            let insertText = TokenTypeReadable[m.visibility] + " " + (m.returnParameterType == null ? "void" : m.returnParameterType.toString()) + " ";
            insertText += m.identifier + "(" + m.parameters.map(p => p.type.toString() + " " + p.identifier).join(", ");
            insertText += ") {\n\t$0\n}";

            keywordCompletionItems.push(
                {
                    label: { label: label, detail: " -> " + MonacoProviderLanguage.implementOverrideMethod(m.isAbstract, label) },
                    filterText: filterText,
                    insertText: insertText,
                    insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                    kind: MonacoConstants.CompletionItemKind.Snippet,
                    range: range
                }
            );

        }

        return keywordCompletionItems;

    }

    getConstructorCompletion(classContext: IJavaClass | JavaEnum, range: IRange) {

        let keywordCompletionItems: monaco.languages.CompletionItem[] = [];

        let constructors = classContext.getOwnMethods().filter(m => m.isConstructor && m.identifier == classContext.identifier && m.identifierRange.startLineNumber !== -1);
        if (constructors.length > 0) return [];


        let fields = classContext.getFields().filter(f => f.classEnum == classContext && !f.isStatic() && !f.initializedBeforeConstructor && !f.isFinal());

        let i: number = 1;

        let attibuteParameters: string = fields.map(f => "${" + i++ + ":" + f.type?.toString() + " " + f.identifier).join(", }");
        if (attibuteParameters.length > 0) attibuteParameters += "}";

        let attributeInitialization: string = fields.map(f => "${" + i++ + ":this." + f.identifier + " = " + f.identifier + ";").join("\n\t}");
        if (attributeInitialization.length > 0) attributeInitialization += "}";


        let insertText = `public ${classContext.identifier}(${attibuteParameters}){\n\t${attributeInitialization}\n\t$0\n}`;

        keywordCompletionItems.push(
            {
                label: { label: classContext.identifier + "(){...}", detail: " -> insert constructor" },
                filterText: classContext.identifier,
                insertText: insertText,
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: MonacoConstants.CompletionItemKind.Snippet,
                range: range,
                sortText: "_aaa"
            }
        );

        return keywordCompletionItems;

    }

    upvoteItemsWithSameFirstCharacterCasing(completionItems: monaco.languages.CompletionItem[], startOfUserInput: string) {
        if (!startOfUserInput || startOfUserInput.length < 1) return;
        let userInputHasFirstCharacterUppercase = this.hasFirstCharacterUpperCase(startOfUserInput);
        for (let ci of completionItems) {
            if (this.hasFirstCharacterUpperCase(ci.insertText) != userInputHasFirstCharacterUppercase) {
                ci.sortText = "a_" + ci.sortText;
            } else {
                ci.sortText = "b_" + ci.sortText;
            }
        }
    }

    hasFirstCharacterUpperCase(s: string) {
        if (!s || s.length < 0) return false;
        return s[0] == s[0].toUpperCase();
    }

    hasFirstCharacterLowerCase(s: string) {
        if (!s || s.length < 0) return false;
        return s[0] == s[0].toUpperCase();
    }

    firstCharacterToUpperCase(s: string) {
        if (!s || s.length == 0) return "";
        return s.charAt(0).toLocaleUpperCase() + s.substring(1);
    }
}