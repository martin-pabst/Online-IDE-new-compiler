import { IMain } from "../../compiler/common/IMain";
import { CompilerFile } from "../../compiler/common/module/CompilerFile";
import { FileTypeManager } from "../../compiler/common/module/FileTypeManager";
import { FileData } from "../communication/Data";
import { Main } from "../main/Main";
import { Patcher } from "./Patcher";
import { Workspace } from "./Workspace";
import * as monaco from 'monaco-editor'


export class GUIFile extends CompilerFile {

    id?: number;        // database-id in Online-IDE

    text_before_revision: string | null = null;
    submitted_date: string | null = null;
    student_edited_after_revision: boolean = false;

    is_copy_of_id?: number | null = null;
    repository_file_version?: number | null = null;
    identical_to_repository_version: boolean = true;

    remote_version: number = 1;             // is this field used anywhere in a meaningful manner?

    isFolder: boolean = false;
    parent_folder_id: number | null;

    // GUI references:
    private monacoModel?: monaco.editor.ITextModel;
    private static uriMap: { [name: string]: number } = {};


    constructor(private main: IMain, filename?: string, text?: string) {
        super(filename);
        if (text) this.setText(text);
    }

    getFileData(workspace: Workspace): FileData {
        let fd: FileData = {
            id: this.id,
            name: this.name,
            text: this.getText(),
            text_before_revision: this.text_before_revision,
            submitted_date: this.submitted_date,
            student_edited_after_revision: this.student_edited_after_revision,
            version: this.remote_version,
            is_copy_of_id: this.is_copy_of_id,
            repository_file_version: this.repository_file_version,
            identical_to_repository_version: this.identical_to_repository_version,
            workspace_id: workspace.id,
            forceUpdate: false,
            isFolder: this.isFolder,
            parent_folder_id: this.parent_folder_id
        }

        return fd;
    }

    static restoreFromData(main: IMain, f: FileData): GUIFile {
        let patched = Patcher.patch(f.text);

        let file = new GUIFile(main, f.name);
        file.setText(patched.patchedText);
        file.text_before_revision = f.text_before_revision;
        file.submitted_date = f.submitted_date;
        file.student_edited_after_revision = false;
        file.remote_version = f.version;
        file.id = f.id;
        file.is_copy_of_id = f.is_copy_of_id;
        file.repository_file_version = f.repository_file_version;
        file.identical_to_repository_version = f.identical_to_repository_version;

        return file;
    }


    getMonacoModel(): monaco.editor.ITextModel | undefined {
        let hadMonacoModel: boolean = this.hasMonacoModel();
        if (!this.monacoModel) {
            this.createMonacolModel();
        }

        if (!hadMonacoModel && !this.main.isEmbedded()) {
            this.monacoModel.onDidChangeContent((ev) => {
                let main1: Main = <Main>this.main;
                if (main1.workspacesOwnerId != main1.user.id) {
                    if(!(ev.isUndoing || ev.isRedoing)){
                        if (this.text_before_revision == null || this.student_edited_after_revision) {
                            this.student_edited_after_revision = false;
                            //@ts-ignore
                            (<monaco.editor.IEditorModel>this.monacoModel).undo();
                            this.text_before_revision = this.monacoModel.getValue(monaco.editor.EndOfLinePreference.LF);
                            //@ts-ignore
                            this.monacoModel.redo();
    
                            this.setSaved(false);
                            main1.networkManager.sendUpdatesAsync(false).then(() => {
                                main1.bottomDiv.homeworkManager.showHomeWorkRevisionButton();
                                main1.projectExplorer.renderHomeworkButton(this);
                            })
                        }
                    }
                } else {
                    this.student_edited_after_revision = true;
                }

            })
        }

        return this.monacoModel;
    }

    getText() {
        if (this.monacoModel) {
            return this.monacoModel.getValue(monaco.editor.EndOfLinePreference.LF);
        } else {
            return super.getText();
        }
    }

    setText(text: string) {
        if (this.monacoModel) {
            this.monacoModel.setValue(text);
            this.notifyListeners();
        } else {
            super.setText(text);
        }

    }


    private createMonacolModel() {
        let path = this.name;

        // a few lines later there's
        // monaco.Uri.from({ path: path, scheme: 'inmemory' });
        // this method throws an exception if path contains '//'
        path = path.replaceAll('//', '_');

        let uriCounter = GUIFile.uriMap[path];
        if (uriCounter == null) {
            uriCounter = 0;
        } else {
            uriCounter++;
        }
        GUIFile.uriMap[path] = uriCounter;

        if (uriCounter > 0) path += " (" + uriCounter + ")";
        let uri = monaco.Uri.from({ path: path, scheme: 'inmemory' });
        let language = FileTypeManager.filenameToFileType(this.name).language;
        let isSaved = this.isSaved();
        this.monacoModel = monaco.editor.createModel(super.getText(), language, uri);
        this.monacoModel.updateOptions({ tabSize: 3, bracketColorizationOptions: { enabled: true, independentColorPoolPerBracketType: false } });

        this.monacoModel.onDidChangeContent(() => { this.notifyListeners() });
        this.setSaved(isSaved);
    }

    disposeMonacoModel() {
        if (this.monacoModel) {
            this.localVersion = this.monacoModel.getAlternativeVersionId();
            super.setText(this.monacoModel.getValue());
            this.monacoModel?.dispose();
            this.monacoModel = undefined;
        }
    }

    getLocalVersion(): number {
        if (this.monacoModel) {
            return this.monacoModel.getAlternativeVersionId();
        } else {
            return this.localVersion;
        }
    }

    hasMonacoModel(): boolean {
        return typeof this.monacoModel !== "undefined";
    }

}
