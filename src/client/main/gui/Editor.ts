import jQuery from 'jquery';
import { SchedulerState } from "../../../compiler/common/interpreter/SchedulerState.ts";
import { JavaAddEditorShortcuts } from '../../../compiler/java/monacoproviders/JavaAddEditorShortcuts.ts';
import { File } from '../../workspace/File.js';
import { Workspace } from "../../workspace/Workspace.ts";
import { Main } from "../Main.ts";
import { MainBase } from "../MainBase.ts";
import { FileTypeManager } from "../../../compiler/common/module/FileTypeManager.ts";

export type HistoryEntry = {
    file_id: number,
    workspace_id: number,
    position: monaco.Position;
}

export class Editor {

    editor: monaco.editor.IStandaloneCodeEditor;

    highlightCurrentMethod: boolean = true;

    cw: monaco.editor.IContentWidget = null;

    lastPosition: HistoryEntry;
    dontPushNextCursorMove: number = 0;

    constructor(public main: MainBase, private showMinimap: boolean, private isEmbedded: boolean) {
    }

    currentlyEditedModuleIsJava(): boolean {
        let name = this.main.getCurrentWorkspace()?.getCurrentlyEditedFile().name;
        return FileTypeManager.filenameToFileType(name).file_type == 0;
    }

    initGUI($element: JQuery<HTMLElement>) {

        this.editor = monaco.editor.create($element[0], {
            // value: [
            //     'function x() {',
            //     '\tconsole.log("Hello world!");',
            //     '}'
            // ].join('\n'),
            // language: 'myJava',
            language: 'myJava',
            "semanticHighlighting.enabled": true,
            lightbulb: {
                enabled: true
            },
            // gotoLocation: {
            //     multipleReferences: "gotoAndPeek"
            // },
            lineDecorationsWidth: 0,
            peekWidgetDefaultFocus: "tree",
            fixedOverflowWidgets: true,
            quickSuggestions: true,
            quickSuggestionsDelay: 10,
            fontSize: 14,
            //@ts-ignore
            fontFamily: window.javaOnlineFont == null ? "Consolas, Roboto Mono" : window.javaOnlineFont,
            fontWeight: "500",
            roundedSelection: true,
            selectOnLineNumbers: false,
            // selectionHighlight: false,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            occurrencesHighlight: false,
            autoIndent: "advanced",
            // renderWhitespace: "boundary",
            dragAndDrop: true,
            formatOnType: true,
            formatOnPaste: true,
            suggestFontSize: 16,
            suggestLineHeight: 22,
            suggest: {
                localityBonus: true,
                insertMode: "replace"
                // snippetsPreventQuickSuggestions: false
            },
            parameterHints: { enabled: true, cycle: true },
            // //@ts-ignore
            // contribInfo: {
            //     suggestSelection: 'recentlyUsedByPrefix',
            // },

            mouseWheelZoom: this.isEmbedded,
            tabSize: 3,
            insertSpaces: true,
            detectIndentation: false,
            minimap: {
                enabled: this.showMinimap
            },
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto'
            },
            theme: "myCustomThemeDark",
            wrappingIndent: "same",
            // automaticLayout: true

        }
        );

        let keysWhichDontStopProgram = ["Arrow", "Page", "ControlLeft", "ControlRight"];

        this.editor.onKeyDown((e: monaco.IKeyboardEvent) => {
            let state = this.main.getInterpreter().scheduler.state;

            if ([SchedulerState.stopped, SchedulerState.error, SchedulerState.not_initialized].indexOf(state) < 0) {

                for(let kdp of keysWhichDontStopProgram){
                    if(e.code.indexOf(kdp) >= 0) return;
                }

                if(e.code == "KeyC" && e.ctrlKey ) return;

                this.main.getActionManager().trigger("interpreter.stop");
            }
        });

        let that: Editor = this;

        let mouseWheelListener = (event: WheelEvent) => {
            if (event.ctrlKey === true) {

                that.changeEditorFontSize(Math.sign(-event.deltaY), true);

                event.preventDefault();
            }
        };

