import jQuery from 'jquery';
import { BreakpointManager } from '../../compiler/common/BreakpointManager.js';
import { Compiler } from '../../compiler/common/Compiler.js';
import { Debugger } from '../../compiler/common/debugger/Debugger.js';
import { Executable } from '../../compiler/common/Executable.js';
import { ActionManager } from '../../compiler/common/interpreter/ActionManager.js';
import { GraphicsManager } from '../../compiler/common/interpreter/GraphicsManager.js';
import { Interpreter } from '../../compiler/common/interpreter/Interpreter.js';
import { KeyboardManager } from '../../compiler/common/interpreter/KeyboardManager.js';
import { Language } from '../../compiler/common/Language.js';
import { EditorOpenerProvider } from '../../compiler/common/monacoproviders/EditorOpenerProvider.js';
import { ErrorMarker } from '../../compiler/common/monacoproviders/ErrorMarker.js';
import { ProgramPointerManager } from '../../compiler/common/monacoproviders/ProgramPointerManager.js';
import { IRange, Range } from '../../compiler/common/range/Range.js';
import { JavaLanguage } from '../../compiler/java/JavaLanguage.js';
import { JavaRepl } from '../../compiler/java/parser/repl/JavaRepl.js';
import { DatabaseNewLongPollingListener } from '../../tools/database/DatabaseNewLongPollingListener.js';
import { checkIfMousePresent, findGetParameter, getCookieValue } from "../../tools/HtmlTools.js";
import { ClassData, UserData, WorkspaceData, Workspaces } from "../communication/Data.js";
import { NetworkManager } from "../communication/NetworkManager.js";
import { PushClientManager } from '../communication/pushclient/PushClientManager.js';
import { SynchronizationManager } from "../repository/synchronize/RepositorySynchronizationManager.js";
import { RepositoryCheckoutManager } from "../repository/update/RepositoryCheckoutManager.js";
import { RepositoryCreateManager } from "../repository/update/RepositoryCreateManager.js";
import { RepositorySettingsManager } from "../repository/update/RepositorySettingsManager.js";
import { SpriteManager } from "../spritemanager/SpriteManager.js";
import { GUIFile } from '../workspace/File.js';
import { InconsistencyFixer } from "../workspace/InconsistencyFixer.js";
import { Workspace } from "../workspace/Workspace.js";
import { BottomDiv } from "./gui/BottomDiv.js";
import { Editor } from "./gui/Editor.js";
import { FileManager } from './gui/FileManager.js';
import { Helper } from "./gui/Helper.js";
import { InputManager } from './gui/InputManager.js';
import { MainMenu } from "./gui/MainMenu.js";
import { PrintManager } from './gui/PrintManager.js';
import { ProgramControlButtons } from './gui/ProgramControlButtons.js';
import { ProjectExplorer } from "./gui/ProjectExplorer.js";
import { RightDiv } from "./gui/RightDiv.js";
import { Sliders } from "./gui/Sliders.js";
import { TeacherExplorer } from "./gui/TeacherExplorer.js";
import { ThemeManager } from "./gui/ThemeManager.js";
import { ViewModeController } from "./gui/ViewModeController.js";
import { WindowStateManager } from "./gui/WindowStateManager.js";
import { Login } from "./Login.js";
import { MainBase } from "./MainBase.js";
import { PruefungManagerForStudents } from './pruefung/PruefungManagerForStudents.js';
import { CompilerFile } from '../../compiler/common/module/CompilerFile.js';
import { Disassembler } from '../../compiler/common/disassembler/Disassembler.js';
import { ExceptionMarker } from '../../compiler/common/interpreter/ExceptionMarker.js';
import { JUnitTestrunner } from '../../compiler/common/testrunner/JUnitTestrunner.js';
import { IPosition } from '../../compiler/common/range/Position.js';
import * as monaco from 'monaco-editor'
import { LanguageManager } from '../../tools/language/LanguageManager.js';
import { Settings } from '../settings/Settings.js';
import { TabletConsoleLog } from '../../tools/TabletConsoleLog.js';


