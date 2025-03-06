import { MainEmbedded } from "./MainEmbedded.js";
import { openContextMenu, makeEditable } from "../../tools/HtmlTools.js";
import { JOScript } from "./EmbeddedStarter.js";
import jQuery from "jquery";
import { FileTypeManager } from "../../compiler/common/module/FileTypeManager.js";
import { GUIFile } from "../workspace/GUIFile.js";
import { Workspace } from "../workspace/Workspace.js";
import { EmbeddedMessages } from "./EmbeddedMessages.js";
import markdownit from 'markdown-it';
import * as monaco from 'monaco-editor'

type FileData = {
    type?: string,
    file?: GUIFile,
    hint?: string,
    $fileDiv: JQuery<HTMLElement>
}

export class EmbeddedFileExplorer {

    currentFileData: FileData;
    private fileDataList: FileData[] = [];

    constructor(private workspace: Workspace, private $fileListDiv: JQuery<HTMLElement>, private main: MainEmbedded) {

        let that = this;

        for (let file of workspace.getFiles()) {

            this.addFile(file);

        }

        if ($fileListDiv != null) {
            let $filesDiv = $fileListDiv.parent();
            let $addButton = jQuery('<div class="joe_addFileButton jo_button img_add-dark jo_active" title="Datei hinzufügen"></div>');
            $filesDiv.append($addButton);

            $addButton.on("click", () => {

                let file = this.main.addFile({ text: "", title: this.getUniqueFilename() });
                let fileData = this.addFile(file);

                this.renameElement(fileData, () => {
                    // if there's no file yet and then one is added and subsequently renamed: select it!
                    if (that.currentFileData != fileData) {
                        that.selectFileData(fileData);
                    }
                });
            });
        }

    }

    getUniqueFilename(): string {
        let newFileName = EmbeddedMessages.NewFileName();

        let i = 0;
        let name: string = newFileName + " " + i + ".java";
        while(this.fileDataList.some(fd => fd.file?.name == (name = newFileName + " " + i + ".java"))) {
            i++;
        }

        return name;

    }

    removeAllFiles() {
        this.fileDataList.forEach(f => this.removeFileData(f));
    }


    addHint(script: JOScript): void {
        let that = this;
        let $fileDiv = jQuery('<div class="jo_file jo_hint" ><div class="jo_fileimage"></div><div class="jo_filename" style="line-height: 22px">' +
            script.title + '</div><div class="jo_additionalButtons"></div></div></div>');
        this.$fileListDiv.append($fileDiv);

        let fileData: FileData = {
            file: null,
            $fileDiv: $fileDiv,
            type: "hint",
            hint: script.text
        };

        this.fileDataList.push(fileData);

        $fileDiv.on("click", (event) => {
            that.selectFileData(fileData);
        });

    }


    addFile(file: GUIFile): FileData {
        let that = this;
        let cssClass = "jo_" + FileTypeManager.filenameToFileType(file.name).iconclass;
        let $fileDiv = jQuery(`<div class="jo_file ${cssClass}" >
        <div class="jo_fileimage"></div>
        <div class="jo_filename" style="line-height: 22px">${file.name}</div>
        <div class="jo_textAfterName"></div>
        <div class="jo_delete img_delete jo_button jo_active" title="Datei löschen"></div>
        <div class="jo_additionalButtonStart"></div>
        </div></div>`);
        if (this.$fileListDiv != null) {
            this.$fileListDiv.append($fileDiv);
        }

        let fileData: FileData = {
            file: file,
            $fileDiv: $fileDiv,
            type: "java"
        };

        this.fileDataList.push(fileData);

        file.panelElement = {
            name: file.name,
            $htmlFirstLine: $fileDiv,
            isFolder: false,
            path: [],
            iconClass: FileTypeManager.filenameToFileType(file.name).iconclass,
            readonly: false,
            isPruefungFolder: false
        }

        $fileDiv.find('.jo_delete').on("mousedown", (e: JQuery.MouseDownEvent) => {
            that.onDelete(fileData, e);
        })

        $fileDiv.find('.jo_delete').on("click", (e) => { e.preventDefault(); e.stopPropagation() });

        $fileDiv.on("click", (event) => {
            that.selectFileData(fileData);
        });

        $fileDiv[0].addEventListener("contextmenu", function (event) {
            event.preventDefault();
            openContextMenu([{
                caption: "Umbenennen",
                callback: () => {
                    that.renameElement(fileData, () => { });
                }
            }], event.pageX, event.pageY);
        }, false);

        return fileData;

    }

