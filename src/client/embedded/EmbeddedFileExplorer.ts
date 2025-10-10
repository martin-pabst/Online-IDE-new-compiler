import { MainEmbedded } from "./MainEmbedded.js";
import { openContextMenu, makeEditable } from "../../tools/HtmlTools.js";
import { JOScript } from "./EmbeddedStarter.js";
import jQuery from "jquery";
import { FileTypeManager } from "../../compiler/common/module/FileTypeManager.js";
import { GUIFile } from "../workspace/File.js";
import { Workspace } from "../workspace/Workspace.js";
import { EmbeddedMessages } from "./EmbeddedMessages.js";
import markdownit from 'markdown-it';
import * as monaco from 'monaco-editor'
import { Treeview } from "../../tools/components/treeview/Treeview.js";

type FileData = {
    type?: string,
    file?: GUIFile,
    hint?: string,
    $fileDiv: JQuery<HTMLElement>
}

export class EmbeddedFileExplorer {

    public treeview: Treeview<GUIFile, number>;

    constructor(private $fileListDiv: JQuery<HTMLElement>, private main: MainEmbedded) {

        this.treeview = new Treeview($fileListDiv[0], {
            captionLine: {
                enabled: true,
                text: "Programmdateien"
            },
            withSelection: true,
            selectMultiple: false,
            buttonAddElements: true,
            buttonAddElementsCaption: "Dateien hinzufügen",
            buttonAddFolders: false,
            comparator: ((a, b) => a.name.localeCompare(b.name)),
            keyExtractor: (file) => file.id,
            parentKeyExtractor: (file) => file.parent_folder_id,
            withDeleteButtons: true,
            confirmDelete: true,
            orderBy: "comparator",
            scrollToSelectedElement: false
        });

        this.treeview.newNodeCallback = async (name, node) => {
            let file = this.main.addFile({ text: "", title: name });
            
            let fileType = FileTypeManager.filenameToFileType(file.name);
            node.iconClass = fileType.iconclass;
            node.readOnly = fileType.suffix == ".md";
            node.externalObject = file;

            this.treeview.selectNodeAndSetFocus(node, true);
            return file;
        }

        this.treeview.renameCallback = async (file, newName, node): Promise<{ correctedName: string; success: boolean; }> => {
            newName = newName.substring(0, 30);
            file.name = newName;
            file.setSaved(false);
            return {correctedName: newName, success: true};
        }

        this.treeview.deleteCallback = async (file, node) => {
            let files = this.treeview.nodes.filter(node => !node.isRootNode() && node.externalObject != file).map(node => node.externalObject);
            this.main.removeFile(file);
            if(node?.hasFocus){
                if(files.length > 0){
                    this.selectFile(files[0], true);
                } else {
                    this.selectFirstFileIfPresent();
                }
            }
            this.treeview.nodes.forEach(node => node.externalObject?.setSaved(false));
            this.main.showResetButton();
            return true;
        }

        this.treeview.nodeClickedCallback = (file) => {
            this.selectFile(file, false);
        }

    }

    selectFirstFileIfPresent() {
        if (this.treeview.nodes.length > 1) {
            this.treeview.selectNodeAndSetFocus(this.treeview.nodes[1], true);
        } else {
            let editor = this.main.getMainEditor();
            let model = monaco.editor.createModel("Keine Datei vorhanden.", "plaintext");
            editor.setModel(model);
            // editor.setValue("Keine Datei vorhanden.");
            editor.updateOptions({ readOnly: true });
        }
    }

    getUniqueFilename(): string {
        let newFileName = EmbeddedMessages.NewFileName();

        let i = 0;
        let name: string = newFileName + " " + i + ".java";
        while (this.treeview.nodes.some(node => node.caption == (name = newFileName + " " + i + ".java"))) {
            i++;
        }

        return name;

    }

    removeAllFiles() {
        this.treeview.clear();
        this.selectFirstFileIfPresent();
    }


    addFile(file: GUIFile) {

        let fileType = FileTypeManager.filenameToFileType(file.name);
        let iconclass = fileType.iconclass;
        let node = this.treeview.addNode(false, file.name, iconclass, file);
        node.readOnly = fileType.suffix == ".md";

    }

    removeFile(file: GUIFile, focusFirstFileSubsequently: boolean = true) {
        this.treeview.removeElementAndItsFolderContents(file);
        this.selectFirstFileIfPresent();
        this.treeview.nodes.forEach(node => node.externalObject?.setSaved(false));
    }

