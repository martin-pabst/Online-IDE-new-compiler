import { TranslatedText } from "../../tools/language/LanguageManager";
import type { Main } from "../main/Main";
import { SettingsMessages } from "./SettingsMessages";
import hoverOverOperator from '/assets/graphics/settings/hover_over_operator.png';
import hoverOverMethod from '/assets/graphics/settings/hover_over_method.png';
import hoverOverClass from '/assets/graphics/settings/hover_over_class.png';
import scopeLines from '/assets/graphics/settings/scope_lines.png';
import classDiagram from '/assets/graphics/settings/class_diagram.png';
import explorer from '/assets/graphics/settings/explorer.png';
import parameterHints from '/assets/graphics/settings/parameter_hints.png';
import structureStatement from '/assets/graphics/settings/structure_statement_help.png';

import type * as monaco from 'monaco-editor'
import { SettingKey, SettingsScope, SettingValue } from "./SettingsStore";


export type SettingValues = Partial<Record<SettingKey, SettingValue>>;

export type SettingsMetadataType = 'setting' | 'group';

export type SettingsAction = (main: Main, value: SettingValue) => void;

export type SettingMetadata = {
    key: SettingKey;
    settingType: 'setting',
    scopes?: SettingsScope[]; // Optional scopes for the setting
    name: TranslatedText;
    description: TranslatedText | undefined;
    type: 'enumeration' | 'string' | 'boolean';
    optionValues?: SettingValue[]; // For string settings with predefined options
    optionTexts?: TranslatedText[]; // For string settings with translated options
    action?: SettingsAction; // Optional action to perform when the setting is changed
    image?: string;
}

