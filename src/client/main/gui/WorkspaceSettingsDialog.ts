import { ProgrammingLanguage } from "../../../compiler/common/programminglanguage/ProgrammingLanguage.js";
import { ProgrammingLanguageManager } from "../../../compiler/common/programminglanguage/ProgrammingLanguageManager.js";
import { getSelectedObject, setSelectItems } from "../../../tools/HtmlTools.js";
import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { Dialog } from "./Dialog.js";
import { WorkspaceSettingsDialogMessages } from "./language/GUILanguage.js";
import jQuery from 'jquery';


export class WorkspaceSettingsDialog {

    $langueSpecificDiv: JQuery<HTMLDivElement>;
    dialog: Dialog;

    resolveWenClosing: () => void;

    constructor(private workspace: Workspace, private main: Main) {

    }

    open(): Promise<void> {
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
        this.$langueSpecificDiv = jQuery("<div></div>");
        dialog.addDiv(this.$langueSpecificDiv);

        $selectElement.on('change', () => {
            let selectedLanguage = <ProgrammingLanguage>getSelectedObject($selectElement);
            this.workspace.settings.language = selectedLanguage.name;
            this.$langueSpecificDiv.empty();
            this.setupLanguageSpecificDiv();
        });


        this.setupLanguageSpecificDiv();


        this.dialog.buttons([
            {
                caption: WorkspaceSettingsDialogMessages.cancel(),
                color: "#a00000",
                callback: () => { this.close() }
            },
            {
                caption: WorkspaceSettingsDialogMessages.OK(),
                color: "green",
                callback: () => {

                    let selectedLanguage = <ProgrammingLanguage>getSelectedObject($selectElement);
                    let languageChanged = selectedLanguage != this.main.getCurrentProgrammingLanguage();

                    let workspaceSettingsChanged = selectedLanguage.retrieveWorkspaceSettings(this.main, this.$langueSpecificDiv[0], this.workspace);

                    if (languageChanged) {
                        this.workspace.settings.language = selectedLanguage.name;
                        this.main.switchProgrammingLanguage(selectedLanguage.name);
                        if (!this.main.isEmbedded()) {
                            (<Main>this.main).projectExplorer.setWorkspaceActive(this.workspace);
                        }
                    }

                    if (languageChanged || workspaceSettingsChanged) {
                        this.workspace.saved = false;
                        this.main.networkManager.sendUpdatesAsync(true);
                    }

                    this.close();
                }
            },
        ])

        return new Promise<void>((resolve) => {
            this.resolveWenClosing = resolve;
        });

    }

    close(){
        this.dialog.close();
        if(this.resolveWenClosing) this.resolveWenClosing();
    }

    setupLanguageSpecificDiv() {
        this.$langueSpecificDiv.empty();
        let languageName = this.workspace.settings.language;
        let language = ProgrammingLanguageManager.getInstance().getLanguageByName(languageName);
        language.setupWorkspaceSettings(this.dialog, this.main, this.$langueSpecificDiv[0], this.workspace);
    }
}