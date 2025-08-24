import { Main } from "../Main.js";
import { ClassData, UserData, Pruefung, PruefungCaptions, getUserDisplayName } from "../../communication/Data.js";
import { ajaxAsync, csrfToken } from "../../communication/AjaxHelper.js";
import { Workspace } from "../../workspace/Workspace.js";
import { GUIToggleButton } from "../../../tools/components/GUIToggleButton.js";
import jQuery from "jquery";
import { PushClientManager } from "../../communication/pushclient/PushClientManager.js";
import * as monaco from 'monaco-editor'
import { TeacherExplorerMessages } from "./language/GUILanguage.js";
import { Treeview } from "../../../tools/components/treeview/Treeview.js";


export class TeacherExplorer {

    studentPanel: Treeview<UserData, UserData>;
    classPanel: Treeview<ClassData | Pruefung, ClassData | Pruefung>;

    // save them here when displaying pupils workspaces:
    ownWorkspaces: Workspace[];
    currentOwnWorkspace: Workspace;

    pruefungen: Pruefung[] = [];

    classPanelMode: "classes" | "tests" = "classes";

    currentPruefung: Pruefung = null;


    constructor(private main: Main, public classData: ClassData[]) {
        this.fetchPruefungen();
    }

    removePanels() {
        this.classPanel.setVisible(false);
        this.studentPanel.setVisible(false);
    }

    initGUI() {

        this.initStudentPanel();

        this.initClassPanel();

        this.main.projectExplorer.accordion.onResize(true);

        this.renderClasses(this.classData);

        PushClientManager.subscribe("onPruefungChanged", async () => {
            if (this.classPanelMode == "tests") {
                await this.fetchPruefungen()
                this.renderPruefungen();
            }
        });

    }

    initStudentPanel() {

        this.studentPanel = new Treeview(this.main.projectExplorer.accordion,
            {
                captionLine: {
                    enabled: true,
                    text: TeacherExplorerMessages.students()
                },
                withSelection: true,
                selectMultiple: false,
                isDragAndDropSource: false,
                buttonAddElements: false,
                withDeleteButtons: false,
                buttonAddFolders: false,
                defaultIconClass: "img_user-dark",
                flexWeight: "1",
                minHeight: 100,
                withFolders: false,
                comparator: (a, b) => {
                    if (a.vidis_akronym && b.vidis_akronym) {
                        return getUserDisplayName(a) > getUserDisplayName(b) ? 1 : -1;
                    }
                    if (a.familienname > b.familienname) return 1;
                    if (b.familienname > a.familienname) return -1;
                    if (a.rufname > b.rufname) return 1;
                    if (b.rufname > a.rufname) return -1;
                    return 0;
                }
            }
        );

        this.studentPanel.nodeClickedCallback = (student: UserData) => {
            if (this.classPanelMode == "classes") {
                this.main.projectExplorer.fetchAndRenderWorkspaces(student, this);
            } else {
                this.main.projectExplorer.fetchAndRenderWorkspaces(student, this, this.currentPruefung);
            }
        }

    }

    restoreOwnWorkspaces() {
        let main = this.main;

        main.getMainEditor().updateOptions({ readOnly: true });

        main.workspaceList = this.ownWorkspaces;
        main.currentWorkspace = this.currentOwnWorkspace;
        main.workspacesOwnerId = main.user.id;
        main.projectExplorer.setExplorerColor(null);

        main.projectExplorer.renderWorkspaces(main.workspaceList);

        if (main.currentWorkspace == null && main.workspaceList.length > 0) {
            main.currentWorkspace = main.workspaceList[0];
        }

        if (main.currentWorkspace != null) {
            main.projectExplorer.setWorkspaceActive(main.currentWorkspace, true);
        }

        this.studentPanel.selectElement(null, false);

    }