export type GroupOfSettingMetadata = {
    settingType: 'group';
    scopes?: SettingsScope[]; // Optional scopes for the group
    name: TranslatedText;
    description: TranslatedText | undefined;
    settings: (SettingMetadata | GroupOfSettingMetadata)[];
    image?: string;
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
                        image: hoverOverOperator,
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
                        image: hoverOverMethod,
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
                        image: hoverOverClass
                    },

                ]
            },
            {
                settingType: 'group',
                name: SettingsMessages.ContextSensitiveHelpName,
                description: SettingsMessages.ContextSensitiveHelpDescription,
                settings: [
                    {
                        key: "editor.contextSensitiveHelp.StructureStatements",
                        settingType: 'setting',
                        name: SettingsMessages.ShowStructureStatementHelp,
                        description: undefined,
                        type: 'enumeration',
                        optionValues: ['false', 'true'],
                        optionTexts: [
                            SettingsMessages.OptionFalse,
                            SettingsMessages.OptionTrue,
                        ],
                        defaultValue: 'true',
                        image: structureStatement
                    },
                    {
                        key: "editor.contextSensitiveHelp.ParameterHints",
                        settingType: 'setting',
                        name: SettingsMessages.ContextSensitiveHelpParameterHintsName,
                        description: SettingsMessages.ContextSensitiveHelpParameterHintsDescription,
                        type: 'enumeration',
                        optionValues: ['false', 'true'],
                        optionTexts: [
                            SettingsMessages.OptionFalse,
                            SettingsMessages.OptionTrue,
                        ],
                        defaultValue: 'true',
                        image: parameterHints,
                        action: (main, value) => {
                            main.getMainEditor().updateOptions({
                                parameterHints:{
                                    enabled: (value === 'true'),
                                    cycle: true
                                } 
                            })
                        }

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
                        action: (main, value) => {
                            main.getMainEditor().updateOptions({
                                autoClosingBrackets: value as monaco.editor.EditorAutoClosingStrategy
                            })
                        }
                    },
                    {
                        key: "editor.autoClosingQuotes",
                        settingType: 'setting',
                        name: SettingsMessages.AutoClosingQuotesName,
                        description: SettingsMessages.AutoClosingQuotesDescription,
                        type: 'enumeration',
                        optionValues: ["always", "beforeWhitespace", "never"],
                        optionTexts: [SettingsMessages.AutoClosingBracketsAlways,
                            SettingsMessages.AutoClosingBracketsBeforeWhitespace,
                            SettingsMessages.AutoClosingBracketsNever],
                        action: (main, value) => {
                            main.getMainEditor().updateOptions({
                                autoClosingQuotes: value as monaco.editor.EditorAutoClosingStrategy
                            })
                        }
                    },
                    {
                        key: "editor.autoSemicolons",
                        settingType: 'setting',
                        name: SettingsMessages.AutoSemicolonsName,
                        description: SettingsMessages.AutoSemicolonsDescription,
                        type: 'boolean',
                        optionTexts: [SettingsMessages.On, SettingsMessages.Off],
                    },

                ]
            },
            {
                settingType: 'group',
                name: SettingsMessages.EditorViewSettings,
                description: SettingsMessages.EditorViewSettingsDescription,
                settings: [
                    {
                        key: "editor.bracketPairLines",
                        settingType: 'setting',
                        name: SettingsMessages.BracketPairLines,
                        description: SettingsMessages.BracketPairLinesDescription,
                        type: 'enumeration',
                        optionValues: ["off", "vertical", "verticalAndUnderlined"],
                        optionTexts: [SettingsMessages.BracketPairLinesOff,
                            SettingsMessages.BracketPairLinesVertical,
                            SettingsMessages.BracketPairLinesVerticalAndUnderlined],
                        action: (main, value) => {
                            main.getMainEditor().updateOptions({
                                guides: {
                                    bracketPairs: value !== 'off',
                                    highlightActiveBracketPair: value !== 'off',
                                    bracketPairsHorizontal: (value === 'verticalAndUnderlined')
                                } as monaco.editor.IGuidesOptions
                            })
                        },
                        image: scopeLines
                    },

                ]
            }

        ]
    },
    {
        settingType: 'group',
        name: SettingsMessages.ClassDiagramSettingsName,
        description: SettingsMessages.ClassDiagramSettingsDescription,
        image: classDiagram,
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
                action: (main, value) => {
                    main.drawClassDiagrams(false);
                }
            },
            {
                key: "classDiagram.background",
                settingType: 'setting',
                name: SettingsMessages.ClassDiagramBackground,
                description: SettingsMessages.ClassDiagramBackgroundDescription,
                type: 'enumeration',
                optionValues: ["transparent", "white"],
                optionTexts: [
                    SettingsMessages.ClassDiagramBackgroundTransparent,
                    SettingsMessages.ClassDiagramBackgroundWhite
                ],
            },
        ]
    },
    {
        settingType: 'group',
        name: SettingsMessages.ExplorerSettingsName,
        description: SettingsMessages.ExplorerSettingsDescription,
        image: explorer,
        settings: [
            {
                key: "explorer.fileOrder",
                settingType: 'setting',
                name: SettingsMessages.ExplorerFileOrderName,
                description: SettingsMessages.ExplorerFileOrderDescription,
                type: 'enumeration',
                optionValues: ["comparator", "user-defined"],
                optionTexts: [
                    SettingsMessages.ExplorerOrderComparator,
                    SettingsMessages.ExplorerOrderUserDefined
                ],
                action: (main, value) => {
                    let treeview = main.projectExplorer.fileTreeview;
                    treeview.config.orderBy = value as 'comparator' | 'user-defined';
                    treeview.sort();
                }
            },
            {
                key: "explorer.workspaceOrder",
                settingType: 'setting',
                name: SettingsMessages.ExplorerWorkspaceOrderName,
                description: SettingsMessages.ExplorerWorkspaceOrderDescription,
                type: 'enumeration',
                optionValues: ["comparator", "user-defined"],
                optionTexts: [
                    SettingsMessages.ExplorerOrderComparator,
                    SettingsMessages.ExplorerOrderUserDefined
                ],
                action: (main, value) => {
                    let treeview = main.projectExplorer.workspaceTreeview;
                    treeview.config.orderBy = value as 'comparator' | 'user-defined';
                    treeview.sort();
                }
            },
        ]
    },
    {
        settingType: 'group',
        name: SettingsMessages.CompilerSettingsName,
        description: SettingsMessages.CompilerSettingsDescription,
        settings: [
            {
                key: "compiler.shadowedSymbolErrorLevel",
                settingType: 'setting',
                name: SettingsMessages.CompilerShadowedSymbolErrorLevelName,
                description: SettingsMessages.CompilerShadowedSymbolErrorLevelDescription,
                type: 'enumeration',
                optionValues: ["ignore", "info", "warning", "error"],
                optionTexts: [
                    SettingsMessages.ErrorLevelIgnore,
                    SettingsMessages.ErrorLevelInfo,
                    SettingsMessages.ErrorLevelWarning,
                    SettingsMessages.ErrorLevelError,
                ],
                action: (main, value) => {
                    main.getCompiler().triggerCompile();
                }
            }
        ]
    }

]

