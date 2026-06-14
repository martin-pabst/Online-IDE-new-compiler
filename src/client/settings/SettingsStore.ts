import { ByArchitecture } from "../../compiler/assembly/byassembly/ByArchitecture";

export type SettingsScope = 'user' | 'class' | 'school' | 'default';

export type SettingPrecedence = 'userClassSchoolDefault' | 'classSchoolUserDefault';
export var SettingsPrecedenceArrays: { [key in SettingPrecedence]: SettingsScope[] } = {
    'userClassSchoolDefault': ['user', 'class', 'school', 'default'],
    'classSchoolUserDefault': ['class', 'school', 'user', 'default']
}

export type SettingsType = {
    "editor.hoverVerbosity.showHelpOnKeywordsAndOperators": true | false,
    "editor.hoverVerbosity.showMethodDeclaration": 'none' | 'declarations' | 'declarationsAndComments',
    "editor.hoverVerbosity.showClassDeclaration": 'none' | 'declarations' | 'declarationsAndComments',
    "editor.contextSensitiveHelp.StructureStatements": "true" | "false",
    "editor.contextSensitiveHelp.ParameterHints": "true" | "false",
    "editor.autoClosingBrackets": "always" | "beforeWhitespace" | "never",
    "editor.autoClosingQuotes": "always" | "beforeWhitespace" | "never",
    "editor.autoSemicolons": true | false,
    "editor.bracketPairLines": "off" | "vertical" | "verticalAndUnderlined",
    "editor.stickyScroll": "off" | "on",
    "editor.quickFix.getterAndSetter": "offer" | "dontOffer",
    "editor.quickFix.generateConstructor": "offer" | "dontOffer",

    "formatter.forceSpacesAfterIfForWhileDo": "0" | "1" | "no"

    "classDiagram.typeConvention": "java" | "pascal",
    "classDiagram.background": "transparent" | "white",
    "classDiagram.omitVoidReturnType": "omit" | "show",
    "classDiagram.drawCompositionDiamond": "yes" | "no",

    "explorer.fileOrder": "user-defined" | "comparator",
    "explorer.workspaceOrder": "user-defined" | "comparator",
    "programmingLanguages.java.enabled": "yes" | "no",
    "programmingLanguages.assembly.enabled": "yes" | "no",

    "compiler.shadowedSymbolErrorLevel": "ignore" | "info" | "warning" | "error",

    "output.clearOutputAfterWorkspaceChange": "yes" | "no",

    "programmingLanguages.assembly.defaultArchitecture": string;

}

export type SettingKey = keyof SettingsType;

export var SettingDefaultValues: SettingsType = {
    "editor.hoverVerbosity.showHelpOnKeywordsAndOperators": true,
    "editor.hoverVerbosity.showMethodDeclaration": 'declarationsAndComments',
    "editor.hoverVerbosity.showClassDeclaration": 'declarationsAndComments',
    "editor.contextSensitiveHelp.StructureStatements": "true",
    "editor.contextSensitiveHelp.ParameterHints": "true",
    "editor.autoClosingBrackets": "beforeWhitespace",
    "editor.autoClosingQuotes": "beforeWhitespace",
    "editor.autoSemicolons": true,
    "editor.bracketPairLines": "vertical",
    "editor.stickyScroll": "on",
    "editor.quickFix.getterAndSetter": "offer",
    "editor.quickFix.generateConstructor": "offer",

    "formatter.forceSpacesAfterIfForWhileDo": "1",
    "classDiagram.typeConvention": "java",
    "classDiagram.background": "transparent",
    "classDiagram.omitVoidReturnType": "omit",
    "classDiagram.drawCompositionDiamond": "yes",
    
    "explorer.fileOrder": "user-defined",
    "explorer.workspaceOrder": "user-defined",
    "programmingLanguages.java.enabled": "yes",
    "programmingLanguages.assembly.enabled": "no",

    "compiler.shadowedSymbolErrorLevel": "warning",
    
    "output.clearOutputAfterWorkspaceChange": "no",

    "programmingLanguages.assembly.defaultArchitecture": ByArchitecture.getArchitectures()[0].identifier

};

export var SettingPrecedenceValues: Partial<{ [key in SettingKey]: SettingPrecedence }> = {
    "editor.quickFix.getterAndSetter": "classSchoolUserDefault",
    "editor.quickFix.generateConstructor": "classSchoolUserDefault",
    "editor.hoverVerbosity.showHelpOnKeywordsAndOperators": "classSchoolUserDefault",
    "editor.hoverVerbosity.showMethodDeclaration": "classSchoolUserDefault",
    "editor.hoverVerbosity.showClassDeclaration": "classSchoolUserDefault",
    "editor.contextSensitiveHelp.StructureStatements": "classSchoolUserDefault",
    "editor.contextSensitiveHelp.ParameterHints": "classSchoolUserDefault",
}

export type SettingValue = string | number | boolean | undefined;



export interface SettingsStore {
    getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined;
}

export class DefaultValueSettingsStore implements SettingsStore {
    getValue(key: SettingKey, scope?: SettingsScope): SettingValue | undefined {
        return SettingDefaultValues[key];
    }
}