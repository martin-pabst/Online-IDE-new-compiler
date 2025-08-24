import jQuery from 'jquery';
import { DatabaseNewLongPollingListener } from '../../../tools/database/DatabaseNewLongPollingListener.js';
import { downloadFile } from "../../../tools/HtmlTools.js";
import { dateToString } from "../../../tools/StringTools.js";
import { ajaxAsync } from '../../communication/AjaxHelper.js';
import { ClassData, DuplicateWorkspaceResponse, FileData, GetWorkspacesRequest, GetWorkspacesResponse, Pruefung, UserData } from "../../communication/Data.js";
import { SpritesheetData } from "../../spritemanager/SpritesheetData.js";
import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { DistributeToStudentsDialog } from "./DistributeToStudentsDialog.js";
import { FileTypeManager } from '../../../compiler/common/module/FileTypeManager.js';
import { Helper } from "./Helper.js";
import { TeacherExplorer } from './TeacherExplorer.js';
import { WorkspaceSettingsDialog } from "./WorkspaceSettingsDialog.js";
import { GUIFile } from '../../workspace/File.js';
import { WorkspaceExporter } from '../../workspace/WorkspaceImporterExporter.js';
import { SchedulerState } from "../../../compiler/common/interpreter/SchedulerState.js";
import { GuiMessages } from './language/GuiMessages.js';
import { ImportWorkspaceGUI } from './ImportWorkspaceGUI.js';
import { AccordionMessages, ProjectExplorerMessages } from './language/GUILanguage.js';
import { TreeviewAccordion } from '../../../tools/components/treeview/TreeviewAccordion.js';
import { DragKind, Treeview, TreeviewContextMenuItem } from '../../../tools/components/treeview/Treeview.js';
import { IconButtonComponent } from '../../../tools/components/IconButtonComponent.js';
import { TreeviewNode } from '../../../tools/components/treeview/TreeviewNode.js';
import * as monaco from 'monaco-editor'

import '/assets/css/icons.css';
import '/assets/css/projectexplorer.css';


export class ProjectExplorer {

    accordion: TreeviewAccordion;
    fileTreeview: Treeview<GUIFile, number>;
    workspaceTreeview: Treeview<Workspace, number>;

    homeButton: IconButtonComponent;
    synchronizedButton: IconButtonComponent;

    constructor(private main: Main, private $projectexplorerDiv: JQuery<HTMLElement>) {

    }

    initGUI() {

        this.accordion = new TreeviewAccordion(this.$projectexplorerDiv[0]);

        this.initFilelistPanel();

        this.initWorkspacelistPanel();

        if (!this.main.user.is_teacher) {
            this.accordion.onResize(true);
        }

        this.workspaceTreeview.addDragDropSource({ treeview: this.workspaceTreeview, dropInsertKind: "asElement", defaultDragKind: "move" })
        this.workspaceTreeview.addDragDropSource({ treeview: this.fileTreeview, dropInsertKind: "intoElement", defaultDragKind: "copy", dragKindWithShift: "move" });

    }

