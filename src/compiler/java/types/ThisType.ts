import { IRange, languages } from "monaco-editor";
import { GenericTypeParameter } from "./GenericTypeParameter";
import { JavaField } from "./JavaField";
import { JavaMethod } from "./JavaMethod";
import { JavaType } from "./JavaType";
import { NonPrimitiveType } from "./NonPrimitiveType";
import { Visibility } from "./Visibility";
import { EmptyRange } from "../../common/range/Range";

export class ThisType extends NonPrimitiveType {

    private static _this: ThisType;

    public static identifier = "This";

    private constructor(){
        super("This", EmptyRange.instance, "This", null);
    }

    public static this(){
        if(!ThisType._this) ThisType._this = new ThisType();
        return ThisType._this;
    }

    isGenericVariant(): boolean {
        return false;
    }
    isGenericTypeParameter(): boolean {
        return false;
    }
    canExplicitlyCastTo(otherType: JavaType): boolean {
        return false;
    }
    canImplicitlyCastTo(otherType: JavaType): boolean {
        return false;
    }
    getFields(): JavaField[] {
        return [];
    }
    getOwnMethods(): JavaMethod[] {
        return [];
    }
    getAllMethods(): JavaMethod[] {
        return [];
    }
    getField(identifier: string, uptoVisibility: Visibility, forceStatic?: boolean): JavaField | undefined {
        return undefined;
    }
    getCompletionItems(visibilityUpTo: Visibility, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string, rangeToReplace: IRange, methodContext: JavaMethod | undefined, onlyStatic?: boolean): languages.CompletionItem[] {
        return [];
    }
    getCopyWithConcreteType(typeMap: Map<GenericTypeParameter, JavaType>): JavaType {
        return this;
    }
    toString(): string {
        return "This";
    }
    getAbsoluteName(): string {
        return "This";
    }
    getCompletionItemDetail(): string {
        return "This";
    }
    getDeclaration(): string {
        return "This";
    }

}