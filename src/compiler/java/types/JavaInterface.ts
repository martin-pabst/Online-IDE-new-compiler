import { CompilerFile } from "../../common/module/CompilerFile";
import { IRange } from "../../common/range/Range";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages";
import { JavaBaseModule } from "../module/JavaBaseModule";
import { ClassClass } from "../runtime/system/ClassClass.ts";
import { GenericTypeParameter } from "./GenericTypeParameter";
import { JavaField } from "./JavaField";
import { JavaMethod } from "./JavaMethod";
import { JavaType } from "./JavaType";
import { NonPrimitiveType } from "./NonPrimitiveType";
import { Visibility } from "./Visibility";
import type * as monaco from 'monaco-editor'

export abstract class IJavaInterface extends NonPrimitiveType {

    constructor(public identifier: string, public identifierRange: IRange, path: string, public module: JavaBaseModule) {
        super(identifier, identifierRange, path, module);
    }

    abstract getAllImplementedInterfaces(): IJavaInterface[];

    getCompletionItemDetail(): string {
        return JCM.interface();
    }

    getClassObject(): ClassClass {
        return null;
    }

    getFile(): CompilerFile {
        return this.module.file;
    }

    getFields(): JavaField[] { return [] };

    abstract getOwnMethods(): JavaMethod[];

    abstract getExtends(): IJavaInterface[];

    abstract isFunctionalInterface(): boolean;

    getPossibleMethods(identifier: string, isConstructor: boolean, hasToBeStatic: boolean): JavaMethod[] {
        if(isConstructor) return [];
        return super.getPossibleMethods(identifier, isConstructor, hasToBeStatic);
    }

    findImplementedInterface(identifier: string): IJavaInterface | undefined {
        if (this.identifier == identifier) return this;
        for (let ext of this.getExtends()) {
            let intf = ext.findImplementedInterface(identifier);
            if (intf) return intf;
        }
        return undefined;
    }

    getField(identifier: string, uptoVisibility: Visibility, forceStatic: boolean = false): JavaField | undefined {
        let field = this.getFields().find(f => f.identifier == identifier && f.visibility <= uptoVisibility && (f._isStatic || !forceStatic));
        if (field) return field;
        if (uptoVisibility == TokenType.keywordPrivate) uptoVisibility = TokenType.keywordProtected;
        for (let interf of this.getExtends()) {
            field = interf.getField(identifier, uptoVisibility, forceStatic);
            if (field) return field
        }
        return undefined;
    }

    toString(): string {
        let s: string = this.identifier;

        if (this.genericTypeParameters && this.genericTypeParameters.length > 0) {
            s += "<" + this.genericTypeParameters.map(gi => gi.toString()).join(", ") + ">";
        }
        return s;
    }

    getAbsoluteName(): string {
        let s: string = this.pathAndIdentifier;

        if (this.genericTypeParameters && this.genericTypeParameters.length > 0) {
            s += "<" + this.genericTypeParameters.map(gi => gi.getAbsoluteName()).join(", ") + ">";
        }
        return s;
    }

    getCompletionItems(visibilityUpTo: Visibility, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string,
        rangeToReplace: monaco.IRange, methodContext: JavaMethod | undefined, onlyStatic?: false): monaco.languages.CompletionItem[] {

        let itemList: monaco.languages.CompletionItem[] = [];

        for (let method of this.getAllMethods().filter( m => (m.classEnumInterface == this || m.visibility != TokenType.keywordPrivate) && (m.isStatic || !onlyStatic))) {

            itemList.push({
                label: method.getCompletionLabel(),
                filterText: method.identifier,
                command: {
                    id: "editor.action.triggerParameterHints",
                    title: '123',
                    arguments: []
                },
                kind: 0, //monaco.languages.CompletionItemKind.Method,
                insertText: method.getCompletionSnippet(leftBracketAlreadyThere),
                detail: method.returnParameterType ? method.returnParameterType.getDeclaration() : "void",
                range: rangeToReplace,
                insertTextRules: 4, //monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: method.documentation == null ? undefined : {
                    value: typeof method.documentation == "string" ? method.documentation : method.documentation()
                }
            });
        }

        return itemList;


    }


}


export class JavaInterface extends IJavaInterface {

