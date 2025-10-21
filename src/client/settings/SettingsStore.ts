
export type SettingsScope = 'user' | 'class' | 'school' | 'default';

export var SettingDefaultValues: Record<string, SettingValue> = {
    "editor.hoverVerbosity.showHelpOnKeywordsAndOperators": true,
    "editor.hoverVerbosity.showMethodDeclaration": 'declarationsAndComments',   
    "editor.hoverVerbosity.showClassDeclaration": 'declarationsAndComments',
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

export type SettingKey = keyof typeof SettingDefaultValues;

export type SettingValue = string | number | boolean | undefined;



export interface SettingsStore {
    getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined;
}

export class DefaultValueSettingsStore implements SettingsStore {
    getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined {
        return SettingDefaultValues[key];
    }
}