import { AccordionPanel, AccordionElement } from "./Accordion.js";
import { Main } from "../Main.js";
import { ClassData, UserData, Pruefung, PruefungCaptions, getUserDisplayName } from "../../communication/Data.js";
import { ajaxAsync, csrfToken } from "../../communication/AjaxHelper.js";
import { Workspace } from "../../workspace/Workspace.js";
import { GUIToggleButton } from "../../../tools/components/GUIToggleButton.js";
import jQuery from "jquery";
import { PushClientManager } from "../../communication/pushclient/PushClientManager.js";
import * as monaco from 'monaco-editor'
import { ProjectExplorerMessages, TeacherExplorerMessages } from "./language/GUILanguage.js";


export class TeacherExplorer {

    studentPanel: AccordionPanel;
    classPanel: AccordionPanel;

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
        this.classPanel.remove();
        this.studentPanel.remove();
    }

    initGUI() {

        this.initStudentPanel();

        this.initClassPanel();

        this.renderClasses(this.classData);

        PushClientManager.subscribe("onPruefungChanged", async () => {
            if (this.classPanelMode == "tests") {
                await this.fetchPruefungen()
                this.renderPruefungen();
            }
        });

    }

    initStudentPanel() {

        this.studentPanel = new AccordionPanel(this.main.projectExplorer.accordion,
           TeacherExplorerMessages.students() , "3", null,
            "", "student", false, false, "student", false, [], "", "");

        this.studentPanel.selectCallback = (ae: UserData) => {
            if (this.classPanelMode == "classes") {
                this.main.projectExplorer.fetchAndRenderWorkspaces(ae, this);
            } else {
                this.main.projectExplorer.fetchAndRenderWorkspaces(ae, this, this.currentPruefung);
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

        this.studentPanel.select(null, false);

    }

    initClassPanel() {
        let that = this;

        let $buttonContainer = jQuery('<div class="joe_teacherExplorerClassButtons"></div>');
        let toggleButtonClass = new GUIToggleButton(TeacherExplorerMessages.classes(), $buttonContainer, true);
        let toggleButtonTest = new GUIToggleButton(TeacherExplorerMessages.tests(), $buttonContainer, false);
        toggleButtonClass.linkTo(toggleButtonTest);

        this.classPanel = new AccordionPanel(this.main.projectExplorer.accordion,
            $buttonContainer, "2", "", "", "class", false, false, "class", false, [], "", "");

        let $buttonPruefungAdministration = jQuery(`<a href='administration_mc.html?csrfToken=${csrfToken}' target='_blank'><div class="jo_button jo_active img_gear-dark" style="margin-right: 6px" title="Prüfungen verwalten..."></d>`);
        this.classPanel.$captionElement.find('.jo_actions').append($buttonPruefungAdministration);


        $buttonPruefungAdministration.attr("title", TeacherExplorerMessages.createNewTest()).hide();

        this.classPanel.selectCallback = (ea) => {

            that.main.networkManager.sendUpdatesAsync().then(() => {

                if (this.classPanelMode == "classes") {

                    let classData = <ClassData>ea;
                    if (classData != null) {
                        this.renderStudents(classData.students);
                    }

                } else {
                    this.onSelectPruefung(<Pruefung>ea);
                }
            });

        }

        toggleButtonTest.onChange(async (checked) => {
            $buttonPruefungAdministration.toggle(200);
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
                        this.classPanel.select(firstPruefung, true, true);
                    }
                } else {
                    this.renderClasses(this.classData);
                    this.main.projectExplorer.onHomeButtonClicked();
                }
            })
        })

        $buttonPruefungAdministration.on('pointerdown', (e) => {
            e.stopPropagation();
        })

    }

    onSelectPruefung(p: Pruefung) {

        this.currentPruefung = p;
        let projectExplorer = this.main.projectExplorer;

        if (p.state == "preparing" || p.state == "running") {
            alert(TeacherExplorerMessages.testIsInState(PruefungCaptions[p.state]));

            projectExplorer.fileListPanel.clear();
            projectExplorer.fileListPanel.setCaption("---");
            projectExplorer.workspaceListPanel.clear();
            this.studentPanel.clear();
            this.main.getMainEditor().setModel(monaco.editor.createModel(TeacherExplorerMessages.noFile(), "text"));


        } else {
            let klass = this.classData.find(c => c.id == p.klasse_id);
            if (klass != null) {
                this.renderStudents(klass.students);
                if (klass.students.length > 0) {
                    this.studentPanel.select(klass.students[0], true, true);
                }
            }
        }

    }

    renderStudents(userDataList: UserData[]) {
        this.studentPanel.clear();

        this.studentPanel.setCaption(userDataList.length + " " + TeacherExplorerMessages.students());

        userDataList.sort((a, b) => {
            if(a.vidis_akronym && b.vidis_akronym){
                return getUserDisplayName(a) > getUserDisplayName(b) ? 1 : -1;
            }
            if (a.familienname > b.familienname) return 1;
            if (b.familienname > a.familienname) return -1;
            if (a.rufname > b.rufname) return 1;
            if (b.rufname > a.rufname) return -1;
            return 0;
        })

        for (let i = 0; i < userDataList.length; i++) {
            let ud = userDataList[i];
            let ae: AccordionElement = {
                name: getUserDisplayName(ud, true),
                sortName: ud.vidis_akronym ? getUserDisplayName(ud) : ud.familienname + " " + ud.rufname,
                externalElement: ud,
                isFolder: false,
                path: [],
                readonly: false,
                isPruefungFolder: false
            }
            this.studentPanel.addElement(ae, true);
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
            let ae: AccordionElement = {
                name: cd.name,
                externalElement: cd,
                isFolder: false,
                path: [],
                readonly: false,
                isPruefungFolder: false
            }
            this.classPanel.addElement(ae, true);
        }

    }

    renderPruefungen() {
        this.classPanel.clear();

        this.pruefungen.forEach(p => this.addPruefungToClassPanel(p));
    }

    addPruefungToClassPanel(p: Pruefung) {
        let ae: AccordionElement = {
            name: p.name,
            externalElement: p,
            isFolder: false,
            path: [],
            iconClass: "test",
            readonly: false,
            isPruefungFolder: false
        }
        this.classPanel.addElement(ae, true);
        this.updateClassNameAndState(p);

    }

    updateClassNameAndState(p: Pruefung) {
        let ae: AccordionElement = this.classPanel.findElement(p);
        if (ae != null) {
            let klasse = this.classData.find(c => c.id == p.klasse_id);
            if (klasse != null) {
                let $text = ae.$htmlFirstLine.find(".joe_pruefung_klasse");
                if ($text.length == 0) {
                    $text = jQuery('<span class="joe_pruefung_klasse"></span>');
                    $text.css('margin', '0 4px');
                    ae.$htmlFirstLine.find(".jo_filename").append($text);
                }
                $text.text(`(${klasse.name})`);
            }

            this.classPanel.setElementClass(ae, "test-" + p.state, PruefungCaptions[p.state]);
        }
    }

    async fetchPruefungen() {

        let response = await ajaxAsync("/servlet/getPruefungenForLehrkraft", {})
        this.pruefungen = response.pruefungen;

    }


}