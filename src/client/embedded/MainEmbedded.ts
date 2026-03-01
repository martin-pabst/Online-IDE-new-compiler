import jQuery from "jquery";
import { BreakpointManager } from "../../compiler/common/BreakpointManager.js";
import { Compiler } from "../../compiler/common/Compiler.js";
import { Debugger } from "../../compiler/common/debugger/Debugger.js";
import { Executable } from "../../compiler/common/Executable.js";
import { ActionManager } from "../../compiler/common/interpreter/ActionManager.js";
import { GraphicsManager } from "../../compiler/common/interpreter/GraphicsManager.js";
import { Interpreter } from "../../compiler/common/interpreter/Interpreter.js";
import { KeyboardManager } from "../../compiler/common/interpreter/KeyboardManager.js";
import { Language } from "../../compiler/common/Language.js";
import { CompilerWorkspace } from "../../compiler/common/module/CompilerWorkspace.js";
import { EditorOpenerProvider } from "../../compiler/common/monacoproviders/EditorOpenerProvider.js";
import { ErrorMarker } from "../../compiler/common/monacoproviders/ErrorMarker.js";
import { ProgramPointerManager } from "../../compiler/common/monacoproviders/ProgramPointerManager.js";
import { IRange, Range } from "../../compiler/common/range/Range.js";
import { JavaLanguage } from "../../compiler/java/JavaLanguage.js";
import { JavaRepl } from "../../compiler/java/parser/repl/JavaRepl.js";
import { downloadFile, findGetParameter, makeTabs, openContextMenu } from "../../tools/HtmlTools.js";
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
import { GUIFile } from "../workspace/File.js";
import { Workspace } from "../workspace/Workspace.js";
import { ExportedWorkspace, WorkspaceExporter } from "../workspace/WorkspaceImporterExporter.js";
import { EmbeddedFileExplorer } from "./EmbeddedFileExplorer.js";
import { EmbeddedIndexedDB } from "./EmbeddedIndexedDB.js";
import { Slider } from "../../tools/components/Slider.js";
import { JOScript } from "./EmbeddedStarter.js";
import { CompilerFile } from "../../compiler/common/module/CompilerFile.js";
import { Disassembler } from "../../compiler/common/disassembler/Disassembler.js";
import { ExceptionMarker } from "../../compiler/common/interpreter/ExceptionMarker.js";
import { IPosition } from "../../compiler/common/range/Position.js";
import { JUnitTestrunner } from "../../compiler/common/testrunner/JUnitTestrunner.js";
import * as monaco from 'monaco-editor'
import { OnlineIDEAccessImpl } from "./EmbeddedInterface.js";
import { Tab } from "../../tools/TabManager.js";
import { base64ToBytes } from "../../tools/Base64.js";
import { Settings } from "../settings/Settings.js";
import { EmbeddedFullpageController } from "./EmbeddedFullpageController.js";
import { SettingValues } from "../settings/SettingsMetadata.js";
import { SchedulerState } from "../../compiler/common/interpreter/SchedulerState.js";

/**
 * Configuration options for the Java Online IDE in embedded mode.
 * https://learnj.de/doku.php?id=onlineide:integration:start#bedeutung_der_konfigurationsparameter
 */
type JavaOnlineConfig = {
    withFileList?: boolean,
    withPCode?: boolean,
    withConsole?: boolean,
    withErrorList?: boolean,
    withBottomPanel?: boolean,
    withClassDiagram?: boolean,
    speed?: number | "max",
    id?: string,
    hideStartPanel?: boolean,
    hideEditor?: boolean,
    libraries?: string[],
    jsonFilename?: string,
    spritesheetURL?: string,
    enableFileAccess?: boolean,
    settings?: SettingValues,
    workspaceURLParameterName?: string,
    cacheUserEdits?: boolean,
    hideResetButton?: boolean,
    hideUnitTests?: boolean,
    hideWorkspaceFilesMng?: boolean,
    simplifyDebugger?: boolean
}

export class MainEmbedded implements MainBase {

    config: JavaOnlineConfig;

    editor: Editor;

    currentWorkspace: Workspace;
    actionManager: ActionManager;

    language: Language;

    interpreter: Interpreter;
    $runDiv: JQuery<HTMLElement>;