export class Main implements MainBase {

    repositoryOn: boolean = true;
    workspaceList: Workspace[] = [];
    workspacesOwnerId: number;

    // monaco_editor: monaco.editor.IStandaloneCodeEditor;
    editor: Editor;
    currentWorkspace: Workspace;
    projectExplorer: ProjectExplorer;
    teacherExplorer: TeacherExplorer;
    networkManager: NetworkManager;
    actionManager: ActionManager;
    mainMenu: MainMenu;

    synchronizationManager: SynchronizationManager;
    repositoryCreateManager: RepositoryCreateManager;
    repositoryUpdateManager: RepositorySettingsManager;
    repositoryCheckoutManager: RepositoryCheckoutManager;

    pruefungManagerForStudents: PruefungManagerForStudents;

    spriteManager: SpriteManager;

    windowStateManager: WindowStateManager = new WindowStateManager(this);

    login: Login;

    debugger: Debugger;

    disassembler: Disassembler;

    bottomDiv: BottomDiv;

    user: UserData;
    gui_state_dirty: boolean = false;

    themeManager: ThemeManager;

    rightDiv: RightDiv;
    programControlButtons: ProgramControlButtons;

    debounceDiagramDrawing: any;

    viewModeController: ViewModeController;

    languagemanager: LanguageManager;

    language: Language;
    interpreter: Interpreter;

    settings: Settings;

    showFile(file?: CompilerFile): void {
        if (!file) return;
        this.projectExplorer.setFileActive(<GUIFile>file);
    }

    getDisassembler(): Disassembler | undefined {
        return this.disassembler;
    }

    addWorkspace(ws: Workspace): void {
        this.workspaceList.push(ws);
    }

    getInterpreter(): Interpreter {
        return this.interpreter;
    }

    getLanguage(): Language {
        return this.language;
    }

