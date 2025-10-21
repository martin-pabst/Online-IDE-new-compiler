import { SettingsMessages } from "./SettingsMessages";
import { TranslatedText } from "../../tools/language/LanguageManager";
import { AllSettingsMetadata, GroupOfSettingMetadata, SettingMetadata, SettingValues } from "./SettingsMetadata";
import type { UserData } from "../communication/Data";
import { SettingDefaultValues, SettingKey, SettingsScope, SettingsStore, SettingValue } from "./SettingsStore";


export class Settings implements SettingsStore {

    hierarchy: SettingsScope[] = ['user', 'class', 'school', 'default'];
    hieararchyTexts: TranslatedText[] = [
        SettingsMessages.ScopeUser,
        SettingsMessages.ScopeClass,
        SettingsMessages.ScopeSchool
    ];

    values: Record<SettingsScope, SettingValues> = {
        user: {},
        class: {},
        school: {},
        default: {}
    }

    constructor(private user: UserData | undefined, 
        userSettings: SettingValues | undefined,
        classSettings: SettingValues | undefined, schoolSettings: SettingValues | undefined) {
        // Initialize default values
        for (let setting of AllSettingsMetadata) {
            this.setDefaultValues(setting);
        }

        
        this.values.user = userSettings || {};
        this.values.class = classSettings || {};
        this.values.school = schoolSettings || {};

    }

    private setDefaultValues(metadata: GroupOfSettingMetadata | SettingMetadata) {
        if (metadata.settingType === 'setting') {
            let defaultValue = SettingDefaultValues[metadata.key];
            if (defaultValue !== undefined) {
                this.values.default[metadata.key] = defaultValue;
            }
        } else if (metadata.settingType === 'group') {
            for (let setting of metadata.settings) {
                this.setDefaultValues(setting);
            }
        }
    }

    public setValue(scope: SettingsScope, key: SettingKey, value: SettingValue) {
        this.values[scope][key] = value;
    }

    public getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined {
        if(scope) {
            return this.values[scope][key];
        } 
        
        for (let s of this.hierarchy) {
            if (this.values[s] && this.values[s][key] !== undefined) {
                return this.values[s][key];
            }
        }

        // If not found in any scope, return undefined
        return undefined;
    }

}