    debugger: Debugger;
    $debuggerDiv: JQuery<HTMLElement>;
    $alternativeDebuggerDiv: JQuery<HTMLElement>;

    bottomDiv: BottomDiv;
    $filesDiv: JQuery<HTMLDivElement>
    ListDiv: JQuery<HTMLElement>;
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

    settings: Settings;

    lastActiveFile?: GUIFile;

    horizontalSlider: Slider;
    verticalSlider: Slider;

    embeddedFullpageController: EmbeddedFullpageController;

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
        return this.bottomDiv?.console.editor;
    }

    getSettings(): Settings {
        let userSettings = this.config.settings || {};

        if (!this.settings) {
            this.settings = new Settings(undefined, userSettings, {}, {});
        }
        return this.settings;
    }

    onCompilationFinished(executable: Executable | undefined): void {
        this.interpreter.setExecutable(executable);

        if (this.bottomDiv && this.fileExplorer) {
            let errors = this.bottomDiv?.errorManager?.showErrors(this.currentWorkspace);
            this.fileExplorer.renderErrorCount(this.currentWorkspace, errors);
        }

        this.drawClassDiagrams(!this.rightDiv.isClassDiagramActive());

    }

    adjustWidthToWorld(): void {
        this.rightDiv.adjustWidthToWorld();
    }





    constructor(private $outerDiv: JQuery<HTMLElement>, private scriptList: JOScript[]) {

        this.readConfig($outerDiv);

        this.initGUI($outerDiv);

        this.initScripts().then(() => {

            this.currentWorkspace.setLibraries(this.getCompiler());

            this.loadUserSpritesheet().then(() => {
                if (!this.config.hideStartPanel) {
                    this.indexedDB = new EmbeddedIndexedDB();
                    this.indexedDB.open(() => {

                        if (this.config.id != null) {
                            this.readScripts(async () => {
                                if (this.fileExplorer) {
                                    this.getCompiler().setFiles(this.fileExplorer.getFiles());
                                    this.fileExplorer.selectFirstFileIfPresent();
                                }
                                if (this.fileExplorer == null) {
                                    let files = this.currentWorkspace.getFiles();
                                    this.getCompiler().setFiles(files);
                                    if (files.length > 0) {
                                        this.setFileActive(files[0]);
                                    }
                                }

                                this.readClassDiagram();

                                this.getCompiler().triggerCompile();

                            });
                        }

                        if (this.config.enableFileAccess) {
                            // Register the IDE in the map BEFORE assigning window.online_ide_access,
                            // so that the setter in index.js can call getIDE() and find this instance.
                            OnlineIDEAccessImpl.registerIDE(this);
                            //@ts-ignore
                            window.online_ide_access = new OnlineIDEAccessImpl();
                        }
                    });
                }
            });
        });

    }

    readClassDiagram() {
        if (!this.config.withClassDiagram) return;

        /*
         * In MainEmbedded.initGUI the classDiagram-Object is instantiated asynchroneously to wait for
         * DOM-Construction first:
         * setTimeout(() => {
         *       this.classDiagram = new ClassDiagram(jQuery(this.classDiagramTab.bodyDiv), this.main);
         *   }, 100);
         * Therefore it can't be guaranteed that this object exists yet. The dirty solution is to wait for
         * it (see below).
         * 
         * TODO: Find a better way to create the classDiagram-object!
         */

        let f = () => {
            if (this.rightDiv?.classDiagram) {
                this.indexedDB.getScript(this.config.id + "-classDiagram", (serializedClassDiagram) => {
                    if (serializedClassDiagram != null) {
                        this.rightDiv.classDiagram.clear();
                        this.rightDiv.classDiagram.deserialize(JSON.parse(serializedClassDiagram));
                        this.drawClassDiagrams(false);
                    }
                })
            } else {
                setTimeout(() => {
                    f();
                }, 300);
            }
        }

        f();
    }

    async tryLoadingWorkspaceFromURL() {
        if (!this.config.workspaceURLParameterName) return;
        let url = findGetParameter(this.config.workspaceURLParameterName);
        if (!url) return;

        try {
            let response = await fetch(url);
            let workspaces = await response.json();
            if (!Array.isArray(workspaces)) workspaces = [workspaces];
            let exportedWorkspace: ExportedWorkspace = workspaces[0];
            this.scriptList = exportedWorkspace.modules.map(mo => ({
                title: mo.name,
                text: mo.text
            })
            );
        } catch (error) {
            console.log("Error retreiving or converting data from URL " + url + " to json.")
            console.error(error);
            return
        }
    }

    async initScripts() {

        this.fileExplorer?.removeAllFiles();

        await this.tryLoadingWorkspaceFromURL();

        this.initWorkspace(this.scriptList);

        if (this.config.withFileList) {
            for (let file of this.currentWorkspace.getFiles()) {
                this.fileExplorer.addFile(file);
            }
            this.fileExplorer.selectFirstFileIfPresent();
        } else {
            this.setFileActive(this.currentWorkspace.getFirstFile());
        }

        this.getCompiler().triggerCompile();

    }


    readConfig($div: JQuery<HTMLElement>) {
        let configJson: string | object = $div.data("java-online");
        if (configJson != null && typeof configJson == "string") {
            this.config = JSON.parse(configJson.split("'").join('"'));
        } else {
            this.config = {}
        }

        if (typeof this.config.cacheUserEdits !== "boolean") {
            this.config.cacheUserEdits = true;
        }

        if (this.config.hideEditor == null) this.config.hideEditor = false;
        if (this.config.hideStartPanel == null) this.config.hideStartPanel = false;

        if (this.config.withBottomPanel == null) {
            this.config.withBottomPanel = this.config.withConsole || this.config.withPCode || this.config.withFileList || this.config.withErrorList;
        }

        if (this.config.hideEditor) {
            this.config.withBottomPanel = false;
            this.config.withClassDiagram = false;
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
        if (this.config.hideUnitTests == null) this.config.hideUnitTests = false;
        if (this.config.hideWorkspaceFilesMng == null) this.config.hideWorkspaceFilesMng = false;
        if (this.config.simplifyDebugger == null) this.config.simplifyDebugger = false;
        if (this.config.hideResetButton == null) this.config.hideResetButton = false;
    }

    setFileActive(file: GUIFile) {

        if (!file) return;

        if (this.lastActiveFile) {
            this.lastActiveFile.saveViewState(this.getMainEditor());
        }

        if (this.config.withFileList) {
            this.fileExplorer.markAsSelectedButDontInvokeCallback(file);
        }

        this.lastActiveFile = file;

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

        if (!this.config.cacheUserEdits){
            callback();
            return;
        }


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
                            that.showResetButton();

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

        let classDiagram = this.rightDiv?.classDiagram;
        if (classDiagram && classDiagram.dirty) {
            this.indexedDB.writeScript(this.config.id + "-classDiagram", JSON.stringify(classDiagram.serialize()));
            classDiagram.dirty = false;
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

        this.indexedDB.removeScript(this.config.id + "-classDiagram");

    }

    initWorkspace(scriptList: JOScript[]) {

        this.currentWorkspace = new Workspace("Embedded-Workspace", this, 0);
        this.currentWorkspace.settings.libraries = this.config.libraries;
        this.currentWorkspace.id = 0; // class diagram needs this

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
        let debuggerTabRef: Tab | undefined;
        let popoutHasDebugger = false;

        let that = this;

        if(!this.config.hideWorkspaceFilesMng) {
            let $buttonOpen = jQuery('<label type="file" class="img_open-file jo_button jo_active"' +
                'style="margin-right: 8px;" title="Workspace aus Datei laden"><input type="file" style="display:none"></label>');

            $buttonOpen.find('input').on('change', (event) => {
                //@ts-ignore
                var files: FileList = event.originalEvent.target.files;
                that.loadWorkspaceFromFile(files[0]);
            })

            let $buttonSave = jQuery('<div class="img_save-dark jo_button jo_active"' +
                'style="margin-right: 8px;" title="Workspace in Datei speichern"></div>');


            $buttonSave.on('click', () => { that.saveWorkspaceToFile() });

            $controlsDiv.append($buttonOpen, $buttonSave);
        }





        if (this.config.withBottomPanel) {
            let $bottomDiv = jQuery('<div class="joe_bottomDiv"></div>');
            $bottomDivInner.append($controlsDiv);

            $bottomDiv.append($bottomDivInner);
            if (this.config.withFileList) {
                this.$filesDiv = this.makeFilesDiv();
                $bottomDiv.prepend(this.$filesDiv);
                new Slider(this.$filesDiv[0], false, false, () => { });
                this.fileExplorer = new EmbeddedFileExplorer(this.$filesDiv, this);
            }
            makeTabs($bottomDivInner);

            $centerDiv.append($editorDiv, $bottomDiv);
            this.verticalSlider = new Slider($bottomDiv[0], true, true, () => { this.editor.editor.layout(); });
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

        if (!this.config.hideEditor && !this.config.withBottomPanel) {
            this.horizontalSlider = new Slider($rightDiv[0], true, false, () => {
                this.editor.editor.layout();
            });
        }

        this.actionManager = new ActionManager($div);
        this.actionManager.init();

        this.editor = new Editor(this, false, true);
        this.editor.initGUI(this.$monacoDiv);
        this.$monacoDiv.find('.monaco-editor').css('z-index', '10');

        if ($div.attr('tabindex') == null) $div.attr('tabindex', "0");

        if (this.config.withBottomPanel) {
            this.bottomDiv = new BottomDiv(this, $bottomDivInner, this.config.withConsole, this.config.withPCode, this.config.withErrorList, true);
            this.bottomDiv.initGUI();

            // Merge Ausgabe + Debugger tabs from rightDiv into the shared bottom tab section.
            if (this.rightDiv?.tabManager) {
                const rtm = this.rightDiv.tabManager;
                const btm = this.bottomDiv.tabManager;
                for (const tab of [...rtm.tabs]) {
                    btm.headingsDiv.insertBefore(tab.headingDiv, btm.tabheadingRightDiv);
                    btm.bodiesDiv.appendChild(tab.bodyDiv);
                    tab.tabManager = btm;
                    btm.tabs.push(tab);
                }
                rtm.tabs = [];
                // Ensure only one tab is highlighted (Fehler is the default shown tab).
                if (this.bottomDiv.errorManager?.tab) {
                    btm.setActive(this.bottomDiv.errorManager.tab);
                }
                debuggerTabRef = btm.tabs.find(t => t.bodyDiv.classList.contains('jo_variablesTab'));

                // Pop-out button: pops whichever tab is currently active out into a modal.
                {
                    const $popOutBtn = jQuery(`<button class="jo_output-popout-trigger" title="Aktiven Tab in Dialog öffnen"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="8,1 12,1 12,5"/><line x1="12" y1="1" x2="6" y2="7"/><polyline points="5,4 1,4 1,12 9,12 9,8"/></svg></button>`);
                    jQuery(btm.tabheadingRightDiv).append($popOutBtn[0]);

                    let popped = false;
                    let $popOverlay: JQuery<HTMLElement>;
                    let poppedTab: Tab | undefined;
                    let originalBodyParent: HTMLElement;
                    let poppedOutputTab: Tab | undefined;
                    let originalOutputBodyParent: HTMLElement | undefined;
                    let isConsoleSplitMode = false;
                    let poppedControlsDiv: HTMLElement | null = null;
                    let poppedControlsDivNextSibling: Node | null = null;
                    let poppedControlsDivParent: HTMLElement | null = null;

                    const closePopout = () => {
                        if (poppedTab && originalBodyParent) originalBodyParent.appendChild(poppedTab.bodyDiv);
                        if (poppedOutputTab && originalOutputBodyParent) {
                            originalOutputBodyParent.appendChild(poppedOutputTab.bodyDiv);
                            if (isConsoleSplitMode) {
                                // Re-enable the in-panel console+output split view.
                                jQuery(btm.bodiesDiv).addClass('jo_console-split');
                                if (poppedTab) poppedTab.bodyDiv.style.display = 'flex';
                                poppedOutputTab.bodyDiv.style.display = 'flex';
                            }
                            poppedOutputTab = undefined;
                            originalOutputBodyParent = undefined;
                            isConsoleSplitMode = false;
                        }
                        // Return the controls bar to its original location.
                        if (poppedControlsDiv && poppedControlsDivParent) {
                            poppedControlsDivParent.insertBefore(poppedControlsDiv, poppedControlsDivNextSibling);
                            poppedControlsDiv = null;
                            poppedControlsDivNextSibling = null;
                            poppedControlsDivParent = null;
                        }
                        popoutHasDebugger = false;
                        $popOverlay?.remove();
                        popped = false;
                        poppedTab = undefined;
                        $popOutBtn.attr('title', 'Aktiven Tab in Dialog öffnen');
                    };

                    const togglePopout = (evt?: Event) => {
                        if (evt) evt.stopPropagation();
                        if (!popped) {
                            const activeTab = btm.tabs.find(t => t.isActive());
                            if (!activeTab) return;
                            poppedTab = activeTab;
                            originalBodyParent = activeTab.bodyDiv.parentElement!;
                            const title = activeTab.headingDiv.textContent ?? '';
                            $popOverlay = jQuery('<div class="jo_output-popout-overlay"></div>');
                            const $popContent = jQuery('<div class="jo_output-popout-content joeCssFence"></div>');
                            const $title = jQuery(`<span>${title}</span>`);
                            const $close = jQuery('<button class="jo_output-popout-close" title="Schließen">✕</button>');
                            const $popHeader = jQuery('<div class="jo_output-popout-header"></div>');
                            $popHeader.append($title);
                            const splitOutputTab = this.rightDiv?.outputTab;
                            const isConsolePop = activeTab === this.bottomDiv.console?.tab && splitOutputTab;
                            const isDebuggerPop = activeTab.bodyDiv.classList.contains('jo_variablesTab') && splitOutputTab;
                            if (isConsolePop) {
                                isConsoleSplitMode = true;
                                poppedOutputTab = splitOutputTab;
                                originalOutputBodyParent = splitOutputTab!.bodyDiv.parentElement ?? undefined;
                                jQuery(btm.bodiesDiv).removeClass('jo_console-split');
                                const $split = jQuery('<div class="jo_popout-console-split"></div>');
                                $split.append(activeTab.bodyDiv, splitOutputTab!.bodyDiv);
                                $popHeader.append($close);
                                $popContent.append($popHeader, $split);
                                splitOutputTab!.bodyDiv.style.display = 'flex';
                            } else if (isDebuggerPop) {
                                // Move output left, debugger right; move entire control bar into header.
                                popoutHasDebugger = true;
                                poppedOutputTab = splitOutputTab;
                                originalOutputBodyParent = splitOutputTab!.bodyDiv.parentElement ?? undefined;
                                const cd = $controlsDiv[0];
                                poppedControlsDivParent = cd.parentElement;
                                poppedControlsDivNextSibling = cd.nextSibling;
                                poppedControlsDiv = cd;
                                const $btnGroup = jQuery('<div class="jo_popout-debug-controls"></div>');
                                $btnGroup.append(cd);
                                $popHeader.append($btnGroup, $close);
                                const $split = jQuery('<div class="jo_popout-console-split"></div>');
                                $split.append(splitOutputTab!.bodyDiv, activeTab.bodyDiv);
                                $popContent.append($popHeader, $split);
                                splitOutputTab!.bodyDiv.style.display = 'flex';
                            } else {
                                $popHeader.append($close);
                                $popContent.append($popHeader, activeTab.bodyDiv);
                            }
                            $popOverlay.append($popContent);
                            jQuery('body').append($popOverlay);
                            activeTab.bodyDiv.style.display = 'flex';
                            popped = true;
                            $popOutBtn.attr('title', 'Dialog schließen');
                            $popOverlay.on('pointerup', (ev) => { if (ev.target === $popOverlay[0]) closePopout(); });
                            $close.on('pointerup', (ev) => { ev.stopPropagation(); closePopout(); });
                        } else {
                            closePopout();
                        }
                    };

                    $popOutBtn.on('pointerup', (e) => togglePopout(e.originalEvent));
                }

                // Console + Ausgabe split view: when the Console tab is active,
                // show the Ausgabe (output) body side-by-side to its right.
                const consoleSplitTab = this.bottomDiv.console?.tab;
                const consoleSplitOutputTab = this.rightDiv?.outputTab;
                if (consoleSplitTab && consoleSplitOutputTab) {
                    const $bodiesDiv = jQuery(btm.bodiesDiv);

                    const enableSplit = () => {
                        $bodiesDiv.addClass('jo_console-split');
                        consoleSplitOutputTab.bodyDiv.style.display = 'flex';
                    };

                    const disableSplit = () => {
                        $bodiesDiv.removeClass('jo_console-split');
                        if (!consoleSplitOutputTab.isActive()) {
                            consoleSplitOutputTab.bodyDiv.style.display = 'none';
                        }
                    };

                    // Intercept setActive so any tab switch away from console cleans up the split.
                    const origSetActive = btm.setActive.bind(btm);
                    btm.setActive = (tab: Tab) => {
                        origSetActive(tab);
                        if (tab !== consoleSplitTab) disableSplit();
                    };

                    const prevConsoleOnShow = consoleSplitTab.onShow;
                    consoleSplitTab.onShow = () => {
                        if (prevConsoleOnShow) prevConsoleOnShow();
                        enableSplit();
                    };
                }
            }
            $rightDiv.hide();
        }

        let graphicsDiv = $div.find('.jo_graphics')[0];
        let coordinatesDiv = <HTMLDivElement>$div.find('.jo_coordinates')[0];

        this.debugger = new Debugger(<HTMLDivElement>this.$debuggerDiv[0], this);
        let breakpointManager = new BreakpointManager(this);
        let inputManager = new InputManager(this.$runDiv, this);
        let printManager = new PrintManager(this.$runDiv, this);
        let fileManager = new FileManager(this);

        let keyboardManager = new KeyboardManager(jQuery('html'), this);
        let programPointerManager = new ProgramPointerManager(this);

        this.interpreter = new Interpreter(
            printManager, this.actionManager,
            new GraphicsManager(graphicsDiv, coordinatesDiv), keyboardManager,
            breakpointManager, this.debugger,
            programPointerManager, inputManager,
            fileManager, new ExceptionMarker(this), this);



        /**
         * Compiler and Repl are fields of language!
        */
        let errorMarker = new ErrorMarker();
        this.language = JavaLanguage.registerMain(this, errorMarker);

        if (this.config.withBottomPanel && !this.config.hideUnitTests) {
            new JUnitTestrunner(this, this.bottomDiv.jUnitTab.bodyDiv);
        }

        this.getCompiler().eventManager.on("compilationFinishedWithNewExecutable", this.onCompilationFinished, this);

        // Manage tab focus on execution state changes.
        if (this.config.withBottomPanel) {
            this.interpreter.eventManager.on("stateChanged", (oldState, newState) => {
                if (oldState === newState) return;
                if (newState === SchedulerState.running) {
                    // Only jump to output on a fresh start (not when continuing from a breakpoint/step).
                    if (oldState === SchedulerState.paused) return;
                    if (this.bottomDiv.console?.tab?.isActive()) return;
                    if (!popoutHasDebugger) this.rightDiv?.outputTab?.show();
                } else if (newState === SchedulerState.paused) {
                    // Breakpoint hit or step completed — show the debugger tab.
                    if (!popoutHasDebugger) debuggerTabRef?.show();
                }
            }, this);
        }

        // this.getCompiler().triggerCompile();

        if (this.config.withBottomPanel && this.config.withPCode) {
            this.disassembler = new Disassembler(this.bottomDiv.disassemblerTab.bodyDiv, this);
        }

        this.programControlButtons = new ProgramControlButtons($controlsDiv, this.interpreter, this.actionManager, this.config.hideUnitTests, this.config.simplifyDebugger);

        new EditorOpenerProvider(this);

        let $infoButton = jQuery('<div class="jo_button jo_active img_ellipsis-dark" style="margin-left: 16px"></div>');
        $infoButton[0].title = 'Über die Online-IDE...';
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

        this.embeddedFullpageController = new EmbeddedFullpageController(this, this.$outerDiv[0], $controlsDiv[0]);
        // Hide the whole-window / fullscreen button — not needed in this embedding.
        this.embeddedFullpageController.primaryButton.divElement.style.display = 'none';

        setTimeout(() => {
            this.editor.editor.layout();
            this.programControlButtons.speedControl.setSpeedInStepsPerSecond(this.config.speed);
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

        this.$outerDiv.find(".joe_codeResetModalOK").on("click", async () => {

            await this.initScripts();
            this.currentWorkspace.getFiles().forEach(f => f.setSaved(true));
            this.deleteScriptsInDB();

            $window.hide();
            this.$resetButton.hide();
            this.compileRunsAfterCodeReset = 1;

        });

        return $window;
    }

    makeFilesDiv(): JQuery<HTMLDivElement> {


        let $filesDiv: JQuery<HTMLDivElement> = jQuery('<div class="joe_bottomDivFiles"></div>');

        return $filesDiv;
    }

    considerShowingCodeResetButton() {
        this.compileRunsAfterCodeReset++;
        if (this.compileRunsAfterCodeReset == 3) {
            this.$resetButton.fadeIn(1000);
        }
    }

    drawClassDiagrams(onlyUpdateIdentifiers: boolean) {
        clearTimeout(this.debounceDiagramDrawing);
        this.debounceDiagramDrawing = setTimeout(() => {
            this.rightDiv?.classDiagram?.drawDiagram(this.currentWorkspace, onlyUpdateIdentifiers);
        }, 500);
    }

    async saveWorkspaceToFile() {
        let filename: string = prompt("Bitte geben Sie den Dateinamen ein", this.config.jsonFilename);
        if (filename == null) {
            alert("Der Dateiname ist leer, daher wird nichts gespeichert.");
            return;
        }
        if (!filename.endsWith(".json")) filename = filename + ".json";
        let ws = this.currentWorkspace;
        let exportedWorkspace = await WorkspaceExporter.exportWorkspace(ws);
        downloadFile(exportedWorkspace, filename)
    }

    loadWorkspaceFromFile(file: globalThis.File) {
        let that = this;
        if (file == null) return;
        var reader = new FileReader();
        reader.onload = async (event) => {
            let text: string = <string>event.target.result;
            // if (!text.startsWith("{")) {
            //     alert(`<div>Das Format der Datei ${file.name} passt nicht.</div>`);
            //     return;
            // }

            let ew: ExportedWorkspace = JSON.parse(text);

            if (Array.isArray(ew)) {
                if (ew.length == 0) {
                    alert(`<div>Das Format der Datei ${file.name} passt nicht.</div>`);
                    return;
                }
                ew = ew[0];
            }

            if (ew.modules == null || ew.name == null || ew.settings == null) {
                alert(`<div>Das Format der Datei ${file.name} passt nicht.</div>`);
                return;
            }

            let ws: Workspace = new Workspace(ew.name, this, 0);
            ws.settings = ew.settings;
            ws.id = 0; // class diagram needs this

            for (let mo of ew.modules) {
                let f = new GUIFile(this, mo.name, mo.text);
                ws.addFile(f);
            }

            that.currentWorkspace = ws;

            if (ew.spritesheetBase64) {
                let zipFile = base64ToBytes(ew.spritesheetBase64);
                await new SpritesheetData().initializeSpritesheetForWorkspace(ws, this, zipFile);
            }

            if (that.fileExplorer != null) {
                that.fileExplorer.removeAllFiles();
                ws.getFiles().forEach(file => that.fileExplorer.addFile(file));
                that.fileExplorer.selectFirstFileIfPresent();
            } else {
                this.setFileActive(this.currentWorkspace.getFirstFile());
            }

            this.getCompiler().triggerCompile();

            that.saveScripts();

            this.showResetButton();

        };
        reader.readAsText(file);

    }

    showResetButton() {
        if(!this.config.hideResetButton) {
            this.$resetButton.fadeIn(1000);
        }
    }

    makeRightDiv(): JQuery<HTMLElement> {

        let $rightDiv = jQuery('<div class="joe_rightDiv"></div>');
        this.$rightDivInner = jQuery('<div class="joe_rightDivInner"></div>');
        $rightDiv.append(this.$rightDivInner);
        this.$outerDiv.append($rightDiv);

        this.rightDiv = new RightDiv(this, this.$outerDiv[0], this.config.withClassDiagram);
        this.rightDiv.initGUI();

        this.$debuggerDiv = jQuery(`<div class="joe_debuggerDiv"></div>`);
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

        if (!this.config.hideEditor) {
            let debuggerTab = new Tab('Debugger', ['jo_scrollable', 'jo_editorFontSize', 'jo_variablesTab']);
            this.rightDiv.tabManager.addTab(debuggerTab);

            let $vd = jQuery(debuggerTab.bodyDiv);


            this.$debuggerDiv.hide();
            $vd.append(this.$debuggerDiv, this.$alternativeDebuggerDiv);
        }

        this.$runDiv = jQuery(this.rightDiv.outputTab.bodyDiv);

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
        if(!this.config.hideUnitTests) {
            this.bottomDiv?.showJunitTab();
        }
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