    initFilelistPanel() {

        this.fileTreeview = new Treeview(this.accordion, {
            captionLine: {
                enabled: true
            },
            withSelection: true,
            selectMultiple: true,
            withFolders: false,
            isDragAndDropSource: true,
            buttonAddElements: true,
            buttonAddFolders: false,
            withDeleteButtons: true,
            confirmDelete: true,
            defaultIconClass: "img_file-dark-java",
            buttonAddElementsCaption: ProjectExplorerMessages.newFile(),
            comparator: (a, b) => {
                return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
            },
            contextMenu: {
                messageNewNode: ProjectExplorerMessages.newFile(),
                messageRename: AccordionMessages.rename()
            },
            minHeight: 150,
            flexWeight: "1",
            keyExtractor: (file) => file.id,
            parentKeyExtractor: (file) => file.parent_folder_id
        })

        this.fileTreeview.newNodeCallback = async (name: string, node: TreeviewNode<GUIFile, number>) => {

            if (this.main.currentWorkspace == null) {
                alert(ProjectExplorerMessages.firstChooseWorkspace());
                return null;
            }

            let file = new GUIFile(this.main, name);
            node.iconClass = FileTypeManager.filenameToFileType(name).iconclass;

            this.main.getCurrentWorkspace().addFile(file);

            this.setFileActive(file);

            // TODO: necessary?
            // that.fileTreeview.setCaption(that.main.currentWorkspace.name);


            let success = await this.main.networkManager.sendCreateFile(file, this.main.currentWorkspace, this.main.workspacesOwnerId);
            if (!success) {
                this.fileTreeview.removeNode(node);
                this.setFileActive(null);
                return null;
            }

            return file;
        }

        this.fileTreeview.renameCallback = async (file, newName, node) => {

            if (newName.length > 80) {
                alert(GuiMessages.FilenameHasBeenTruncated(80));
                newName = newName.substring(0, 80);
            }

            file.name = newName;
            file.setSaved(false);
            let fileType = FileTypeManager.filenameToFileType(newName);
            node.iconClass = fileType.iconclass;

            monaco.editor.setModelLanguage(file.getMonacoModel(), fileType.language);

            let resp: boolean = await this.main.networkManager.sendUpdatesAsync(true);

            return { correctedName: newName, success: resp }
        }

        this.fileTreeview.deleteCallback = async (file) => {
            let success = await this.main.networkManager.sendDeleteWorkspaceOrFileAsync("file", file.id);

            if (success) {
                this.main.getCurrentWorkspace().removeFile(file);
                this.main.getCompiler()?.triggerCompile();
                if (this.main.getCurrentWorkspace().getFiles().length == 0) {
                    this.fileTreeview.setCaption(ProjectExplorerMessages.noFile());
                }
            }

            return success;

        }

        this.fileTreeview.contextMenuProvider = (file, node) => {
            let cmiList: TreeviewContextMenuItem<GUIFile, number>[] = [];

            cmiList.push({
                caption: ProjectExplorerMessages.duplicate(),
                callback: async (file, treeviewNode) => {

                    let oldFile: GUIFile = file;
                    let newFile: GUIFile = new GUIFile(this.main, oldFile.name + " - " + ProjectExplorerMessages.copy(), oldFile.getText());
                    newFile.remote_version = oldFile.remote_version;

                    let workspace = this.main.getCurrentWorkspace();
                    workspace.addFile(newFile);

                    let success = await this.main.networkManager.sendCreateFile(newFile, workspace, this.main.workspacesOwnerId);

                    if (success) {
                        let newNode = this.fileTreeview.addNode(false, newFile.name, FileTypeManager.filenameToFileType(newFile.name).iconclass,
                            newFile, treeviewNode.parentKey);
                        this.setFileActive(newFile);
                        newNode.renameNode();
                    }
                }
            });


            if (!(this.main.user.is_teacher || this.main.user.is_admin || this.main.user.is_schooladmin)) {

                if (file.submitted_date == null) {
                    cmiList.push({
                        caption: ProjectExplorerMessages.markAsAssignment(),
                        callback: (file1, treeviewNode) => {
                            file.submitted_date = dateToString(new Date());
                            file.setSaved(false);
                            this.main.networkManager.sendUpdatesAsync(true);
                            this.renderHomeworkButton(file);
                        }
                    });
                } else {
                    cmiList.push({
                        caption: ProjectExplorerMessages.removeAssignmentLabel(),
                        callback: (file1, treevewNode) => {
                            file.submitted_date = null;
                            file.setSaved(false);
                            this.main.networkManager.sendUpdatesAsync(true);
                            this.renderHomeworkButton(file);
                        }
                    });
                }

            }

            return cmiList;

        }


        this.fileTreeview.nodeClickedCallback =
            (file: GUIFile) => {
                this.setFileActive(file);
            }

        this.synchronizedButton = this.fileTreeview.captionLineAddIconButton("img_open-change-dark",
            () => {
                this.main.getCurrentWorkspace().synchronizeWithRepository();
            },
            ProjectExplorerMessages.synchronizeWorkspaceWithRepository()
        )

        this.synchronizedButton.setVisible(false);

    }

