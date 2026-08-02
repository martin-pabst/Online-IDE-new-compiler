export type LMADeclarationType = "declaration" | "field" | "method";

export type LibraryClassDeclaration = {
    type: "declaration";
    package?: string;                   // dot-separated package name, e.g. "java.lang"
    signature: string;
    comment?: string | (() => string);
}

export type LibraryMethodDeclaration = {
    type: "method";
    signature: string;
    native?: Function;
    java?: Function;
    template?: string;
    constantFoldingFunction?: (...parms: any) => any;
    comment?: string | (() => string);
}

export type LibraryAttributeDeclaration = {
    type: "field";
    signature: string;
    nativeIdentifier?: string;
    template?: string;
    constantValue?: any;
    comment?: string | (() => string);
    hiddenWhenDebugging?: boolean
}

export type LibraryClassOrMethodOrAttributeDeclaration = LibraryClassDeclaration | LibraryMethodDeclaration | LibraryAttributeDeclaration;

export type LibraryDeclarations = LibraryClassOrMethodOrAttributeDeclaration[];