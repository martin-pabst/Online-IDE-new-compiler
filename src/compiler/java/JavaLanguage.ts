import { Compiler } from "../common/Compiler";
import { IMain } from "../common/IMain";
import { Language } from "../common/Language";
import { ColorProvider as JavaColorProvider } from "../common/monacoproviders/ColorProvider";
import { ErrorMarker } from "../common/monacoproviders/ErrorMarker";
import { JavaCompiler } from "./JavaCompiler";
import { JavaCompletionItemProvider } from "./monacoproviders/JavaCompletionItemProvider";
import { JavaDefinitionProvider } from "./monacoproviders/JavaDefinitionProvider";
import { JavaFormatter } from "./monacoproviders/JavaFormatter";
import { JavaHoverProvider } from "./monacoproviders/JavaHoverProvider";
import { JavaOnDidTypeProvider } from "./monacoproviders/JavaOnDidTypeProvider";
import { JavaReferenceProvider } from "./monacoproviders/JavaReferenceProvider";
import { JavaRenameProvider } from "./monacoproviders/JavaRenameProvider";
import { JavaSignatureHelpProvider } from "./monacoproviders/JavaSignatureHelpProvider";
import { JavaSymbolAndMethodMarker } from "./monacoproviders/JavaSymbolAndMethodMarker";
import { JavaCodeActionProvider } from "./monacoproviders/quickfix/JavaCodeActionProvider.ts";
import { JavaRepl as JavaRepl } from "./parser/repl/JavaRepl";
import * as monaco from 'monaco-editor'

export class JavaLanguage extends Language {

    private static instance: JavaLanguage;


    private constructor() {
        super("Java", ".java", "myJava");
        this.registerLanguageAtMonacoEditor();
        this.registerProviders();
    }

    static getInstance(): JavaLanguage {
        if (!JavaLanguage.instance) {
            JavaLanguage.instance = new JavaLanguage();
        }

        return JavaLanguage.instance;
    }


    public static registerMain(main: IMain, errorMarker: ErrorMarker): JavaLanguage {
        let compiler = new JavaCompiler(main, errorMarker);
        let instance = JavaLanguage.getInstance();
        instance.registerCompiler(main, compiler);
        let repl = new JavaRepl(main, compiler);
        instance.registerRepl(main, repl);
        JavaOnDidTypeProvider.configureEditor(main.getMainEditor());
        new JavaSymbolAndMethodMarker(main);
        return instance;
    }




    private registerProviders() {

        new JavaHoverProvider(this);
        new JavaCompletionItemProvider(this);
        new JavaRenameProvider(this);
        new JavaDefinitionProvider(this);
        new JavaReferenceProvider(this);
        new JavaSignatureHelpProvider(this);

        new JavaColorProvider(this);

        let formatter = new JavaFormatter();
        monaco.languages.registerDocumentFormattingEditProvider(this.monacoLanguageSelector, formatter);
        monaco.languages.registerOnTypeFormattingEditProvider(this.monacoLanguageSelector, formatter);
        monaco.languages.registerCodeActionProvider(this.monacoLanguageSelector, new JavaCodeActionProvider(this));
    }

