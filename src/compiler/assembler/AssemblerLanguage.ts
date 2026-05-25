import { IMain } from "../common/IMain";
import { ProgrammingLanguage } from "../common/programminglanguage/ProgrammingLanguage.ts";
import { ErrorMarker } from "../common/monacoproviders/ErrorMarker";
import * as monaco from 'monaco-editor'
import { LibraryManager } from "../common/programminglanguage/LibraryManager.ts";
import { AssemblerLibraryManager } from "./AssemblerLibraryManager.ts";
import { AssemblerCompiler } from "./AssemblerCompiler.ts";

export class AssemblerLanguage extends ProgrammingLanguage {

    private static instance: AssemblerLanguage;

    private libraryManager: LibraryManager = new AssemblerLibraryManager();

    private constructor() {
        super("Assembler", "asm", "myAssembler");
        this.registerLanguageAtMonacoEditor();
        this.registerProviders();
    }

    static getInstance(): AssemblerLanguage {
        if (!AssemblerLanguage.instance) {
            AssemblerLanguage.instance = new AssemblerLanguage();
        }

        return AssemblerLanguage.instance;
    }


    public registerMain(main: IMain, errorMarker: ErrorMarker) {
        let compiler = new AssemblerCompiler();
        // let compiler = new JavaCompiler(main, errorMarker);
        // let repl = new JavaRepl(main, compiler);
        let settings = main.getSettings();

        this.registerCompiler(main, compiler);
        // this.registerRepl(main, repl);
        this.registerSettings(main, settings)

        // JavaOnDidTypeProvider.configureEditor(main.getMainEditor());


    }




    private registerProviders() {

        // new JavaHoverProvider(this);
        // new JavaCompletionItemProvider(this);
        // new JavaRenameProvider(this);
        // new JavaDefinitionProvider(this);
        // new JavaReferenceProvider(this);
        // new JavaSignatureHelpProvider(this);
        // new JavaInlayHintsProvider(this);

        // let formatter = new JavaFormatter(this);
        // monaco.languages.registerDocumentFormattingEditProvider(this.monacoLanguageSelector, formatter);
        // monaco.languages.registerOnTypeFormattingEditProvider(this.monacoLanguageSelector, formatter);
        // monaco.languages.registerCodeActionProvider(this.monacoLanguageSelector, new JavaCodeActionProvider(this));
    }

    private registerLanguageAtMonacoEditor(): void {
        monaco.languages.register({
            id: 'myAssembler',
            extensions: ['.asm'],
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
            colorizedBracketPairs: [
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
            // folding: {
            //     markers: {
            //         start: new RegExp("^\\s*//\\s*(?:(?:#?region\\b)|(?:<editor-fold\\b))"),
            //         end: new RegExp("^\\s*//\\s*(?:(?:#?endregion\\b)|(?:</editor-fold>))")
            //     }
            // },

        };
        let language: monaco.languages.IMonarchLanguage = {
            ignoreCase: true,
            defaultToken: '',
            tokenPostfix: '.asm',
            keywords: [
                'load', 'store', 'add', 'sub', 'mul', 'div', 'mod', 'jmp', 'jeq', 'jne', 'jgt', 'jge', 'jlt', 'jle'
            ],
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            digits: /\d+(_+\d+)*/,
            octaldigits: /[0-7]+(_+[0-7]+)*/,
            binarydigits: /[0-1]+(_+[0-1]+)*/,
            hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
            // The main tokenizer for our languages
            tokenizer: {
                root: [
                    [/\w*:/, 'label'],
                    [
                        /[.a-zA-Z_]\w*/,
                        {
                            cases: {
                                '@keywords': { token: 'keyword.$0' },
                                '@default': ''
                            }
                        }
                    ],

                    //technically not correct as it includes the spaces
                    [/\s+(\*|;).*$/, 'comment'],
                    // whitespace
                    [/[ \t\r\n]+/, ''],
                    // Comments
                    [/^(\*|;).*$/, 'comment'],

                    // whitespace
                    { include: '@whitespace' },

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

            },
        };

        //@ts-ignore
        monaco.languages.setLanguageConfiguration(this.monacoLanguageSelector, conf);
        //@ts-ignore
        monaco.languages.setMonarchTokensProvider(this.monacoLanguageSelector, language);

    }

    public enable(main: IMain) {
        let bottomDiv = main.getBottomDiv();
        // bottomDiv.jUnitTab?.setVisible(true);
        // bottomDiv.disassemblerTab?.setVisible(true);
        // bottomDiv.console?.tab?.setVisible(true);
        let rightDiv = main.getRightDiv();
        // rightDiv.classDiagramTab?.setVisible(true);
    }

    public disable(main: IMain) {
        let bottomDiv = main.getBottomDiv();
        // bottomDiv.jUnitTab?.setVisible(false);
        // bottomDiv.disassemblerTab?.setVisible(false);
        // bottomDiv.console?.tab?.setVisible(false);
        let rightDiv = main.getRightDiv();
        // rightDiv.classDiagramTab?.setVisible(false);
    }

    public beforeWorkspaceChange(main: IMain) {
        // this.jUnitTestrunner.clearOutput();
        // this.jUnitTestrunner.clearTree();
    }

    getLibraryManager(): LibraryManager {
        return this.libraryManager;
    }

}