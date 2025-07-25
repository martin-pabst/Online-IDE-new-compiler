import jQuery from 'jquery';
import { DatabaseNewLongPollingListener } from '../../../tools/database/DatabaseNewLongPollingListener.js';
import { downloadFile } from "../../../tools/HtmlTools.js";
import { dateToString } from "../../../tools/StringTools.js";
import { ajaxAsync } from '../../communication/AjaxHelper.js';
import { ClassData, FileData, GetWorkspacesRequest, GetWorkspacesResponse, Pruefung, UserData } from "../../communication/Data.js";
import { SpritesheetData } from "../../spritemanager/SpritesheetData.js";
import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { Accordion, AccordionContextMenuItem, AccordionElement, AccordionPanel } from "./Accordion.js";
import { DistributeToStudentsDialog } from "./DistributeToStudentsDialog.js";
import { FileTypeManager } from '../../../compiler/common/module/FileTypeManager.js';
import { Helper } from "./Helper.js";
import { TeacherExplorer } from './TeacherExplorer.js';
import { WorkspaceSettingsDialog } from "./WorkspaceSettingsDialog.js";
import { GUIFile } from '../../workspace/File.js';
import { WorkspaceImporterExporter } from '../../workspace/WorkspaceImporterExporter.js';
import { SchedulerState } from "../../../compiler/common/interpreter/SchedulerState.js";
import { GuiMessages } from './language/GuiMessages.js';
import * as monaco from 'monaco-editor'
import { WorkspaceImporter } from './WorkspaceImporter.js';
import { ProjectExplorerMessages } from './language/GUILanguage.js';


export class ProjectExplorer {

    accordion: Accordion;
    fileListPanel: AccordionPanel;
    workspaceListPanel: AccordionPanel;

    $homeAction: JQuery<HTMLElement>;
    $synchronizeAction: JQuery<HTMLElement>;

    constructor(private main: Main, private $projectexplorerDiv: JQuery<HTMLElement>) {

    }

    initGUI() {

        this.accordion = new Accordion(this.main, this.$projectexplorerDiv);

        this.initFilelistPanel();

        this.initWorkspacelistPanel();

    }

