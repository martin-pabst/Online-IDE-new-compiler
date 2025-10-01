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
import { RepositoryImportMessages } from "./language/RepositoryImportMessages.js";
import { ExportedRepository, RepositoryImporter } from "../../workspace/RepositoryImporterExporter.js";


export class ImportRepositoryGUI {

    dialog: Dialog;
    files: FileList

    constructor(private main: Main) {

        this.dialog = new Dialog();

    }

    show() {
        this.dialog.initAndOpen();
        this.dialog.heading(RepositoryImportMessages.importRepository());
        this.dialog.description(RepositoryImportMessages.importRepositoryDescription())

        let $fileInputButton = jQuery('<input type="file" id="file" name="file" multiple />');
        this.dialog.addDiv($fileInputButton);

        $fileInputButton.on('change', (event) => {
            //@ts-ignore
            this.files = event.originalEvent.target.files;
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

            this.files = evt.originalEvent.dataTransfer.files;
        })


        this.dialog.buttons([
            {
                caption: RepositoryImportMessages.ok(),
                color: "#18a000ff",
                callback: () => {
                    this.importFiles();
                    this.dialog.close()
                }
            },
            {
                caption: RepositoryImportMessages.cancel(),
                color: "#caaf17ff",
                callback: () => {
                    this.dialog.close()
                }
            },
        ])
    }

    async importFiles() {
        if (!this.files || this.files.length === 0) {
            alert(RepositoryImportMessages.noFilesSelected());
            return;
        }

        let file = this.files[0];
        var reader = new FileReader();
        reader.onload = async (event) => {
            let text: string = <string>event.target.result;
            if (!text.startsWith("{")) {
                alert(RepositoryImportMessages.wrongFileFormat(file.name));
                return;
            }
            
            let er: ExportedRepository;
            try {
                er = JSON.parse(text);
            } catch (e) {
                alert(RepositoryImportMessages.wrongFileFormat(file.name));
                return;
            }

           var importer = new RepositoryImporter(this.main)
           await importer.importRepository(er);
           alert(RepositoryImportMessages.importSuccessfully(file.name))

        };

        reader.readAsText(file);


    }
}