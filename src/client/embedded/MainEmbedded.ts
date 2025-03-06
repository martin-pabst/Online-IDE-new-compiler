import jQuery from "jquery";
import { BreakpointManager } from "../../compiler/common/BreakpointManager.js";
import { Compiler } from "../../compiler/common/language/Compiler.js";
import { Debugger } from "../../compiler/common/debugger/Debugger.js";
import { Executable } from "../../compiler/common/Executable.js";
import { ActionManager } from "../../compiler/common/interpreter/ActionManager.js";
import { GraphicsManager } from "../../compiler/common/interpreter/GraphicsManager.js";
import { Interpreter } from "../../compiler/common/interpreter/Interpreter.js";
import { KeyboardManager } from "../../compiler/common/interpreter/KeyboardManager.js";
import { Language } from "../../compiler/common/language/Language.js";
import { CompilerWorkspace } from "../../compiler/common/module/CompilerWorkspace.js";
import { EditorOpenerProvider } from "../../compiler/common/monacoproviders/EditorOpenerProvider.js";
import { ErrorMarker } from "../../compiler/common/monacoproviders/ErrorMarker.js";
import { ProgramPointerManager } from "../../compiler/common/monacoproviders/ProgramPointerManager.js";
import { IRange, Range } from "../../compiler/common/range/Range.js";
import { JavaLanguage } from "../../compiler/java/JavaLanguage.js";
import { JavaRepl } from "../../compiler/java/parser/repl/JavaRepl.js";
import { downloadFile, makeTabs, openContextMenu } from "../../tools/HtmlTools.js";
import { BottomDiv } from "../main/gui/BottomDiv.js";
import { Editor } from "../main/gui/Editor.js";
import { FileManager } from "../main/gui/FileManager.js";
import { FileTypeManager } from "../../compiler/common/module/FileTypeManager.js";
import { InputManager } from "../main/gui/InputManager.js";
import { PrintManager } from "../main/gui/PrintManager.js";
import { ProgramControlButtons } from "../main/gui/ProgramControlButtons.js";
import { RightDiv } from "../main/gui/RightDiv.js";
import { MainBase } from "../main/MainBase.js";
import { SpritesheetData } from "../spritemanager/SpritesheetData.js";
import { GUIFile } from "../workspace/GUIFile.js";
import { Workspace } from "../workspace/Workspace.js";
import { ExportedWorkspace, WorkspaceImporterExporter } from "../workspace/WorkspaceImporterExporter.js";
import { EmbeddedFileExplorer } from "./EmbeddedFileExplorer.js";
import { EmbeddedIndexedDB } from "./EmbeddedIndexedDB.js";
import { EmbeddedSlider } from "../../tools/components/EmbeddedSlider.js";
import { JOScript } from "./EmbeddedStarter.js";
import { CompilerFile } from "../../compiler/common/module/CompilerFile.js";
import { Disassembler } from "../../compiler/common/disassembler/Disassembler.js";
import { ExceptionMarker } from "../../compiler/common/interpreter/ExceptionMarker.js";
import { IPosition } from "../../compiler/common/range/Position.js";
import { JUnitTestrunner } from "../../compiler/common/testrunner/JUnitTestrunner.js";
import * as monaco from 'monaco-editor'
import { OnlineIDEAccessImpl } from "./EmbeddedInterface.js";


type JavaOnlineConfig = {
    withFileList?: boolean,
    withPCode?: boolean,
    withConsole?: boolean,
    withErrorList?: boolean,
    withBottomPanel?: boolean,
    speed?: number | "max",
    id?: string,
    hideStartPanel?: boolean,
    hideEditor?: boolean,
    libraries?: string[],
    jsonFilename?: string,
    spritesheetURL?: string,
    enableFileAccess?: boolean
}

export class MainEmbedded implements MainBase {

    config: JavaOnlineConfig;

    editor: Editor;

    currentWorkspace: Workspace;
    actionManager: ActionManager;

    language: Language;
    errorMarker: ErrorMarker;

    interpreter: Interpreter;
    $runDiv: JQuery<HTMLElement>;

    debugger: Debugger;
    $debuggerDiv: JQuery<HTMLElement>;
    $alternativeDebuggerDiv: JQuery<HTMLElement>;

    bottomDiv: BottomDiv;
    $filesListDiv: JQuery<HTMLElement>;
    $disassemblerDiv: JQuery<HTMLElement>;
    $junitDiv: JQuery<HTMLElement>;
    disassembler?: Disassembler;