        if (!this.isEmbedded) {

            let _main: Main = <Main><any>this.main;

            _main.windowStateManager.registerBackButtonListener((event: PopStateEvent) => {
                let historyEntry: HistoryEntry = <HistoryEntry>event.state;
                if(event.state == null) return;
                let workspace: Workspace = _main.workspaceList.find((ws) => ws.id == historyEntry.workspace_id);
                if(workspace == null) return;
                let file: File = workspace.findFileById(historyEntry.file_id);
                if(file == null) return; 

                // console.log("Processing pop state event, returning to module " + historyEntry.module_id);

                if(workspace != _main.getCurrentWorkspace()) 
                {
                    that.dontPushNextCursorMove++;
                    _main.projectExplorer.setWorkspaceActive(workspace);
                    that.dontPushNextCursorMove--;
                }
                if(file != _main.getCurrentWorkspace()?.getCurrentlyEditedFile()){
                    that.dontPushNextCursorMove++;
                    _main.projectExplorer.setFileActive(file);
                    that.dontPushNextCursorMove--;
                } 
                that.dontPushNextCursorMove++;
                that.editor.setPosition(historyEntry.position);
                that.editor.revealPosition(historyEntry.position);
                that.dontPushNextCursorMove--;
                that.pushHistoryState(true, historyEntry);
            });
        }

        // this.editor.onDidChangeConfiguration((event) => {
        //     if (event.hasChanged(monaco.editor.EditorOption.fontInfo) && this.isEmbedded) {

        //         this.main.getBottomDiv().errorManager.registerLightbulbOnClickFunctions();

        //     }
        // });

        this.editor.onDidChangeCursorPosition((event) => {

            let currentModelId = (<File | undefined>this.main.getCurrentWorkspace()?.getCurrentlyEditedFile())?.id;
            if(currentModelId == null) return;
            let pushNeeded = this.lastPosition == null
                || event.source == "api"
                || currentModelId != this.lastPosition.file_id
                || Math.abs(this.lastPosition.position.lineNumber - event.position.lineNumber) > 20;
            
            if(pushNeeded && this.dontPushNextCursorMove == 0){
                this.pushHistoryState(false, this.getPositionForHistory());
            } else if(currentModelId == history.state?.module_id){

                    this.pushHistoryState(true, this.getPositionForHistory());
            }

            that.onEvaluateSelectedText(event);

        });

        // We need this to set our model after user uses Strg+click on identifier
        this.editor.onDidChangeModel((event) => {

            let element: HTMLDivElement = <any>$element.find('.monaco-editor')[0];
            if(element != null){
                element.removeEventListener("wheel", mouseWheelListener);
                element.addEventListener("wheel", mouseWheelListener, { passive: false });
            }

            if (this.main.getCurrentWorkspace() == null) return;

            let currentlyEditedFile = <File | undefined>this.main.getCurrentWorkspace().getCurrentlyEditedFile();
            if (this.main instanceof Main && currentlyEditedFile != null) {

                this.main.projectExplorer.setActiveAfterExternalModelSet(currentlyEditedFile);

                let pushNeeded = this.lastPosition == null
                    || currentlyEditedFile.id != this.lastPosition.file_id;
                
                if(pushNeeded && this.dontPushNextCursorMove == 0){
                    this.pushHistoryState(false, this.getPositionForHistory());
                }    

            }

        });

        // If editor is instantiated before fonts are loaded then indentation-lines
        // are misplaced, see https://github.com/Microsoft/monaco-editor/issues/392
        // so:
        setTimeout(() => {
            monaco.editor.remeasureFonts();
        }, 2000);

        JavaAddEditorShortcuts.addActions(this.editor);

