import { Tab, TabManager } from "../../tools/TabManager.ts";
import { ajaxAsync } from "../communication/AjaxHelper.ts";
import { GetSettingsResponse } from "../communication/Data.ts";
import { Dialog } from "../main/gui/Dialog.ts";
import { Main } from "../main/Main.ts";
import { SettingsMessages } from "./SettingsMessages.ts";
import { SettingsScope, SettingValues } from "./SettingsMetadata.ts";
import '/assets/css/settings.css';

export class SettingsGUI {

    userSettings: SettingValues | null; // settings for user 
    classSettings?: { classId: number, className: number, settings: SettingValues }[] | null; // settings for classes if user is teacher
    schoolSettings?: SettingValues | null; // settings for school if user is schooladmin

    currentScope: SettingsScope = "user"; // current scope of settings, can be user, class or school
    currentSettings: SettingValues | null = null; // current settings for the selected scope
    currentClassId: number | null = null; // current class id if scope is class


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

        let $settingsLeftMenuDiv = jQuery('<div class="jo_settingsLeftMenu"></div>');
        $tabBody.append($settingsLeftMenuDiv);

        let $settingsMainDiv = jQuery('<div class="jo_settingsMain jo_scrollable"></div>');
        $tabBody.append($settingsMainDiv);

        let tabManager = new TabManager($tabDiv[0], true);

        let userSettingsTab = new Tab(SettingsMessages.UserSettingsTabHeading(), []);
        userSettingsTab.onShow = () => { this.showTab("user"); };
        tabManager.addTab(userSettingsTab);
        tabManager.setActive(userSettingsTab);

        let classSettingsTab = new Tab(SettingsMessages.ClassSettingsTabHeading(), []);
        classSettingsTab.onShow = () => { this.showTab("class"); };
        tabManager.addTab(classSettingsTab);

        let schoolSettingsTab = new Tab(SettingsMessages.SchoolSettingsTabHeading(), []);
        schoolSettingsTab.onShow = () => { this.showTab("school"); };
        tabManager.addTab(schoolSettingsTab);


    }

    async getSettingsFromServer(){
        let response = <GetSettingsResponse> await ajaxAsync("/servlet/getSettings", {})
        this.classSettings = response.classSettings;
        this.schoolSettings = response.schoolSettings;
    }

    showTab(scope: SettingsScope) {

    }



}