    $hintDiv: JQuery<HTMLElement>;
    $monacoDiv: JQuery<HTMLElement>;
    $resetButton: JQuery<HTMLElement>;

    rightDiv: RightDiv;
    $rightDivInner: JQuery<HTMLElement>;

    fileExplorer: EmbeddedFileExplorer;

    debounceDiagramDrawing: any;

    indexedDB: EmbeddedIndexedDB;

    programControlButtons: ProgramControlButtons;

    breakpointManager: BreakpointManager;

    compileRunsAfterCodeReset: number = 0;

    isEmbedded(): boolean { return true; }

    getCompiler(): Compiler {
        return this.language.getCompiler(this);
    }
    getInterpreter(): Interpreter {
        return this.interpreter;
    }
    getCurrentWorkspace(): Workspace {
        return this.currentWorkspace;
    }
    getDebugger(): Debugger {
        return this.debugger;
    }
    getMonacoEditor(): monaco.editor.IStandaloneCodeEditor {
        return this.editor.editor;
    }

    getRightDiv(): RightDiv {
        return this.rightDiv;
    }

    getBottomDiv(): BottomDiv {
        return this.bottomDiv;
    }

    getActionManager(): ActionManager {
        return this.actionManager;
    }

    addWorkspace(ws: CompilerWorkspace): void {
        // not used
    }

    getLanguage(): Language {
        return this.language;
    }

    getRepl(): JavaRepl {
        return this.language?.getRepl(this);
    }

    getMainEditor(): monaco.editor.IStandaloneCodeEditor {
        return this.editor.editor;
    }

    getReplEditor(): monaco.editor.IStandaloneCodeEditor {
        return this.bottomDiv.console.editor;
    }

    onCompilationFinished(executable: Executable | undefined): void {
        this.interpreter.setExecutable(executable);

        for(let file of this.currentWorkspace.getFiles()){
            this.errorMarker.markErrorsOfFile(file);
        }
        
        if (this.bottomDiv && this.fileExplorer) {
            this.bottomDiv?.errorManager?.showErrors(this.currentWorkspace);
            this.fileExplorer.renderErrorCount(this.currentWorkspace);
        }

        for (let module of this.getCompiler().getAllModules()) {
            if (!(module.file instanceof GUIFile)) return;
            let model = module.file.getMonacoModel();
            if (!model) return;
            monaco.editor.setModelMarkers(model, "myJava", module.quickfixes);
        }

    }

    adjustWidthToWorld(): void {
        this.rightDiv.adjustWidthToWorld();
    }





    constructor(private $outerDiv: JQuery<HTMLElement>, private scriptList: JOScript[]) {

        this.readConfig($outerDiv);

        this.initGUI($outerDiv);

        this.initScripts();

        this.currentWorkspace.setLibraries(this.getCompiler());

        if (!this.config.hideStartPanel) {
            this.indexedDB = new EmbeddedIndexedDB();
            this.indexedDB.open(() => {

                if (this.config.id != null) {
                    this.readScripts(async () => {
                        if (this.fileExplorer) {
                            this.getCompiler().setFiles(this.fileExplorer.getFiles());
                            this.fileExplorer.setFirstFileActive();
                        }
                        if (this.fileExplorer == null) {
                            let files = this.currentWorkspace.getFiles();
                            this.getCompiler().setFiles(files);
                            if (files.length > 0) {
                                this.setFileActive(files[0]);
                            }
                        }
                        this.getLanguage().triggerCompile(this, false);

                    });
                }

                if (this.config.enableFileAccess) {
                    //@ts-ignore
                    window.online_ide_access = new OnlineIDEAccessImpl();
                    OnlineIDEAccessImpl.registerIDE(this);
                }
            });
        }


    }

    initScripts() {

        this.fileExplorer?.removeAllFiles();

        this.initWorkspace(this.scriptList);

        if (this.config.withFileList) {
            this.fileExplorer = new EmbeddedFileExplorer(this.currentWorkspace, this.$filesListDiv, this);
            this.fileExplorer.setFirstFileActive();
            this.scriptList.filter((script) => script.title.endsWith(".md")).forEach((script) => this.fileExplorer.addHint(script));
        } else {
            this.setFileActive(this.currentWorkspace.getFirstFile());
            this.getLanguage().triggerCompile(this, false);
        }

    }


