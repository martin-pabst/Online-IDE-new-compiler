import jQuery from 'jquery';
import { Main } from "../main/Main.js";
import { CacheManager } from "../../tools/database/CacheManager.js";
import { Workspace } from "../workspace/Workspace.js";
import { ajax, ajaxAsync, csrfToken, PerformanceCollector } from "./AjaxHelper.js";
import { BaseResponse, ClassData, CreateOrDeleteFileOrWorkspaceRequest, CRUDResponse, DatabaseData, DistributeWorkspaceRequest, DistributeWorkspaceResponse, DuplicateWorkspaceRequest, DuplicateWorkspaceResponse, FileData, GetDatabaseRequest, getDatabaseResponse, GetTemplateRequest, JAddStatementRequest, JAddStatementResponse, JRollbackStatementRequest, JRollbackStatementResponse, MoveFileRequest, ObtainSqlTokenRequest, ObtainSqlTokenResponse, SendUpdatesRequest, SendUpdatesResponse, SetRepositorySecretRequest, SetRepositorySecretResponse, UpdateFileOrderRequest, UpdateGuiStateRequest, UpdateGuiStateResponse, UpdateWorkspaceOrderRequest, WorkspaceData, type CreateOrUpdateGradeRequest, type GetGradeRequest, type GetGradeResponse, type GradeData } from "./Data.js";
import { PushClientManager } from "./pushclient/PushClientManager.js";
import { GUIFile } from '../workspace/File.js';
import pako from 'pako'
import { FileTypeManager } from '../../compiler/common/module/FileTypeManager.js';


export class NetworkManager {

    // = "https://sql.onlinecoding.de/servlet/";
    // SqlIdeUrlHolder.sqlIdeURL = "http://localhost:6500/servlet/";
    // SqlIdeUrlHolder.sqlIdeURL = "https://www.sql-ide.de/servlet/";

    timerhandle: any;

    ownUpdateFrequencyInSeconds: number = 25;
    teacherUpdateFrequencyInSeconds: number = 5;

    updateFrequencyInSeconds: number = 25;
    forcedUpdateEvery: number = 25;
    forcedUpdatesInARow: number = 0;

    secondsTillNextUpdate: number = this.updateFrequencyInSeconds;
    errorHappened: boolean = false;

    interval: any;

    counterTillForcedUpdate: number;

    constructor(public main: Main, private $updateTimerDiv: JQuery<HTMLElement>) {

    }

    async initializeTimer() {

        let that = this;
        this.$updateTimerDiv.find('svg').attr('width', that.updateFrequencyInSeconds);

        if (this.interval != null) clearInterval(this.interval);

        this.counterTillForcedUpdate = this.forcedUpdateEvery;

        this.interval = setInterval(() => {

            if (that.main.user == null) return; // don't call server if no user is logged in

            that.secondsTillNextUpdate--;

            if (that.secondsTillNextUpdate < 0) {
                that.secondsTillNextUpdate = that.updateFrequencyInSeconds;
                that.counterTillForcedUpdate--;
                let doForceUpdate = that.counterTillForcedUpdate == 0;
                if (doForceUpdate) {
                    this.forcedUpdatesInARow++;
                    that.counterTillForcedUpdate = this.forcedUpdateEvery;
                    if (this.forcedUpdatesInARow > 50) {
                        that.counterTillForcedUpdate = this.forcedUpdateEvery * 10;
                    }
                }


                that.sendUpdatesAsync(doForceUpdate, false);

            }

            let $rect = this.$updateTimerDiv.find('.jo_updateTimerRect');

            $rect.attr('width', that.secondsTillNextUpdate + "px");

            if (that.errorHappened) {
                $rect.css('fill', '#c00000');
                this.$updateTimerDiv.attr('title', "Fehler beim letzten Speichervorgang -> Werd's wieder versuchen");
            } else {
                $rect.css('fill', '#008000');
                this.$updateTimerDiv.attr('title', that.secondsTillNextUpdate + " Sekunden bis zum nächsten Speichern");
            }

            PerformanceCollector.sendDataToServer();

        }, 1000);

    }

    initializePushClientManager() {
        PushClientManager.getInstance().subscribe("doFileUpdate", (data) => {
            this.sendUpdatesAsync(true, false, true);
        })
    }

