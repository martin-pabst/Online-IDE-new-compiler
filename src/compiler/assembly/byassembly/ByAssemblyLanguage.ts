import { IMain } from "../../common/IMain.ts";
import { ProgrammingLanguage } from "../../common/programminglanguage/ProgrammingLanguage.ts";
import { ErrorMarker } from "../../common/monacoproviders/ErrorMarker.ts";
import * as monaco from 'monaco-editor'
import { LibraryManager } from "../../common/programminglanguage/LibraryManager.ts";
import { AssemblyLibraryManager } from "../AssemblyLibraryManager.ts";
import { ByAssemblyCompiler } from "./ByAssemblyCompiler.ts";
import { MemoryTab } from "../debugger/MemoryTab.ts";
import { AssemblyCompletionItemProvider } from "../monacoproviders/AssemblyCompletionItemProvider.ts";
import { AssemblyReferenceProvider } from "../monacoproviders/AssemblyReferenceProvider.ts";
import { AssemblyDefinitionProvider } from "../monacoproviders/AssemblyDefinitionProvider.ts";
import { AssemblyHoverProvider } from "../monacoproviders/AssemblyHoverProvider.ts";
import { AssemblyRenameProvider } from "../monacoproviders/AssemblyRenameProvider.ts";
import { AssemblySymbolAndMethodMarker } from "../monacoproviders/AssemblySymbolAndMethodMarker.ts";
import { lm } from "../../../tools/language/LanguageManager.ts";
import { AssemblyFormatter } from "../monacoproviders/AssemblyFormatter.ts";
import { ProgrammingLanguageData } from "../../common/programminglanguage/ProgrammingLanguageData.ts";
import type { Dialog } from "../../../client/main/gui/Dialog.ts";
import type { Workspace } from "../../../client/workspace/Workspace.ts";
import jQuery from 'jquery';
import { getSelectedObject, setSelectItems } from "../../../tools/HtmlTools.ts";
import { ByArchitecture } from "./ByArchitecture.ts";
import { DOM } from "../../../tools/DOM.ts";
import { ByAssemblyMessages } from "./ByAssemblyMessages.ts";


export class ByAssemblyLanguage extends ProgrammingLanguage {

    private static instance: ByAssemblyLanguage;

    private libraryManager: LibraryManager = new AssemblyLibraryManager();  // not used

    private constructor() {
        super(ProgrammingLanguageData.ByAssembly.name, ProgrammingLanguageData.ByAssembly.fileEndingWithOutDot, ProgrammingLanguageData.ByAssembly.monacoLanguageSelector);
        this.registerLanguageAtMonacoEditor();
        this.registerProviders();
    }

    static getInstance(): ByAssemblyLanguage {
        if (!ByAssemblyLanguage.instance) {
            ByAssemblyLanguage.instance = new ByAssemblyLanguage();
        }

        return ByAssemblyLanguage.instance;
    }

    public registerMain(main: IMain, errorMarker: ErrorMarker) {
        let compiler = new ByAssemblyCompiler(main, errorMarker);
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

        new AssemblyFormatter(this);

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
                'hold', 'halt', 'word',
                'push', 'pop',
                'call', 'return',
                'jsr', 'rts', 'rsv', 'rel',
                'cmp', 'and', 'or', 'xor', 'not',
                'shr', 'shl',
            ],

            immediateKeywords: [
                'loadi', 'storei',
                'addi', 'subi', 'muli', 'divi', 'modi',
                'andi', 'ori', 'xori', 'cmpi',
                'shri', 'shli'
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
                    [/\.[a-zäöüßA-ZÄÖÜ_]*/, 'identifier.pseudodirective'],
                    [/[a-zäöüßA-ZÄÖÜ_][a-zäöüßA-ZÄÖÜ_0-9]*:/, 'identifier.tag'],
                    // identifiers and keywords
                    [/[a-zäöüßA-ZÄÖÜ_$][\w$]*/, {
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

                    // strings
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                    [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

                    // characters
                    [/'[^\\']'/, 'string'],
                    [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                    [/'/, 'string.invalid']

                ],

                immediateOperand: [
                    { include: '@whitespace' },
                    [/0[xX][0-9a-fA-F]+/, 'number.immediate', '@pop'],
                    [/-?\d+/, 'number.immediate', '@pop'],
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

                string: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
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
        (<MemoryTab>rightDiv.memoryTab)?.listenToCompiler(this.getCompiler(main) as ByAssemblyCompiler);

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

    public setupWorkspaceSettings(dialog: Dialog, main: IMain, languageSpecificDiv: HTMLDivElement, workspace: Workspace) {
        DOM.makeDiv(languageSpecificDiv, "dialog-subheading", "languagesettings").textContent = ByAssemblyMessages.ArchitectureHeading();


        let selectElement = document.createElement("select");
        selectElement.classList.add("jo_settingsSelect");

        let currentArchitecture: string | undefined = workspace.settings.assemblyArchitecture;

        let defaultArchitecture = <string>main.getSettings().getValue("programmingLanguages.assembly.defaultArchitecture");

        setSelectItems(jQuery(selectElement), ByArchitecture.getArchitectures().map(arch => ({ value: arch.identifier, object: arch, caption: arch.getLocalizedName()() })),
            currentArchitecture ?? defaultArchitecture ?? ByArchitecture.getArchitectures()[0].identifier);

        languageSpecificDiv.appendChild(selectElement);

    }

    public retrieveWorkspaceSettings(main: IMain, languageSpecificDiv: HTMLDivElement, workspace: Workspace): boolean {
        let selectElement = languageSpecificDiv.getElementsByClassName("jo_settingsSelect")[0];

        let selectedArchitecture = <ByArchitecture>getSelectedObject(<JQuery<HTMLSelectElement>>jQuery(selectElement));
        if (workspace.settings.assemblyArchitecture != selectedArchitecture.identifier) {
            workspace.settings.assemblyArchitecture = selectedArchitecture.identifier;
            main.getCompiler().forceRecompilation();
            return true;
        }

        return false;
    }


}