    readConfig($div: JQuery<HTMLElement>) {
        let configJson: string | object = $div.data("java-online");
        if (configJson != null && typeof configJson == "string") {
            this.config = JSON.parse(configJson.split("'").join('"'));
        } else {
            this.config = {}
        }

        if (this.config.hideEditor == null) this.config.hideEditor = false;
        if (this.config.hideStartPanel == null) this.config.hideStartPanel = false;

        if (this.config.withBottomPanel == null) {
            this.config.withBottomPanel = this.config.withConsole || this.config.withPCode || this.config.withFileList || this.config.withErrorList;
        }

        if (this.config.hideEditor) {
            this.config.withBottomPanel = false;
            this.config.withFileList = false;
            this.config.withConsole = false;
            this.config.withPCode = false;
            this.config.withErrorList = false;
        }

        if (this.config.withBottomPanel) {
            if (this.config.withFileList == null) this.config.withFileList = true;
            if (this.config.withPCode == null) this.config.withPCode = true;
            if (this.config.withConsole == null) this.config.withConsole = true;
            if (this.config.withErrorList == null) this.config.withErrorList = true;
        }

        if (this.config.speed == null) this.config.speed = "max";
        if (this.config.libraries == null) this.config.libraries = [];
        if (this.config.jsonFilename == null) this.config.jsonFilename = "workspace.json";

    }

    setFileActive(file: GUIFile) {

        if (!file) return;

        if (this.config.withFileList) {
            this.fileExplorer.currentFileData?.file?.saveViewState(this.getMainEditor());
            this.fileExplorer.markFile(file);
        }


        /**
         * WICHTIG: Die Reihenfolge der beiden Operationen ist extrem wichtig.
         * Falls das Model im readonly-Zustand gesetzt wird, funktioniert <Strg + .>
         * nicht und die Lightbulbs werden nicht angezeigt, selbst dann, wenn
         * später readonly = false gesetzt wird.
         */
        this.getMainEditor().updateOptions({
            readOnly: false,
            lineNumbersMinChars: 4
        });

        try {
            this.editor.editor.setModel(file.getMonacoModel());
        } catch (e) {
            console.log("Catched!");
        }

        file.restoreViewState(this.getMainEditor());

        this.disassembler?.disassemble();

    }

    eraseDokuwikiSearchMarkup(text: string): string {
        return text.replace(/<span class="search\whit">(.*?)<\/span>/g, "$1");
    }

    readScripts(callback: () => void) {

        let files = this.currentWorkspace.getFiles();
        files.forEach(f => {
            f.getMonacoModel();
            f.setSaved(true);
        })

        let that = this;

        this.indexedDB.getScript(this.config.id, (scriptListJSon) => {
            if (scriptListJSon == null) {
                setTimeout(() => {
                    setInterval(() => {
                        that.saveScripts();
                    }, 1000);
                }, 2000);
                callback();
            } else {

                let scriptList: string[] = JSON.parse(scriptListJSon);
                let countDown = scriptList.length;

                for (let file of files.slice()) {
                    that.fileExplorer?.removeFile(file, false);  // calls MainEmbedded.removeFile subsequently
                }
                that.currentWorkspace.removeAllFiles();

                for (let name of scriptList) {

                    let scriptId = this.config.id + name;
                    this.indexedDB.getScript(scriptId, (script) => {
                        if (script != null) {

                            script = this.eraseDokuwikiSearchMarkup(script);

                            let file = new GUIFile(this, name, script);
                            file.getMonacoModel();
                            file.setSaved(true);

                            that.fileExplorer?.addFile(file);
                            that.currentWorkspace.addFile(file);
                            that.$resetButton.fadeIn(1000);

                            // console.log("Retrieving script " + scriptId);
                        }
                        countDown--;
                        if (countDown == 0) {
                            setInterval(() => {
                                that.saveScripts();
                            }, 1000);
                            callback();
                        }
                    })

                }

            }


        });


    }

    saveScripts() {

        let files = this.currentWorkspace.getFiles();

        let scriptList: string[] = [];
        let oneNotSaved: boolean = false;

        files.forEach(file => oneNotSaved = oneNotSaved || !file.isSaved());

        if (oneNotSaved) {

            for (let file of files) {
                scriptList.push(file.name);
                let scriptId = this.config.id + file.name;
                this.indexedDB.writeScript(scriptId, file.getText());
                file.setSaved(true);
                // console.log("Saving script " + scriptId);
            }

            this.indexedDB.writeScript(this.config.id, JSON.stringify(scriptList));
        }

    }

