import { Tab, TabManager } from "../../tools/TabManager.ts";
import { ajaxAsync } from "../communication/AjaxHelper.ts";
import { GetSettingsResponse } from "../communication/Data.ts";
import { Dialog } from "../main/gui/Dialog.ts";
import { Main } from "../main/Main.ts";
import { SettingsMessages } from "./SettingsMessages.ts";
import { AllSettingsMetadata, GroupOfSettingMetadata, SettingsScope, SettingValues } from "./SettingsMetadata.ts";
import jQuery from 'jquery';
import '/assets/css/settings.css';
import { setSelectItems } from "../../tools/HtmlTools.ts";
import { Treeview } from "../../tools/components/treeview/Treeview.ts";
import { TreeviewNode } from "../../tools/components/treeview/TreeviewNode.ts";

export class SettingsGUI {

    userSettings: SettingValues | null; // settings for user 
    classSettings?: { classId: number, className: string, settings: SettingValues }[] | null; // settings for classes if user is teacher
    schoolSettings?: SettingValues | null; // settings for school if user is schooladmin

    currentScope: SettingsScope = "user"; // current scope of settings, can be user, class or school
    currentSettingsGroup: GroupOfSettingMetadata | null = null; // current settings group in the explorer
    currentSettings: SettingValues | null = null; // current settings for the selected scope
    currentClassId: number | null = null; // current class id if scope is class

    $settingsLeftMenuDiv: JQuery<HTMLDivElement>; // left menu for settings tabs
    $settingsMainDiv: JQuery<HTMLDivElement>; // main div for settings content

    settingsExplorer: Treeview<GroupOfSettingMetadata>;

    constructor(private main: Main) {
        this.userSettings = main.user.settings.settings || {};
    }

    async open() {
        await this.getSettingsFromServer();

        let dialog = new Dialog();
        dialog.initAndOpen();
        dialog.heading(SettingsMessages.SettingsHeading());

        let $tabDiv = jQuery('<div></div>');
        dialog.addDiv($tabDiv);

        let $tabBody = jQuery('<div class="jo_settingsTabBody"></div>');
        dialog.addDiv($tabBody);

        this.$settingsLeftMenuDiv = jQuery('<div class="jo_settingsLeftMenu"></div>');
        $tabBody.append(this.$settingsLeftMenuDiv);

        this.$settingsMainDiv = jQuery('<div class="jo_settingsMain jo_scrollable"></div>');
        $tabBody.append(this.$settingsMainDiv);

        let tabManager = new TabManager($tabDiv[0], true);

        let userSettingsTab = new Tab(SettingsMessages.UserSettingsTabHeading(), []);
        userSettingsTab.onShow = () => { this.showSettingsData("user"); };
        tabManager.addTab(userSettingsTab);
        tabManager.setActive(userSettingsTab);

        if (this.classSettings && this.classSettings.length > 0) {
            let classSettingsTab = new Tab(SettingsMessages.ClassSettingsTabHeading(), []);
            classSettingsTab.onShow = () => { this.showSettingsData("class"); };
            tabManager.addTab(classSettingsTab);

            let $selectElement: JQuery<HTMLSelectElement> = jQuery('<select class="jo_settingsSelect"></select>');
            classSettingsTab.headingDiv.append($selectElement[0]);

            setSelectItems($selectElement, this.classSettings.map(cs => ({
                value: cs.classId,
                object: cs,
                caption: cs.className
            })));

        }

        if (this.schoolSettings) {
            let schoolSettingsTab = new Tab(SettingsMessages.SchoolSettingsTabHeading(), []);
            schoolSettingsTab.onShow = () => { this.showSettingsData("school"); };
            tabManager.addTab(schoolSettingsTab);
        }

        dialog.buttons([
            {
                caption: SettingsMessages.CloseButton(),
                color: 'green',
                callback: () => { dialog.close(); }
            }
        ]);

        this.initSettingsExplorer();
    }

    async getSettingsFromServer() {
        let response = <GetSettingsResponse>await ajaxAsync("/servlet/getSettings", {})
        this.classSettings = response.classSettings;
        this.schoolSettings = response.schoolSettings;
    }

    showSettingsData(scope?: SettingsScope) {
        if(scope) this.currentScope = scope;
        this.$settingsMainDiv.empty();

        if(!this.currentSettingsGroup) return;

        this.$settingsMainDiv.append(jQuery(`<div class="jo_settingsGroupCaption">${this.currentSettingsGroup.name()}</div>`));
        this.$settingsMainDiv.append(jQuery(`<div>${this.currentSettingsGroup.description()}</div>`));


    }


    initSettingsExplorer() {
        this.settingsExplorer = new Treeview(this.$settingsLeftMenuDiv[0], {
            withSelection: true,
            selectMultiple: false,
            captionLine: {
                enabled: false
            },
            buttonAddElements: false,
            buttonAddFolders: false,
            withFolders: true,
            withDeleteButtons: false,
            withDragAndDrop: false
        })

        for (let settingsGroup of AllSettingsMetadata.filter(sg => sg.settingType === 'group')) {
            this.addSettingsToExplorer(settingsGroup);
        }

        this.settingsExplorer.onNodeClickedHandler = (element: GroupOfSettingMetadata) => {
            this.currentSettingsGroup = element;
            this.showSettingsData();
        }

    }

    addSettingsToExplorer(settingsGroup: GroupOfSettingMetadata, parent: GroupOfSettingMetadata | null = null) {


        this.settingsExplorer.addNode(settingsGroup.settings.find(s => s.settingType === 'group') != null, settingsGroup.name(), undefined, settingsGroup,
            settingsGroup, parent, true);

        settingsGroup.settings.filter(s => s.settingType === 'group').forEach(childGroup => {
            this.addSettingsToExplorer(childGroup, settingsGroup);
        });

    }


}