    savePruefungWorkspace(pruefungWorkspace: Workspace){

        let request: SendUpdatesRequest = {
            workspacesWithoutFiles: [pruefungWorkspace.getWorkspaceData(false)],
            files: pruefungWorkspace.getFiles().map(file => file.getFileData(pruefungWorkspace)),
            owner_id: this.main.workspacesOwnerId,
            userId: this.main.user.id,
            currentWorkspaceId: this.main.currentWorkspace?.pruefung_id == null ? this.main.currentWorkspace?.id : null,
            getModifiedWorkspaces: false
        }

        ajaxAsync('servlet/sendUpdates', request);

    }

    async sendUpdatesAsync(sendIfNothingIsDirty: boolean = false, sendBeacon: boolean = false, alertIfNewWorkspacesFound: boolean = false): Promise<boolean> {

        if (this.main.user == null || this.main.user.is_testuser) {
            return true;
        }

        let classDiagram = this.main.rightDiv?.classDiagram;
        let userSettings = this.main.user.gui_state;

        if (classDiagram?.dirty || this.main.gui_state_dirty) {

            userSettings.classDiagram = classDiagram?.serialize();
            this.sendUpdateGuiState(sendBeacon).then((success) => {
                if(success){                    
                    this.main.gui_state_dirty = false;
                    if(classDiagram) classDiagram.dirty = false;
                }
            });;
            this.forcedUpdatesInARow = 0;
        }


        let wdList: WorkspaceData[] = [];
        let fdList: FileData[] = [];

        let workspacesToUpdate: Workspace[] = [];
        let filesToUpdate: GUIFile[] = [];

        for (let ws of this.main.workspaceList) {

            if (!ws.saved) {
                wdList.push(ws.getWorkspaceData(false));
                workspacesToUpdate.push(ws);
                this.forcedUpdatesInARow = 0;
            }

            for (let file of ws.getFiles()) {
                if (!file.isSaved()) {
                    this.forcedUpdatesInARow = 0;
                    fdList.push(file.getFileData(ws));
                    // console.log("Save file " + file.name);
                    filesToUpdate.push(file);
                }
            }
        }

        let request: SendUpdatesRequest = {
            workspacesWithoutFiles: wdList,
            files: fdList,
            owner_id: this.main.workspacesOwnerId,
            userId: this.main.user.id,
            currentWorkspaceId: this.main.currentWorkspace?.pruefung_id == null ? this.main.currentWorkspace?.id : null,
            getModifiedWorkspaces: sendIfNothingIsDirty
        }

        let that = this;
        if (wdList.length > 0 || fdList.length > 0 || sendIfNothingIsDirty || this.errorHappened) {

            if (sendBeacon) {
                // If user closes browser-tab or even browser then only sendBeacon works to send data.
                navigator.sendBeacon("sendUpdates", JSON.stringify(request));
            } else {

                try {
                    let response = await ajaxAsync('servlet/sendUpdates', request) as SendUpdatesResponse;
                    that.errorHappened = !response.success;
                    if (!that.errorHappened) {

                        filesToUpdate.forEach(file => file.setSaved(true));
                        workspacesToUpdate.forEach(ws => ws.saved = true);

                        if (response.workspaces != null) {
                            that.updateWorkspaces(request, response, alertIfNewWorkspacesFound);
                        }


                        /**
                         * 13.06.2026: filesToForceUpdate was used to to update student's file if
                         * a teacher was editing them concurrently.
                         */
                        // if (response.filesToForceUpdate != null) {
                        //     that.updateFiles(response.filesToForceUpdate);
                        // }

                        // if(response.activePruefung != null){
                        //     that.main.pruefungManagerForStudents.startPruefung(response.activePruefung);
                        // }

                        return true;

                    } else {
                        let message: string = "Fehler beim Senden der Daten: ";
                        if (response["message"]) message += response["message"];
                        console.log(message);
                        return false;
                    }
                } catch (message) {
                    that.errorHappened = true;
                    console.log("Fehler beim Ajax-call: " + message)
                    return;
                }
            }
        }

        return true;
    }

    async sendCreateWorkspace(w: Workspace, owner_id: number): Promise<boolean> {

        if (this.main.user.is_testuser) {
            w.id = Math.round(Math.random() * 10000000);
            return null;
        }

        let wd: WorkspaceData = w.getWorkspaceData(false);
        let request: CreateOrDeleteFileOrWorkspaceRequest = {
            type: "create",
            entity: "workspace",
            data: wd,
            owner_id: owner_id,
            userId: this.main.user.id
        }

        let response = await ajaxAsync("servlet/createOrDeleteFileOrWorkspace", request) as CRUDResponse;
        if (response.success) {
            w.id = response.id;
            return true;
        } else {
            return false;
        }

    }

