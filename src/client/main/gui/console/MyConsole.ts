import { Error } from "../../../../compiler/common/Error.js";
import { ErrorMarker } from "../../../../compiler/common/monacoproviders/ErrorMarker.js";
import { ReplReturnValue } from "../../../../compiler/java/parser/repl/ReplReturnValue.js";
import { copyTextToClipboard } from "../../../../tools/HtmlTools.js";
import { MainBase } from "../../MainBase.js";
import { Helper } from "../Helper.js";
import { ConsoleEntry } from "./ConsoleEntry.js";
import * as monaco from 'monaco-editor'

export class MyConsole {

    editor: monaco.editor.IStandaloneCodeEditor;
    history: string[] = [];
    historyPos: number = 0;

    statements: string[] = [];

    timerHandle: any;

    consoleEntries: ConsoleEntry[] = [];

    $consoleTabHeading: JQuery<HTMLElement>;
    $consoleTab: JQuery<HTMLElement>;

    errorMarker: ErrorMarker = new ErrorMarker();

    lastStatement: string = "";

    lastCompileTime: number = 0;

    constructor(private main: MainBase, public $bottomDiv: JQuery<HTMLElement>) {
        if ($bottomDiv == null) return; // Console is only used to highlight exceptions

        this.$consoleTabHeading = $bottomDiv.find('.jo_tabheadings>.jo_console-tab');
        this.$consoleTab = $bottomDiv.find('.jo_tabs>.jo_consoleTab');
    }

    initConsoleClearButton() {

        let that = this;

        let $consoleClear = this.$consoleTabHeading.parent().find('.jo_console-clear');
        let $consoleCopy = this.$consoleTabHeading.parent().find('.jo_console-copy');

        this.$consoleTab.on('myshow', () => {
            $consoleClear.show();
            $consoleCopy.show();
            that.editor.layout();
        });

        this.$consoleTab.on('myhide', () => {
            $consoleClear.hide();
            $consoleCopy.hide();
        });

        $consoleClear.on('mousedown', (e) => {
            e.stopPropagation();
            that.clear();
        });

        $consoleCopy.on('mousedown', (e) => {
            e.stopPropagation();
            that.copyToClipboard();
        });

    }

    initGUI() {

        if (this.$bottomDiv == null) return;

        this.initConsoleClearButton();

        let $editorDiv = this.$consoleTab.find('.jo_commandline');

        this.editor = monaco.editor.create($editorDiv[0], {
            value: [
                ''
            ].join('\n'),
            automaticLayout: false,
            renderLineHighlight: "none",
            guides: {
                bracketPairs: false,
                highlightActiveIndentation: false,
                indentation: false
            },
            overviewRulerLanes: 0,
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            fixedOverflowWidgets: true,
            language: 'myJava',

            fontSize: 14,
            //@ts-ignore
            fontFamily: window.javaOnlineFont == null ? "Consolas, Roboto Mono" : window.javaOnlineFont,
            fontWeight: "500",
            roundedSelection: true,
            occurrencesHighlight: "multiFile",
            suggest: {
                localityBonus: true,
                snippetsPreventQuickSuggestions: false
            },
            minimap: {
                enabled: false
            },
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
            },
            theme: "myCustomThemeDark",

            acceptSuggestionOnEnter: "on"

        }
        );

        this.editor.layout();

        let that = this;


        this.editor.addAction({
            id: "action_enter",
            label: "Enter key",
            keybindings: [monaco.KeyCode.Enter],
            precondition: '!suggestWidgetVisible',
            run: () => {
                let statement = this.editor.getModel()?.getValue();
                if (!statement) return;

                setTimeout(async () => {
                    let command = that.editor.getModel().getValue(monaco.editor.EndOfLinePreference.LF, false);

                    if (!command || command == "") return;

                    that.history.push(command);
                    that.statements.push(command);
                    that.historyPos = 0;

                    let returnValue = await that.main.getRepl().executeAsync(command!, false);
                    this.showCompilationErrors(returnValue?.errors);

                    if (typeof returnValue !== "undefined") {
                        if (typeof returnValue.value == "undefined" && returnValue.errors?.length > 0 && returnValue.errors?.find(error => error.level == "error")) {
                            that.writeConsoleError(command, returnValue.errors?.find(error => error.level == "error"));
                        } else {
                            that.writeConsoleEntry(command, returnValue);
                        }
                        this.editor.getModel()?.setValue('');
                    }
                    setTimeout(() => {
                        this.editor.focus();
                    }, 100);
                }, 10);

            }
        });

        this.editor.addAction({
            id: "action_arrow_up",
            label: "ArrowUp",
            keybindings: [monaco.KeyCode.UpArrow],
            precondition: '!suggestWidgetVisible && !parameterHintsVisible',
            run: () => {
                let nextHistoryPos = that.history.length - (that.historyPos + 1);
                if (nextHistoryPos >= 0) {
                    that.historyPos++;
                    let text = that.history[nextHistoryPos];
                    that.editor.setValue(text);
                    that.editor.setPosition({
                        lineNumber: 1,
                        column: text.length + 1
                    })
                    this.compileAndShowErrors();
                }
            }
        });

