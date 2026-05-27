import { Main } from "../../../client/main/Main";
import { GUIFile } from "../../../client/workspace/File";
import { Treeview } from "../../../tools/components/treeview/Treeview";
import { TreeviewAccordion } from "../../../tools/components/treeview/TreeviewAccordion";
import { IMain } from "../IMain";
import { FileTypeManager } from "../module/FileTypeManager";
import { DebM } from "./DebuggerMessages";

export type DebuggerType = "java" | "assembly";

export abstract class Debugger {
    protected treeviewAccordion: TreeviewAccordion;

    protected fileTreeview: Treeview<GUIFile, number>;

    constructor(private debuggerDiv: HTMLDivElement, public main: IMain) {

        this.treeviewAccordion = new TreeviewAccordion(debuggerDiv, debuggerDiv.parentElement.parentElement);


    }

    public abstract updateView(): void;


    public hide() {
        this.debuggerDiv.style.display = "none";
        this.fileTreeview?.clear();
    }

    public show() {

        if (this.fileTreeview) {
            let currentWorkspace = this.main.getCurrentWorkspace();
            this.fileTreeview.clear();
            if (currentWorkspace) {
                let files = currentWorkspace.getFiles().slice();
                for (let file of files) {

                    this.fileTreeview.addNode(file.isFolder, file.name,
                        file.isFolder ? undefined : FileTypeManager.filenameToFileType(file.name, this.main.getCurrentProgrammingLanguage()).iconclass, file);

                }

                this.fileTreeview.sort();

            }

        }

        this.debuggerDiv.style.display = "block";
    }

    protected initFileTreeview() {
        this.fileTreeview = new Treeview(this.treeviewAccordion, {
            captionLine: {
                enabled: true,
                text: DebM.files()
            },
            buttonAddElements: false,
            flexWeight: "1",
            withDeleteButtons: false,
            isDragAndDropSource: false,
            buttonAddFolders: false,
            withSelection: true,
            minHeight: 50,
            defaultIconClass: "img_file-dark-java",
            comparator: (a, b) => {
                return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
            },
            keyExtractor: (file) => file.id,
            parentKeyExtractor: (file) => file.parent_folder_id,

            orderExtractor: (file) => file?.sorting_order || 0,
            orderSetter(file, order) {
                file.sorting_order = order;
            },
            orderBy: this.main.getSettings().getValue("explorer.fileOrder") as ("user-defined" | "comparator")
        });

        this.fileTreeview.nodeClickedCallback =
            (file: GUIFile) => {
                if (!file.isFolder) {
                    let editor = this.main.getMainEditor();

                    (<Main>this.main).projectExplorer.lastOpenFile?.saveViewState(editor);

                    editor.updateOptions({ readOnly: this.main.getCurrentWorkspace()?.readonly });
                    editor.setModel(file.getMonacoModel());
                    file.restoreViewState(editor);
                }
            }

    }

}