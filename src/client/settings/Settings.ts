import { SettingsMessages } from "./SettingsMessages";
import { TranslatedText } from "../../tools/language/LanguageManager";
import { AllSettingsMetadata, GroupOfSettingMetadata, SettingKey, SettingMetadata, SettingScope, SettingValue, SettingValues } from "./SettingsMetadata";
import { UserData } from "../communication/Data";

export class Settings {

    hierarchy: SettingScope[] = ['user', 'class', 'school', 'default'];
    hieararchyTexts: TranslatedText[] = [
        SettingsMessages.ScopeUser,
        SettingsMessages.ScopeClass,
        SettingsMessages.ScopeSchool
    ];

    values: Record<SettingScope, SettingValues> = {
        user: {},
        class: {},
        school: {},
        default: {}
    }

    constructor(private user: UserData | undefined, classSettings: SettingValues | undefined, schoolSettings: SettingValues | undefined) {
        // Initialize default values
        for (let setting of AllSettingsMetadata) {
            this.setDefaultValues(setting);
        }

        if(user){
            this.values.user = user.settings.settings || {};
        }

        this.values.class = classSettings || {};
        this.values.school = schoolSettings || {};

    }

    private setDefaultValues(metadata: GroupOfSettingMetadata | SettingMetadata) {
        if (metadata.settingType === 'setting') {
            if (metadata.defaultValue !== undefined) {
                this.values.default[metadata.key] = metadata.defaultValue;
            }
        } else if (metadata.settingType === 'group') {
            for (let setting of metadata.settings) {
                this.setDefaultValues(setting);
            }
        }
    }

    public setValue(scope: SettingScope, key: SettingKey, value: SettingValue) {
        this.values[scope][key] = value;
    }

    public getValue(key: SettingKey, scope?: SettingScope): SettingValue | undefined {
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