    async moveFile(file_id: number, destination_workspace_id: number){
        let request: MoveFileRequest = {
            file_id: file_id,
            destination_workspace_id: destination_workspace_id
        }
        let response = await ajaxAsync("servlet/moveFile", request);
        return response.success;
    }

    async sendCreateFile(f: GUIFile, ws: Workspace, owner_id: number): Promise<boolean> {

        if (this.main.user.is_testuser) {
            f.id = Math.round(Math.random() * 10000000);
            return false;
        }


        let fd: FileData = f.getFileData(ws);
        let request: CreateOrDeleteFileOrWorkspaceRequest = {
            type: "create",
            entity: "file",
            data: fd,
            owner_id: owner_id,
            userId: this.main.user.id
        }

        let response = await ajaxAsync("servlet/createOrDeleteFileOrWorkspace", request) as CRUDResponse;
        if(response.success) {
            f.id = response.id;
            f.setSaved(true);
        } 
        
        return response.success;

    }

    async sendDuplicateWorkspace(ws: Workspace): Promise <DuplicateWorkspaceResponse> {

        if (this.main.user.is_testuser) {
            return {message: "Diese Aktion ist für den Testuser nicht möglich.", workspace: null, success: false};
        }


        let request: DuplicateWorkspaceRequest = {
            workspace_id: ws.id
        }

        return await ajaxAsync("/servlet/duplicateWorkspace", request) as DuplicateWorkspaceResponse;

    }

    sendDistributeWorkspace(ws: Workspace, klasse: ClassData, student_ids: number[], callback: (error: string) => void) {

        if (this.main.user.is_testuser) {
            callback("Diese Aktion ist für den Testuser nicht möglich.");
            return;
        }


        this.sendUpdatesAsync(false).then(() => {
            let request: DistributeWorkspaceRequest = {
                workspace_id: ws.id,
                class_id: klasse?.id,
                student_ids: student_ids
            }

            ajax("distributeWorkspace", request, (response: DistributeWorkspaceResponse) => {
                callback(response.message)
            }, callback);
        });

    }

    sendSetSecret(repositoryId: number, read: boolean, write: boolean, callback: (response: SetRepositorySecretResponse) => void) {
        let request: SetRepositorySecretRequest = { repository_id: repositoryId, newSecretRead: read, newSecretWrite: write };

        ajax("setRepositorySecret", request, (response: SetRepositorySecretResponse) => {
            callback(response)
        }, (message) => { alert(message) });

    }

    sendCreateRepository(ws: Workspace, publish_to: number, repoName: string, repoDescription: string, callback: (error: string, repository_id?: number) => void) {

        if (this.main.user.is_testuser) {
            callback("Diese Aktion ist für den Testuser nicht möglich.");
            return;
        }


        this.sendUpdatesAsync(true).then(() => {

            let request = {
                workspace_id: ws.id,
                publish_to: publish_to,
                name: repoName,
                description: repoDescription
            }

            ajax("createRepository", request, (response: { success: boolean, message?: string, repository_id?: number }) => {
                ws.getFiles().forEach(file => {
                    file.is_copy_of_id = file.id;
                    file.repository_file_version = 1;
                })
                ws.repository_id = response.repository_id;
                ws.has_write_permission_to_repository = true;
                callback(response.message, response.repository_id)
            }, callback);

        });


    }

    async sendDeleteWorkspaceOrFileAsync(type: "workspace" | "file", ids: number[]): Promise<boolean> {

        if (this.main.user.is_testuser) {
            return true;
        }

        let request: CreateOrDeleteFileOrWorkspaceRequest = {
            type: "delete",
            entity: type,
            ids: ids,
            userId: this.main.user.id
        }

        let response = 
           await ajaxAsync("/servlet/createOrDeleteFileOrWorkspace", request) as CRUDResponse;

        return response.success;
    }

    async sendUpdateGuiState(sendBeacon: boolean = false): Promise<boolean> {

        if (this.main.user.is_testuser) {
        }
            return true;

        let request: UpdateGuiStateRequest = {
            gui_state: this.main.user.gui_state,
            userId: this.main.user.id
        }

        if (sendBeacon) {
            navigator.sendBeacon("servlet/updateGuiState", JSON.stringify(request));
            return true;
        } else {
            let response: UpdateGuiStateResponse = await ajaxAsync("servlet/updateGuiState", request);
            return response?.success || false;
        }

    }

