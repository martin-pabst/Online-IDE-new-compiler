import { ajax } from "../../communication/AjaxHelper.js";
import { CommitFilesRequest, CommitFilesResponse, Repository, RepositoryFileEntry, RepositoryHistoryEntry } from "../../communication/Data.js";
import { Main } from "../../main/Main.js";
import { GUIFile } from "../../workspace/File.js";
import { Workspace } from "../../workspace/Workspace.js";
import { HistoryElement } from "./HistoryElement.js";
import { SynchronizationManager } from "./RepositorySynchronizationManager.js";
import * as monaco from 'monaco-editor'
import diff_match_patch from 'diff-match-patch'
import { dateToString } from "../../../tools/StringTools.js";


export type SynchroFileState = "original" | "changed" | "new" | "deleted";

export type SynchroFile = {
    idInsideRepository: number,
    idInsideWorkspace?: number,
    workspaceFile: GUIFile,
    committedFromFile?: SynchroFile,
    name: string,
    repository_file_version: number,
    identical_to_repository_version: boolean,
    text: string,
    synchroWorkspace: SynchroWorkspace,

    state: SynchroFileState,
    markedAsMerged: boolean,

    originalText?: string,
    monacoModel?: monaco.editor.ITextModel,
}


export class SynchroWorkspace {

    files: SynchroFile[] = [];
    copiedFromWorkspace: Workspace;
    isCurrentRepositoryVersion: boolean = false;

    name: string;

    constructor(private manager: SynchronizationManager) {

    }

    hasChanges(): boolean {
        for (let file of this.files) {
            if (file.state != "original") return true;
        }
        return false;
    }


    isWritable(): boolean {
        return this.copiedFromWorkspace != null || (this.isCurrentRepositoryVersion && this.manager.repositoryIsWritable);
    }

    copyFromWorkspace(workspace: Workspace): SynchroWorkspace {

        this.files = [];
        workspace.getFiles().forEach(file => {

            this.files.push({
                name: file.name,
                repository_file_version: file.repository_file_version,
                identical_to_repository_version: file.identical_to_repository_version,
                idInsideRepository: file.is_copy_of_id,
                idInsideWorkspace: file.id,
                workspaceFile: file,
                text: file.getText().replace(/\r\n/g, "\n"),
                synchroWorkspace: this,

                state: "original",
                markedAsMerged: false,

                originalText: file.getText(),
                monacoModel: null
            })
        });

        this.name = "Workspace: " + workspace.name;
        this.copiedFromWorkspace = workspace;

        return this;
    }

    copyFromRepository(repository: Repository, isCurrentRepositoryVersion: boolean): SynchroWorkspace {
        this.isCurrentRepositoryVersion = isCurrentRepositoryVersion;
        this.files = [];
        repository.fileEntries.forEach((fileEntry) => {
            this.files.push({
                name: fileEntry.filename,
                idInsideRepository: fileEntry.id,
                idInsideWorkspace: null,
                workspaceFile: null,
                repository_file_version: fileEntry.version,
                identical_to_repository_version: true,
                text: fileEntry.text == null ? null : fileEntry.text.replace(/\r\n/g, "\n"),
                synchroWorkspace: this,

                state: "original",
                markedAsMerged: false,

                monacoModel: null
            })
        })

        this.name = "Repository: " + repository.name + " (V " + repository.version + ")";

        return this;
    }

    copyFromHistoryElement(historyElement: HistoryElement): SynchroWorkspace {
        let repo = historyElement.getRepositoryState();
        this.copyFromRepository(repo, false);
        this.name = "History-Version " + repo.version;
        return this;
    }