        this.editor.addAction({
            id: "action_arrow_down",
            label: "ArrowDown",
            keybindings: [monaco.KeyCode.DownArrow],
            precondition: '!suggestWidgetVisible && !parameterHintsVisible',
            run: () => {
                let nextHistoryPos = that.history.length - (that.historyPos - 1);
                if (nextHistoryPos <= that.history.length - 1) {
                    that.historyPos--;
                    let text = that.history[nextHistoryPos];
                    that.editor.setValue(text);
                    that.editor.setPosition({
                        lineNumber: 1,
                        column: text.length + 1
                    })
                } else {
                    that.editor.setValue("");
                    that.historyPos = 0;
                }
                this.compileAndShowErrors();
            }
        });



        this.editor.onDidChangeModelContent((e) => {
            let statement = this.editor.getModel()?.getValue();
            if (!statement) return;
            if (statement != this.lastStatement) {
                this.lastStatement = statement;

                this.compileAndShowErrors();
            }
        })


        this.$consoleTabHeading.on("mousedown", () => {
            Helper.showHelper("consoleHelper", this.main);

            setTimeout(() => {
                that.editor.focus();
            }, 500);
        });

    }


    compileAndShowErrors() {
        setTimeout(() => {
            if (performance.now() - this.lastCompileTime > 390) {
                let programAndModule = this.compile();
                if (programAndModule) {
                    this.showCompilationErrors(programAndModule.module.errors);
                }
                this.lastCompileTime = performance.now();
            }
        }, 400);
    }


    compile() {
        let command = this.editor.getModel().getValue(monaco.editor.EndOfLinePreference.LF, false);
        return this.main.getRepl().compile(command, false);
    }

    execute() {

        // monaco.editor.colorize(command, 'myJava', { tabSize: 3 }).then((command) => {

        // });

    }

    showCompilationErrors(errors?: Error[]) {
        if (!errors) return;
        let monacoModel = this.main.getReplEditor()?.getModel();
        if (!monacoModel) return;

        this.errorMarker.markErrors(errors, monacoModel);

    }

    showTab() {
        let mousePointer = window.PointerEvent ? "pointer" : "mouse";
        this.$consoleTabHeading.trigger(mousePointer + "down");
    }


    replReturnValueToOutput(replReturnValue: ReplReturnValue): string | undefined {
        if (typeof replReturnValue == "undefined") return undefined;
        if (!replReturnValue.text) return undefined;
        let type: string = replReturnValue.type ? replReturnValue.type.toString() + " " : "";
        let text = replReturnValue.text;
        //@ts-ignore#
        if (text["value"]) text = text.value;
        switch (type) {
            case "string ":
            case "String ":
                if (replReturnValue.value) {
                    text = '"' + text + '"';
                } else {
                    text = "null";
                }
                break;
            case "char ":
            case "Character ":
                text = "'" + text + "'";
                break;
        }

        if (text.length > 200) {
            text = text.substring(0, 200) + " ...";
        }

        return text;

    }

    writeConsoleError(command: string | JQuery<HTMLElement>, error: Error) {

        if (this.$consoleTab == null) {
            return;
        }
        let consoleTop = this.$consoleTab.find('.jo_console-top');

        let commandEntry = new ConsoleEntry(true, command, null, null, null, null, false);
        this.consoleEntries.push(commandEntry);
        consoleTop.append(commandEntry.$consoleEntry);


        let resultEntry = new ConsoleEntry(false, null, error.message, error.message, "Fehler:", null, true, "#ff0000");
        this.consoleEntries.push(resultEntry);
        consoleTop.append(resultEntry.$consoleEntry);


        setTimeout(() => {
            consoleTop[0].scrollTop = consoleTop[0].scrollHeight;
            // resultEntry.$consoleEntry[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 30);

    }

    writeConsoleEntry(command: string | JQuery<HTMLElement>, value: ReplReturnValue, color: string = null) {

        if (this.$consoleTab == null) {
            return;
        }
        let consoleTop = this.$consoleTab.find('.jo_console-top');

        let commandEntry = new ConsoleEntry(true, command, null, null, null, null, value == null, color);
        this.consoleEntries.push(commandEntry);
        consoleTop.append(commandEntry.$consoleEntry);

        let replReturnOutputAsString = this.replReturnValueToOutput(value);
        if (replReturnOutputAsString) {
            let resultEntry = new ConsoleEntry(false, null, value.value, replReturnOutputAsString, null, null, true, color);
            this.consoleEntries.push(resultEntry);
            consoleTop.append(resultEntry.$consoleEntry);
        }


        setTimeout(() => {
            consoleTop[0].scrollTop = consoleTop[0].scrollHeight;
            // resultEntry.$consoleEntry[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 30);

    }

    clear() {
        let consoleTop = this.$consoleTab.find('.jo_console-top');
        consoleTop.children().remove(); // empty();
        this.consoleEntries = [];
        this.statements = [];
    }

    detachValues() {
        for (let ce of this.consoleEntries) {
            ce.detachValue();
        }
    }


    clearExceptions() {
        if (this.$bottomDiv == null) return;
        let $consoleTop = this.$consoleTab.find('.jo_console-top');
        $consoleTop.find('.jo_exception').parents('.jo_consoleEntry').remove();
    }

    copyToClipboard(){
        copyTextToClipboard(this.statements.join("\n"));
    }

}