    deleteScriptsInDB() {
        this.indexedDB.getScript(this.config.id, (scriptListJSon) => {
            if (scriptListJSon == null) {
                return;
            } else {

                let scriptList: string[] = JSON.parse(scriptListJSon);

                for (let name of scriptList) {

                    let scriptId = this.config.id + name;
                    this.indexedDB.removeScript(scriptId);
                }

                this.indexedDB.removeScript(this.config.id);

            }


        });

    }

    initWorkspace(scriptList: JOScript[]) {
        this.currentWorkspace = new Workspace("Embedded-Workspace", this, 0);
        this.currentWorkspace.settings.libraries = this.config.libraries;

        let i = 0;
        for (let script of scriptList) {
            this.addFile(script);
        }

    }

    addFile(script: JOScript): GUIFile {
        let fileType = FileTypeManager.filenameToFileType(script.title);

        let file = new GUIFile(this, script.title, script.text);
        file.id = this.currentWorkspace.getFiles().length;

        this.currentWorkspace.addFile(file);

        let that = this;

        file.getMonacoModel().onDidChangeContent(() => {
            that.considerShowingCodeResetButton();
        });

        return file;
    }

    removeFile(file: GUIFile) {
        this.currentWorkspace.removeFile(file);
        this.getCompiler()?.triggerCompile();
    }


