import { TranslatedText } from "../../tools/language/LanguageManager";
import { SettingsMessages } from "./SettingsMessages";

export type SettingsScope = 'user' | 'class' | 'school' | 'default';

export type SettingKey = "editor.hoverVerbosity.showHelpOnKeywordsAndOperators" |
    "editor.hoverVerbosity.showMethodDeclaration" |
    "editor.hoverVerbosity.showClassDeclaration";

export type SettingValue = string | number | boolean | undefined;
export type SettingValues = Partial<Record<SettingKey, SettingValue>>;

export type SettingsMetadataType = 'setting' | 'group';

export type SettingMetadata = {
    key: SettingKey;
    settingType: 'setting',
    scopes?: SettingsScope[]; // Optional scopes for the setting
    name: TranslatedText;
    description: TranslatedText | undefined;
    type: 'enumeration' | 'string' | 'boolean';
    defaultValue?: SettingValue;
    optionValues?: string[]; // For string settings with predefined options
    optionTexts?: TranslatedText[]; // For string settings with translated options
}

export type GroupOfSettingMetadata = {
    settingType: 'group';
    scopes?: SettingsScope[]; // Optional scopes for the group
    name: TranslatedText;
    description: TranslatedText | undefined;
    settings: (SettingMetadata | GroupOfSettingMetadata)[];
}

export var AllSettingsMetadata: GroupOfSettingMetadata[] = [
    {
        settingType: 'group',
        name: SettingsMessages.EditorSettingsName,
        description: SettingsMessages.EditorSettingsDescription,
        settings: [
            { 
                settingType: 'group',
                name: SettingsMessages.HoverVerbosityName,
                description: SettingsMessages.HoverVerbosityDescription,
                settings: [
                    {
                        key: "editor.hoverVerbosity.showHelpOnKeywordsAndOperators",
                        settingType: 'setting',
                        name: SettingsMessages.ShowHelpOnKeywordsAndOperators,
                        description: undefined,
                        type: 'boolean',
                        defaultValue: true
                    },
                    {
                        key: "editor.hoverVerbosity.showMethodDeclaration",
                        settingType: 'setting',
                        name: SettingsMessages.ShowMethodDeclaration,
                        description: undefined,
                        type: 'string',
                        optionValues: ['none', 'declarations', 'declarationsAndComments'],
                        optionTexts: [
                            SettingsMessages.None,
                            SettingsMessages.Declarations,
                            SettingsMessages.DeclarationsAndComments
                        ],
                        defaultValue: 'declarationsAndComments'
                    },
                    {   
                        key: "editor.hoverVerbosity.showClassDeclaration",
                        settingType: 'setting',
                        name: SettingsMessages.ShowClassDeclaration,
                        description: undefined,
                        type: 'string',
                        optionValues: ['none', 'declarations', 'declarationsAndComments'],
                        optionTexts: [
                            SettingsMessages.None,
                            SettingsMessages.Declarations,
                            SettingsMessages.DeclarationsAndComments
                        ],
                        defaultValue: 'declarationsAndComments'
                    },

                ]
             }
        ]
    }

]