    commit(workspace: Workspace, oldRepository: Repository, comment: string, main: Main,
        callback: (repository: Repository, errormessage: string) => void) {

        let oldIdToFileMap: { [id: number]: RepositoryFileEntry } = {};
        let newIdToFileMap: { [id: number]: SynchroFile } = {};

        let newlyVersionedFileIds: number[] = [];

        oldRepository.fileEntries.forEach(file => oldIdToFileMap[file.id] = file);
        this.files.forEach(file => {
            if (file.idInsideRepository != null) {
                newIdToFileMap[file.idInsideRepository] = file;
            }
        });

        let repositoryHistoryEntry: RepositoryHistoryEntry = {
            comment: comment,
            name: main.user.rufname + " " + main.user.familienname,
            username: main.user.username,
            isIntermediateEntry: false,
            timestamp: dateToString(new Date()),
            userId: main.user.id,
            version: oldRepository.version + 1,
            historyFiles: []
        }

        for (let file of this.files) {
            if (file.state == "deleted") continue;

            let oldFile = oldIdToFileMap[file.idInsideRepository];
            if (oldFile == null) {

                // if file.committedFromFile.
                if (file.idInsideRepository == null) {
                    newlyVersionedFileIds.push(file.committedFromFile.idInsideWorkspace);
                    file.committedFromFile.idInsideRepository = file.committedFromFile.idInsideWorkspace;
                    file.committedFromFile.repository_file_version = 1;
                    file.idInsideRepository = file.committedFromFile.idInsideWorkspace;
                    file.committedFromFile.idInsideRepository = file.committedFromFile.idInsideWorkspace;
                }

                repositoryHistoryEntry.historyFiles.push({
                    id: file.idInsideRepository,
                    type: "create",
                    version: 1,
                    content: file.text,
                    filename: file.name
                });
            } else if (oldFile.text != file.text) {
                oldFile.version++;
                let patch: string = this.getPatch(oldFile.text, file.text);
                if (patch == null) {
                    repositoryHistoryEntry.historyFiles.push({
                        id: oldFile.id,
                        type: "intermediate",
                        version: oldFile.version,
                        content: file.text,
                        filename: file.name
                    });
                } else {
                    repositoryHistoryEntry.historyFiles.push({
                        id: oldFile.id,
                        type: "change",
                        version: oldFile.version,
                        content: patch,
                        filename: (oldFile.filename == file.name) ? undefined : file.name
                    });
                }

                let cff = file.committedFromFile;
                if (cff != null) {
                    cff.repository_file_version = oldFile.version;
                    cff.workspaceFile.repository_file_version = oldFile.version;
                    cff.workspaceFile.setSaved(false);
                }

            } else if (oldFile.filename != file.name) {
                repositoryHistoryEntry.historyFiles.push({
                    id: oldFile.id,
                    type: "intermediate",
                    version: oldFile.version,
                    filename: file.name
                });
            }
        }

        for (let oldFile of oldRepository.fileEntries) {
            if (newIdToFileMap[oldFile.id] == null || newIdToFileMap[oldFile.id].state == "deleted") {
                repositoryHistoryEntry.historyFiles.push({
                    id: oldFile.id,
                    type: "delete",
                    version: oldFile.version
                });

            }
        }

        let newFileEntries: RepositoryFileEntry[] = this.files.filter(file => file.state != "deleted").map((synchroFile) => {
            return {
                filename: synchroFile.name,
                id: synchroFile.idInsideRepository,
                text: synchroFile.text,
                version: synchroFile.repository_file_version
            }
        })


        let commitFilesRequest: CommitFilesRequest = {
            files: newFileEntries,
            repositoryVersionBeforeCommit: oldRepository.version,
            repository_id: oldRepository.id,
            workspace_id: workspace.id,
            repositoryHistoryEntry: repositoryHistoryEntry,
            newlyVersionedFileIds: newlyVersionedFileIds
        }

        let that = this;
        ajax("commitFiles", commitFilesRequest, (cfr: CommitFilesResponse) => {
            workspace.getFiles().forEach((file) => {
                if (newlyVersionedFileIds.indexOf(file.id) >= 0) {
                    file.is_copy_of_id = file.id;
                    file.repository_file_version = 1;
                    file.identical_to_repository_version = true;
                    file.setSaved(false);
                }
            });
            that.manager.currentUserSynchroWorkspace.files.forEach(synchroFile => {
                let workspaceFile = synchroFile.workspaceFile;
                if (workspaceFile != null) {
                    if (synchroFile.text == workspaceFile.getText() &&
                        (synchroFile.repository_file_version != workspaceFile.repository_file_version || synchroFile.identical_to_repository_version != workspaceFile.identical_to_repository_version)) {
                        workspaceFile.identical_to_repository_version = synchroFile.identical_to_repository_version;
                        workspaceFile.repository_file_version = synchroFile.repository_file_version;
                        workspaceFile.setSaved(false);
                    }
                }
                if (workspaceFile.is_copy_of_id != null) {
                    synchroFile.idInsideRepository = workspaceFile.is_copy_of_id;
                }
            });
            that.manager.main.networkManager.sendUpdatesAsync(true).then(() => {
                callback(cfr.repository, null);
            });
        }, (error: string) => { callback(null, error) })

    }

