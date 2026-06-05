import { ProgrammingLanguage } from "../../../compiler/common/programminglanguage/ProgrammingLanguage.js";
import { ProgrammingLanguageManager } from "../../../compiler/common/programminglanguage/ProgrammingLanguageManager.js";
import { getSelectedObject, setSelectItems } from "../../../tools/HtmlTools.js";
import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { Dialog } from "./Dialog.js";
import { WorkspaceSettingsDialogMessages } from "./language/GUILanguage.js";
import jQuery from 'jquery';


export class WorkspaceSettingsDialog {

    $libraryDiv: JQuery<HTMLDivElement>;
    dialog: Dialog;

    constructor(private workspace: Workspace, private main: Main) {

    }

    open() {
        let libraryManager = this.main.getCurrentProgrammingLanguage()?.getLibraryManager();
        if (!libraryManager) {
            console.error("Current programming language does not provide a library manager.");
            return;
        }

        let dialog = new Dialog();
        this.dialog = dialog;
        dialog.initAndOpen();
        dialog.heading(WorkspaceSettingsDialogMessages.workspaceSettings(this.workspace.name));

        let $selectLanguageDiv = jQuery("<div><span>Sprache: </span></div>");
        let $selectElement: JQuery<HTMLSelectElement> = jQuery('<select class="jo_settingsSelect"></select>');

        setSelectItems($selectElement, ProgrammingLanguageManager.getInstance()
        .getLanguagesSelection(this.main).map(
            l => ({ value: l.name, caption: l.getTranslatedName(), object: l })
        ), this.workspace.settings.language);


        $selectLanguageDiv.append($selectElement);

        dialog.addDiv($selectLanguageDiv);

        $selectElement.on('change', () => {
            let selectedLanguage = <ProgrammingLanguage>getSelectedObject($selectElement);
            this.workspace.settings.language = selectedLanguage.name;
            this.setupLibraryDiv();
        });

        this.$libraryDiv = jQuery("<div></div>");
        dialog.addDiv(this.$libraryDiv);

        this.setupLibraryDiv();


        this.dialog.buttons([
            {
                caption: WorkspaceSettingsDialogMessages.cancel(),
                color: "#a00000",
                callback: () => { this.dialog.close() }
            },
            {
                caption: WorkspaceSettingsDialogMessages.OK(),
                color: "green",
                callback: () => {
                    let currentLibraries = this.workspace.settings.libraries;

                    let librariesChanged: boolean = false;
                    let newLibs: string[] = [];
                    for (let lib of libraryManager.getLibrariesData()) {
                        let used = lib.checkboxState();
                        librariesChanged = librariesChanged || (used != (currentLibraries.indexOf(lib.id) >= 0));
                        if (used) newLibs.push(lib.id);
                    }

                    let selectedLanguage = <ProgrammingLanguage>getSelectedObject($selectElement);
                    let languageChanged = selectedLanguage != this.main.getCurrentProgrammingLanguage();

                    if (languageChanged) {
                        this.workspace.settings.language = selectedLanguage.name;
                        this.main.switchProgrammingLanguage(selectedLanguage.name);
                        if (!this.main.isEmbedded()) {
                            (<Main>this.main).projectExplorer.setWorkspaceActive(this.workspace);
                        }
                    }

                    if (librariesChanged) {
                        this.workspace.settings.libraries = newLibs;
                        this.workspace.saved = false;
                        this.workspace.getFiles().forEach(f => this.main.getCompiler().setFileDirty(f));
                        this.main.getCompiler().triggerCompile();

                        this.workspace.setLibraries(this.main.getCompiler());
                    }

                    if (languageChanged || librariesChanged) {
                        this.workspace.saved = false;
                        this.main.networkManager.sendUpdatesAsync(true);
                    }

                    dialog.close();
                }
            },
        ])


    }

    setupLibraryDiv() {
        this.$libraryDiv.empty();
        let libraryManager = ProgrammingLanguageManager.getInstance().getLanguageByName(this.workspace.settings.language).getLibraryManager();

        let currentLibraries = this.workspace.settings.libraries;

        if (libraryManager.getLibrariesData().length > 0) {
            this.$libraryDiv.append(jQuery('<div class="dialog-subheading languagesettings">' + WorkspaceSettingsDialogMessages.usedLibraries() + "</div>"));
            for (let library of libraryManager.getLibrariesData()) {
                let cbs = this.dialog.addCheckbox(library.identifier + " (" + library.description + ")", currentLibraries.indexOf(library.id) >= 0, library.id, this.$libraryDiv);
                library.checkboxState = cbs;
            }

        }


    }
}