import { Klass } from "../../../common/interpreter/StepFunction";
import { ObjectClass } from "../../runtime/system/javalang/ObjectClassStringClass";

export type LMADeclarationType = "declaration" | "field" | "method";

export type LibraryClassDeclaration = {
    type: LMADeclarationType;
    signature: string;
    comment?: string | (() => string);
}

export type LibraryMethodDeclaration = {
    type: LMADeclarationType;
    signature: string;
    native?: Function;
    java?: Function;
    template?: string;
    constantFoldingFunction?: (...parms: any) => any;
    comment?: string | (() => string);
}

export type LibraryAttributeDeclaration = {
    type: LMADeclarationType;
    signature: string;
    nativeIdentifier: string;
    template?: string;
    getValueForDebugger?: (o: { [index: string]: any }) => any;
    constantValue: any;
    comment?: string | (() => string);
    hiddenWhenDebugging?: boolean
}

export type LibraryMethodOrAttributeDeclaration = LibraryClassDeclaration | LibraryMethodDeclaration | LibraryAttributeDeclaration;

export type LibraryDeclarations = LibraryMethodOrAttributeDeclaration[];