    renameElement(fileData: FileData, callback: () => void) {
        let that = this;
        let $div = fileData.$fileDiv.find('.jo_filename');
        let pointPos = fileData.file.name.indexOf('.');
        let selection = pointPos == null ? null : { start: 0, end: pointPos };
        makeEditable($div, $div, (newText: string) => {
            fileData.file.name = newText;
            $div.html(newText);
            fileData.$fileDiv.removeClass('jo_java jo_emptyFile jo_xml jo_json jo_text');
            let fileType = FileTypeManager.filenameToFileType(newText);
            fileData.$fileDiv.addClass("jo_" + fileType.iconclass);
            monaco.editor.setModelLanguage(fileData.file?.getMonacoModel(), fileType.language);
            if (callback != null) callback();
        }, selection);

    }

    selectFile(file: GUIFile, focusEditorSubsequently: boolean = true) {

        if (!file) return;

        let type = FileTypeManager.filenameToFileType(file.name);

        switch (type.suffix) {
            case ".java":
                this.main.$hintDiv.hide();
                this.main.$monacoDiv.show();
                this.main.setFileActive(file);
                if (focusEditorSubsequently) {
                    setTimeout(() => {
                        this.main.getMainEditor().focus();
                    }, 100);
                }
                this.main.interpreter.onFileSelected();
                break;
            case ".md":
                this.main.$monacoDiv.hide();
                this.main.$hintDiv.show();

                let syntaxMap: { [code: string]: string } = {};
                let code: string[] = [];

                //@ts-ignore
                let md1 = markdownit({
                    highlight: function (str, lang) {
                        code.push(str);
                        return "";
                    }
                });

                md1.renderer.rules.code_inline = function (tokens, idx, options, env, self) {
                    var token = tokens[idx];
                    code.push(token.content);
                    // pass token to default renderer.
                    return ""; //md1.renderer.rules.code_block(tokens, idx, options, env, self);
                };

                md1.render(file.getText());

                this.colorize(code, syntaxMap, () => {
                    //@ts-ignore
                    let md2 = markdownit({
                        highlight: function (str, lang) {
                            return syntaxMap[str];
                        }
                    });

                    md2.renderer.rules.code_inline = function (tokens, idx, options, env, self) {
                        var token = tokens[idx];
                        // pass token to default renderer.
                        return syntaxMap[token.content].replace("<br/>", "");
                    };


                    let html = md2.render(file.getText());
                    this.main.$hintDiv.html(html);
                });
                break;
        }
    }

    colorize(code: string[], codeMap: { [code: string]: string }, callback: () => void) {
        let that = this;
        if (code.length > 0) {
            let uncoloredtext = code.pop();
            monaco.editor.colorize(uncoloredtext, 'myJava', { tabSize: 3 }).then((text) => {
                codeMap[uncoloredtext] = text;
                that.colorize(code, codeMap, callback);
            }
            );
        } else {
            callback();
        }

    }


    getFiles() {
        return this.treeview.nodes.filter(node => !node.isRootNode() && node.externalObject).map(node => node.externalObject);
    }

    markFilesAsStartable(files: GUIFile[], active: boolean) {
        for (let node of this.treeview.nodes.filter(node1 => !node1.isRootNode())) {
            let startButton = node.getIconButtonByTag("Start");
            let file = node.externalObject;
            if (!startButton) startButton = node.addIconButton("img_start-dark", () => {
                this.main.onStartFileClicked(file);
            }, "Starte das in dieser Datei enthaltene Hauptprogramm", true);
            startButton.tag = "Start";
            startButton.setVisible(files.indexOf(file) >= 0);
            startButton.setActive(active);
        }
    }

    renderErrorCount(currentWorkspace: Workspace, errorCountMap: Map<GUIFile, number>) {
        if (errorCountMap == null) return;
        for (let f of currentWorkspace.getFiles()) {
            let errorCount: number = errorCountMap.get(f);
            let errorCountS: string = ((errorCount == null || errorCount == 0) ? "" : "(" + errorCount + ")");

            let node = this.treeview.findNodeByElement(f);
            node.setRightPartOfCaptionErrors(errorCountS);
        }
    }

    markAsSelectedButDontInvokeCallback(file: GUIFile) {
        let node = this.treeview.findNodeByElement(file);
        if (node) {
            this.treeview.unselectAllNodes(true);
            node.setSelected(true)
            node.setFocus(true);
        }
    }

}