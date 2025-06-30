import { IMain } from "../../../compiler/common/IMain.js";
import { base64ToBytes } from "../../../tools/Base64.js";
import { SpriteManager } from "../../spritemanager/SpriteManager.js";
import { SpritesheetData } from "../../spritemanager/SpritesheetData.js";
import { GUIFile } from "../../workspace/File.js";
import { Workspace } from "../../workspace/Workspace.js";
import { ExportedFile, ExportedWorkspace } from "../../workspace/WorkspaceImporterExporter.js";
import { Main } from "../Main.js";
import { MainBase } from "../MainBase.js";
import { Dialog } from "./Dialog.js";
import jQuery from "jquery";
import { WorkspaceImporterMessages } from "./language/GUILanguage.js";

export class WorkspaceImporter {

    dialog: Dialog;

    constructor(private main: Main, private path: string[] = []) {

        this.dialog = new Dialog();

    }

    show() {
        let that = this;
        this.dialog.init();
        this.dialog.heading(WorkspaceImporterMessages.importWorkspace());
        this.dialog.description(WorkspaceImporterMessages.importWorkspaceDescription())
        let pathDescription = WorkspaceImporterMessages.pathDescription1();
        if (this.path.length > 0) {
            pathDescription = WorkspaceImporterMessages.pathDescription2(this.path.join("/"));
        }
        this.dialog.description(pathDescription);

        let $fileInputButton = jQuery('<input type="file" id="file" name="file" multiple />');
        this.dialog.addDiv($fileInputButton);

        let exportedWorkspaces: ExportedWorkspace[] = [];

        let $errorDiv = this.dialog.description("", "red");
        let $workspacePreviewDiv = jQuery('<div class="jo_scrollable jo_workspaceImportList" style="flex-basis: 20px; flex-grow: 1; overflow: auto; background-color: #ffffff60"></div>');
        let $workspacePreviewList = jQuery(`<ul></ul>`);
        $workspacePreviewDiv.append($workspacePreviewList);


        let registerFiles = (files: FileList) => {
            for (let i = 0; i < files.length; i++) {
                let f = files[i];
                var reader = new FileReader();
                reader.onload = (event) => {
                    let text: string = <string>event.target.result;
                    if (!(text.startsWith("{") || text.startsWith("["))) {
                        $errorDiv.append(jQuery(`<div>${WorkspaceImporterMessages.wrongFileFormat(f.name)}</div>`));
                        return;
                    }
                    
                    let ew: ExportedWorkspace[] = [];
                    try {
                        ew = JSON.parse(text);
                        if (!Array.isArray(ew)) {
                            ew = [ew];
                        }
                    } catch (e) {
                        $errorDiv.append(jQuery(`<div>${WorkspaceImporterMessages.noJson(f.name)}</div>`));
                        return;
                    }
                    
                    for (let ew1 of ew) {
                        if (ew1.modules == null || ew1.name == null || ew1.settings == null) {
                            $errorDiv.append(jQuery(`<div>${WorkspaceImporterMessages.wrongFileFormat(f.name)}</div>`));
                        } else {
                            exportedWorkspaces.push(ew1);
                            let checkbox = jQuery(`<input type="checkbox" checked="checked" />`);
                            let pathString = (ew1.path && ew1.path.length > 0) ? ew1.path + "\\" : "";
                            let listItem = jQuery(`<li><span>${pathString}${ew1.name} ${WorkspaceImporterMessages.withFiles(ew1.modules.length)}<span></li>`);
                            listItem.prepend(checkbox);
                            ew1.isSelected = true
                            $workspacePreviewList.append(listItem);
                            checkbox.on('change', (event) => {
                                ew1.isSelected = checkbox.is(':checked')
                            });
                        }
                    }


                };
                reader.readAsText(f);
            }
        }

        $fileInputButton.on('change', (event) => {
            //@ts-ignore
            var files: FileList = event.originalEvent.target.files;
            registerFiles(files);
        })

        let $dropZone = jQuery(`<div class="jo_workspaceimport_dropzone">${WorkspaceImporterMessages.dragFilesHere()}</div>`);
        this.dialog.addDiv($dropZone);
        this.dialog.description(`<b>${WorkspaceImporterMessages.theseWorkspacesGetImported()}</b>`);



        $dropZone.on('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            evt.originalEvent.dataTransfer.dropEffect = 'copy';
        })
        $dropZone.on('drop', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.originalEvent.dataTransfer.files;
            registerFiles(files);
        })

        this.dialog.addDiv($workspacePreviewDiv);

        let waitDiv = jQuery('#bitteWarten');
        let waitProgressBar = jQuery('<div class="jo_waitProgressBar"></div>');
        let waitProgressBarInner = jQuery('<div class="jo_waitProgressBarInner"></div>');
        waitProgressBar.append(waitProgressBarInner);
        waitDiv.append(waitProgressBar);

        this.dialog.buttons([
            {
                caption: WorkspaceImporterMessages.cancel(),
                color: "#a00000",
                callback: () => { this.dialog.close() }
            },
            {
                caption: WorkspaceImporterMessages.import(),
                color: "green",
                callback: async () => {

                    waitDiv.css("display", "flex");

                    let networkManager = this.main.networkManager;
                    let projectExplorer = this.main.projectExplorer;

                    let owner_id: number = this.main.user.id;
                    if (this.main.workspacesOwnerId != null) {
                        owner_id = this.main.workspacesOwnerId;
                    }

                    let workspacesToImport: ExportedWorkspace[] = exportedWorkspaces.filter(wse => wse.isSelected);

                    let firstWorkspace: Workspace;

                    let i = 0;
                    for (let wse of workspacesToImport) {
                        waitProgressBarInner.css("width", (i++ / workspacesToImport.length * 100) + "%");

                        let path = this.path.slice();
                        if (wse.path != null) {
                            path = path.concat(wse.path.split("/"));
                        }

                        let ws: Workspace[] = WorkspaceImporter.importWorkspaceWithoutSpritesheet(wse, path, this.main, owner_id);

                        for (let ws1 of ws) {
                            let error = await networkManager.sendCreateWorkspace(ws1, owner_id);
                            if (error == null) {
                                projectExplorer.workspaceListPanel.addElement({
                                    name: ws1.name,
                                    externalElement: ws1,
                                    iconClass: "workspace",
                                    isFolder: ws1.isFolder,
                                    path: ws1.path == '' ? [] : ws1.path.split("/"),
                                    readonly: false,
                                    isPruefungFolder: false
                                }, true);


                                for (let f of ws1.getFiles()) {
                                    await networkManager.sendCreateFile(f, ws1, owner_id)
                                }

                                if (!ws1.isFolder) {
                                    if (firstWorkspace == null) firstWorkspace = ws1;
                                    if (wse.spritesheetBase64) {
                                        let zipFile = base64ToBytes(wse.spritesheetBase64);
                                        try {
                                            let spritesheetId = await SpriteManager.uploadSpritesheet(zipFile, ws1.id, false);
                                            ws1.spritesheetId = spritesheetId;
                                        } catch(e){}
                                    }
                                }

                            } else {
                                alert(WorkspaceImporterMessages.serverNotReachable());
                            }
                            
                        }
                    }

                    waitProgressBar.remove();
                    waitDiv.css("display", "none");

                    
                    projectExplorer.workspaceListPanel.sortElements();
                    this.dialog.close();
                    if (firstWorkspace != null) projectExplorer.setWorkspaceActive(firstWorkspace, true);

                }
            },
        ])
    }

    static importWorkspaceWithoutSpritesheet(wse: ExportedWorkspace, path: string[], main: MainBase, owner_id: number): Workspace[] {

        let ws: Workspace = new Workspace(wse.name, main, owner_id);

        ws.isFolder = false;
        ws.path = path.join("/");
        ws.settings = wse.settings;
        main.addWorkspace(ws);
        for (let exportedFile of wse.modules) {
            ws.addFile(WorkspaceImporter.importFile(main, exportedFile));
        }

        let workspaces: Workspace[] = [];

        if (main instanceof Main) {
            workspaces = WorkspaceImporter.buildPath(path, main, owner_id);
        }

        return workspaces.concat(ws);
    }

    static buildPath(path: string[], main: Main, owner_id: number): Workspace[] {
        let workspaces: Workspace[] = [];
        for (let i = 0; i < path.length; i++) {
            let currentPath = path.slice(0, i + 1);
            let ws = main.projectExplorer.workspaceListPanel.elements.find(el => {
                if (!el.isFolder) return false;
                let pathString = el.name;
                if (el.path && el.path.length > 0) {
                    pathString = el.path.join("/") + "/" + pathString;
                }
                return pathString == currentPath.join("/");
            });

            if (!ws) {
                let newWs = new Workspace(path[i], main, owner_id);
                newWs.isFolder = true;
                newWs.path = path.slice(0, i).join("/");
                main.addWorkspace(newWs);
                workspaces.push(newWs);
            }
        }
        return workspaces;
    }

    private static importFile(main: IMain, ef: ExportedFile): GUIFile {
        let file = new GUIFile(main, ef.name);

        file.setText(ef.text);
        file.identical_to_repository_version = ef.identical_to_repository_version;
        file.is_copy_of_id = ef.is_copy_of_id;
        file.repository_file_version = ef.repository_file_version;

        return file;
    }


}