    methods: JavaMethod[] = [];
    fields: JavaField[] = [];               // A interface may have fields, but they must be static final

    private extends: IJavaInterface[] = [];

    constructor(identifier: string, identifierRange: IRange, path: string, module: JavaBaseModule) {
        super(identifier, identifierRange, path, module);
        this.genericTypeParameters = [];
    }

    isFunctionalInterface(): boolean {
        return this.methods.length == 1;
    }

    getFields(): JavaField[] {
        return this.fields;
    }

    isGenericVariant(): boolean {
        return false;
    }

    isGenericTypeParameter(): boolean {
        return false;
    }

    addExtends(ext: IJavaInterface | IJavaInterface[]) {
        if (!Array.isArray(ext)) ext = [ext];
        this.extends = this.extends.concat(ext);
    }

    public registerExtendsImplementsOnAncestors(type?: NonPrimitiveType) {
        if (type) this.registerChildType(type);

        type = type || this;

        for (let impl of this.extends) {
            (<JavaInterface>impl).registerExtendsImplementsOnAncestors(type);
        }

    }


    getCopyWithConcreteType(typeMap: Map<GenericTypeParameter, NonPrimitiveType>): IJavaInterface {
        if(this.genericTypeParameters.length == 0) return this;
        return new GenericVariantOfJavaInterface(this, typeMap);
    }

    getExtends(): IJavaInterface[] {
        return this.extends;
    }

    cachedAllImplementedInterfaces?: IJavaInterface[];
    getAllImplementedInterfaces(): IJavaInterface[] {
        if(!this.cachedAllImplementedInterfaces){
            this.cachedAllImplementedInterfaces = [];
            for(let intf of this.getExtends()){
                this.cachedAllImplementedInterfaces.push(intf);
                this.cachedAllImplementedInterfaces = this.cachedAllImplementedInterfaces?.concat(intf.getAllImplementedInterfaces());
            }
        }
        return this.cachedAllImplementedInterfaces!;
    }


    public getOwnMethods(): JavaMethod[] {
        return this.methods;
    }

    public getAllMethods(): JavaMethod[] {
        let methods: JavaMethod[] = this.methods;
        for (let impl of this.extends) {
            methods = methods.concat(impl.getAllMethods());
        }
        return methods;
    }

    private getAllInheritedMethodsHelper(alreadyFoundSignatureMap: Map<string, JavaMethod>) {
        for (let m of this.methods) {
            let signature = m.getInternalName("java");
            if (!alreadyFoundSignatureMap.get(signature)) {
                alreadyFoundSignatureMap.set(signature, m);
            }
        }
        for (let intf of this.extends) {
            (<JavaInterface>intf).getAllInheritedMethodsHelper(alreadyFoundSignatureMap);
        }
    }

    public getAllInheritedMethods(): JavaMethod[] {
        let map: Map<string, JavaMethod> = new Map();
        this.getAllInheritedMethodsHelper(map);
        let list: JavaMethod[] = [];
        map.forEach((method, signatur) => list.push(method));
        return list;
    }

    canImplicitlyCastTo(otherType: JavaType): boolean {
        if (otherType instanceof GenericTypeParameter) {
            for (let ext of otherType.upperBounds) {
                if (!this.canImplicitlyCastTo(ext)) return false;
            }

            if (otherType.catches) otherType.catches.push(this);

            return true;
        }

        if (!(otherType instanceof JavaInterface)) return false;

        if (otherType == this) return true;

        for (let intf of this.extends) {
            if (intf.canImplicitlyCastTo(otherType)) return true;
        }

        if (otherType.identifier == 'Object') return true;


        return false;
    }

    canExplicitlyCastTo(otherType: JavaType): boolean {
        if (this.canImplicitlyCastTo(otherType)) return true;
        if (otherType instanceof NonPrimitiveType) {
            return otherType.canImplicitlyCastTo(this);
        }

        return false;
    }

    getDeclaration(): string {
        let decl: string = TokenTypeReadable[this.visibility] + " ";
        decl += "interface " + this.identifier;

        if (this.genericTypeParameters && this.genericTypeParameters.length > 0) {
            decl += "<" + this.genericTypeParameters.map(gi => {
                return gi.getDeclaration();
            }).join(", ") + ">";
        }

        if(this.getExtends().length > 0){
            decl += " extends " + this.getExtends().map(ext => ext.toString()).join(", ");
        }

        return decl;

    }