    initClassPanel() {
        let that = this;

        let $buttonContainer = jQuery('<div class="joe_teacherExplorerClassButtons"></div>');
        let toggleButtonClass = new GUIToggleButton(TeacherExplorerMessages.classes(), $buttonContainer, true);
        let toggleButtonTest = new GUIToggleButton(TeacherExplorerMessages.tests(), $buttonContainer, false);
        toggleButtonClass.linkTo(toggleButtonTest);

        this.classPanel = new Treeview(this.main.projectExplorer.accordion, {
            captionLine: {
                enabled: true,
                element: $buttonContainer[0]
            },
            withSelection: true,
            selectMultiple: false,
            isDragAndDropSource: false,
            buttonAddElements: false,
            withDeleteButtons: false,
            buttonAddFolders: false,
            defaultIconClass: "img_class-dark",
            flexWeight: "1",
            minHeight: 100,
            withFolders: false

        })

        let buttonPruefungAdministration = this.classPanel.captionLineAddIconButton("img_gear-dark", () => {
            window.open(`administration_mc.html?csrfToken=${csrfToken}`, '_blank').focus();
        }, TeacherExplorerMessages.createNewTest());

        buttonPruefungAdministration.setVisible(false);

        this.classPanel.nodeClickedCallback = (classOrPruefung) => {

            that.main.networkManager.sendUpdatesAsync().then(() => {

                if (this.classPanelMode == "classes") {

                    let classData = <ClassData>classOrPruefung;
                    if (classData != null) {
                        this.renderStudents(classData.students);
                    }

                } else {
                    this.onSelectPruefung(<Pruefung>classOrPruefung);
                }
            });

        }

        toggleButtonTest.onChange(async (checked) => {
            buttonPruefungAdministration.setVisible(true);
            that.classPanelMode = checked ? "tests" : "classes";
            that.main.networkManager.sendUpdatesAsync().then(() => {
                if (checked) {
                    if (that.main.workspacesOwnerId == that.main.user.id) {
                        that.ownWorkspaces = that.main.workspaceList.slice();
                        that.currentOwnWorkspace = that.main.currentWorkspace;
                    }
                    this.renderPruefungen();
                    let firstPruefung = this.pruefungen.find(p => ["preparing", "running"].indexOf(p.state) < 0);
                    if (firstPruefung != null) {
                        this.classPanel.selectElement(firstPruefung, true);
                    }
                } else {
                    this.renderClasses(this.classData);
                    this.main.projectExplorer.onHomeButtonClicked();
                }
            })
        })

    }

    onSelectPruefung(p: Pruefung) {

        this.currentPruefung = p;
        let projectExplorer = this.main.projectExplorer;

        if (p.state == "preparing" || p.state == "running") {
            alert(TeacherExplorerMessages.testIsInState(PruefungCaptions[p.state]));

            projectExplorer.fileTreeview.clear();
            projectExplorer.fileTreeview.setCaption("---");
            projectExplorer.workspaceTreeview.clear();
            this.studentPanel.clear();
            this.main.getMainEditor().setModel(monaco.editor.createModel(TeacherExplorerMessages.noFile(), "text"));


        } else {
            let klass = this.classData.find(c => c.id == p.klasse_id);
            if (klass != null) {
                this.renderStudents(klass.students);
                if (klass.students.length > 0) {
                    this.studentPanel.selectElement(klass.students[0], true);
                }
            }
        }

    }

    renderStudents(userDataList: UserData[]) {
        this.studentPanel.clear();

        this.studentPanel.setCaption(userDataList.length + " " + TeacherExplorerMessages.students());

        userDataList.sort(this.studentPanel.config.comparator);

        for (let i = 0; i < userDataList.length; i++) {

            let ud = userDataList[i];
            this.studentPanel.addNode(false, getUserDisplayName(ud, true), "img_user-dark", ud);

        }

    }

    renderClasses(classDataList: ClassData[]) {
        this.studentPanel.clear();
        this.studentPanel.setCaption(TeacherExplorerMessages.students());
        this.classPanel.clear();

        classDataList.sort((a, b) => {
            return a.name.localeCompare(b.name);
        })

        for (let cd of classDataList) {
            this.classPanel.addNode(false, cd.name, "img_class-dark", cd);
        }

    }

    renderPruefungen() {
        this.classPanel.clear();

        this.pruefungen.forEach(p => this.addPruefungToClassPanel(p));
    }

    addPruefungToClassPanel(p: Pruefung) {

        this.classPanel.addNode(false, p.name, "img_test-state-preparing", p);
        this.updateClassNameAndState(p);

    }

    updateClassNameAndState(p: Pruefung) {
        let node = this.classPanel.findNodeByElement(p);
        if (!node) return;
        let klasse = this.classData.find(c => c.id == p.klasse_id);
        if (klasse != null) {
            node.renderCaptionAsHtml = true;
            node.caption =  `<span class="joe_pruefung_klasse" style="margin: 0 4px">${klasse.name}</span>`;
        }

        node.iconClass = "img_test-state-" + p.state;
        node.iconTooltip = PruefungCaptions[p.state];
    }

    async fetchPruefungen() {

        let response = await ajaxAsync("/servlet/getPruefungenForLehrkraft", {})
        this.pruefungen = response.pruefungen;

    }


}