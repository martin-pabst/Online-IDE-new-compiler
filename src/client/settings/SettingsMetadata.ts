import { IMain } from "../../compiler/common/IMain";
import { TranslatedText } from "../../tools/language/LanguageManager";
import { SettingsMessages } from "./SettingsMessages";
import * as monaco from 'monaco-editor'


export type SettingsScope = 'user' | 'class' | 'school' | 'default';

export type SettingKey = "editor.hoverVerbosity.showHelpOnKeywordsAndOperators" |
    "editor.hoverVerbosity.showMethodDeclaration" |
    "editor.hoverVerbosity.showClassDeclaration" |
    "editor.autoClosingBrackets" |
    "classDiagram.typeConvention";

export type SettingValue = string | number | boolean | undefined;
export type SettingValues = Partial<Record<SettingKey, SettingValue>>;

export type SettingsMetadataType = 'setting' | 'group';

export type SettingsAction = (main: IMain, value: SettingValue) => void;

export type SettingMetadata = {
    key: SettingKey;
    settingType: 'setting',
    scopes?: SettingsScope[]; // Optional scopes for the setting
    name: TranslatedText;
    description: TranslatedText | undefined;
    type: 'enumeration' | 'string' | 'boolean';
    defaultValue?: SettingValue;
    optionValues?: SettingValue[]; // For string settings with predefined options
    optionTexts?: TranslatedText[]; // For string settings with translated options
    action?: SettingsAction; // Optional action to perform when the setting is changed
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
                        type: 'enumeration',
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
                        type: 'enumeration',
                        optionValues: ['none', 'declarations', 'declarationsAndComments'],
                        optionTexts: [
                            SettingsMessages.None,
                            SettingsMessages.Declarations,
                            SettingsMessages.DeclarationsAndComments
                        ],
                        defaultValue: 'declarationsAndComments'
                    },

                ]
            },
            {
                settingType: 'group',
                name: SettingsMessages.TypingAssistanceName,
                description: SettingsMessages.TypingAssistanceDescription,
                settings: [
                    {
                        key: "editor.autoClosingBrackets",
                        settingType: 'setting',
                        name: SettingsMessages.AutoClosingBracketsName,
                        description: SettingsMessages.AutoClosingBracketsDescription,
                        type: 'enumeration',
                        optionValues: ["always", "beforeWhitespace", "never"],
                        optionTexts: [SettingsMessages.AutoClosingBracketsAlways,
                            SettingsMessages.AutoClosingBracketsBeforeWhitespace,
                            SettingsMessages.AutoClosingBracketsNever],
                        defaultValue: "always",
                        action: (main, value) => {
                            main.getMainEditor().updateOptions({
                                autoClosingBrackets:  value as monaco.editor.EditorAutoClosingStrategy
                            })
                        }
                    },

                ]
            }

        ]
    },
    {
        settingType: 'group',
        name: SettingsMessages.ClassDiagramSettingsName,
        description: SettingsMessages.ClassDiagramSettingsDescription,
        settings: [
            {
                key: "classDiagram.typeConvention",
                settingType: 'setting',
                name: SettingsMessages.ClassDiagramTypeConventionName,
                description: SettingsMessages.ClassDiagramTypeConventionDescription,
                type: 'enumeration',
                optionValues: ["java", "pascal"],
                optionTexts: [
                    SettingsMessages.ClassDiagramTypeConventionJava,
                    SettingsMessages.ClassDiagramTypeConventionPascal
                ],
                defaultValue: "java"
            }
        ]
    }

]