    getCompletionItems(visibilityUpTo: Visibility, leftBracketAlreadyThere: boolean, identifierAndBracketAfterCursor: string,
        rangeToReplace: monaco.IRange, methodContext: JavaMethod | undefined, onlyStatic?: false): monaco.languages.CompletionItem[] {
            const items = super.getCompletionItems(visibilityUpTo, leftBracketAlreadyThere, identifierAndBracketAfterCursor, rangeToReplace,
                methodContext, onlyStatic);

            for(let gp of this.genericTypeParameters){
                items.push({
                    label: gp.identifier,
                    detail: gp.getDeclaration(),
                    kind: 24, //monaco.languages.CompletionItemKind.TypeParameter,
                    range: rangeToReplace,
                    insertText: gp.identifier 
                })
            }

            return items;
    }



}


export class GenericVariantOfJavaInterface extends IJavaInterface {

    private cachedMethods?: JavaMethod[];

    private cachedExtends?: IJavaInterface[];

    constructor(public isGenericVariantOf: JavaInterface, public typeMap: Map<GenericTypeParameter, NonPrimitiveType>) {
        super(isGenericVariantOf.identifier, isGenericVariantOf.identifierRange, isGenericVariantOf.pathAndIdentifier, isGenericVariantOf.module);
        this.runtimeClass = isGenericVariantOf.runtimeClass;
    }

    getFirstTypeParametersType(): JavaType | undefined {
        let genericInformation = this.isGenericVariantOf.genericTypeParameters;
        if (genericInformation && genericInformation.length > 0) {
            return this.typeMap.get(genericInformation[0]);
        }
        return undefined;
    }

    isFunctionalInterface(): boolean {
        return this.isGenericVariantOf.isFunctionalInterface();
    }

    toString(): string {
        let s: string = this.identifier;

        let genericTypeParameters = this.isGenericVariantOf.genericTypeParameters;

        if (genericTypeParameters && genericTypeParameters.length > 0) {
            s += "<" + genericTypeParameters.map(gi => {
                let type = this.typeMap.get(gi);
                return type?.toString();
            }).join(", ") + ">";
        }
        return s;
    }

    getAbsoluteName(): string {
        let s: string = this.pathAndIdentifier;

        let genericTypeParameters = this.isGenericVariantOf.genericTypeParameters;

        if (genericTypeParameters && genericTypeParameters.length > 0) {
            s += "<" + genericTypeParameters.map(gi => {
                let type = this.typeMap.get(gi);
                return type?.getAbsoluteName();
            }).join(", ") + ">";
        }
        return s;
    }

    getDeclaration(): string {
        let decl: string = TokenTypeReadable[this.visibility] + " ";
        if (this.isStatic) decl += "static ";
        decl += "interface " + this.identifier;

        let genericInformation = this.isGenericVariantOf.genericTypeParameters;
        if (genericInformation && genericInformation.length > 0) {
            decl += "<" + genericInformation.map(gi => {
                let type = this.typeMap.get(gi);
                return type?.getDeclaration();
            }).join(", ") + ">";
        }

        if(this.getExtends().length > 0){
            decl += " extends " + this.getExtends().map(ext => ext.toString()).join(", ");
        }

        return decl;

    }

    isGenericVariant(): boolean {
        return true;
    }

    isGenericTypeParameter(): boolean {
        return false;
    }

    getCopyWithConcreteType(otherTypeMap: Map<GenericTypeParameter, NonPrimitiveType>): IJavaInterface {
        let newTypeMap: Map<GenericTypeParameter, NonPrimitiveType> = new Map();
        let copyNeeded = false;
        this.typeMap.forEach((jt, gt) => {
            let jtCopy = jt.getCopyWithConcreteType(otherTypeMap);
            if (jt != jtCopy) copyNeeded = true;
            newTypeMap.set(gt, <NonPrimitiveType>jtCopy);
        })

        if (!copyNeeded) return this;

        return new GenericVariantOfJavaInterface(this.isGenericVariantOf, newTypeMap);
    }

