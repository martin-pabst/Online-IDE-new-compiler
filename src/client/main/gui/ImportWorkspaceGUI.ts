import { Workspace } from "../../workspace/Workspace.js";
import { ExportedWorkspace, WorkspaceImporter } from "../../workspace/WorkspaceImporterExporter.js";
import { Main } from "../Main.js";
import { Dialog } from "./Dialog.js";
import jQuery from "jquery";
import { WorkspaceImportMessages } from "./language/WorkspaceImportMessages.js";
import '/assets/css/workspaceimport.css';
import { DOM } from "../../../tools/DOM.js";
import { Treeview } from "../../../tools/components/treeview/Treeview.js";
import { SimpleProgressbar } from "./ProgressIndicator.js";
import { TreeviewNode } from "../../../tools/components/treeview/TreeviewNode.js";


export class ImportWorkspaceGUI {

    dialog: Dialog;

    constructor(private main: Main) {

        this.dialog = new Dialog();

    }

    show() {
        this.dialog.initAndOpen();
        this.dialog.heading(WorkspaceImportMessages.importWorkspace());
        this.dialog.description(WorkspaceImportMessages.importWorkspaceDescription())

        let $fileInputButton = jQuery('<input type="file" id="file" name="file" multiple />');
        this.dialog.addDiv($fileInputButton);

        let $treeviewDragDropDiv = jQuery('<div class="jo_importDragDropDiv" style="flex-basis: 20px; flex-grow: 1; overflow: auto"></div>');

        let treeviewLeftDiv = DOM.makeDiv($treeviewDragDropDiv[0], "jo_importLeft", "jo_scrollable");
        let treeviewRightDiv = DOM.makeDiv($treeviewDragDropDiv[0], "jo_importRight", "jo_scrollable");

        let leftTreeview = new Treeview<ExportedWorkspace, number>(treeviewLeftDiv, {
            captionLine: {
                enabled: true,
                text: "Inhalt der importierten Datei:"
            },
            withSelection: true,
            selectMultiple: true,
            selectWholeFolders: true,
            isDragAndDropSource: true,
            buttonAddElements: false,
            buttonAddFolders: false,
            withDeleteButtons: false,
            withFolders: true,
            keyExtractor: (ews => ews.id),
            parentKeyExtractor: (ews => ews.parent_folder_id)
        });

        let rightTreeview = new Treeview<Workspace, number>(treeviewRightDiv, {
            captionLine: {
                enabled: true,
                text: "Ihre Workspaces:"
            },
            withSelection: false,
            selectMultiple: false,
            isDragAndDropSource: false,
            buttonAddElements: false,
            buttonAddFolders: false,
            withDeleteButtons: false,
            withFolders: true,
            comparator: (a, b) => {
                return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
            },
            keyExtractor: (ews => ews.id),
            parentKeyExtractor: (ews => ews.parent_folder_id)
        });

        rightTreeview.addDragDropSource({ treeview: leftTreeview, defaultDragKind: "copy", dropInsertKind: "asElement" });

        rightTreeview.dropEventCallback = (sourceTreeview, destinationNode) => {
            this.dropEventCallback(leftTreeview, rightTreeview, destinationNode);
        }

        $fileInputButton.on('change', (event) => {
            //@ts-ignore
            var files: FileList = event.originalEvent.target.files;
            this.fillSourceTreeview(files, leftTreeview);
        })

        let $dropZone = jQuery(`<div class="jo_workspaceimport_dropzone">${WorkspaceImportMessages.dragFilesHere()}</div>`);
        this.dialog.addDiv($dropZone);
        this.dialog.description('').text(WorkspaceImportMessages.dragDropTutorial());

        $dropZone.on('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            evt.originalEvent.dataTransfer.dropEffect = 'copy';
        })
        $dropZone.on('drop', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.originalEvent.dataTransfer.files;
            this.fillSourceTreeview(files, leftTreeview);
        })

        this.dialog.addDiv($treeviewDragDropDiv);

        this.fillDestTreeview(rightTreeview);

        this.dialog.buttons([
            {
                caption: WorkspaceImportMessages.ok(),
                color: "#18a000ff",
                callback: () => { 
                    this.main.workspaceList = rightTreeview.getOrderedNodeListRecursively().map(node => node.externalObject);
                    this.main.projectExplorer.renderWorkspaces(this.main.workspaceList);
                    this.dialog.close() 
                }
            }
        ])
    }

    async dropEventCallback(leftTreeview: Treeview<ExportedWorkspace, number>, rightTreeview: Treeview<Workspace, number>,
        destinationNode: TreeviewNode<Workspace, number>) {
        let workspacesToImport = leftTreeview.getOrderedListOfCurrentlySelectedNodes().map(node => node.externalObject);

        let owner_id: number = this.main.user.id;
        if (this.main.workspacesOwnerId != null) {
            owner_id = this.main.workspacesOwnerId;
        }

        let waitProgressBar = new SimpleProgressbar();

        await new WorkspaceImporter(this.main, owner_id).importWorkspaces(workspacesToImport, destinationNode, waitProgressBar);
    }

    fillSourceTreeview(files: FileList, treeview: Treeview<ExportedWorkspace, number>) {
        treeview.clear();
        for (let i = 0; i < files.length; i++) {
            let f = files[i];
            var reader = new FileReader();
            reader.onload = (event) => {
                let text: string = <string>event.target.result;
                if (!(text.startsWith("{") || text.startsWith("["))) {
                    alert(WorkspaceImportMessages.wrongFileFormat(f.name));
                    return;
                }

                let ew: ExportedWorkspace[] = [];
                try {
                    ew = JSON.parse(text);
                    if (!Array.isArray(ew)) {
                        ew = [ew];
                    }
                } catch (e) {
                    alert(WorkspaceImportMessages.noJson(f.name));
                    return;
                }

                for (let ew1 of ew) {
                    if (ew1.modules == null || ew1.name == null || ew1.settings == null) {
                        alert(WorkspaceImportMessages.wrongFileFormat(f.name));
                        return;
                    } else {
                        treeview.addNode(ew1.isFolder, ew1.name, ew1.isFolder ? undefined : 'img_workspace-dark', ew1);
                    }
                }

            };
            reader.readAsText(f);
        }

    }

    fillDestTreeview(treeview: Treeview<Workspace, number>) {
        treeview.clear();
        let workspaces = this.main.workspaceList;
        for (let ws of workspaces) {
            treeview.addNode(ws.isFolder, ws.name, 'img_workspace-dark', ws);
        }
    }

}