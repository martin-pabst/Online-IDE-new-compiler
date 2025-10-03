import { Main } from "../Main.js";
import { Dialog } from "./Dialog.js";
import jQuery from "jquery";
import { WorkspaceImportMessages } from "./language/WorkspaceImportMessages.js";
import '/assets/css/workspaceimport.css';
import { RepositoryImportMessages } from "./language/RepositoryImportMessages.js";
import { ExportedRepository, RepositoryImporter } from "../../workspace/RepositoryImporterExporter.js";
import lightbulb from '/assets/graphics/lightbulb.png';

export class ImportRepositoryGUI {

    dialog: Dialog;
    files: FileList

    $newNameInput: JQuery<HTMLInputElement>;

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

        let $dropZone = jQuery(`<div class="jo_workspaceimport_dropzone"><div>${WorkspaceImportMessages.dragFilesHere()}</div></div>`);
        this.dialog.addDiv($dropZone);
        let $dropZoneInner = jQuery(`<div class="jo_workspaceimport_dropzone_inner"></div>`);
        $dropZone.append($dropZoneInner);
        this.dialog.description('').text(RepositoryImportMessages.renameDescription());

        this.$newNameInput = this.dialog.input('text', RepositoryImportMessages.newName());

        $dropZone.on('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            evt.originalEvent.dataTransfer.dropEffect = 'copy';
        })
        $dropZone.on('drop', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            this.files = evt.originalEvent.dataTransfer.files;
            $dropZoneInner.text(this.files.length + ' ' + RepositoryImportMessages.filesSelected());
        })

        
        this.dialog.buttons([
            {
                caption: RepositoryImportMessages.import(),
                color: "#18a000ff",
                callback: () => {
                    this.importFiles();
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
        this.dialog.addDiv(jQuery('<div style="height:20px"></div>'));
        this.dialog.addDiv(jQuery(``));
        this.dialog.description(`<img src="${lightbulb}" style="width:32px; margin-right: 5px;">` + RepositoryImportMessages.exportTipp());
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

            let newName = this.$newNameInput.val()?.toString()?.trim();
            if (newName && newName.length > 0) {
                er.name = newName;
            }

            var importer = new RepositoryImporter(this.main)
            await importer.importRepository(er);
            alert(RepositoryImportMessages.importSuccessfully(file.name))
            this.dialog.close()
        };

        reader.readAsText(file);


    }
}