    public getOwnMethods(): JavaMethod[] {
        if (!this.cachedMethods) {
            this.cachedMethods = [];

            for (let method of this.isGenericVariantOf.getOwnMethods()) {
                this.cachedMethods.push(method.getCopyWithConcreteType(this.typeMap, this));
            }
        }
        return this.cachedMethods;
    }

    public getAllMethods(): JavaMethod[] {
        let methods: JavaMethod[] = this.getOwnMethods();
        for (let impl of this.getExtends()) {
            methods = methods.concat(impl.getAllMethods());
        }
        return methods;
    }

    getExtends(): IJavaInterface[] {
        if (!this.cachedExtends) {
            this.cachedExtends = this.isGenericVariantOf.getExtends().map(impl => <IJavaInterface>impl.getCopyWithConcreteType(this.typeMap));
        }

        return this.cachedExtends;
    }

    cachedAllImplementedInterfaces?: IJavaInterface[];
    getAllImplementedInterfaces(): IJavaInterface[] {
        if(!this.cachedAllImplementedInterfaces){
            this.cachedAllImplementedInterfaces = this.isGenericVariantOf.getAllImplementedInterfaces().map(impl => <IJavaInterface>impl.getCopyWithConcreteType(this.typeMap));
        }
        return this.cachedAllImplementedInterfaces!;
    }


    canExplicitlyCastTo(otherType: JavaType): boolean {
        if (this.canImplicitlyCastTo(otherType)) return true;

        if (otherType instanceof NonPrimitiveType) {
            return otherType.canImplicitlyCastTo(this);
        }

        return false;
    }

    canImplicitlyCastTo(otherType: JavaType): boolean {

        if (otherType instanceof GenericTypeParameter) {
            for (let ext of otherType.upperBounds) {
                if (!this.canImplicitlyCastTo(ext)) return false;
            }

            if (otherType.catches) otherType.catches.push(this);

            return true;
        }


        if (!(otherType instanceof IJavaInterface)) return false;

        // List<Integer> or ArrayList<Integer> can cast to List
        if (otherType instanceof JavaInterface) {
            if (this.isGenericVariantOf.canImplicitlyCastTo(otherType)) return true;
            return false;
        }

        // Now otherType instanceof GenericVariantFromJavaInteface
        // Collection<Integer> can cast to Collection<Integer> or List<? extends Number>
        let ot1 = <GenericVariantOfJavaInterface><any>otherType;

        if (!this.isGenericVariantOf.canImplicitlyCastTo(ot1.isGenericVariantOf)) return false;

        // Find concrete parameterized supertype of this.isGenericVariantFrom which is generic variant from otherType
        // ... Find concrete parameterized supertype of ArrayList<Integer> which is generic variant from List (so: find List<Integer>)

        // superTypeOfMeWhichIsGenericVariantOfOtherType ==> smgvo
        let smgvo = this.findSuperTypeOfMeWhichIsGenericVariantOf(ot1);

        if (smgvo == null) return false;

        for (let genericParameter of smgvo.isGenericVariantOf.genericTypeParameters!) {
            let myType = smgvo.typeMap.get(genericParameter);
            let othersType = ot1.typeMap.get(genericParameter);

            if (!myType || !othersType) return false;

            let othersTypeIsGenericWildcardParameter = othersType instanceof GenericTypeParameter && othersType.isWildcard;

            if (!(myType.canImplicitlyCastTo(othersType) && (othersTypeIsGenericWildcardParameter || othersType.canImplicitlyCastTo(myType)))) {
                return false;
            }

        }

        return true;
    }

    findSuperTypeOfMeWhichIsGenericVariantOf(otherType: GenericVariantOfJavaInterface): GenericVariantOfJavaInterface | null {
        let otherTypeIsGenericVariantOf = otherType.isGenericVariantOf;
        if (otherTypeIsGenericVariantOf == this.isGenericVariantOf) return this;

        for (let st of this.getExtends()) {
            if (st instanceof GenericVariantOfJavaInterface) {
                let found = st.findSuperTypeOfMeWhichIsGenericVariantOf(otherType);
                if (found != null) return found;
            }
        }

        return null;
    }

    public registerExtendsImplementsOnAncestors(type?: NonPrimitiveType) {
        this.isGenericVariantOf.registerExtendsImplementsOnAncestors(type);
    }
}