    initFilelistPanel() {

        let that = this;

        this.fileListPanel = new AccordionPanel(this.accordion, ProjectExplorerMessages.noWorkspaceSelected(), "3",
            "img_add-file-dark", ProjectExplorerMessages.newFile(), "emptyFile", true, false, "file", true, [],
            GuiMessages.NewFileName(), ".java");

        this.fileListPanel.newElementCallback =

            (accordionElement, successfulNetworkCommunicationCallback) => {

                if (that.main.currentWorkspace == null) {
                    alert(ProjectExplorerMessages.firstChooseWorkspace());
                    return null;
                }

                let f = new GUIFile(this.main, accordionElement.name);
                f.panelElement = accordionElement;
                accordionElement.externalElement = f;

                that.fileListPanel.setElementClass(accordionElement, FileTypeManager.filenameToFileType(accordionElement.name).iconclass)

                that.main.getCurrentWorkspace().addFile(f);

                that.setFileActive(f);

                that.fileListPanel.setCaption(that.main.currentWorkspace.name);

                that.main.networkManager.sendCreateFile(f, that.main.currentWorkspace, that.main.workspacesOwnerId).then(
                    (error: string) => {
                        if (error == null) {
                            successfulNetworkCommunicationCallback(f);
                        } else {
                            alert(ProjectExplorerMessages.serverNotReachable());

                        }
                    });

            };

        this.fileListPanel.renameCallback =
            (file: GUIFile, newName: string, ae: AccordionElement) => {
                newName = newName.substring(0, 80);

                file.name = newName;
                file.setSaved(false);
                let fileType = FileTypeManager.filenameToFileType(newName);
                that.fileListPanel.setElementClass(ae, fileType.iconclass);

                monaco.editor.setModelLanguage(file.getMonacoModel(), fileType.language);

                that.main.networkManager.sendUpdatesAsync();
                return newName;
            }

        this.fileListPanel.deleteCallback =
            (file: GUIFile, callbackIfSuccessful: () => void) => {
                that.main.networkManager.sendDeleteWorkspaceOrFile("file", file.id, (error: string) => {
                    if (error == null) {
                        that.main.getCurrentWorkspace().removeFile(file);
                        that.main.getCompiler()?.triggerCompile();
                        if (that.main.getCurrentWorkspace().getFiles().length == 0) {

                            that.fileListPanel.setCaption(ProjectExplorerMessages.noFile());
                        }
                        callbackIfSuccessful();
                    } else {
                        alert(ProjectExplorerMessages.serverNotReachable());

                    }
                });
            }

        this.fileListPanel.contextMenuProvider = (accordionElement: AccordionElement) => {

            let cmiList: AccordionContextMenuItem[] = [];
            let that = this;

            cmiList.push({
                caption: ProjectExplorerMessages.duplicate(),
                callback: (element: AccordionElement) => {

                    let oldFile: GUIFile = element.externalElement;
                    let newFile: GUIFile = new GUIFile(this.main, oldFile.name + " - " + ProjectExplorerMessages.copy(), oldFile.getText());
                    newFile.remote_version = oldFile.remote_version;

                    let workspace = that.main.getCurrentWorkspace();
                    workspace.addFile(newFile);

                    that.main.networkManager.sendCreateFile(newFile, workspace, that.main.workspacesOwnerId).then(
                        (error: string) => {
                            if (error == null) {
                                let element: AccordionElement = {
                                    isFolder: false,
                                    name: newFile.name,
                                    path: [],
                                    externalElement: newFile,
                                    iconClass: FileTypeManager.filenameToFileType(newFile.name).iconclass,
                                    readonly: false,
                                    isPruefungFolder: false
                                }
                                newFile.panelElement = element;
                                that.fileListPanel.addElement(element, true);
                                that.fileListPanel.sortElements();
                                that.setFileActive(newFile);
                                that.fileListPanel.renameElement(element);
                            } else {
                                alert(ProjectExplorerMessages.serverNotReachable());

                            }
                        });
                }
            });


            if (!(that.main.user.is_teacher || that.main.user.is_admin || that.main.user.is_schooladmin)) {
                let file = <GUIFile>accordionElement.externalElement;

                if (file.submitted_date == null) {
                    cmiList.push({
                        caption: ProjectExplorerMessages.markAsAssignment(),
                        callback: (element: AccordionElement) => {

                            let file = <GUIFile>element.externalElement;
                            file.submitted_date = dateToString(new Date());
                            file.setSaved(false);
                            that.main.networkManager.sendUpdatesAsync(true);
                            that.renderHomeworkButton(file);
                        }
                    });
                } else {
                    cmiList.push({
                        caption: ProjectExplorerMessages.removeAssignmentLabel(),
                        callback: (element: AccordionElement) => {

                            let file = <GUIFile>element.externalElement;
                            file.submitted_date = null;
                            file.setSaved(false);
                            that.main.networkManager.sendUpdatesAsync(true);
                            that.renderHomeworkButton(file);

                        }
                    });
                }

            }

            return cmiList;
        }



        this.fileListPanel.selectCallback =
            (file: GUIFile) => {
                that.setFileActive(file);
            }


        this.$synchronizeAction = jQuery('<div class="img_open-change jo_button jo_active" style="margin-right: 4px"' +
            ` title="${ProjectExplorerMessages.synchronizeWorkspaceWithRepository()}">`);



        this.$synchronizeAction.on('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();

            this.main.getCurrentWorkspace().synchronizeWithRepository();

        })

