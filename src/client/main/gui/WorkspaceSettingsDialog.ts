import { JavaLibraryManager, LibraryData } from "../../../compiler/java/runtime/JavaLibraryManager.js";
import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { Dialog } from "./Dialog.js";
import { WorkspaceSettingsDialogMessages } from "./language/GUILanguage.js";



export class WorkspaceSettingsDialog{

    libraries: LibraryData[] = new JavaLibraryManager().libraries;

    constructor(private workspace: Workspace, private main: Main){

    }

    open(){
        let dialog = new Dialog();
        dialog.initAndOpen();
        dialog.heading(WorkspaceSettingsDialogMessages.workspaceSettings(this.workspace.name));
        dialog.subHeading(WorkspaceSettingsDialogMessages.usedLibraries());

        let currentLibraries = this.workspace.settings.libraries;

        for(let library of this.libraries){
            let cbs = dialog.addCheckbox(library.identifier + " (" + library.description + ")", currentLibraries.indexOf(library.id) >= 0, library.id);
            library.checkboxState = cbs;
        }

        dialog.buttons([
            {
                caption: WorkspaceSettingsDialogMessages.cancel(),
                color: "#a00000",
                callback: () => {dialog.close()}
            },
            {
                caption: WorkspaceSettingsDialogMessages.OK(),
                color: "green",
                callback: () => {
                    let changed: boolean = false;
                    let newLibs: string[] = [];
                    for(let lib of this.libraries){
                        let used = lib.checkboxState();
                        changed = changed || (used != (currentLibraries.indexOf(lib.id) >= 0));
                        if(used) newLibs.push(lib.id);
                    }

                    if(changed){
                        this.workspace.settings.libraries = newLibs;
                        this.workspace.saved = false;
                        this.workspace.getFiles().forEach(f => this.main.getCompiler().setFileDirty(f));   
                        this.main.getCompiler().triggerCompile();
                                             
                        this.workspace.setLibraries(this.main.getCompiler());
                        this.main.networkManager.sendUpdatesAsync(true);
                    }

                    dialog.close();
                }
            },
        ])


    }
}