    renderHomeworkButton(file: GUIFile) {

        let node = this.fileTreeview.findNodeByElement(file);
        if (!node) return;

        let homeworkButton = node.getIconButtonByTag("Homework");
        if (!homeworkButton) {
            homeworkButton = node.addIconButton("img_homework", undefined, "", true);
            homeworkButton.tag = "Homework";
        }

        let klass: string = null;
        let title: string = "";
        if (file.submitted_date != null) {
            klass = "img_homework";
            title = ProjectExplorerMessages.labeledAsAssignment() + ": " + file.submitted_date
            if (file.text_before_revision) {
                klass = "img_homework-corrected";
                title = ProjectExplorerMessages.assignmentIsCorrected();
            }
        }

        if (klass) {
            homeworkButton.iconClass = klass;
            homeworkButton.title = title;
        }

    }


    /**
     * Initializes the workspace treeview in the project explorer.
     */
    initWorkspacelistPanel() {

        this.workspaceTreeview = new Treeview(this.accordion, {
            captionLine: {
                enabled: true,
                text: ProjectExplorerMessages.WORKSPACES()
            },
            withSelection: true,
            selectMultiple: true,
            isDragAndDropSource: true,
            withDeleteButtons: true,
            confirmDelete: true,
            buttonAddElements: true,
            buttonAddElementsCaption: ProjectExplorerMessages.newWorkspace() + "...",
            buttonAddFolders: true,
            minHeight: 150,
            flexWeight: "1",
            defaultIconClass: "img_workspace-dark",
            comparator: (a, b) => {
                return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
            },
            keyExtractor: workspace => workspace.id,
            parentKeyExtractor: workspace => workspace.parent_folder_id,
            readOnlyExtractor: (workspace) => workspace.readonly
        })

        this.workspaceTreeview.newNodeCallback = async (name, node) => {
            let owner_id: number = this.main.user.id;
            if (this.main.workspacesOwnerId != null) {
                owner_id = this.main.workspacesOwnerId;
            }

            let w: Workspace = new Workspace(name, this.main, owner_id);
            w.isFolder = node.isFolder;
            w.parent_folder_id = node.getParent().externalObject?.id ?? null;
            this.main.workspaceList.push(w);

            let success = await this.main.networkManager.sendCreateWorkspace(w, this.main.workspacesOwnerId);
            if (success) {
                if (!node.isFolder) {
                    this.fileTreeview.addElementsButton.setVisible(true);
                    this.setWorkspaceActive(w);
                    w.renderSynchronizeButton(node);
                }
                return w;
            }

            return undefined;

        }

        this.workspaceTreeview.renameCallback = async (workspace, newName, node) => {
            newName = newName.substring(0, 80);
            workspace.name = newName;
            workspace.saved = false;
            let success = await this.main.networkManager.sendUpdatesAsync();
            return { correctedName: newName, success: success }
        }

        this.workspaceTreeview.deleteCallback = async (workspace) => {
            let success = await this.main.networkManager
                .sendDeleteWorkspaceOrFileAsync("workspace", workspace.id);
            if (success) {
                this.fileTreeview.addElementsButton.setVisible(false);
                this.main.removeWorkspace(workspace);
                this.fileTreeview.clear();
                this.main.getMainEditor().setModel(null);
                this.fileTreeview.setCaption(ProjectExplorerMessages.selectWorkspace());
                this.synchronizedButton.setVisible(false);
            }
            return success;
        }

        this.workspaceTreeview.nodeClickedCallback = async (workspace) => {
            if (workspace != null && !workspace.isFolder) {
                // TODO: necessary?
                // this.main.networkManager.sendUpdatesAsync();
                this.setWorkspaceActive(workspace, false, false);
                this.fileTreeview.addElementsButton.setVisible(true);
            }
        }

        this.workspaceTreeview.dropEventCallback = (sourceTreeview, destinationNode, destinationChildIndex, dragKind) => {
            if (sourceTreeview == this.workspaceTreeview) {
                this.moveOrCopyWorkspaces(this.workspaceTreeview.getOrderedListOfCurrentlySelectedNodes(), destinationNode, destinationChildIndex, dragKind);
            } else if (sourceTreeview == this.fileTreeview) {
                this.moveOrCopyFilesToOtherWorkspaces(this.fileTreeview.getOrderedListOfCurrentlySelectedNodes(), destinationNode, dragKind);
            }
        }

        this.homeButton = this.workspaceTreeview.captionLineAddIconButton(
            "img_home-dark", () => {
                this.onHomeButtonClicked();
            }, ProjectExplorerMessages.displayOwnWorkspaces()
        )

        this.homeButton.setVisible(false);

        this.workspaceTreeview.contextMenuProvider =
            (workspace, node) => {

                let mousePointer = window.PointerEvent ? "pointer" : "mouse";

                let cmiList: TreeviewContextMenuItem<Workspace, number>[] = [];

                if(workspace.readonly) return cmiList;

                cmiList.push(
                    {
                        caption: ProjectExplorerMessages.newWorkspace() + "...",
                        callback: () => {
                            while (!node.isFolder && !node.isRootNode && node != null) {
                                node = node.getParent();
                            }
                            this.workspaceTreeview.selectNode(node, false);
                            this.workspaceTreeview.addNewNode(false);
                        }
                    });

                if (node.isFolder) {
                    cmiList.push(
                        // {
                        //     caption: ProjectExplorerMessages.importWorkspace() + "...",
                        //     callback: () => {
                        //         new ImportWorkspaceGUI(<Main>this.main).show();
                        //     }
                        // },
                        {
                            caption: ProjectExplorerMessages.exportFolder(),
                            callback: async () => {
                                let name: string = workspace.name.replace(/\//g, "_");
                                downloadFile(await WorkspaceExporter.exportFolder(workspace, this.workspaceTreeview), name + ".json")
                            }
                        }
                    );
                } else {
                    cmiList.push(
                        {
                            caption: ProjectExplorerMessages.duplicate(),
                            callback: async () => {
                                let response: DuplicateWorkspaceResponse = await this.main.networkManager.sendDuplicateWorkspace(workspace);

                                if (response.message == null && response.workspace != null) {
                                    let newWorkspace: Workspace = Workspace.restoreFromData(response.workspace, this.main);

                                    this.main.rightDiv.classDiagram.duplicateSerializedClassDiagram(workspace.id, newWorkspace.id);

                                    this.main.workspaceList.push(newWorkspace);

                                    this.workspaceTreeview.addNode(false, newWorkspace.name, node.iconClass, newWorkspace, node.getParent()?.ownKey ?? null);

                                } else if (response.message != null) {
                                    alert(response.message);
                                }
                            }
                        },
                        {
                            caption: ProjectExplorerMessages.exportToFile(),
                            callback: async () => {
                                let name: string = workspace.name.replace(/\//g, "_");
                                downloadFile(await WorkspaceExporter.exportWorkspace(workspace), name + ".json")
                            }
                        }
                    );

                    if (this.main.user.is_teacher && this.main.teacherExplorer.classPanel.size(true) > 0) {
                        cmiList.push(
                            {
                                caption: ProjectExplorerMessages.distributeToClass() + "...",
                                callback: () => { },
                                subMenu: this.main.teacherExplorer.classPanel.nodes.map((classNode) => {
                                    let classData = <ClassData>classNode.externalObject;
                                    return {
                                        caption: classData.name,
                                        callback: () => {

                                            this.main.networkManager.sendDistributeWorkspace(workspace, classData, null, (error: string) => {
                                                if (error == null) {
                                                    let networkManager = this.main.networkManager;
                                                    let dt = networkManager.updateFrequencyInSeconds * networkManager.forcedUpdateEvery;
                                                    alert(ProjectExplorerMessages.workspaceDistributed(workspace.name, classData.name));
                                                } else {
                                                    alert(error);
                                                }
                                            });

                                        }
                                    }
                                })
                            },
                            {
                                caption: ProjectExplorerMessages.distributeToStudents(),
                                callback: () => {
                                    let classes: ClassData[] = this.main.teacherExplorer.classPanel.nodes.map(ae => <ClassData>ae.externalObject);
                                    new DistributeToStudentsDialog(classes, workspace, this.main);
                                }
                            }
                        );
                    }

                    if (this.main.repositoryOn && this.main.workspacesOwnerId == this.main.user.id) {
                        if (workspace.repository_id == null) {
                            cmiList.push({
                                caption: ProjectExplorerMessages.createRepository(),
                                callback: () => {
                                    this.main.repositoryCreateManager.show(workspace);
                                }
                            });
                        } else {
                            cmiList.push({
                                caption: ProjectExplorerMessages.synchronizeWorkspaceWithRepository(),
                                callback: () => {
                                    workspace.synchronizeWithRepository();
                                }
                            });
                            cmiList.push({
                                caption: ProjectExplorerMessages.detachFromRepository(),
                                color: "#ff8080",
                                callback: async () => {
                                    workspace.repository_id = null;
                                    workspace.saved = false;
                                    await this.main.networkManager.sendUpdatesAsync(true);
                                    node.iconClass = "img_workspace-dark";
                                    workspace.renderSynchronizeButton(node);
                                }
                            });
                        }
                    }

                    cmiList.push({
                        caption: ProjectExplorerMessages.settings() + "...",
                        callback: () => {
                            new WorkspaceSettingsDialog(workspace, this.main).open();
                        }
                    })

                }

                return cmiList;
            }

    }

    async moveOrCopyFilesToOtherWorkspaces(filesToMoveOrCopy: TreeviewNode<GUIFile, number>[], destinationWorkspaceNode: TreeviewNode<Workspace, number>, dragKind: DragKind) {
        if (destinationWorkspaceNode.isFolder) {
            alert("Dateien können nicht in einen Workspace-Ordner verschoben/kopiert werden.");
            return;
        }

        let destinationWorkspace = destinationWorkspaceNode.externalObject;
        let sourceWorkspace = this.main.getCurrentWorkspace();

        switch (dragKind) {
            case "move":
                for (let fileNode of filesToMoveOrCopy) {
                    let file = fileNode.externalObject;
                    let success = await this.main.networkManager.moveFile(file.id, destinationWorkspace.id);
                    if(success){
                        sourceWorkspace.removeFile(file);
                        destinationWorkspace.addFile(file);
                        this.fileTreeview.removeNode(fileNode);
                    }
                }
                break;
            case "copy":
                for (let fileNode of filesToMoveOrCopy) {
                    let file = fileNode.externalObject;
                    let newFile = new GUIFile(this.main, file.name, file.getText());
                    let success = await this.main.networkManager.sendCreateFile(newFile, destinationWorkspace, destinationWorkspace.owner_id);
                    if(success) destinationWorkspace.addFile(newFile);
                }
                break;
        }

    }

    // this.workspaceTreeview.moveNodesCallback = async (movedWorkspaces: Workspace[],
    //     destinationFolder: Workspace, position: {
    //         order: number,
    //         elementBefore: Workspace, elementAfter: Workspace
    //     },
    //     dragKind: DragKind): Promise<boolean> => {
    //     for (let ws of movedWorkspaces) {
    //         ws.parent_folder_id = destinationFolder?.id ?? null;
    //         ws.saved = false;
    //     }
    //     return await this.main.networkManager.sendUpdatesAsync(true);
    // }

    async moveOrCopyWorkspaces(nodesToCopyOrMove: TreeviewNode<Workspace, number>[], destinationFolderNode: TreeviewNode<Workspace, number>, destinationChildIndex: number, dragKind: DragKind) {
        switch (dragKind) {
            case "move":
                let new_parent_folder_id = destinationFolderNode.ownKey;
                for (let node of nodesToCopyOrMove) {
                    let ws = node.externalObject;
                    if (ws) ws.parent_folder_id = new_parent_folder_id;
                    ws.saved = false;
                }
                if (await this.main.networkManager.sendUpdatesAsync(true)) {
                    destinationFolderNode.insertNodes(destinationChildIndex, nodesToCopyOrMove);
                }
                break;
            case "copy":
                // Not yet implemented!
                break;
        }

    }


    onHomeButtonClicked() {
        this.main.networkManager.sendUpdatesAsync();

        this.main.bottomDiv.hideHomeworkTab();

        this.workspaceTreeview.addElementsButton.setVisible(true);
        this.workspaceTreeview.addFolderButton.setVisible(true);
        this.homeButton.setVisible(false);
        this.fileTreeview.addElementsButton.setVisible(this.main.workspaceList.length > 0);

        this.main.teacherExplorer.restoreOwnWorkspaces();
        this.main.networkManager.updateFrequencyInSeconds = this.main.networkManager.ownUpdateFrequencyInSeconds;
    }

    renderFiles(workspace: Workspace) {

        let name = workspace == null ? ProjectExplorerMessages.noWorkspace() : workspace.name;

        this.fileTreeview.setCaption(name);
        this.fileTreeview.clear();

        if (workspace != null) {
            let files: GUIFile[] = workspace.getFiles().slice();

            // Todo: necessary?
            // files.sort((a, b) => { return a.name > b.name ? 1 : a.name < b.name ? -1 : 0 });

            for (let file of files) {

                this.fileTreeview.addNode(false, file.name,
                    FileTypeManager.filenameToFileType(file.name).iconclass, file, null);

                this.renderHomeworkButton(file);
            }

        }
    }

    renderWorkspaces(workspaceList: Workspace[]) {

        this.fileTreeview.clear();
        this.workspaceTreeview.clear();

        for (let ws of workspaceList) {
            let iconClass = ws.repository_id == null ? 'img_workspace-dark' : 'img_workspace-dark-repository';
            if (ws.isFolder) iconClass = undefined;
            let node = this.workspaceTreeview.addNode(ws.isFolder, ws.name, iconClass, ws)

            if(ws.name == '_Prüfungen' && ws.readonly){
                node.renderCaptionAsHtml = true;
                node.caption = '<span class="jo_explorer_pruefungCaption">Prüfungen</span>'
            }

            ws.renderSynchronizeButton(node);
        }

    }

    renderErrorCount(workspace: Workspace, errorCountMap: Map<GUIFile, number>) {
        if (errorCountMap == null) return;
        for (let f of workspace.getFiles()) {
            let errorCount: number = errorCountMap.get(f);
            let errorCountS: string = ((errorCount == null || errorCount == 0) ? "" : "(" + errorCount + ")");
            this.fileTreeview.findNodeByElement(f)?.setRightPartOfCaptionErrors(errorCountS);
        }
    }

    showRepositoryButtonIfNeeded(w: Workspace) {
        if (w.repository_id != null && w.owner_id == this.main.user.id) {
            this.synchronizedButton.setVisible(true);

            if (!this.main.user.gui_state.helperHistory.repositoryButtonDone) {

                Helper.showHelper("repositoryButton", this.main, jQuery(this.synchronizedButton.parent));

            }
        } else {
            this.synchronizedButton.setVisible(false);
        }
    }

    setWorkspaceActive(w: Workspace, scrollIntoView: boolean = false, selectElement: boolean = true) {

        /*
        * monaco editor counts LanguageChangedListeners and issues ugly warnings in console if more than
        * 200, 300, ... are created. Unfortunately it creates one each time a monaco.editor.ITextModel is created.
        * To keep monaco.editor.ITextModel instance count low we instantiate it only when needed and dispose of it
        * when switching to another workspace.
        */
        if (w == null) return;
        this.main.editor.editor.setModel(null); // detach current model from editor
        this.main.getCurrentWorkspace()?.disposeMonacoModels();
        w.createMonacoModels();

        DatabaseNewLongPollingListener.close();

        if (selectElement) this.workspaceTreeview.selectElement(w, false);

        if (this.main.interpreter.scheduler.state == SchedulerState.running) {
            this.main.interpreter.stop(false);
        }

        this.main.currentWorkspace = w;

        w.setLibraries(this.main.getCompiler());

        this.renderFiles(w);

        if (w != null) {
            let files = w.getFiles();

            if (w.currentlyOpenFile != null) {
                this.setFileActive(w.currentlyOpenFile);
            } else if (files.length > 0) {
                this.setFileActive(files[0]);
            } else {
                this.setFileActive(null);
            }

            if (files.length == 0 && !this.main.user.gui_state.helperHistory.newFileHelperDone) {

                Helper.showHelper("newFileHelper", this.main, jQuery(this.fileTreeview.addElementsButton.parent));

            }

            this.showRepositoryButtonIfNeeded(w);

            let spritesheet = new SpritesheetData();
            spritesheet.initializeSpritesheetForWorkspace(w, this.main).then(() => {
                for (let file of files) {
                    this.main.getCompiler().setFileDirty(file);
                }
                this.main.bottomDiv.gradingManager?.setValues(w);
                this.main.getCompiler().triggerCompile();
            });

        } else {
            this.setFileActive(null);
        }


    }

    lastOpenFile: GUIFile = null;
    setFileActive(file: GUIFile) {

        this.main.bottomDiv.homeworkManager.hideRevision();

        let editor = this.main.getMainEditor();

        this.lastOpenFile?.saveViewState(editor);

        if (file == null) {
            editor.setModel(monaco.editor.createModel(ProjectExplorerMessages.noFile(), "text"));
            editor.updateOptions({ readOnly: true });
            this.fileTreeview.setCaption(ProjectExplorerMessages.noFile());
        } else {
            editor.updateOptions({ readOnly: this.main.getCurrentWorkspace()?.readonly && !this.main.user.is_teacher });
            editor.setModel(file.getMonacoModel());
            if ([SchedulerState.running, SchedulerState.paused].indexOf(this.main.getInterpreter().scheduler.state) < 0) {
                setTimeout(() => {
                    editor.focus();
                }, 100);
            }

            if (file.text_before_revision != null) {
                this.main.bottomDiv.homeworkManager.showHomeWorkRevisionButton();
            } else {
                this.main.bottomDiv.homeworkManager.hideHomeworkRevisionButton();
            }

            this.main.getInterpreter().onFileSelected();
        }


    }

    setActiveAfterExternalModelSet(f: GUIFile) {   // MP Aug. 24: Ändern zu file: File!
        this.fileTreeview.selectElement(f, false);

        this.lastOpenFile = f;

        this.main.editor.dontPushNextCursorMove++;
        f.restoreViewState(this.main.getMainEditor());
        this.main.editor.dontPushNextCursorMove--;

        this.setCurrentlyEditedFile(f);

        this.main.getDisassembler()?.disassemble();
        this.main.getInterpreter().showProgramPointer();

        setTimeout(() => {
            if (!this.main.getMainEditor().getOptions().get(monaco.editor.EditorOption.readOnly)) {
                this.main.getMainEditor().focus();
            }
        }, 300);

    }

    private setCurrentlyEditedFile(f: GUIFile) {
        if (f == null) return;
        let ws = this.main.currentWorkspace;
        if (ws.currentlyOpenFile != f) {
            ws.currentlyOpenFile = f;
            ws.saved = false;
        }
    }

    setExplorerColor(color: string, usersFullName?: string) {
        let caption: string;

        if (color == null) {
            color = "transparent";
            caption = ProjectExplorerMessages.myWorkspaces();
        } else {
            caption = usersFullName;
        }

        this.fileTreeview.getNodeDiv().style.backgroundColor = color;
        this.workspaceTreeview.getNodeDiv().style.backgroundColor = color;

        this.workspaceTreeview.setCaption(caption);
    }

    getNewFile(fileData: FileData): GUIFile {
        return GUIFile.restoreFromData(this.main, fileData);
    }

    async fetchAndRenderOwnWorkspaces() {
        await this.fetchAndRenderWorkspaces(this.main.user);
    }

    async fetchAndRenderWorkspaces(ae: UserData, teacherExplorer?: TeacherExplorer, pruefung: Pruefung = null) {


        await this.main.networkManager.sendUpdatesAsync();

        let request: GetWorkspacesRequest = {
            ws_userId: ae.id,
            userId: this.main.user.id
        }

        let response: GetWorkspacesResponse = await ajaxAsync("/servlet/getWorkspaces", request);

        if (response.success == true) {

            if (this.main.workspacesOwnerId == this.main.user.id && teacherExplorer != null) {
                teacherExplorer.ownWorkspaces = this.main.workspaceList.slice();
                teacherExplorer.currentOwnWorkspace = this.main.currentWorkspace;
            }

            let isTeacherAndInPruefungMode = teacherExplorer?.classPanelMode == "tests";

            if (ae.id != this.main.user.id) {

                if (isTeacherAndInPruefungMode) {
                    response.workspaces.workspaces = response.workspaces.workspaces.filter(w => w.pruefung_id == pruefung.id);
                }

            }

            this.main.workspacesOwnerId = ae.id;
            this.main.restoreWorkspaces(response.workspaces, false);

            if (ae.id != this.main.user.id) {
                this.main.projectExplorer.setExplorerColor("rgba(255, 0, 0, 0.2", ae.familienname + ", " + ae.rufname);
                this.main.projectExplorer.homeButton.setVisible(true);
                Helper.showHelper("homeButtonHelper", this.main);
                this.main.networkManager.updateFrequencyInSeconds = this.main.networkManager.teacherUpdateFrequencyInSeconds;
                this.main.networkManager.secondsTillNextUpdate = this.main.networkManager.teacherUpdateFrequencyInSeconds;

                if (!isTeacherAndInPruefungMode) {
                    this.main.bottomDiv.homeworkManager.attachToWorkspaces(this.main.workspaceList);
                    this.main.bottomDiv.showHomeworkTab();
                }
            }

            if (pruefung != null) {
                this.workspaceTreeview.addElementsButton.setVisible(false);
                this.workspaceTreeview.addFolderButton.setVisible(false);
            } else {
                this.workspaceTreeview.addElementsButton.setVisible(true);
                this.workspaceTreeview.addFolderButton.setVisible(true);
            }
        }



    }

    markFilesAsStartable(files: GUIFile[], active: boolean) {
        for (let node of this.fileTreeview.nodes.filter(node1 => !node1.isRootNode())) {
            let startButton = node.getIconButtonByTag("Start");
            let file = node.externalObject;
            if (!startButton) startButton = node.addIconButton("img_start-dark", () => {
                this.main.getInterpreter().start(file);
            }, "Starte das in dieser Datei enthaltene Hauptprogramm", true);
            startButton.tag = "Start";
            startButton.setVisible(files.indexOf(file) >= 0);
        }
    }

    show() {
        this.$projectexplorerDiv.css('display', '');
    }

    hide() {
        this.$projectexplorerDiv.css('display', 'none');
    }
}