    private registerLanguageAtMonacoEditor(): void {
        monaco.languages.register({
            id: 'myJava',
            extensions: ['.learnJava'],
            //  mimetypes: ["text/x-java-source", "text/x-java"]
        });

        let conf: monaco.languages.LanguageConfiguration = {
            indentationRules: {
                // ^(.*\*/)?\s*\}.*$
                decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
                // ^.*\{[^}"']*$
                increaseIndentPattern: /^.*\{[^}"']*$/
            },
            onEnterRules: [
                {
                    // e.g. /** | */
                    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                    afterText: /^\s*\*\/$/,
                    action: { indentAction: monaco.languages.IndentAction.IndentOutdent, appendText: ' * ' }
                },
                {
                    // e.g. /** ...|
                    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                    action: { indentAction: monaco.languages.IndentAction.None, appendText: ' * ' }
                },
                {
                    // e.g.  * ...|
                    // beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                    beforeText: /^(\t|(\ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                    action: { indentAction: monaco.languages.IndentAction.None, appendText: '* ' }
                },
                {
                    // e.g.  */|
                    beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                    action: { indentAction: monaco.languages.IndentAction.None, removeText: 1 }
                },
                {
                    // e.g.  *-----*/|
                    beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                    action: { indentAction: monaco.languages.IndentAction.None, removeText: 1 }
                }
            ],
            // the default separators except `@$`
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/'],
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')'],
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' },
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' },
                { open: '<', close: '>' },
            ],
            folding: {
                markers: {
                    start: new RegExp("^\\s*//\\s*(?:(?:#?region\\b)|(?:<editor-fold\\b))"),
                    end: new RegExp("^\\s*//\\s*(?:(?:#?endregion\\b)|(?:</editor-fold>))")
                }
            },

        };
        let language: monaco.languages.IMonarchLanguage = {
            ignoreCase: false,
            defaultToken: '',
            tokenPostfix: '.java',
            keywords: [
                'abstract', 'continue', 'new', 'switch', 'assert', 'default',
                'goto', 'package', 'synchronized', 'private',
                'this', 'implements', 'protected', 'throw',
                'import', 'public', 'throws', 'case', 'instanceof', 'return',
                'transient', 'catch', 'extends', 'try', 'final',
                'static', 'finally', 'strictfp',
                'volatile', 'const', 'native', 'super', 'true', 'false', 'null'
            ],
            print: ['print', 'println'],
            statements: ['for', 'while', 'if', 'then', 'else', 'do', 'break', 'continue'],
            types: ['int', 'boolean', 'char', 'float', 'double', 'long', 'void', 'byte', 'short',
                'class', 'enum', 'interface', 'var'],
            operators: [
                '=', '>', '<', '!', '~', '?', ':',
                '==', '<=', '>=', '!=', '&&', '||', '++', '--',
                '+', '-', '*', '/', '&', '|', '^', '%', '<<',
                '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
                '^=', '%=', '<<=', '>>=', '>>>='
            ],
            // we include these common regular expressions
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            digits: /\d+(_+\d+)*/,
            octaldigits: /[0-7]+(_+[0-7]+)*/,
            binarydigits: /[0-1]+(_+[0-1]+)*/,
            hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
            // The main tokenizer for our languages
            tokenizer: {
                root: [
                    // identifiers and keywords
                    // [/[a-zA-Z_$][\w$]*/, {
                    [/\.[A-Z$ÄÖÜ][\w$äöüßÄÖÜ]*(?=\()/, {
                        cases: {
                            '@default': 'method'
                        }
                    }],
                    [/[a-z_$äöü][\w$äöüßÄÖÜ]*(?=\()/, {
                        cases: {
                            '@keywords': { token: 'keyword.$0' },
                            '@statements': { token: 'statement.$0' },
                            '@types': { token: 'type.$0' },
                            '@print': { token: 'print.$0' },
                            '@default': 'method'
                        }
                    }],
                    [/[a-z_$äöüß][\w$äöüßÄÖÜ]*/, {
                        cases: {
                            '@keywords': { token: 'keyword.$0' },
                            '@statements': { token: 'statement.$0' },
                            '@types': { token: 'type.$0' },
                            '@default': 'identifier'
                        }
                    }],
                    [/[A-Z$ÄÖÜ][\w$äöüßÄÖÜ]*/, 'class'],
                    // whitespace
                    { include: '@whitespace' },
                    // delimiters and operators
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'delimiter',
                            '@default': ''
                        }
                    }],
                    // @ annotations.
                    [/@\s*[a-zA-Z_\$][\w\$]*/, 'annotation'],
                    // numbers
                    [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
                    [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
                    [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
                    [/0(@octaldigits)[Ll]?/, 'number.octal'],
                    [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
                    [/(@digits)[fFdD]/, 'number.float'],
                    [/(@digits)[lL]?/, 'number'],
                    // delimiter: after number because of .\d floats
                    [/[;,.]/, 'delimiter'],
                    // strings
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"""/, 'string', '@string'],
                    [/"/, 'string', '@string'],
                    // characters
                    [/'[^\\']'/, 'string'],
                    [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                    [/'/, 'string.invalid']
                ],
                whitespace: [
                    [/[ \t\r\n]+/, ''],
                    [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],
                comment: [
                    [/[^\/*]+/, 'comment'],
                    // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
                    // [/\/\*/,    'comment.invalid' ],    // this breaks block comments in the shape of /* //*/
                    [/\*\//, 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],
                //Identical copy of comment above, except for the addition of .doc
                javadoc: [
                    [/[^\/*]+/, 'comment.doc'],
                    // [/\/\*/, 'comment.doc', '@push' ],    // nested comment not allowed :-(
                    [/\/\*/, 'comment.doc.invalid'],
                    [/\*\//, 'comment.doc', '@pop'],
                    [/[\/*]/, 'comment.doc']
                ],
                string: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"""/, 'string', '@pop'],
                    [/"/, 'string', '@pop']
                ],

            },
        };

        //@ts-ignore
        monaco.languages.setLanguageConfiguration('myJava', conf);
        //@ts-ignore
        monaco.languages.setMonarchTokensProvider('myJava', language);


    }

}