    onDelete(fileData: FileData, ev: JQuery.MouseDownEvent) {
        ev.preventDefault();
        ev.stopPropagation();
        let that = this;
        openContextMenu([{
            caption: "Abbrechen",
            callback: () => {
                // nothing to do.
            }
        }, {
            caption: "Ich bin mir sicher: löschen!",
            color: "#ff6060",
            callback: () => {
                that.removeFileData(fileData);
            }
        }], ev.pageX + 2, ev.pageY + 2);

    }


    removeFile(file: GUIFile, focusFirstFileSubsequently: boolean = true){
        this.removeFileData(this.getFileDataFromFile(file), focusFirstFileSubsequently);
    }

    removeFileData(fileData: FileData, focusFirstFileSubsequently: boolean = true) {
        fileData.$fileDiv.remove();
        this.main.removeFile(fileData.file);
        this.fileDataList = this.fileDataList.filter((fd) => fd != fileData);
        if (this.currentFileData == fileData) {
            if (this.fileDataList.length > 0) {
                this.selectFileData(this.fileDataList[0], focusFirstFileSubsequently);
            } else {
                let editor = this.main.getMainEditor();
                let model = monaco.editor.createModel("Keine Datei vorhanden.", "plaintext");
                editor.setModel(model);
                // editor.setValue("Keine Datei vorhanden.");
                editor.updateOptions({ readOnly: true });
            }
        }

        this.fileDataList.forEach((fileData) => fileData.file?.setSaved(false));
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

    setFirstFileActive() {
        if (this.fileDataList.length > 0) {
            this.selectFileData(this.fileDataList[0], false);
        }
    }

    getFileDataFromFile(file: GUIFile): FileData | undefined {
        let fileData = this.fileDataList.find(fd => fd.file == file);
        return fileData;
    }

    selectFile(file: GUIFile, focusEditorSubsequently: boolean = true) {
        this.selectFileData(this.getFileDataFromFile(file), focusEditorSubsequently);
    }

    selectFileData(fileData: FileData, focusEditorSubsequently: boolean = true) {

        if (!fileData) return;

        switch (fileData.type) {
            case "java":
                this.main.$hintDiv.hide();
                this.main.$monacoDiv.show();
                this.main.setFileActive(fileData.file);
                if (focusEditorSubsequently) {
                    this.main.getMainEditor().focus();
                }
                this.main.interpreter.onFileSelected();
                break;
            case "hint":
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

                md1.render(fileData.hint);

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


                    let html = md2.render(fileData.hint);
                    this.main.$hintDiv.html(html);
                });
                this.$fileListDiv.find('.jo_file').removeClass('jo_active');
                fileData.$fileDiv.addClass('jo_active');
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


    markFile(file: GUIFile) {
        if (this.$fileListDiv == null) return;
        this.$fileListDiv.find('.jo_file').removeClass('jo_active');

        this.currentFileData = this.fileDataList.find((fileData) => fileData.file == file);

        if (this.currentFileData != null) this.currentFileData.$fileDiv.addClass('jo_active');

    }

    getFiles(){
        return this.fileDataList.map(f => f.file);
    }

    markFilesAsStartable(files: GUIFile[], active: boolean){

        for(let fd of this.fileDataList){
            let buttonDiv = fd.$fileDiv.find('.jo_additionalButtonStart');
            if(fd.file && files.indexOf(fd.file) >= 0){
                buttonDiv.addClass('img_start-dark jo_button');
                buttonDiv.off('click.fileList');
                if(active){
                    buttonDiv.addClass('jo_active');
                    buttonDiv.on('click.fileList', (ev) => {
                        this.onClickStart(fd);
                        ev.stopPropagation();
                    })
                } else {
                    buttonDiv.removeClass('jo_active');
                }
            } else {
                buttonDiv.removeClass('img_start-dark jo_button jo_active');
                buttonDiv.off('click.fileList');
            }
        }
    }

    onClickStart(fd: FileData){
        this.main.onStartFileClicked(fd.file);
    }

    renderErrorCount(currentWorkspace: Workspace) {
        for (let f of currentWorkspace.getFiles()) {
            let errorCount: number = f.errors.filter(error => error.level == "error").length;
            let errorCountS: string = ((errorCount == null || errorCount == 0) ? "" : "(" + errorCount + ")");

            this.setTextAfterFilename(f, errorCountS, 'jo_errorcount');
        }

    }

    setTextAfterFilename(f: GUIFile, text: string, cssClass: string) {
        let fd = this.fileDataList.find(fd1 => fd1.file == f);
        if(!fd) return;
        let $div = fd.$fileDiv.find('.jo_textAfterName');
        $div.addClass(cssClass);
        $div.html(text);
    }

}