    initGUI($div: JQuery<HTMLElement>) {

        // let $leftDiv = jQuery('<div class="joe_leftDiv"></div>');

        $div.css({
            "background-image": "none",
            "background-size": "100%"
        })

        let $centerDiv = jQuery('<div class="joe_centerDiv"></div>');
        let $resetModalWindow = this.makeCodeResetModalWindow($div);

        let $rightDiv = this.makeRightDiv();

        let $editorDiv = jQuery('<div class="joe_editorDiv"></div>');
        this.$monacoDiv = jQuery('<div class="joe_monacoDiv"></div>');
        this.$hintDiv = jQuery('<div class="joe_hintDiv jo_scrollable"></div>');
        this.$resetButton = jQuery('<div class="joe_resetButton jo_button jo_active" title="Code auf Ausgangszustand zurücksetzen">Code Reset</div>');

        $editorDiv.append(this.$monacoDiv, this.$hintDiv, this.$resetButton);

        // let $bracketErrorDiv = this.makeBracketErrorDiv();
        // $editorDiv.append($bracketErrorDiv);

        this.$resetButton.hide();

        this.$resetButton.on("click", () => { $resetModalWindow.show(); })

        this.$hintDiv.hide();

        let $controlsDiv = jQuery('<div class="joe_controlsDiv"></div>');
        let $bottomDivInner = jQuery('<div class="joe_bottomDivInner"></div>');

        let $buttonOpen = jQuery('<label type="file" class="img_open-file jo_button jo_active"' +
            'style="margin-right: 8px;" title="Workspace aus Datei laden"><input type="file" style="display:none"></label>');

        let that = this;

        $buttonOpen.find('input').on('change', (event) => {
            //@ts-ignore
            var files: FileList = event.originalEvent.target.files;
            that.loadWorkspaceFromFile(files[0]);
        })

        let $buttonSave = jQuery('<div class="img_save-dark jo_button jo_active"' +
            'style="margin-right: 8px;" title="Workspace in Datei speichern"></div>');


        $buttonSave.on('click', () => { that.saveWorkspaceToFile() });

        $controlsDiv.append($buttonOpen, $buttonSave);



        if (this.config.withBottomPanel) {
            let $bottomDiv = jQuery('<div class="joe_bottomDiv"></div>');
            this.makeBottomDiv($bottomDivInner, $controlsDiv);
            $bottomDiv.append($bottomDivInner);
            if (this.config.withFileList) {
                let $filesDiv = this.makeFilesDiv();
                $bottomDiv.prepend($filesDiv);
                new EmbeddedSlider($filesDiv[0], false, false, () => { });
            }
            makeTabs($bottomDivInner);


            $centerDiv.append($editorDiv, $bottomDiv);
            new EmbeddedSlider($bottomDiv[0], true, true, () => { this.editor.editor.layout(); });
        } else {
            $centerDiv.prepend($editorDiv);
        }




        if (!this.config.withBottomPanel) {
            if (this.config.hideEditor) {
                $rightDiv.prepend($controlsDiv);
            } else {
                $centerDiv.prepend($controlsDiv);
                $controlsDiv.addClass('joe_controlPanel_top');
                $editorDiv.css({
                    'position': 'relative',
                    'height': '1px'
                });
            }
        }

        $div.addClass('joe_javaOnlineDiv');
        $div.append($centerDiv, $rightDiv);

        if (!this.config.hideEditor) {
            new EmbeddedSlider($rightDiv[0], true, false, () => {
                this.editor.editor.layout();
            });
        }

        this.actionManager = new ActionManager($div);
        this.actionManager.init();

        this.editor = new Editor(this, false, true);
        this.editor.initGUI(this.$monacoDiv);
        this.$monacoDiv.find('.monaco-editor').css('z-index', '10');

        if ($div.attr('tabindex') == null) $div.attr('tabindex', "0");

        this.bottomDiv = new BottomDiv(this, $bottomDivInner, $div);
        this.bottomDiv.initGUI();

        this.rightDiv = new RightDiv(this, this.$rightDivInner);
        this.rightDiv.initGUI();

        let $rightSideContainer = jQuery('<div class="jo_rightdiv-rightside-container">');
        let $coordinates = jQuery('<div class="jo_coordinates">(0/0)</div>');
        this.$rightDivInner.append($rightSideContainer);
        $rightSideContainer.append($coordinates);

        let graphicsDiv = this.$runDiv.find('.jo_graphics')[0]!;



        this.debugger = new Debugger(<HTMLDivElement>this.$debuggerDiv[0], this);
        let breakpointManager = new BreakpointManager(this);
        let inputManager = new InputManager(this.$runDiv, this);
        let printManager = new PrintManager(this.$runDiv, this);
        let fileManager = new FileManager(this);

        let keyboardManager = new KeyboardManager(jQuery('html'), this);
        let programPointerManager = new ProgramPointerManager(this);

        this.interpreter = new Interpreter(
            printManager, this.actionManager,
            new GraphicsManager(graphicsDiv), keyboardManager,
            breakpointManager, this.debugger,
            programPointerManager, inputManager,
            fileManager, new ExceptionMarker(this), this);



        /**
         * Compiler and Repl are fields of language!
        */
        this.errorMarker = new ErrorMarker();
        this.language = JavaLanguage.registerMain(this);

        if (this.$junitDiv) {
            new JUnitTestrunner(this, this.$junitDiv[0]);
        }

        this.getCompiler().eventManager.on("compilationFinishedWithNewExecutable", this.onCompilationFinished, this);

        this.getLanguage().triggerCompile(this, false);

        if (this.config.withPCode) {
            this.disassembler = new Disassembler(this.$disassemblerDiv[0], this);
        }

        this.programControlButtons = new ProgramControlButtons($controlsDiv, this.interpreter, this.actionManager);

        new EditorOpenerProvider(this);

        let $infoButton = jQuery('<div class="jo_button jo_active img_ellipsis-dark" style="margin-left: 16px"></div>');
        $controlsDiv.append($infoButton);

        $infoButton.on('mousedown', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            openContextMenu([{
                caption: "Über die Online-IDE ...",
                link: "https://www.online-ide.de",
                callback: () => {
                    // nothing to do.
                }
            }], ev.pageX + 2, ev.pageY + 2);
        });

        setTimeout(() => {
            this.editor.editor.layout();
            this.loadUserSpritesheet().then(() => {
                this.programControlButtons.speedControl.setSpeedInStepsPerSecond(this.config.speed);
            });
        }, 200);

        if (this.config.hideEditor) {
            $centerDiv.hide();
            $rightDiv.css("flex", "1");
            if (!this.config.hideStartPanel) {
                $div.find(".joe_rightDivInner").css('height', 'calc(100% - 24px)');
                $div.find(".joe_controlsDiv").css('padding', '2px');
                $div.find(".jo_speedcontrol-outer").css('z-index', '10');
            } else {
                $div.find(".joe_controlsDiv").hide();
            }
        }