    async sendUpdateFileOrder(files: GUIFile[]): Promise<boolean> {
        let request: UpdateFileOrderRequest = {
            fileOrderList: files.map(f => ({fileId: f.id, order: f.sorting_order}))
        }

        let response: BaseResponse = await ajaxAsync('servlet/updateFileOrder', request);
        
        return response.success;
    }

    async sendUpdateWorkspaceOrder(workspaces: Workspace[]): Promise<boolean> {
        let request: UpdateWorkspaceOrderRequest = {
            workspaceOrderList: workspaces.map(ws => ({workspaceId: ws.id, order: ws.sorting_order}))
        }

        let response: BaseResponse = await ajaxAsync('servlet/updateWorkspaceOrder', request);
        
        return response.success;
    }


    private updateWorkspaces(sendUpdatesRequest: SendUpdatesRequest, sendUpdatesResponse: SendUpdatesResponse, alertIfNewWorkspacesFound: boolean = false) {

        let idToRemoteWorkspaceDataMap: Map<number, WorkspaceData> = new Map();

        let fileIdsSended = [];
        sendUpdatesRequest.files.forEach(file => fileIdsSended.push(file.id));

        sendUpdatesResponse.workspaces.workspaces.forEach(wd => idToRemoteWorkspaceDataMap.set(wd.id, wd));

        let newWorkspaceNames: string[] = [];

        for (let remoteWorkspace of sendUpdatesResponse.workspaces.workspaces) {

            let localWorkspaces = this.main.workspaceList.filter(ws => ws.id == remoteWorkspace.id);

            // Did student get a workspace from his/her teacher?
            if (localWorkspaces.length == 0) {
                if (remoteWorkspace.pruefung_id == null) {
                    newWorkspaceNames.push(remoteWorkspace.name);
                }
                this.createNewWorkspaceFromWorkspaceData(remoteWorkspace);
            }

        }



        for (let workspace of this.main.workspaceList) {
            let remoteWorkspace: WorkspaceData = idToRemoteWorkspaceDataMap.get(workspace.id);
            if (remoteWorkspace != null) {
                let idToRemoteFileDataMap: Map<number, FileData> = new Map();
                remoteWorkspace.files.forEach(fd => idToRemoteFileDataMap.set(fd.id, fd));

                let idToFileMap: Map<number, GUIFile> = new Map();
                // update/delete files if necessary
                for (let file of workspace.getFiles()) {
                    let fileId = file.id;
                    idToFileMap.set(fileId, file);
                    let remoteFileData = idToRemoteFileDataMap.get(fileId);
                    if (remoteFileData == null) {
                        this.main.projectExplorer.fileTreeview.removeElementAndItsFolderContents(file);
                        this.main.getCurrentWorkspace()?.removeFile(file);
                    } else {
                        if (fileIdsSended.indexOf(fileId) < 0 && file.getText() != remoteFileData.text) {
                            file.setText(remoteFileData.text);
                            file.setSaved(true);
                        }
                        file.remote_version = remoteFileData.version;
                    }
                }


                // add files if necessary
                for (let remoteFile of remoteWorkspace.files) {
                    if (idToFileMap.get(remoteFile.id) == null) {
                        this.createFile(workspace, remoteFile);
                    }
                }
            }
        }

        if (newWorkspaceNames.length > 0 && alertIfNewWorkspacesFound) {
            let message: string = newWorkspaceNames.length > 1 ? "Folgende Workspaces hat Deine Lehrkraft Dir gesendet: " : "Folgenden Workspace hat Deine Lehrkraft Dir gesendet: ";
            message += newWorkspaceNames.join(", ");
            alert(message);
        }

        this.main.projectExplorer.workspaceTreeview.sort();
        this.main.projectExplorer.fileTreeview.sort();

    }

    private updateFiles(filesFromServer: FileData[]) {
        let fileIdToLocalFileMap: Map<number, GUIFile> = new Map();

        for (let workspace of this.main.workspaceList) {
            for (let file of workspace.getFiles()) {
                fileIdToLocalFileMap[file.id] = file;
            }
        }

        for (let remoteFile of filesFromServer) {
            let file = fileIdToLocalFileMap.get(remoteFile.id);
            if (file != null && file.getText() != remoteFile.text) {
                file.setText(remoteFile.text);
                file.setSaved(true);
                file.remote_version = remoteFile.version;
            }
        }
    }