    getPatch(contentOld: string, contentNew: string): string {
        //@ts-ignore
        let dmp: diff_match_patch = new diff_match_patch();
        //@ts-ignore
        let patchObject: patch_obj[] = dmp.patch_make(contentOld, contentNew);

        let patch: string = JSON.stringify(patchObject);

        // Test patch and only return it if it is valid!
        let deSerializedPatchObject = JSON.parse(patch);

        let result: [string, boolean[]] = dmp.patch_apply(deSerializedPatchObject, contentOld);

        if (result == null || result[0] == null) return null;

        if (result[0] == contentNew) {
            return patch;
        } else {
            return null;
        }

    }

    writeChangesToWorkspace() {
        let workspace = this.copiedFromWorkspace;
        let oldIdToFileMap: { [id: number]: GUIFile } = {};
        let newIdToFileMap: { [id: number]: SynchroFile } = {};

        workspace.getFiles().forEach(file => {
            if (file.is_copy_of_id != null) oldIdToFileMap[file.is_copy_of_id] = file;
        });

        this.files.forEach(file => {
            if (file.idInsideWorkspace != null) newIdToFileMap[file.idInsideWorkspace] = file;
        });

        let main = this.manager.main;
        for (let file of workspace.getFiles()) {

            let synchroFile = newIdToFileMap[file.id];
            if (synchroFile != null && synchroFile.state != 'deleted') {
                file.setText(synchroFile.monacoModel.getValue(monaco.editor.EndOfLinePreference.LF, false));
                synchroFile.text = file.getText();
                file.is_copy_of_id = synchroFile.idInsideRepository;
                file.repository_file_version = synchroFile.repository_file_version;
                file.identical_to_repository_version = synchroFile.identical_to_repository_version;
                file.setSaved(false);
                this.manager.main.getCompiler().setFileDirty(file);
                file.name = synchroFile.name;
                if (file.panelElement != null) {
                    file.panelElement.$htmlFirstLine.find('.jo_filename');
                }
            } else {

                main.networkManager.sendDeleteWorkspaceOrFile("file", file.id, (error: string) => {
                    if (error == null) {
                    } else {
                        alert('Der Server ist nicht erreichbar!');
                    }
                });

                this.files.splice(this.files.indexOf(synchroFile), 1);
                workspace.removeFile(file);
                main.projectExplorer.fileListPanel.removeElement(file);
                if (main.currentWorkspace == workspace && main.getCurrentWorkspace()?.getCurrentlyEditedFile() == file) {
                    main.projectExplorer.setFileActive(null);
                }

            }

        }

        for (let synchroFile of this.files) {
            if (synchroFile.idInsideRepository != null && oldIdToFileMap[synchroFile.idInsideRepository] == null) {

                let f = new GUIFile(this.manager.main, synchroFile.name, synchroFile.text);
                f.is_copy_of_id = synchroFile.idInsideRepository;
                f.repository_file_version = synchroFile.repository_file_version;
                f.identical_to_repository_version = synchroFile.identical_to_repository_version;

                workspace.addFile(f);

                main.networkManager.sendCreateFile(f, workspace, main.user.id).then(
                    (error: string) => {
                        if (error == null) {
                        } else {
                            alert('Der Server ist nicht erreichbar!');

                        }
                    });

            }
        }

        main.networkManager.sendUpdatesAsync(true).then(() => {
            if (main.currentWorkspace == workspace) {
                let currentlyEditedFile = main.getCurrentWorkspace()?.getCurrentlyEditedFile();
                main.projectExplorer.setWorkspaceActive(workspace, true);

                // if module hadn't been deleted while synchronizing:
                if (workspace.getFiles().indexOf(currentlyEditedFile) >= 0) {
                    main.projectExplorer.setFileActive(currentlyEditedFile);
                    main.projectExplorer.fileListPanel.select(currentlyEditedFile, false);
                }

            }

            workspace.getFiles().forEach(f => main.getCompiler().setFileDirty(f));
        })


    }

}