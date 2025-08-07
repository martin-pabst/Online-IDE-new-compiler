import { Tab, TabManager } from "../../tools/TabManager.ts";
import { ajaxAsync } from "../communication/AjaxHelper.ts";
import { GetSettingsResponse, UpdateSettingsDataRequest, UpdateSettingsDataResponse, UpdateUserSettingsRequest } from "../communication/Data.ts";
import { Dialog } from "../main/gui/Dialog.ts";
import { Main } from "../main/Main.ts";
import { SettingsMessages } from "./SettingsMessages.ts";
import { AllSettingsMetadata, GroupOfSettingMetadata, SettingMetadata, SettingsScope, SettingValue, SettingValues } from "./SettingsMetadata.ts";
import jQuery from 'jquery';
import '/assets/css/settings.css';
import { getSelectedObject, SelectItem, setSelectItems } from "../../tools/HtmlTools.ts";
import { Treeview } from "../../tools/components/treeview/Treeview.ts";

type ClassSettings = { classId: number, className: string, settings: SettingValues };

export class SettingsGUI {

    userSettings: SettingValues | null; // settings for user 
    ownClassSettings?: SettingValues | null;
    classSettings?: ClassSettings[] | null; // settings for classes if user is teacher
    schoolSettings?: SettingValues | null; // settings for school if user is schooladmin

    currentScope: SettingsScope = "user"; // current scope of settings, can be user, class or school
    currentSettingsGroup: GroupOfSettingMetadata | null = null; // current settings group in the explorer
    currentSettings: SettingValues | null = null; // current settings for the selected scope
    currentClassId: number | null = null; // current class id if scope is class

    $settingsLeftMenuDiv: JQuery<HTMLDivElement>; // left menu for settings tabs
    $settingsMainDiv: JQuery<HTMLDivElement>; // main div for settings content

    settingsExplorer: Treeview<GroupOfSettingMetadata>;

    constructor(private main: Main) {
        this.userSettings = main.settings.values.user || {};
        this.ownClassSettings = main.settings.values.class;
        this.schoolSettings = main.settings.values.school;
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
            classSettingsTab.onShow = () => { 
                this.showSettingsData("class"); 
            };
            tabManager.addTab(classSettingsTab);

            let $selectElement: JQuery<HTMLSelectElement> = jQuery('<select class="jo_settingsSelect"></select>');
            classSettingsTab.headingDiv.append($selectElement[0]);

            setSelectItems($selectElement, this.classSettings.map(cs => ({
                value: cs.classId,
                object: cs,
                caption: cs.className
            })));

            this.currentClassId = this.classSettings[0].classId;

            $selectElement.on('change', () => {
                let cs: ClassSettings = getSelectedObject($selectElement);
                this.currentClassId = cs.classId;
                if(this.currentScope == 'class'){
                    this.showSettingsData();
                }
            })

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
        if (response.success) {
            this.classSettings = response.classSettings;
            this.schoolSettings = response.schoolSettings;
        }
    }

    showSettingsData(scope?: SettingsScope) {
        if (scope) this.currentScope = scope;
        this.$settingsMainDiv.empty();

        if (!this.currentSettingsGroup) return;

        this.$settingsMainDiv.append(jQuery(`<div class="jo_settingsGroupCaption">${this.currentSettingsGroup.name()}</div>`));
        if (this.currentSettingsGroup.description) this.$settingsMainDiv.append(jQuery(`<div style="margin-bottom: 10px">${this.currentSettingsGroup.description()}</div>`));

        for (let setting of this.currentSettingsGroup.settings.filter(s => s.settingType == 'setting')) {
            let $settingDiv = jQuery(`<div class="jo_settingDiv"></div>`);
            this.$settingsMainDiv.append($settingDiv);
            this.renderSetting(setting, $settingDiv);
        }
    }

    renderSetting(setting: SettingMetadata, $settingDiv: JQuery<HTMLElement>) {
        $settingDiv.append(jQuery(`<div class="jo_settingCaption">${setting.name()}</div>`));
        if (setting.description) $settingDiv.append(jQuery(`<div>${setting.description()}</div>`));

        let key = setting.key;
        let currentSettingValue = this.getCurrentSettingValues()[key];
        let defaultSettingValue = this.getDefaultSettingValue(key);

        switch (setting.type) {
            case 'boolean':
                let optionCaptions: string[] = ["true", "false"];
                if (setting.optionTexts) optionCaptions = setting.optionTexts.map(t => t());
                optionCaptions.push("default: " + (defaultSettingValue ? optionCaptions[0] : optionCaptions[1]));
                let optionValues: SettingValue[] = [true, false, undefined]
                this.appendSelectElement($settingDiv, optionCaptions, optionValues, currentSettingValue, 
                    async (selectedValue, $savingMessage) => {
                    await this.storeAndSave(setting.key, selectedValue, $savingMessage);
                })
                break;
            case 'string':
                this.appendInputElement($settingDiv, <string>currentSettingValue, defaultSettingValue, 
                    async (selectedValue, $savingMessage) => {
                    await this.storeAndSave(setting.key, selectedValue, $savingMessage)
                })
                break;
            case 'enumeration':
                let optionCaptions1: string[] = setting.optionTexts.map(t => t());
                optionCaptions1.push("default: " + defaultSettingValue);
                let optionValues1: SettingValue[] = setting.optionValues.slice();
                optionValues1.push(undefined);

                this.appendSelectElement($settingDiv, optionCaptions, optionValues, currentSettingValue, 
                    async (selectedValue, $savingMessage) => {
                    await this.storeAndSave(setting.key, selectedValue, $savingMessage);
                })
                break;
        }

    }

