import { SettingsMessages } from "./SettingsMessages";
import { TranslatedText } from "../../tools/language/LanguageManager";
import { AllSettingsMetadata, GroupOfSettingMetadata, SettingMetadata, SettingValues } from "./SettingsMetadata";
import type { UserData } from "../communication/Data";
import { SettingDefaultValues, SettingKey, SettingsScope, SettingsStore, SettingValue, SettingPrecedenceValues, SettingPrecedence, SettingsPrecedenceArrays } from "./SettingsStore";
import { SecureJSON } from "../../tools/SecureJSON";


export class Settings implements SettingsStore {

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
        userSettings: string | undefined,
        classSettings: string | undefined, schoolSettings: string | undefined) {
        // Initialize default values

        for (let key in SettingDefaultValues) {
            this.values.default[key] = SettingDefaultValues[key];
        }

        this.values.user = userSettings ? SecureJSON.parse(userSettings) : {};
        this.values.class = classSettings ? SecureJSON.parse(classSettings) : {};
        this.values.school = schoolSettings ? SecureJSON.parse(schoolSettings) : {};

    }

    public setValue(scope: SettingsScope, key: SettingKey, value: SettingValue) {
        this.values[scope][key] = value;
    }

    public getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined {
        if (scope) {
            return this.values[scope][key];
        }

        let settingsPrecedence: SettingPrecedence = SettingPrecedenceValues[key] || 'userClassSchoolDefault';

        if (this.user?.is_teacher || this.user?.is_schooladmin) {
            settingsPrecedence = 'userClassSchoolDefault';
        }

        let settingPrecedenceArray = SettingsPrecedenceArrays[settingsPrecedence];

        for (let s of settingPrecedenceArray) {
            if (this.values[s] && this.values[s][key] !== undefined) {
                return this.values[s][key];
            }
        }

        // If not found in any scope, return undefined
        return undefined;
    }

}