        this.editor.addAction({
            id: 'Debugger Goto',
            label: 'interpreter goto',

            // An optional array of keybindings for the action.
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],

            // A precondition for this action.
            precondition: undefined,

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: undefined,

            contextMenuGroupId: 'navigation',

            contextMenuOrder: 1.5,

            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convenience
            run: (ed) => {
                this.main.getActionManager().trigger("interpreter.goto", this.editor.getSelection().startLineNumber)
            }
        });

        // console.log(this.editor.getSupportedActions().map(a => a.id));

        return this.editor;
    }

    getPositionForHistory(): HistoryEntry {
        let file = <File | undefined>this.main.getCurrentWorkspace()?.getCurrentlyEditedFile();
        if(file == null) return;
        
        return {
            position: this.editor.getPosition(),
            workspace_id: (<Workspace>this.main.getCurrentWorkspace()).id,
            file_id: file.id
        }
    }

    lastPushTime: number = 0;
    pushHistoryState(replace: boolean, historyEntry: HistoryEntry){

        if(this.main.isEmbedded() || historyEntry == null) return;

        if(replace){
            history.replaceState(historyEntry, ""); //`Java-Online, ${module.file.name} (Zeile ${this.lastPosition.position.lineNumber}, Spalte ${this.lastPosition.position.column})`);
            // console.log("Replace History state with workspace-id: " + historyEntry.workspace_id + ", module-id: " + historyEntry.module_id);
        } else {
            let time = new Date().getTime();
            if(time - this.lastPushTime > 200){
                history.pushState(historyEntry, ""); //`Java-Online, ${module.file.name} (Zeile ${historyEntry.position.lineNumber}, Spalte ${historyEntry.position.column})`);
            } else {
                history.replaceState(historyEntry, "");
            }
            this.lastPushTime = time;
            // console.log("Pushed History state with workspace-id: " + historyEntry.workspace_id + ", module-id: " + historyEntry.module_id);
        }

        this.lastPosition = historyEntry;
    }

    lastTime: number = 0;
    setFontSize(fontSizePx: number) {

        // console.log("Set font size: " + fontSizePx);
        let time = new Date().getTime();
        if (time - this.lastTime < 150) return;
        this.lastTime = time;

        let editorfs = this.editor.getOptions().get(monaco.editor.EditorOption.fontSize);

        if (this.main instanceof Main) {
            this.main.viewModeController.saveFontSize(fontSizePx);
        }

        if (fontSizePx != editorfs) {
            this.editor.updateOptions({
                fontSize: fontSizePx
            });

            // editor does not set fontSizePx, but fontSizePx * zoomfactor with unknown zoom factor, so 
            // we have to do this dirty workaround:
            let newEditorfs = this.editor.getOptions().get(monaco.editor.EditorOption.fontSize);
            let factor = newEditorfs / fontSizePx;
            this.editor.updateOptions({
                fontSize: fontSizePx / factor
            });

            let bottomDiv1 = this.main.getBottomDiv();
            if (bottomDiv1 != null && bottomDiv1.console != null) {
                bottomDiv1.console.editor.updateOptions({
                    fontSize: fontSizePx / factor
                });
            }

        }

        let bottomDiv = this.main.getBottomDiv();
        if (bottomDiv != null && bottomDiv.console != null) {
            let $commandLine = bottomDiv.$bottomDiv.find('.jo_commandline');
            $commandLine.css({
                height: (fontSizePx * 1.1 + 4) + "px",
                "line-height": (fontSizePx * 1.1 + 4) + "px"
            })
            bottomDiv.console.editor.layout();
        }


        // let newEditorfs = this.editor.getOptions().get(monaco.editor.EditorOption.fontSize);

        // console.log({editorFS: editorfs, newFs: fontSizePx, newEditorFs: newEditorfs});


        jQuery('.jo_editorFontSize').css('font-size', fontSizePx + "px");
        jQuery('.jo_editorFontSize').css('line-height', (fontSizePx + 2) + "px");

        document.documentElement.style.setProperty('--breakpoint-size', fontSizePx + 'px');
        document.documentElement.style.setProperty('--breakpoint-radius', fontSizePx / 2 + 'px');

    }

    changeEditorFontSize(delta: number, dynamic: boolean = true) {
        let editorfs = this.editor.getOptions().get(monaco.editor.EditorOption.fontSize);

        if (dynamic) {
            if (editorfs < 10) {
                delta *= 1;
            } else if (editorfs < 20) {
                delta *= 2;
            } else {
                delta *= 4;
            }
        }

        let newEditorFs = editorfs + delta;
        if (newEditorFs >= 6 && newEditorFs <= 80) {
            this.setFontSize(newEditorFs);
        }
    }

    async onEvaluateSelectedText(event: monaco.editor.ICursorPositionChangedEvent) {

        let that = this;

        if (that.cw != null) {
            that.editor.removeContentWidget(that.cw);
            that.cw = null;
        }

        if (that.main.getInterpreter().scheduler.state == SchedulerState.paused) {

            let model = that.editor.getModel();
            let text = model.getValueInRange(that.editor.getSelection());
            if (text != null && text.length > 0) {
                let repl = this.main.getRepl();
                let result = repl.executeAsync(text, true);
                if (typeof result != "undefined") {

                    monaco.editor.colorize(text + ": ", 'myJava', { tabSize: 3 }).then((text) => {
                        if (text.endsWith("<br/>")) text = text.substr(0, text.length - 5);
                        that.cw = {
                            getId: function () {
                                return 'my.content.widget';
                            },
                            getDomNode: function () {
                                let dn = jQuery('<div class="jo_editorTooltip jo_codeFont">' + text + ": " + result + '</div>');
                                return dn[0];
                            },
                            getPosition: function () {
                                return {
                                    position: event.position,
                                    preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE, monaco.editor.ContentWidgetPositionPreference.BELOW]
                                };
                            }
                        };
                        that.editor.addContentWidget(that.cw);

                    });


                }
            }

        }


    }

    dontDetectLastChange() {
        // this.dontDetectLastChanging = true;
    }

}