    async storeAndSave(key: string, selectedValue: string | number | boolean, $savingMessage: JQuery<HTMLDivElement>) {
        this.getCurrentSettingValues()[key] = selectedValue;
        let request: UpdateSettingsDataRequest = {
            userId: this.currentScope == 'user' ? this.main.user.id : undefined,
            klasseId: this.currentScope == 'class' ? this.currentClassId : undefined,
            schuleId: this.currentScope == 'school' ? this.main.user.schule_id : undefined,
            settings: this.getCurrentSettingValues()
        }

        $savingMessage.text('saving...');
        $savingMessage.css('color', 'var(--loginMessageColor)');
        $savingMessage.show();
        let response: UpdateSettingsDataResponse = await ajaxAsync('/servlet/updateSettings', request);
        $savingMessage.text('-> saved✓');
        $savingMessage.css('color', 'var(--loginButtonBackground)')
    }

    wrapWithSavingMessageAndAppendToParent($element: JQuery<HTMLElement>, $parent: JQuery<HTMLElement>): JQuery<HTMLDivElement>{
        let $wrapper = jQuery(`<div class='jo_settingsWrapper'></div>`);
        $wrapper.append($element);
        let $savingMessage: JQuery<HTMLDivElement> = jQuery(`<div class='jo_settingsSavingMessage'>saving...</div>`);
        $wrapper.append($savingMessage);
        $savingMessage.hide();
        $parent.append($wrapper);
        return $savingMessage;

    }

    appendInputElement($parent: JQuery<HTMLElement>, currentValue: string, defaultValue: string,
        onChangedCallback: (selectedValue: SettingValue, $savingMessage: JQuery<HTMLDivElement>) => Promise<void>
    ) {
        let $inputElement: JQuery<HTMLInputElement> = jQuery(`<input type='text' placeholder='default: ${defaultValue}' class='jo_settingsInput'>`);
        let $savingMessage = this.wrapWithSavingMessageAndAppendToParent($inputElement, $parent);
        $inputElement.on('focusout', async () => {
            let value = $inputElement.val();
            if (value == '') value = undefined; // default-value!
            await onChangedCallback(value, $savingMessage);
        })

        $inputElement.on('change', () => {
            $savingMessage.hide();
        })
    }

    appendSelectElement($parent: JQuery<HTMLElement>,
        optionCaptions: string[],
        optionValues: SettingValue[],
        selectedValue: SettingValue,   // undefined -> defaultCaption 
        onChangedCallback: (selectedValue: SettingValue, $savingMessage: JQuery<HTMLDivElement>) => Promise<void>
    ) {

        let $selectElement: JQuery<HTMLSelectElement> = jQuery('<select class="jo_settingsSelect"></select>');

        let $savingMessage = this.wrapWithSavingMessageAndAppendToParent($selectElement, $parent);

        let selectItems: SelectItem[] = [];
        for (let i = 0; i < optionValues.length; i++) {
            selectItems.push({
                value: optionCaptions[i],
                caption: optionCaptions[i],
                object: optionValues[i]
            })
        }

        setSelectItems($selectElement, selectItems)

        let selectedIndex: number = selectItems.findIndex(item => item.object === selectedValue);
        $selectElement[0].selectedIndex = selectedIndex;

        $selectElement.on('change',
            async () => {
                await onChangedCallback(getSelectedObject($selectElement), $savingMessage);
            }
        );

    }


    getDefaultSettingValue(key: string) {
        let value = this.getCurrentSettingValues()[key];
        if (typeof value == 'undefined') {
            if (this.currentScope == 'user' && this.ownClassSettings) {
                value = this.ownClassSettings[key];
            }
            if (typeof value == 'undefined') {
                value = this.schoolSettings[key];
            }
            if (typeof value == 'undefined') {
                value = this.main.settings.values.default[key];
            }
        }
        return value;
    }

    getCurrentSettingValues(): SettingValues {
        switch (this.currentScope) {
            case 'user': return this.userSettings;
            case 'class': if (!(this.main.user.is_schooladmin || this.main.user.is_admin || this.main.user.is_teacher)) return this.ownClassSettings;
                return this.classSettings.find(cs => cs.classId == this.currentClassId)?.settings || {};
            case 'school': return this.schoolSettings;
        }
        return {};
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