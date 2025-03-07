import { CompilerFile } from "../../common/module/CompilerFile";
import { EmptyRange, IRange } from "../../common/range/Range";
import { TokenType, TokenTypeReadable } from "../TokenType.ts";
import { JavaBaseModule } from "../module/JavaBaseModule";
import { JavaField } from "./JavaField";
import { GenericTypeParameter } from "./GenericTypeParameter";
import { JavaClass } from "./JavaClass";
import { JavaTypeWithInstanceInitializer } from "./JavaTypeWithInstanceInitializer.ts";
import { JavaInterface } from "./JavaInterface";
import { JavaType } from "./JavaType";
import { JavaMethod } from "./JavaMethod";
import { NonPrimitiveType } from "./NonPrimitiveType";
import { Visibility } from "./Visibility.ts";
import { Klass } from "../../common/interpreter/RuntimeConstants.ts";
import { JavaArrayType } from "./JavaArrayType.ts";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType.ts";
import { JavaParameter } from "./JavaParameter.ts";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { ClassClass } from "../runtime/system/ClassClass.ts";
import type * as monaco from 'monaco-editor'
import { MonacoConstants } from "../../common/monacoproviders/MonacoConstants.ts";


export class JavaEnum extends JavaTypeWithInstanceInitializer {

    fields: JavaField[] = [];
    methods: JavaMethod[] = [];

    /**
     * needed for user defined Sprites in SpriteLibraryEnum, see document user-defined-spritesheets.md
     */
    id: number;

    private implements: JavaInterface[] = [];
    private classObject: ClassClass;



    constructor(identifier: string, identifierRange: IRange, path: string, module: JavaBaseModule, public baseEnumClass: JavaClass) {
        super(identifier, identifierRange, path, module);
        this.id = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER);
        this.classObject = new ClassClass(this);
    }

    getClassObject(): ClassClass {
        return this.classObject;
    }

    getCompletionItemDetail(): string {
        return JCM.enum();
    }

    getField(identifier: string, uptoVisibility: Visibility, forceStatic: boolean = false): JavaField | undefined {
        let field = this.getFields().find(f => f.identifier == identifier && f.visibility <= uptoVisibility && (f._isStatic || !forceStatic));
        if (field) return field;
        if (uptoVisibility == TokenType.keywordPrivate) uptoVisibility = TokenType.keywordProtected;

        return this.baseEnumClass.getField(identifier, uptoVisibility, forceStatic);

    }

    removeField(identifier: string){
        let index = this.fields.findIndex(field => field.identifier == identifier);
        if(index >= 0) this.fields.splice(index, 1);
    }

    initRuntimeClass(baseClass: Klass) {
        let that = this;
        this.runtimeClass = class extends baseClass {
            static type = that;
            constructor(name: string, ordinal: number){
                super(name, ordinal);
            }
         };
    }

    getExtends(): JavaClass {
        return this.baseEnumClass;
    }

    isGenericTypeParameter(): boolean {
        return false;
    }

    isGenericVariant(): boolean {
        return false;
    }

    getFile(): CompilerFile {
        return this.module.file;
    }

    getCopyWithConcreteType(_typeMap: Map<GenericTypeParameter, NonPrimitiveType>): JavaEnum {
        return this;
    }

    getImplements(): JavaInterface[] {
        return this.implements;
    }

    public getFields(): JavaField[] {

        return this.fields;

    }

    public getOwnMethods(): JavaMethod[] {
        return this.methods;
    }

    getAllMethods(): JavaMethod[] {
        return this.getOwnMethods().concat(this.baseEnumClass.getAllMethods());
    }


    canImplicitlyCastTo(otherType: JavaType): boolean {
        if (otherType.isPrimitive) return false;

        if (otherType instanceof JavaInterface) {
            for (let intf of this.implements) {
                if (intf.canExplicitlyCastTo(otherType)) return true;
            }
            return false;
        }

        if (otherType instanceof JavaEnum) {
            if (otherType == this) return true;
            return false;
        }

        if (otherType instanceof JavaClass) {
            if (otherType.identifier == 'Object') return true;
            return false;
        }

        return false;

    }

    canExplicitlyCastTo(otherType: JavaType): boolean {
        return this.canImplicitlyCastTo(otherType);
    }

    toString(): string {
        return this.identifier;
    }

    getAbsoluteName(): string {
        return this.pathAndIdentifier;
    }

    getDeclaration(): string {
        let decl: string = TokenTypeReadable[this.visibility] + " ";
        if (this.isStatic) decl += "static ";
        decl += "enum " + this.identifier;
        return decl;
    }

    getCompletionItems(visibilityUpTo: Visibility, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string,
        rangeToReplace: monaco.IRange, methodContext?: JavaMethod, onlyStatic?: false): monaco.languages.CompletionItem[] {

        let itemList: monaco.languages.CompletionItem[] = [];

        for (let field of this.getFields().filter(f => f.visibility <= visibilityUpTo && (f._isStatic || !onlyStatic))) {
            itemList.push({
                label: field.toString(),
                kind: MonacoConstants.CompletionItemKind.Field, 
                insertText: field.identifier,
                range: rangeToReplace,
                documentation: field.documentation == null ? undefined : {
                    value: typeof field.documentation == "string" ? field.documentation : field.documentation()
                }
            });
        }

        for (let method of this.getAllMethods().filter(m => (m.classEnumInterface == this || m.visibility != TokenType.keywordPrivate) && (m.isStatic || !onlyStatic))) {

            itemList.push({
                label: method.getCompletionLabel(),
                filterText: method.identifier,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                },
                kind: MonacoConstants.CompletionItemKind.Method, 
                insertText: method.getCompletionSnippet(leftBracketAlreadyThere),
                range: rangeToReplace,
                detail: method.returnParameterType ? method.returnParameterType.getDeclaration() : "void",
                insertTextRules: MonacoConstants.CompletionItemInsertTextRule.InsertAsSnippet, 
                documentation: method.documentation == null ? undefined : {
                    value: typeof method.documentation == "string" ? method.documentation : method.documentation()
                }
            });
        }

        return itemList;


    }

    addValuesMethod(klass: Klass, stringType: PrimitiveType) {

        klass["_values"] = (klass["_mn$values$" + this.identifier + "_I$"] = () => {
            return klass.values;
        })

        let valuesMethod = new JavaMethod("values", EmptyRange.instance, this.module, TokenType.keywordPublic);
        valuesMethod.returnParameterType = new JavaArrayType(this, 1, this.module, EmptyRange.instance);
        valuesMethod.isStatic = true;
        valuesMethod.hasImplementationWithNativeCallingConvention = true;

        this.methods.push(valuesMethod);

        klass["_valueOf"] = (klass["_mn$valueOf$" + this.identifier + "$string"] = (name: string) => {
            let value = klass[name];
            if (!value) return null;
            return value;
        })

        let valueOfMethod = new JavaMethod("valueOf", EmptyRange.instance, this.module, TokenType.keywordPublic);
        valueOfMethod.returnParameterType = this;
        valueOfMethod.parameters.push(new JavaParameter("name", EmptyRange.instance, this.module, stringType, true, false, false));
        valueOfMethod.isStatic = true;
        valueOfMethod.hasImplementationWithNativeCallingConvention = true;

        this.methods.push(valueOfMethod);
    }


}

