import { Klass } from "../../common/interpreter/RuntimeConstants.ts";
import { JavaField } from "./JavaField.ts";
import { GenericTypeParameter } from "./GenericTypeParameter";
import { JavaType } from "./JavaType";
import { JavaMethod } from "./JavaMethod";
import { NonPrimitiveType } from "./NonPrimitiveType";
import { Visibility } from "./Visibility.ts";
import type * as monaco from 'monaco-editor'

export class StaticNonPrimitiveType extends JavaType {

    isMainClass: boolean = false;

    getAbsoluteName(): string {
        return this.nonPrimitiveType.getAbsoluteName();
    }
    getCompletionItemDetail(): string {
        return "";
    }

    get runtimeClass(): Klass | undefined {
        return this.nonPrimitiveType.runtimeClass;
    }

    get outerType(): NonPrimitiveType | StaticNonPrimitiveType | undefined {
        return this.nonPrimitiveType.outerType;
    }

    innerTypes: (NonPrimitiveType | StaticNonPrimitiveType)[] = [];

    constructor(public nonPrimitiveType: NonPrimitiveType) {
        super(nonPrimitiveType.identifier, nonPrimitiveType.identifierRange, nonPrimitiveType.module);
    }

    getCompletionItems(visibilityUpTo: Visibility, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string,
        rangeToReplace: monaco.IRange, methodContext: JavaMethod | undefined): monaco.languages.CompletionItem[]{

            return this.nonPrimitiveType.getCompletionItems(visibilityUpTo, leftBracketAlreadyThere, identifierAndBracketAfterCursor,
                rangeToReplace, methodContext, true);

        }


    fastExtendsImplements(identifier: string) {
        return this.nonPrimitiveType.fastExtendsImplements(identifier);
    }


    getCopyWithConcreteType(typeMap: Map<GenericTypeParameter, JavaType>): JavaType {
        return this;
    }

    getDefaultValue() {
        return null;
    }

    getPossibleMethods(identifier: string, isConstructor: boolean, hasToBeStatic: boolean): JavaMethod[] {
        return this.nonPrimitiveType.getPossibleMethods(identifier, isConstructor, hasToBeStatic);
    }

    getField(identifier: string, uptoVisibility: Visibility): JavaField | undefined {
        return this.nonPrimitiveType.getField(identifier, uptoVisibility, true);
    }

    canImplicitlyCastTo(type: JavaType) {
        return false;
    }

    toString(): string {
        return this.nonPrimitiveType.toString();
    }

    getDeclaration(): string {
        return this.nonPrimitiveType.getDeclaration();
    }

    getFields(): JavaField[] {
        return this.nonPrimitiveType.getFields().filter(f => f._isStatic);
    }

}