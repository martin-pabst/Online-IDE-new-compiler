
export type SettingsScope = 'user' | 'class' | 'school' | 'default';

export type SettingsType = {
    "editor.hoverVerbosity.showHelpOnKeywordsAndOperators": true | false,
    "editor.hoverVerbosity.showMethodDeclaration": 'none' | 'declarations' | 'declarationsAndComments',   
    "editor.hoverVerbosity.showClassDeclaration":  'none' | 'declarations' | 'declarationsAndComments',
    "editor.contextSensitiveHelp.StructureStatements" :"true" | "false",
    "editor.contextSensitiveHelp.ParameterHints" :"true" | "false",
    "editor.autoClosingBrackets": "always" | "beforeWhitespace" | "never",
    "editor.autoClosingQuotes": "always" | "beforeWhitespace" | "never",
    "editor.autoSemicolons": true | false,
    "editor.bracketPairLines": "off" | "vertical" | "verticalAndUnderlined",
    "classDiagram.typeConvention": "java" | "pascal",
    "classDiagram.background": "transparent" | "white",
    "explorer.fileOrder": "user-defined" | "comparator",
    "explorer.workspaceOrder": "user-defined" | "comparator",
    "compiler.shadowedSymbolErrorLevel": "ignore" | "info" | "warning" | "error"
}

export type SettingKey = keyof SettingsType;

export var SettingDefaultValues: SettingsType = {
    "editor.hoverVerbosity.showHelpOnKeywordsAndOperators": true,
    "editor.hoverVerbosity.showMethodDeclaration": 'declarationsAndComments',   
    "editor.hoverVerbosity.showClassDeclaration": 'declarationsAndComments',
    "editor.contextSensitiveHelp.StructureStatements" :"true",
    "editor.contextSensitiveHelp.ParameterHints" :"true",
    "editor.autoClosingBrackets": "always",
    "editor.autoClosingQuotes": "always",
    "editor.autoSemicolons": true,
    "editor.bracketPairLines": "vertical",
    "classDiagram.typeConvention": "java",
    "classDiagram.background": "transparent",
    "explorer.fileOrder": "user-defined",
    "explorer.workspaceOrder": "user-defined",
    "compiler.shadowedSymbolErrorLevel": "warning"
};


export type SettingValue = string | number | boolean | undefined;



export interface SettingsStore {
    getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined;
}

export class DefaultValueSettingsStore implements SettingsStore {
    getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined {
        return SettingDefaultValues[key];
    }
}