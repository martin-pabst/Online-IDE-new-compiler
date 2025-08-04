import { Tab, TabManager } from "../../tools/TabManager.ts";
import { Dialog } from "../main/gui/Dialog.ts";
import { Main } from "../main/Main.ts";
import { SettingsMessages } from "./SettingsMessages.ts";
import { SettingsScope } from "./SettingsMetadata.ts";
import '/assets/css/settings.css';

export class SettingsGUI {

    constructor(private main: Main){

    }

    open(){
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
        userSettingsTab.onShow = () => {  this.showTab("user"); };
        tabManager.addTab(userSettingsTab);
        tabManager.setActive(userSettingsTab);      

        let classSettingsTab = new Tab(SettingsMessages.ClassSettingsTabHeading(), []);
        classSettingsTab.onShow = () => {  this.showTab("class"); };
        tabManager.addTab(classSettingsTab);

        let schoolSettingsTab = new Tab(SettingsMessages.SchoolSettingsTabHeading(), []);
        schoolSettingsTab.onShow = () => {  this.showTab("school"); };
        tabManager.addTab(schoolSettingsTab);



    }

    showTab(scope: SettingsScope) {
    
    }

}