        // this.interpreter.eventManager.on("stateChanged", (oldState: SchedulerState, newState: SchedulerState) => {
        //     if (newState == SchedulerState.paused) {
        //         this.$debuggerDiv.show();
        //         this.$alternativeDebuggerDiv.hide();
        //         return;
        //     } else if (!(oldState == SchedulerState.paused && newState == SchedulerState.running)) {
        //         this.$debuggerDiv.hide();
        //         this.$alternativeDebuggerDiv.show();
        //     }
        // })

    }

    hideDebugger() {
        this.$debuggerDiv.hide();
        this.$alternativeDebuggerDiv.show();
    }

    showDebugger() {
        this.$debuggerDiv.show();
        this.$alternativeDebuggerDiv.hide();
    }

    // makeBracketErrorDiv(): JQuery<HTMLElement> {
    //     return jQuery(`
    //     <div class="jo_parenthesis_warning" title="Klammerwarnung!" style="bottom: 55px">
    //     <div class="jo_warning_light"></div>
    //     <div class="jo_pw_heading">{ }</div>
    //     <div title="Letzten Schritt rückgängig"
    //         class="jo_pw_undo img_undo jo_button jo_active"></div>
    //     </div>
    //     `);
    // }

    makeCodeResetModalWindow($parent: JQuery<HTMLElement>): JQuery<HTMLElement> {
        let $window = jQuery(
            `
            <div class="joe_codeResetModal">
            <div style="flex: 1"></div>
            <div style="display: flex">
                <div style="flex: 1"></div>
                <div style="padding-left: 30px;">
                <div style="color: red; margin-bottom: 10px; font-weight: bold">Warnung:</div>
                <div>Soll der Code wirklich auf den Ausgangszustand zurückgesetzt werden?</div>
                <div>Alle von Dir gemachten Änderungen werden damit verworfen.</div>
                </div>
                <div style="flex: 1"></div>
            </div>
            <div class="joe_codeResetModalButtons">
            <div class="joe_codeResetModalCancel jo_button jo_active">Abbrechen</div>
            <div class="joe_codeResetModalOK jo_button jo_active">OK</div>
            </div>
            <div style="flex: 2"></div>
            </div>
        `
        );

        $window.hide();

        $parent.append($window);

        this.$outerDiv.find(".joe_codeResetModalCancel").on("click", () => {
            $window.hide();
        });

        this.$outerDiv.find(".joe_codeResetModalOK").on("click", () => {

            this.initScripts();
            this.currentWorkspace.getFiles().forEach(f => f.setSaved(true));
            this.deleteScriptsInDB();

            $window.hide();
            this.$resetButton.hide();
            this.compileRunsAfterCodeReset = 1;

        });

        return $window;
    }

    makeFilesDiv(): JQuery<HTMLElement> {


        let $filesDiv = jQuery('<div class="joe_bottomDivFiles jo_scrollable"></div>');

        let $filesHeader = jQuery('<div class="joe_filesHeader jo_tabheading jo_active"  style="line-height: 24px">Programmdateien</div>');

        this.$filesListDiv = jQuery('<div class="joe_filesList jo_scrollable"></div>');
        // for (let index = 0; index < 20; index++) {
        //     let $file = jQuery('<div class="jo_file jo_java"><div class="jo_fileimage"></div><div class="jo_filename"></div></div></div>');
        //     $filesList.append($file);
        // }

        $filesDiv.append($filesHeader, this.$filesListDiv);

        return $filesDiv;
    }

    considerShowingCodeResetButton() {
        this.compileRunsAfterCodeReset++;
        if (this.compileRunsAfterCodeReset == 3) {
            this.$resetButton.fadeIn(1000);
        }
    }

    drawClassDiagrams(onlyUpdateIdentifiers: boolean) {
        // clearTimeout(this.debounceDiagramDrawing);
        // this.debounceDiagramDrawing = setTimeout(() => {
        //     this.rightDiv?.classDiagram?.drawDiagram(this.currentWorkspace, onlyUpdateIdentifiers);
        // }, 500);
    }

    saveWorkspaceToFile() {
        let filename: string = prompt("Bitte geben Sie den Dateinamen ein", this.config.jsonFilename);
        if (filename == null) {
            alert("Der Dateiname ist leer, daher wird nichts gespeichert.");
            return;
        }
        if (!filename.endsWith(".json")) filename = filename + ".json";
        let ws = this.currentWorkspace;
        let name: string = ws.name.replace(/\//g, "_");
        downloadFile(WorkspaceImporterExporter.exportWorkspace(ws), filename)
    }


    makeBottomDiv($bottomDiv: JQuery<HTMLElement>, $buttonDiv: JQuery<HTMLElement>) {

        let $tabheadings = jQuery('<div class="jo_tabheadings"></div>');
        $tabheadings.css('position', 'relative');
        let $thRightSide = jQuery('<div class="joe_tabheading-right jo_noHeading"></div>');

        $thRightSide.append($buttonDiv);

        if (this.config.withConsole) {
            let $thConsoleClear = jQuery('<div class="img_clear-dark jo_button jo_active jo_console-clear"' +
                'style="display: none; margin-left: 8px;" title="Console leeren"></div>');
            $thRightSide.append($thConsoleClear);
            let $thConsoleCopy = jQuery('<div class="img_copy-dark jo_button jo_active jo_console-copy"' +
                'style="display: none; margin-left: 8px;" title="Anweisungen aus der Console in die Zwischenablage kopieren"></div>');
            $thRightSide.append($thConsoleCopy);
        }

        if (this.config.withErrorList) {
            let $thErrors = jQuery('<div class="jo_tabheading jo_active" data-target="jo_errorsTab" style="line-height: 24px">Fehler</div>');
            $tabheadings.append($thErrors);
        }


        if (this.config.withConsole) {
            let $thConsole = jQuery('<div class="jo_tabheading jo_console-tab" data-target="jo_consoleTab" style="line-height: 24px">Console</div>');
            $tabheadings.append($thConsole);
        }

        if (this.config.withPCode) {
            let $thPCode = jQuery('<div class="jo_tabheading" data-target="jo_pcodeTab" style="line-height: 24px">Disassembler </div>');
            $tabheadings.append($thPCode);
        }

        let $thJunit = jQuery('<div class="jo_tabheading jo_testrunnerTabheading" data-target="jo_junitTab" style="line-height: 24px">Testrunner </div>');
        $tabheadings.append($thJunit);


        $tabheadings.append($thRightSide);

        $bottomDiv.append($tabheadings);

        let $tabs = jQuery('<div class="jo_tabs jo_scrollable"></div>');

        if (this.config.withErrorList) {
            let $tabError = jQuery('<div class="jo_active jo_scrollable jo_errorsTab"></div>');
            $tabs.append($tabError);
        }

        if (this.config.withConsole) {
            let $tabConsole = jQuery(
                `
        <div class="jo_editorFontSize jo_consoleTab">
        <div class="jo_console-inner">
            <div class="jo_scrollable jo_console-top"></div>
            <div class="jo_commandline"></div>
        </div>
        </div>
    `);

            $tabs.append($tabConsole);
        }

        if (this.config.withPCode) {
            this.$disassemblerDiv = jQuery('<div class="jo_scrollable jo_pcodeTab"></div>');
            $tabs.append(this.$disassemblerDiv);
        }

        this.$junitDiv = jQuery('<div class="jo_scrollable jo_junitTab"></div>');
        $tabs.append(this.$junitDiv);


        $bottomDiv.append($tabs);

    }

    loadWorkspaceFromFile(file: globalThis.File) {
        let that = this;
        if (file == null) return;
        var reader = new FileReader();
        reader.onload = (event) => {
            let text: string = <string>event.target.result;
            if (!text.startsWith("{")) {
                alert(`<div>Das Format der Datei ${file.name} passt nicht.</div>`);
                return;
            }

            let ew: ExportedWorkspace = JSON.parse(text);

            if (ew.modules == null || ew.name == null || ew.settings == null) {
                alert(`<div>Das Format der Datei ${file.name} passt nicht.</div>`);
                return;
            }

            let ws: Workspace = new Workspace(ew.name, this, 0);
            ws.settings = ew.settings;

            for (let mo of ew.modules) {
                let f = new GUIFile(this, mo.name, mo.text);
                ws.addFile(f);
            }

            that.currentWorkspace = ws;

            if (that.fileExplorer != null) {
                that.fileExplorer.removeAllFiles();
                ws.getFiles().forEach(file => that.fileExplorer.addFile(file));
                that.fileExplorer.setFirstFileActive();
            } else {
                this.setFileActive(this.currentWorkspace.getFirstFile());
            }

            this.getLanguage().triggerCompile(this, false);

            that.saveScripts();

        };
        reader.readAsText(file);

    }

    makeRightDiv(): JQuery<HTMLElement> {

        let $rightDiv = jQuery('<div class="joe_rightDiv"></div>');
        this.$rightDivInner = jQuery('<div class="joe_rightDivInner"></div>');
        $rightDiv.append(this.$rightDivInner);

        this.$debuggerDiv = jQuery('<div class="joe_debuggerDiv"></div>');
        this.$runDiv = jQuery(
            `
            <div class="jo_tab jo_active jo_run">
            <div class="jo_run-programend">Programm beendet</div>
            <div class="jo_run-input">
            <div>
            <div>
        <div class="jo_run-input-message" class="jo_rix">Bitte geben Sie eine Zahl ein!</div>
        <input class="jo_run-input-input" type="text" class="jo_rix">
        <div class="jo_run-input-button-outer" class="jo_rix">
        <div class="jo_run-input-button" class="jo_rix">OK</div>
        </div>

        <div class="jo_run-input-error" class="jo_rix"></div>
    </div>
    </div>
    </div>
    <div class="jo_run-inner">
    <div class="jo_graphics"></div>
    <div class="jo_output jo_scrollable"></div>
    </div>

    </div>

    `);


        if (!this.config.hideEditor) {
            let $tabheadings = jQuery('<div class="jo_tabheadings"></div>');
            $tabheadings.css('position', 'relative');
            let $thRun = jQuery('<div class="jo_tabheading jo_active" data-target="jo_run" style="line-height: 24px">Ausgabe</div>');
            let $thVariables = jQuery('<div class="jo_tabheading jo_console-tab" data-target="jo_variablesTab" style="line-height: 24px">Variablen</div>');
            $tabheadings.append($thRun, $thVariables);
            this.$rightDivInner.append($tabheadings);
            let $vd = jQuery('<div class="jo_scrollable jo_editorFontSize jo_variablesTab"></div>');

            this.$alternativeDebuggerDiv = jQuery(`
            <div class="jo_alternativeText jo_scrollable">
            <div style="font-weight: bold">Tipp:</div>
            Die Variablen sind nur dann sichtbar, wenn das Programm
            <ul>
            <li>im Einzelschrittmodus ausgeführt wird(Klick auf <span class="img_step-over-dark jo_inline-image"></span>),</li>
            <li>an einem Breakpoint hält (Setzen eines Breakpoints mit Mausklick links neben den Zeilennummern und anschließendes Starten des Programms mit
                <span class="img_start-dark jo_inline-image"></span>) oder </li>
                <li>in sehr niedriger Geschwindigkeit ausgeführt wird (weniger als 10 Schritte/s).
                </ul>
                </div>
                `);

            this.$debuggerDiv.hide();
            $vd.append(this.$debuggerDiv, this.$alternativeDebuggerDiv);
            let $tabs = jQuery('<div class="jo_tabs jo_scrollable"></div>');
            $tabs.append(this.$runDiv, $vd);
            this.$rightDivInner.append($tabs);
            makeTabs($rightDiv);
        } else {
            this.$rightDivInner.append(this.$runDiv);
        }

        return $rightDiv;
    }

    async loadUserSpritesheet() {
        if (this.config.spritesheetURL != null) {

            let spritesheet = new SpritesheetData();

            await spritesheet.initializeSpritesheetForWorkspace(this.currentWorkspace, this, this.config.spritesheetURL);

        }
    }

    showFile(file?: CompilerFile): void {
        if (!file) return;
        this.fileExplorer?.selectFile(<GUIFile>file, false);
    }

    getDisassembler(): Disassembler | undefined {
        return this.disassembler;
    }

    showJUnitDiv(): void {
        this.bottomDiv?.showJunitTab();
    }

    showProgramPosition(file?: CompilerFile, positionOrRange?: IPosition | IRange, setCursor: boolean = true) {
        this.showFile(file);
        if (!positionOrRange) return;
        if (positionOrRange["startLineNumber"]) positionOrRange = Range.getStartPosition(<IRange>positionOrRange);
        if (setCursor) this.getMainEditor().setPosition(<IPosition>positionOrRange);
        this.getMainEditor().revealPositionInCenterIfOutsideViewport(<IPosition>positionOrRange);
        this.getMainEditor().focus();
    }


    markFilesAsStartable(files: GUIFile[], active: boolean) {
        this.fileExplorer?.markFilesAsStartable(files, active);
    }

    onStartFileClicked(file: GUIFile) {
        this.interpreter.start(file);
    }

}