        this.fileListPanel.addAction(this.$synchronizeAction);
        this.$synchronizeAction.hide();

    }

    renderHomeworkButton(file: GUIFile) {
        let $buttonDiv = file?.panelElement?.$htmlFirstLine?.find('.jo_additionalButtonHomework');
        if ($buttonDiv == null) return;

        $buttonDiv.find('.jo_homeworkButton').remove();

        let klass: string = null;
        let title: string = "";
        if (file.submitted_date != null) {
            klass = "img_homework";
            title = ProjectExplorerMessages.labeledAsAssignment() + ": " + file.submitted_date
            if (file.text_before_revision) {
                klass = "img_homework-corrected";
                title = "Korrektur liegt vor."
            }
        }

        if (klass != null) {
            let $homeworkButtonDiv = jQuery(`<div class="jo_homeworkButton ${klass}" title="${title}"></div>`);
            $buttonDiv.prepend($homeworkButtonDiv);
            if (klass.indexOf("jo_active") >= 0) {
                $homeworkButtonDiv.on('mousedown', (e) => e.stopPropagation());
                $homeworkButtonDiv.on('click', (e) => {
                    e.stopPropagation();
                    // TODO
                });
            }

        }
    }



    initWorkspacelistPanel() {

        let that = this;

        this.workspaceListPanel = new AccordionPanel(this.accordion, ProjectExplorerMessages.WORKSPACES(), "4",
            "img_add-workspace-dark", ProjectExplorerMessages.newWorkspace() + "...", "workspace", true, true, "workspace", false, ["file"],
            GuiMessages.NewWorkspaceName(), "");

        this.workspaceListPanel.newElementCallback =

            (accordionElement, successfulNetworkCommunicationCallback) => {

                let owner_id: number = that.main.user.id;
                if (that.main.workspacesOwnerId != null) {
                    owner_id = that.main.workspacesOwnerId;
                }

                let w: Workspace = new Workspace(accordionElement.name, that.main, owner_id);
                w.isFolder = false;
                w.path = accordionElement.path.join("/");
                that.main.workspaceList.push(w);

                that.main.networkManager.sendCreateWorkspace(w, that.main.workspacesOwnerId).then((error: string) => {
                    if (error == null) {
                        that.fileListPanel.enableNewButton(true);
                        successfulNetworkCommunicationCallback(w);
                        that.setWorkspaceActive(w);
                        w.renderSynchronizeButton(accordionElement);
                    } else {
                        alert(ProjectExplorerMessages.serverNotReachable());

                    }
                });
            };

        this.workspaceListPanel.renameCallback =
            (workspace: Workspace, newName: string) => {
                newName = newName.substr(0, 80);
                workspace.name = newName;
                workspace.saved = false;
                that.main.networkManager.sendUpdatesAsync();
                return newName;
            }

        this.workspaceListPanel.deleteCallback =
            (workspace: Workspace, successfulNetworkCommunicationCallback: () => void) => {
                that.main.networkManager.sendDeleteWorkspaceOrFile("workspace", workspace.id, (error: string) => {
                    if (error == null) {
                        that.fileListPanel.$buttonNew.hide();
                        that.main.removeWorkspace(workspace);
                        that.fileListPanel.clear();
                        that.main.getMainEditor().setModel(null);
                        that.fileListPanel.setCaption(ProjectExplorerMessages.selectWorkspace());
                        this.$synchronizeAction.hide();
                        successfulNetworkCommunicationCallback();
                    } else {
                        alert(ProjectExplorerMessages.serverNotReachable());

                    }
                });
            }

        this.workspaceListPanel.selectCallback =
            (workspace: Workspace) => {
                if (workspace != null && !workspace.isFolder) {
                    that.main.networkManager.sendUpdatesAsync().then(() => {
                        that.setWorkspaceActive(workspace);
                    });
                }

            }

        this.workspaceListPanel.newFolderCallback = (newElement: AccordionElement, successCallback) => {
            let owner_id: number = that.main.user.id;
            if (that.main.workspacesOwnerId != null) {
                owner_id = that.main.workspacesOwnerId;
            }

            let folder: Workspace = new Workspace(newElement.name, that.main, owner_id);
            folder.isFolder = true;

            folder.path = newElement.path.join("/");
            folder.panelElement = newElement;
            newElement.externalElement = folder;
            that.main.workspaceList.push(folder);

            that.main.networkManager.sendCreateWorkspace(folder, that.main.workspacesOwnerId).then((error: string) => {
                if (error == null) {
                    successCallback(folder);
                } else {
                    alert(ProjectExplorerMessages.error() + ": " + error);
                    that.workspaceListPanel.removeElement(newElement);
                }
            });

        }

        this.workspaceListPanel.moveCallback = (ae: AccordionElement | AccordionElement[]) => {
            if (!Array.isArray(ae)) ae = [ae];
            for (let a of ae) {
                let ws: Workspace = a.externalElement;
                ws.path = a.path.join("/");
                ws.saved = false;
            }
            this.main.networkManager.sendUpdatesAsync();
        }

        this.workspaceListPanel.dropElementCallback = (dest: AccordionElement, droppedElement: AccordionElement, dropEffekt: "copy" | "move") => {
            let workspace: Workspace = dest.externalElement;
            let file: GUIFile = droppedElement.externalElement;

            if (workspace.getFiles().indexOf(file) >= 0) return; // module is already in destination workspace

            let newFile: GUIFile = new GUIFile(this.main, file.name, file.getText());
            newFile.remote_version = file.remote_version;

            if (dropEffekt == "move") {
                // move file
                let oldWorkspace = that.main.currentWorkspace;
                oldWorkspace.removeFile(file);
                that.fileListPanel.removeElement(file);
                that.main.networkManager.sendDeleteWorkspaceOrFile("file", file.id, () => { });
            }

            workspace.addFile(newFile);
            that.main.networkManager.sendCreateFile(newFile, workspace, that.main.workspacesOwnerId).then(
                (error: string) => {
                    if (error == null) {
                    } else {
                        alert(ProjectExplorerMessages.serverNotReachable());

                    }
                });

        }

        this.$homeAction = jQuery('<div class="img_home-dark jo_button jo_active" style="margin-right: 4px"' +
            ` title="${ProjectExplorerMessages.displayOwnWorkspaces()}">`);
        this.$homeAction.on('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();

            that.main.networkManager.sendUpdatesAsync().then(() => {
                that.onHomeButtonClicked();
            });

            that.main.bottomDiv.hideHomeworkTab();

        })


        this.workspaceListPanel.addAction(this.$homeAction);
        this.$homeAction.hide();

        this.workspaceListPanel.contextMenuProvider = (workspaceAccordionElement: AccordionElement) => {

            let mousePointer = window.PointerEvent ? "pointer" : "mouse";
            let ws: Workspace = <Workspace>workspaceAccordionElement.externalElement;

            let cmiList: AccordionContextMenuItem[] = [];
            if (workspaceAccordionElement.isFolder) {
                cmiList.push(
                    {
                        caption: ProjectExplorerMessages.newWorkspace() + "...",
                        callback: () => {
                            that.workspaceListPanel.select(workspaceAccordionElement.externalElement);
                            that.workspaceListPanel.$buttonNew.trigger(mousePointer + 'down');
                        }
                    }, {
                        caption: ProjectExplorerMessages.importWorkspace() + "...",
                        callback: () => {
                            new WorkspaceImporter(<Main>that.main, workspaceAccordionElement.path.concat(ws.name)).show();
                        }
                    },
                    {
                        caption: ProjectExplorerMessages.exportFolder(),
                        callback: async (element: AccordionElement) => {
                            let ws: Workspace = <Workspace>element.externalElement;
                            let name: string = ws.name.replace(/\//g, "_");
                            downloadFile(await WorkspaceImporterExporter.exportFolder(ws, this.workspaceListPanel), name + ".json")
                        }
                    }
                );
            } else {
                cmiList.push({
                    caption: ProjectExplorerMessages.duplicate(),
                    callback: (element: AccordionElement) => {
                        let srcWorkspace: Workspace = element.externalElement;
                        this.main.networkManager.sendDuplicateWorkspace(srcWorkspace,
                            (error: string, workspaceData) => {
                                if (error == null && workspaceData != null) {
                                    let newWorkspace: Workspace = Workspace.restoreFromData(workspaceData, this.main);

                                    this.main.rightDiv.classDiagram.duplicateSerializedClassDiagram(srcWorkspace.id, newWorkspace.id);

                                    this.main.workspaceList.push(newWorkspace);
                                    let path = workspaceData.path.split("/");
                                    if (path.length == 1 && path[0] == "") path = [];
                                    newWorkspace.panelElement = {
                                        name: newWorkspace.name,
                                        externalElement: newWorkspace,
                                        iconClass: newWorkspace.repository_id == null ? 'workspace' : 'repository',
                                        isFolder: false,
                                        path: path,
                                        readonly: false,
                                        isPruefungFolder: false
                                    };

                                    this.workspaceListPanel.addElement(newWorkspace.panelElement, true);
                                    this.workspaceListPanel.sortElements();
                                }
                                if (error != null) {
                                    alert(error);
                                }
                            })
                    }
                },
                    {
                        caption: ProjectExplorerMessages.exportToFile(),
                        callback: async (element: AccordionElement) => {
                            let ws: Workspace = <Workspace>element.externalElement;
                            let name: string = ws.name.replace(/\//g, "_");
                            downloadFile(await WorkspaceImporterExporter.exportWorkspace(ws), name + ".json")
                        }
                    }
                );

                if (this.main.user.is_teacher && this.main.teacherExplorer.classPanel.elements.length > 0) {
                    cmiList.push({
                        caption: ProjectExplorerMessages.distributeToClass() + "...",
                        callback: (element: AccordionElement) => { },
                        subMenu: this.main.teacherExplorer.classPanel.elements.map((ae) => {
                            return {
                                caption: ae.name,
                                callback: (element: AccordionElement) => {
                                    let klasse = <any>ae.externalElement;

                                    let workspace: Workspace = element.externalElement;

                                    this.main.networkManager.sendDistributeWorkspace(workspace, klasse, null, (error: string) => {
                                        if (error == null) {
                                            let networkManager = this.main.networkManager;
                                            let dt = networkManager.updateFrequencyInSeconds * networkManager.forcedUpdateEvery;
                                            alert(ProjectExplorerMessages.workspaceDistributed(workspace.name, klasse.name));
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
                            callback: (element: AccordionElement) => {
                                let classes: ClassData[] = this.main.teacherExplorer.classPanel.elements.map(ae => ae.externalElement);
                                let workspace: Workspace = element.externalElement;
                                new DistributeToStudentsDialog(classes, workspace, this.main);
                            }
                        }
                    );
                }

                if (this.main.repositoryOn && this.main.workspacesOwnerId == this.main.user.id) {
                    if (workspaceAccordionElement.externalElement.repository_id == null) {
                        cmiList.push({
                            caption: ProjectExplorerMessages.createRepository(),
                            callback: (element: AccordionElement) => {
                                let workspace: Workspace = element.externalElement;

                                that.main.repositoryCreateManager.show(workspace);
                            },
                            subMenu: null,
                            // [{ n: 0, text: "nur privat sichtbar" }, { n: 1, text: "sichtbar für die Klasse" },
                            // { n: 2, text: "sichtbar für die Schule" }].map((k) => {
                            //     return {
                            //         caption: k.text,
                            //         callback: (element: AccordionElement) => {


                            // this.main.networkManager.sendCreateRepository(workspace, k.n, (error: string, repository_id?: number) => {
                            //     if (error == null) {
                            //         this.workspaceListPanel.setElementClass(element, "repository");
                            //         workspace.renderSynchronizeButton();
                            //         this.showRepositoryButtonIfNeeded(workspace);
                            //     } else {
                            //         alert(error);
                            //     }
                            // });

                            //         }
                            //     }
                            // })
                        });
                    } else {
                        cmiList.push({
                            caption: ProjectExplorerMessages.synchronizeWorkspaceWithRepository(),
                            callback: (element: AccordionElement) => {
                                let workspace: Workspace = element.externalElement;
                                workspace.synchronizeWithRepository();
                            }
                        });
                        cmiList.push({
                            caption: ProjectExplorerMessages.detachFromRepository(),
                            color: "#ff8080",
                            callback: (element: AccordionElement) => {
                                let workspace: Workspace = element.externalElement;
                                workspace.repository_id = null;
                                workspace.saved = false;
                                this.main.networkManager.sendUpdatesAsync(true).then(() => {
                                    that.workspaceListPanel.setElementClass(element, "workspace");
                                    workspace.renderSynchronizeButton(element);
                                });
                            }
                        });
                    }
                }

                cmiList.push({
                    caption: ProjectExplorerMessages.settings() + "...",
                    callback: (element: AccordionElement) => {
                        let workspace: Workspace = element.externalElement;
                        new WorkspaceSettingsDialog(workspace, this.main).open();
                    }
                })

            }

            return cmiList;
        }

    }

    onHomeButtonClicked() {
        this.workspaceListPanel.$buttonNew.show();
        this.workspaceListPanel.$newFolderAction.show();

        this.main.teacherExplorer.restoreOwnWorkspaces();
        this.main.networkManager.updateFrequencyInSeconds = this.main.networkManager.ownUpdateFrequencyInSeconds;
        this.$homeAction.hide();
        this.fileListPanel.enableNewButton(this.main.workspaceList.length > 0);
    }

    renderFiles(workspace: Workspace) {

        let name = workspace == null ? ProjectExplorerMessages.noWorkspace() : workspace.name;

        this.fileListPanel.setCaption(name);
        this.fileListPanel.clear();

        if (this.main.getCurrentWorkspace() != null) {
            for (let file of this.main.getCurrentWorkspace().getFiles()) {
                file.panelElement = null;
            }
        }

        if (workspace != null) {
            let files: GUIFile[] = workspace.getFiles().slice();

            files.sort((a, b) => { return a.name > b.name ? 1 : a.name < b.name ? -1 : 0 });

            for (let file of files) {

                file.panelElement = {
                    name: file.name,
                    externalElement: file,
                    isFolder: false,
                    path: [],
                    iconClass: FileTypeManager.filenameToFileType(file.name).iconclass,
                    readonly: workspace.readonly,
                    isPruefungFolder: false
                };

                this.fileListPanel.addElement(file.panelElement, true);
                this.renderHomeworkButton(file);
            }

            this.fileListPanel.sortElements();

        }
    }

    renderWorkspaces(workspaceList: Workspace[]) {

        this.fileListPanel.clear();
        this.workspaceListPanel.clear();

        for (let w of workspaceList) {
            let path = w.path.split("/");
            if (path.length == 1 && path[0] == "") path = [];
            w.panelElement = {
                name: w.name,
                externalElement: w,
                iconClass: w.repository_id == null ? 'workspace' : 'repository',
                isFolder: w.isFolder,
                path: path,
                readonly: w.readonly,
                isPruefungFolder: false
            };

            this.workspaceListPanel.addElement(w.panelElement, false);

            w.renderSynchronizeButton(w.panelElement);
        }

        this.workspaceListPanel.sortElements();
        this.fileListPanel.enableNewButton(workspaceList.length > 0);
        // setTimeout(() => {
        //     this.workspaceListPanel.collapseAll();
        // }, 500);

    }

    renderErrorCount(workspace: Workspace, errorCountMap: Map<GUIFile, number>) {
        if (errorCountMap == null) return;
        for (let f of workspace.getFiles()) {
            let errorCount: number = errorCountMap.get(f);
            let errorCountS: string = ((errorCount == null || errorCount == 0) ? "" : "(" + errorCount + ")");

            this.fileListPanel.setTextAfterFilename(f.panelElement, errorCountS, 'jo_errorcount');
        }
    }

    showRepositoryButtonIfNeeded(w: Workspace) {
        if (w.repository_id != null && w.owner_id == this.main.user.id) {
            this.$synchronizeAction.show();

            if (!this.main.user.settings.helperHistory.repositoryButtonDone) {

                Helper.showHelper("repositoryButton", this.main, this.$synchronizeAction);

            }



        } else {
            this.$synchronizeAction.hide();
        }
    }

    setWorkspaceActive(w: Workspace, scrollIntoView: boolean = false) {

        /*
        * monaco editor counts LanguageChangedListeners and issues ugly warnings in console if more than
        * 200, 300, ... are created. Unfortunately it creates one each time a monaco.editor.ITextModel is created.
        * To keep monaco.editor.ITextModel instance count low we instantiate it only when needed and dispose of it
        * when switching to another workspace.
        */
        if(w == null) return;
        this.main.editor.editor.setModel(null); // detach current model from editor
        this.main.getCurrentWorkspace()?.disposeMonacoModels();
        w.createMonacoModels();

        DatabaseNewLongPollingListener.close();

        this.workspaceListPanel.select(w, false, scrollIntoView);

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

            if (files.length == 0 && !this.main.user.settings.helperHistory.newFileHelperDone) {

                Helper.showHelper("newFileHelper", this.main, this.fileListPanel.$captionElement);

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
            this.fileListPanel.setCaption(ProjectExplorerMessages.noFile());
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
        this.fileListPanel.select(f, false);

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

        this.fileListPanel.$listElement.parent().css('background-color', color);
        this.workspaceListPanel.$listElement.parent().css('background-color', color);

        this.workspaceListPanel.setCaption(caption);
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
                this.main.projectExplorer.$homeAction.show();
                Helper.showHelper("homeButtonHelper", this.main);
                this.main.networkManager.updateFrequencyInSeconds = this.main.networkManager.teacherUpdateFrequencyInSeconds;
                this.main.networkManager.secondsTillNextUpdate = this.main.networkManager.teacherUpdateFrequencyInSeconds;

                if (!isTeacherAndInPruefungMode) {
                    this.main.bottomDiv.homeworkManager.attachToWorkspaces(this.main.workspaceList);
                    this.main.bottomDiv.showHomeworkTab();
                }
            }

            if (pruefung != null) {
                this.workspaceListPanel.$buttonNew.hide();
                this.workspaceListPanel.$newFolderAction.hide();
            } else {
                this.workspaceListPanel.$buttonNew.show();
                this.workspaceListPanel.$newFolderAction.show();
            }
        }



    }

    markFilesAsStartable(files: GUIFile[], active: boolean) {
        this.fileListPanel.markElementsAsStartable(files, active, (file: GUIFile) => {
            this.main.getInterpreter().start(file);
        });
    }


}