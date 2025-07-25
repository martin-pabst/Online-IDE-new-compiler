import jQuery from 'jquery';
import { makeDiv } from "../../../tools/HtmlTools.js";
import { dateToStringWithoutTime, stringToDate } from "../../../tools/StringTools.js";
import { Workspace } from "../../workspace/Workspace.js";
import { Main } from "../Main.js";
import { GUIFile } from '../../workspace/File.js';
import * as monaco from 'monaco-editor'
import { Tab, TabManager } from '../../../tools/TabManager.js';
import { HomeworkManagerMessages } from './language/GUILanguage.js';


type FileWithWorkspace = {
    file: GUIFile,
    workspace: Workspace
}

type DayWithModules = {
    date: Date;
    day: string;
    modules: FileWithWorkspace[];
}

export class HomeworkManager {

    $homeworkTabLeft: JQuery<HTMLElement>;
    $homeworkTabRight: JQuery<HTMLElement>;

    $showRevisionButton: JQuery<HTMLElement>;
    showRevisionActive: boolean = false;

    diffEditor: monaco.editor.IStandaloneDiffEditor;

    tab: Tab;

    constructor(private main: Main, public tabManager: TabManager) {
        this.tab = new Tab(HomeworkManagerMessages.homework(), ["jo_homeworkTab"]);
        tabManager.addTab(this.tab);
    }

    initGUI() {
        let that = this;
        let $homeworkTab = jQuery(this.tab.bodyDiv);
        $homeworkTab.append(this.$homeworkTabLeft = makeDiv("", "jo_homeworkTabLeft jo_scrollable"));
        $homeworkTab.append(this.$homeworkTabRight = makeDiv("", "jo_homeworkTabRight jo_scrollable"));
        this.$showRevisionButton = makeDiv("", "jo_button jo_active jo_homeworkRevisionButton", "")
        jQuery('#view-mode').prepend(this.$showRevisionButton);
        this.$showRevisionButton.on("click", () => {
            if (this.showRevisionActive) {
                this.hideRevision();
            } else {
                this.showRevision(that.main.getCurrentWorkspace()?.getCurrentlyEditedFile());
            }
        });
        this.$showRevisionButton.hide();
        jQuery('#diffEditor').hide();
    }

    showHomeWorkRevisionButton() {
        this.$showRevisionButton.text(this.showRevisionActive ? HomeworkManagerMessages.defaultView() : HomeworkManagerMessages.showRemarks());
        this.$showRevisionButton.show();
    }

    hideHomeworkRevisionButton() {
        this.$showRevisionButton.hide();
    }

    showRevision(file: GUIFile) {

        jQuery('#editor').hide();
        jQuery('#diffEditor').show();

        var originalModel = monaco.editor.createModel(file.text_before_revision, "myJava");
        var modifiedModel = monaco.editor.createModel(file.getText(), "myJava");

        this.diffEditor = monaco.editor.createDiffEditor(document.getElementById("diffEditor"), {
            // You can optionally disable the resizing
            enableSplitViewResizing: true,
            originalEditable: false,
            readOnly: true,
            // Render the diff inline
            renderSideBySide: true
        });

        this.diffEditor.setModel({
            original: originalModel,
            modified: modifiedModel
        });

        this.showRevisionActive = true;
        this.showHomeWorkRevisionButton();
    }

    hideRevision() {
        if (this.showRevisionActive) {

            jQuery('#diffEditor').hide();
            this.diffEditor.dispose();
            this.diffEditor = null;
            jQuery('#editor').show();

            this.showRevisionActive = false;
            this.showHomeWorkRevisionButton();
        }
    }


    attachToWorkspaces(workspaces: Workspace[]) {

        let daysWithModules: DayWithModules[] = [];
        let map: { [day: string]: DayWithModules } = {};

        workspaces.forEach(ws => {
            ws.getFiles().forEach(file => {

                let dateString = file.submitted_date;
                if (dateString != null) {

                    let date: Date = stringToDate(dateString);
                    let dateWithoutTime = dateToStringWithoutTime(date);
                    let dwm: DayWithModules = map[dateWithoutTime];
                    if (dwm == null) {
                        dwm = {
                            date: date,
                            day: dateWithoutTime,
                            modules: []
                        };
                        map[dateWithoutTime] = dwm;
                        daysWithModules.push(dwm);
                    }
                    dwm.modules.push({file: file, workspace: ws});

                }

            });

        });

        this.$homeworkTabLeft.empty();
        this.$homeworkTabRight.empty();

        let that = this;

        this.$homeworkTabLeft.append(makeDiv("", "jo_homeworkHeading", HomeworkManagerMessages.filingDays() + ":"));


        daysWithModules.sort((a, b) => {
            if (a.date.getFullYear() != b.date.getFullYear()) return -Math.sign(a.date.getFullYear() - b.date.getFullYear());
            if (a.date.getMonth() != b.date.getMonth()) return -Math.sign(a.date.getMonth() - b.date.getMonth());
            if (a.date.getDate() != b.date.getDate()) return -Math.sign(a.date.getDate() - b.date.getDate());
            return 0;
        });

        let first: boolean = true;

        daysWithModules.forEach(dwm => {

            dwm.modules.sort((m1, m2) => m1.file.name.localeCompare(m2.file.name));

            let $div = makeDiv("", "jo_homeworkDate", dwm.day);
            this.$homeworkTabLeft.append($div);

            $div.on("click", (e) => {
                this.$homeworkTabLeft.find('.jo_homeworkDate').removeClass('jo_active');
                $div.addClass('jo_active');
                that.select(dwm);
            });

            if (first) {
                first = false;
                $div.addClass('jo_active');
                that.select(dwm);
            }

        });

    }

    select(dwm: DayWithModules) {
        this.$homeworkTabRight.empty();
        this.$homeworkTabRight.append(makeDiv("", "jo_homeworkHeading", HomeworkManagerMessages.givenFiles() + ":"));
        let that = this;
        dwm.modules.forEach(moduleWithWorkspace => {
            let $div = jQuery(`<div class="jo_homeworkEntry">${HomeworkManagerMessages.workspace()} <span class="jo_homework-workspace">
                    ${moduleWithWorkspace.workspace.name}</span>, ${HomeworkManagerMessages.file()} <span class="jo_homework-file">
                    ${moduleWithWorkspace.file.name}</span> (${HomeworkManagerMessages.dateFiled()}: ${moduleWithWorkspace.file.submitted_date} )</div>`);
            that.$homeworkTabRight.append($div);
            $div.on("click", () => {
                    that.main.projectExplorer.setWorkspaceActive(moduleWithWorkspace.workspace, true);
                    that.main.projectExplorer.setFileActive(moduleWithWorkspace.file);
                    that.main.projectExplorer.fileListPanel.select(moduleWithWorkspace.file, false);
            });
        })

    }



}