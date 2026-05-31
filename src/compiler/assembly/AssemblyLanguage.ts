import { IMain } from "../common/IMain.ts";
import { ProgrammingLanguage } from "../common/programminglanguage/ProgrammingLanguage.ts";
import { ErrorMarker } from "../common/monacoproviders/ErrorMarker.ts";
import * as monaco from 'monaco-editor'
import { LibraryManager } from "../common/programminglanguage/LibraryManager.ts";
import { AssemblyLibraryManager } from "./AssemblyLibraryManager.ts";
import { AssemblyCompiler } from "./AssemblyCompiler.ts";
import { MemoryTab } from "./debugger/MemoryTab.ts";
import { AssemblyCompletionItemProvider } from "./monacoproviders/AssemblyCompletionItemProvider.ts";
import { AssemblyReferenceProvider } from "./monacoproviders/AssemblyReferenceProvider.ts";
import { AssemblyDefinitionProvider } from "./monacoproviders/AssemblyDefinitionProvider.ts";
import { AssemblyHoverProvider } from "./monacoproviders/AssemblyHoverProvider.ts";
import { AssemblyRenameProvider } from "./monacoproviders/AssemblyRenameProvider.ts";
import { AssemblySymbolAndMethodMarker } from "./monacoproviders/AssemblySymbolAndMethodMarker.ts";
import { lm } from "../../tools/language/LanguageManager.ts";

export class AssemblyLanguage extends ProgrammingLanguage {

    private static instance: AssemblyLanguage;

    private libraryManager: LibraryManager = new AssemblyLibraryManager();  // not used

    private constructor() {
        super("Assembly", "asm", "myAssembly");
        this.registerLanguageAtMonacoEditor();
        this.registerProviders();
    }

    static getInstance(): AssemblyLanguage {
        if (!AssemblyLanguage.instance) {
            AssemblyLanguage.instance = new AssemblyLanguage();
        }

        return AssemblyLanguage.instance;
    }

    getTranslatedName(): string {
        
       return lm({
            "de": "Maschinensprache (Assembler)",
            "en": "Machine language (Assembler)",
            "fr": "Langage machine (assembleur)"
        })

    }

    public registerMain(main: IMain, errorMarker: ErrorMarker) {
        let compiler = new AssemblyCompiler(main, errorMarker);
        // let compiler = new JavaCompiler(main, errorMarker);
        // let repl = new JavaRepl(main, compiler);
        let settings = main.getSettings();

        this.registerCompiler(main, compiler);
        // this.registerRepl(main, repl);
        this.registerSettings(main, settings)

        new AssemblySymbolAndMethodMarker(main);    

        // JavaOnDidTypeProvider.configureEditor(main.getMainEditor());


    }




    private registerProviders() {

        new AssemblyCompletionItemProvider(this);
        new AssemblyReferenceProvider(this);
        new AssemblyDefinitionProvider(this);
        new AssemblyHoverProvider(this);
        new AssemblyRenameProvider(this);

        // new JavaHoverProvider(this);
        // new JavaRenameProvider(this);
        // new JavaSignatureHelpProvider(this);
        // new JavaInlayHintsProvider(this);

        // let formatter = new JavaFormatter(this);
        // monaco.languages.registerDocumentFormattingEditProvider(this.monacoLanguageSelector, formatter);
        // monaco.languages.registerOnTypeFormattingEditProvider(this.monacoLanguageSelector, formatter);
        // monaco.languages.registerCodeActionProvider(this.monacoLanguageSelector, new JavaCodeActionProvider(this));
    }

    private registerLanguageAtMonacoEditor(): void {
        monaco.languages.register({
            id: this.monacoLanguageSelector,
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
            // Set defaultToken to invalid to see what you do not tokenize yet
            // defaultToken: 'invalid',
            ignoreCase: true,

            keywords: [
                'load', 'store',
                'add', 'sub', 'mul', 'div', 'mod',
                'jmp', 'jeq', 'jne', 'jgt', 'jge', 'jlt', 'jle',
                'hold', 'word'
            ],

            immediateKeywords: [
                'loadi', 'storei',
                'addi', 'subi', 'muli', 'divi', 'modi'
            ],

            operators: [

            ],

            // we include these common regular expressions
            symbols: /[=><!~?:&|+\-*\/\^%]+/,

            // C# style strings
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

            // The main tokenizer for our languages
            tokenizer: {
                root: [
                    [/\.[a-zA-Z_]*/, 'identifier.pseudodirective'],
                    [/[a-zA-Z_]*:/, 'identifier.tag'],
                    // identifiers and keywords
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@immediateKeywords': { token: 'keyword', next: '@immediateOperand' },
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],

                    // whitespace
                    { include: '@whitespace' },

                    // delimiters and operators
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': ''
                        }
                    }],

                    // numbers
                    { include: '@number' },

                    // delimiter: after number because of .\d floats
                    [/[;,.]/, 'delimiter'],

                ],

                immediateOperand: [
                    { include: '@whitespace' },
                    [/0[xX][0-9a-fA-F]+/, 'number.immediate', '@pop'],
                    [/\d+/, 'number.immediate', '@pop'],
                    [/.*$/, 'invalid', '@pop']
                ],

                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\/\*/, 'comment', '@push'],    // nested comment
                    ["\\*/", 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],

                number: [
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number']
                ],

                whitespace: [
                    [/[ \t\r\n]+/, 'white'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],
            },
        };


        //@ts-ignore
        monaco.languages.setLanguageConfiguration(this.monacoLanguageSelector, conf);
        //@ts-ignore
        monaco.languages.setMonarchTokensProvider(this.monacoLanguageSelector, language);

    }

    public async enable(main: IMain) {
        let bottomDiv = main.getBottomDiv();
        bottomDiv.jUnitTab?.setVisible(false);
        bottomDiv.disassemblerTab?.setVisible(false);
        bottomDiv.console?.tab?.setVisible(false);
        let rightDiv = main.getRightDiv();
        rightDiv.classDiagramTab?.setVisible(false);
        
        rightDiv.memoryTab?.setVisible(true);
        (<MemoryTab>rightDiv.memoryTab)?.listenToCompiler(this.getCompiler(main) as AssemblyCompiler);

        // let debuggerTab = rightDiv.tabManager.getTabByName("Debugger");
        // debuggerTab?.show();

        let memoryTab = rightDiv.tabManager.getTabByName("Memory Tab");
        memoryTab?.show();

        main.setHorizontalSliderPosition(main.isEmbedded() ? 0.6 : 0.4);
        
        main.getInterpreter().showTriangleAtProgramPointer = false;

        setTimeout(() => {
            main.getActionManager().setVisible("interpreter.stepInto", false);
            main.getActionManager().setVisible("interpreter.stepOut", false);
            main.getActionManager().setVisible("interpreter.restart", false);            
            main.getActionManager().setVisible("interpreter.startTests", false);            
        }, 800);
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

    public getDebuggerType(): "java" | "assembly" {
        return 'assembly';
    }

}