    getCompiler(): Compiler {
        return this.language.getCompiler(this);
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

    isEmbedded(): boolean { return false; }

    getDebugger(): Debugger {
        return this.debugger;
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

    setFileActive(file: GUIFile) {
        this.projectExplorer.setFileActive(file);
    }

    getSettings(): Settings {
        return this.settings;
    }

    startupBeforeLogin() {

        checkIfMousePresent();

        this.languagemanager = new LanguageManager(this, document.body);

        this.login = new Login(this);

        // let singleUseToken: string | undefined = getCookieValue("singleUseToken");
        let singleUseToken: string | undefined = findGetParameter("singleUseToken");

        if (singleUseToken) {
            this.login.initGUI();
            this.login.loginWithVidis(singleUseToken);
        } else {
            this.login.initGUI();
        }

    }

    startupAfterLogin() {

        this.actionManager = new ActionManager(null);
        this.actionManager.init();

        this.mainMenu = new MainMenu(this);
        this.projectExplorer = new ProjectExplorer(this, jQuery('#leftpanel>.jo_projectexplorer'));
        this.projectExplorer.initGUI();

        this.bottomDiv = new BottomDiv(this, jQuery('#bottomdiv-outer>.jo_bottomdiv-inner'), true, true, true, false);

        this.networkManager = new NetworkManager(this, this.bottomDiv.$updateTimer);

        this.rightDiv = new RightDiv(this, document.body, true);
        this.rightDiv.initGUI();

        //@ts-ignore
        window.UZIP = null; // needed by UPNG

        this.viewModeController = new ViewModeController(jQuery("#view-mode"), this);

        this.editor = new Editor(this, true, false);
        this.editor.initGUI(jQuery('#editor'));

        let that = this;
        jQuery(window).on('resize', (event) => {
            jQuery('#bottomdiv-outer').css('height', '150px');
            jQuery('#editor').css('height', (window.innerHeight - 150 - 30 - 2) + "px");
            that.editor.editor.layout();
            jQuery('#editor').css('height', "");

        });

        jQuery(window).trigger('resize');

        this.themeManager = new ThemeManager(<HTMLDivElement>jQuery('.joeCssFence')[0]);
        this.themeManager.switchTheme("dark");

        let breakpointManager = new BreakpointManager(this);
        this.debugger = new Debugger(<HTMLDivElement>jQuery('#leftpanel>.jo_debugger')[0], this);
        this.debugger.hide();
        let inputManager = new InputManager(jQuery('#rightdiv-inner .jo_run'), this);
        let printManager = new PrintManager(jQuery('#rightdiv-inner .jo_run'), this);
        let fileManager = new FileManager(this);
        let graphicsManager = new GraphicsManager(jQuery('#rightdiv-inner .jo_graphics')[0], <HTMLDivElement>jQuery('#rightdiv-inner .jo_coordinates')[0]);
        let keyboardManager = new KeyboardManager(jQuery(window), this);
        let programPointerManager = new ProgramPointerManager(this);
        let exceptionMarker = new ExceptionMarker(this);

        this.interpreter = new Interpreter(
            printManager, this.actionManager,
            graphicsManager, keyboardManager,
            breakpointManager, this.debugger,
            programPointerManager, inputManager,
            fileManager, exceptionMarker, this);

        let errorMarker = new ErrorMarker();

        /**
         * Compiler and Repl are fields of language!
        */
        this.language = JavaLanguage.registerMain(this, errorMarker);

        new JUnitTestrunner(this, this.bottomDiv.jUnitTab.bodyDiv);

        this.getCompiler().eventManager.on('compilationFinishedWithNewExecutable', this.onCompilationFinished, this);
        this.getCompiler().eventManager.on('compilationFinished', () => {
            this.getInterpreter()?.onFileSelected();
        }, this);
        // this.getCompiler().triggerCompile();

        this.disassembler = new Disassembler(this.bottomDiv.disassemblerTab.bodyDiv, this);

        this.programControlButtons = new ProgramControlButtons(jQuery('#controls'), this.interpreter, this.actionManager);

        new EditorOpenerProvider(this);

        this.getMainEditor().updateOptions({ readOnly: true });

        this.bottomDiv.initGUI();

        if (this.repositoryOn) {
            this.synchronizationManager = new SynchronizationManager(this);
            // this.synchronizationManager.initGUI();
            this.repositoryCreateManager = new RepositoryCreateManager(this);
            this.repositoryCreateManager.initGUI();
            this.repositoryUpdateManager = new RepositorySettingsManager(this);
            this.repositoryUpdateManager.initGUI();
            this.repositoryCheckoutManager = new RepositoryCheckoutManager(this);
            this.repositoryCheckoutManager.initGUI();

        }

        this.spriteManager = new SpriteManager(this);

        setTimeout(() => {
            this.getMainEditor().layout();

            let sliders = new Sliders(this);
            sliders.initSliders();

        }, 200);

        jQuery(window).on('unload', async function () {

            if (navigator.sendBeacon && that.user != null) {
                await that.networkManager.sendUpdatesAsync(false, true);
                that.interpreter.eventManager.fire("resetRuntime");

                DatabaseNewLongPollingListener.close();
                PushClientManager.getInstance().close();
            }

        });


        TabletConsoleLog.registerProvider((message) => { printManager.print(message, false, '#5050ff')});


    }

    initTeacherExplorer(classdata: ClassData[]) {
        if (this.teacherExplorer != null) {
            this.teacherExplorer.removePanels();
        }
        this.teacherExplorer = new TeacherExplorer(this, classdata);
        this.teacherExplorer.initGUI();
    }

    onCompilationFinished(executable: Executable | undefined): void {

        // this is the only time-critical task:
        this.interpreter.setExecutable(executable);

        // this can wait => give the main thread time to do its chores:
        setTimeout(() => {            
            let errors = this.bottomDiv?.errorManager?.showErrors(this.currentWorkspace);
            this.projectExplorer.renderErrorCount(this.currentWorkspace, errors);
            this.drawClassDiagrams(!this.rightDiv.isClassDiagramActive());
    
            for (let module of this.getCompiler().getAllModules()) {
                if (!(module.file instanceof GUIFile)) return;
                let model = module.file.getMonacoModel();
                if (!model) return;
                monaco.editor.setModelMarkers(model, "myJava", module.quickfixes);
            }
        }, 20);

    }


    drawClassDiagrams(onlyUpdateIdentifiers: boolean) {
        clearTimeout(this.debounceDiagramDrawing);
        this.debounceDiagramDrawing = setTimeout(() => {
            this.rightDiv?.classDiagram?.drawDiagram(this.currentWorkspace, onlyUpdateIdentifiers);
        }, 500);
    }

    removeWorkspace(w: Workspace) {
        this.workspaceList.splice(this.workspaceList.indexOf(w), 1);
    }

    restoreWorkspaces(workspaces: Workspaces, fixInconsistencies: boolean) {

        this.workspaceList = [];
        this.currentWorkspace = null;
        // this.monaco.setModel(monaco.editor.createModel("Keine Datei vorhanden." , "text"));
        this.getMainEditor().updateOptions({ readOnly: true });

        for (let ws of workspaces.workspaces) {

            let workspace: Workspace = Workspace.restoreFromData(ws, this);
            this.workspaceList.push(workspace);
            if (ws.id == this.user.currentWorkspace_id) {
                this.currentWorkspace = workspace;
            }
        }

        /**
         * Find inconsistencies and fix them
         */
        if (fixInconsistencies) {
            new InconsistencyFixer().start(this.workspaceList, this.networkManager, this);
        }

        this.projectExplorer.renderWorkspaces(this.workspaceList);

        if (this.currentWorkspace == null && this.workspaceList.length > 0) {
            this.currentWorkspace = this.workspaceList[0];
        }

        if (this.currentWorkspace != null) {
            this.projectExplorer.setWorkspaceActive(this.currentWorkspace, true);
        } else {
            this.projectExplorer.setFileActive(null);
        }

        if (this.workspaceList.length == 0) {

            Helper.showHelper("newWorkspaceHelper", this, jQuery(this.projectExplorer.workspaceTreeview.addFolderButton.parent));

        }

        if (!this.user.gui_state.helperHistory.folderButtonDone && this.projectExplorer.workspaceTreeview.size(true) > 5) {

            Helper.showHelper("folderButton", this, jQuery(this.projectExplorer.workspaceTreeview.addFolderButton.parent));

        } else
            if (Math.random() < 0.9) {
                Helper.showHelper("spritesheetHelper", this);
            }



    }

    restoreWorkspaceFromData(workspaceData: WorkspaceData): Workspace {
        return Workspace.restoreFromData(workspaceData, this);
    }

    getCurrentWorkspace(): Workspace {
        return this.currentWorkspace;
    }

    adjustWidthToWorld(): void {
        this.rightDiv.adjustWidthToWorld();
    }

    showJUnitDiv() {
        this.bottomDiv.showJunitTab();
    }

    showProgramPosition(file?: CompilerFile, positionOrRange?: IPosition | IRange, setCursor: boolean = true) {
        this.showFile(file);
        if (!positionOrRange) return;
        if (positionOrRange["startLineNumber"]) positionOrRange = Range.getStartPosition(<IRange>positionOrRange);
        if (setCursor) this.getMainEditor().setPosition(<IPosition>positionOrRange)
        this.getMainEditor().revealPositionInCenterIfOutsideViewport(<IPosition>positionOrRange);
        this.getMainEditor().focus();
    }

    markFilesAsStartable(files: GUIFile[], active: boolean) {
        this.projectExplorer.markFilesAsStartable(files, active);
    }

    onStartFileClicked(file: GUIFile) {
        this.interpreter.start(file);
    }

    hideDebugger(): void {
        this.debugger.hide();
        this.projectExplorer.show();
    }

    showDebugger(): void {
        this.debugger.show();
        this.projectExplorer.hide();
    }

}