    public createNewWorkspaceFromWorkspaceData(remoteWorkspace: WorkspaceData, withSort: boolean = false): Workspace {

        let w = this.main.restoreWorkspaceFromData(remoteWorkspace);

        this.main.workspaceList.push(w);

        let iconClass = remoteWorkspace.repository_id == null ? "img_workspace-dark" : "img_workspace-dark-repository";
        let node = this.main.projectExplorer.workspaceTreeview.addNode(w.isFolder,w.name,
            iconClass, w
         )
         // TODO: node.readonly = w.readonly

        if (w.repository_id != null) {
            w.renderSynchronizeButton(node);
        }

        if (withSort) {
            this.main.projectExplorer.workspaceTreeview.sort();
        }
        return w;
    }

    private createFile(workspace: Workspace, remoteFile: FileData) {
        let f = this.main.projectExplorer.getNewFile(remoteFile); //new Module(f, this.main);

        let ae: any = null; //AccordionElement
        if (workspace == this.main.getCurrentWorkspace()) {

            let iconClass = FileTypeManager.filenameToFileType(f.name, this.main.getCurrentProgrammingLanguage()).iconclass;
            
            this.main.projectExplorer.fileTreeview.addNode(false, f.name, iconClass, f)

        }

        workspace.addFile(f);

    }


    public fetchDatabase(code: string, callback: (database: DatabaseData, error: string) => void) {

        let cacheManager: CacheManager = new CacheManager();

        let request: GetDatabaseRequest = {
            databaseCode: code
        }

        ajax("getDatabase", request, (response: getDatabaseResponse) => {
            if (response.success) {

                let database = response.database;

                cacheManager.fetchTemplateFromCache(database.based_on_template_id, (templateDump: Uint8Array) => {

                    if (templateDump != null) {
                        //@ts-ignore
                        database.templateDump = pako.inflate(templateDump);
                        callback(database, null);
                        return;
                    } else {
                        if (database.based_on_template_id == null) {
                            callback(database, null);
                            return
                        }
                        this.fetchTemplate(code, (template) => {
                            if (template != null) {
                                cacheManager.saveTemplateToCache(database.based_on_template_id, template);
                                // @ts-ignore
                                database.templateDump = pako.inflate(template);
                                callback(database, null);
                                return;
                            } else {
                                callback(null, "Konnte das Template nicht laden.");
                                return;
                            }
                        })
                    }
                })
            } else {
                callback(null, "Netzwerkfehler!");
            }
        });


    }


    private fetchTemplate(code: string, callback: (template: Uint8Array) => void) {
        let request: GetTemplateRequest = {
            databaseCode: code
        }

        let headers: { [key: string]: string; } = {};
        if (csrfToken != null) headers = { "x-token-pm": csrfToken };

        jQuery.ajax({
            type: 'POST',
            async: true,
            headers: headers,
            data: JSON.stringify(request),
            contentType: 'application/json',
            url: "servlet/getTemplate",
            xhrFields: { responseType: 'arraybuffer' },
            success: function (response: any) {
                callback(new Uint8Array(response));
            },
            error: function (jqXHR, message) {
                alert("Konnte das Template nicht laden.");
                callback(null);
            }
        });

    }

    public addDatabaseStatement(code: string, version_before: number, statements: string[],
        callback: (statementsBefore: string[], new_version: number, message: string) => void) {

        let request: JAddStatementRequest = {
            databaseCode: code,
            version_before: version_before,
            statements: statements
        }

        ajax("addDatabaseStatements", request, (response: JAddStatementResponse) => {
            callback(response.statements_before, response.new_version, response.message);
        }, (message) => { callback([], 0, message) })


    }

    public rollbackDatabaseStatement(code: string, current_version: number,
        callback: (message: string) => void) {

        let request: JRollbackStatementRequest = {
            databaseCode: code,
            current_version: current_version
        }

        ajax("rollback", request, (response: JRollbackStatementResponse) => {
            callback(response.message);
        })


    }

    public async fetchGrade(schueler_id: number, pruefung_id: number): Promise<GradeData> {
        let request: GetGradeRequest = {
            schuelerId: schueler_id,
            pruefungId: pruefung_id
        }

        let response = await ajaxAsync("servlet/getGrade", request) as GetGradeResponse;

        return response.grade;
    }

    public createOrUpdateGrade(schueler_id: number, pruefung_id: number, grade: string, points: string, comment: string) {
        let request: CreateOrUpdateGradeRequest = {
            schuelerId: schueler_id,
            pruefungId: pruefung_id,
            grade: grade,
            points: points,
            comment: comment
        }

        ajaxAsync("servlet/createOrUpdateGrade", request);
    }

}