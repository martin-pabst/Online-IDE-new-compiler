import { KlassObjectRegistry } from "../../common/interpreter/StepFunction";
import { JCM } from "../language/JavaCompilerMessages";
import type { ASTNodeWithIdentifier } from "../parser/AST";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { JavaClass } from "../types/JavaClass";
import { JavaEnum } from "../types/JavaEnum";
import { IJavaInterface } from "../types/JavaInterface";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import { JavaCompiledModule } from "./JavaCompiledModule";
import * as monaco from 'monaco-editor'


type TypeNode = {
    type?: JavaType;
    children?: Map<string, TypeNode>;
};

export class JavaTypeStore {

    /**
     * Type java.lang.A.B is stored in typeMap.get("java").children.get("lang").children.get("A").children.get("B").type
     * Type java.lang.A is stored in typeMap.get("java").children.get("lang").children.get("A").type
     */

    private typeMap: TypeNode = { children: new Map() };
    private mainClasses: JavaClass[] = [];

    constructor() {

    }

    // copy(excludeTypesOfModule?: JavaCompiledModule): JavaTypeStore {
    //     let jts = new JavaTypeStore();
    //     if (excludeTypesOfModule) {
    //         this.typeMap.forEach((value, key) => { if (value.module !== excludeTypesOfModule) jts.typeMap.set(key, value) });
    //     } else {
    //         this.typeMap.forEach((value, key) => { jts.typeMap.set(key, value) });
    //     }
    //     return jts;
    // }

    empty() {
        this.typeMap = { children: new Map() };
        this.mainClasses = [];
    }

    addType(type: JavaType) {
        if (type instanceof NonPrimitiveType) {
            let typeMap = this.typeMap;
            let pathParts = type.pathAndIdentifierAsArray;
            for (let i = 0; i < pathParts.length; i++) {
                let part = pathParts[i];
                let childTypeMap = typeMap.children.get(part);
                if (!childTypeMap) {
                    childTypeMap = { children: new Map() }
                    typeMap.children.set(part, childTypeMap);
                }
                typeMap = childTypeMap;
            }
            typeMap.type = type;
            if (type.isMainClass) this.mainClasses.push(<JavaClass>type);
        } else {
            this.typeMap.children.set(type.identifier, { type: type, children: new Map() });
        }
    }

    getMainClasses(): JavaClass[] {
        return this.mainClasses;
    }

    getType(pathWithIdentifier: string | string[]): JavaType | undefined {
        if (Array.isArray(pathWithIdentifier)) {
            let typeMap = this.typeMap;
            for (let i = 0; i < pathWithIdentifier.length; i++) {
                let part = pathWithIdentifier[i];
                typeMap = typeMap.children.get(part);
                if (!typeMap) return undefined;
            }
            return typeMap.type;
        } else {
            let parts = pathWithIdentifier.split(".");
            return this.getType(parts);
        }

    }

    getFirstTypeWhichisNoPackage(pathWithIdentifier: ASTNodeWithIdentifier[]):  { type: JavaType, nextIndex: number } | undefined {
        let typeMap = this.typeMap;
        for (let i = 0; i < pathWithIdentifier.length; i++) {
            let part = pathWithIdentifier[i];
            typeMap = typeMap.children.get(part.identifier);
            if (!typeMap) return undefined;
            if (typeMap.type) return { type: typeMap.type, nextIndex: i + 1 };
        }
        return undefined;

    }

    populateClassObjectRegistry(klassObjectRegistry: KlassObjectRegistry) {
        this.populateClassObjectRegistryRecursive(this.typeMap, klassObjectRegistry);
    }

    private populateClassObjectRegistryRecursive(typeNode: TypeNode, klassObjectRegistry: KlassObjectRegistry) {
        if (typeNode.type instanceof NonPrimitiveType && typeNode.type.runtimeClass) {
            klassObjectRegistry[typeNode.type.pathAndIdentifierAsDotSeparatedString] = typeNode.type.runtimeClass;
        }
        if (typeNode.children) {
            typeNode.children.forEach((childTypeNode, key) => {
                this.populateClassObjectRegistryRecursive(childTypeNode, klassObjectRegistry);
            })
        }
    }


    initFastExtendsImplementsLookup() {
        this.initFastExtendsImplementsLookupRecursive(this.typeMap);
    }

    private initFastExtendsImplementsLookupRecursive(typeNode: TypeNode) {
        if (typeNode.type) {
            typeNode.type.registerExtendsImplementsOnAncestors();
        }
        if (typeNode.children) {
            typeNode.children.forEach((childTypeNode, key) => {
                this.initFastExtendsImplementsLookupRecursive(childTypeNode);
            })
        }
    }

    getClasses(): JavaClass[] {
        let classes: JavaClass[] = [];

        this.getClassesRecursive(this.typeMap, classes);
        return classes;
    }

    private getClassesRecursive(typeNode: TypeNode, classes: JavaClass[]) {
        if (typeNode.type instanceof JavaClass) {
            classes.push(typeNode.type);
        }
        if (typeNode.children) {
            typeNode.children.forEach((childTypeNode, key) => {
                this.getClassesRecursive(childTypeNode, classes);
            })
        }
    }

    getNonPrimitiveTypes(): NonPrimitiveType[] {
        let npts: NonPrimitiveType[] = [];

        this.getNonPrimitiveTypesRecursive(this.typeMap, npts);
        return npts;
    }

    private getNonPrimitiveTypesRecursive(typeNode: TypeNode, npts: NonPrimitiveType[]) {
        if (typeNode.type instanceof NonPrimitiveType) {
            npts.push(typeNode.type);
        }
        if (typeNode.children) {
            typeNode.children.forEach((childTypeNode, key) => {
                this.getNonPrimitiveTypesRecursive(childTypeNode, npts);
            })
        }
    }

    getTypeCompletionItems(classContext: NonPrimitiveType | StaticNonPrimitiveType | undefined, rangeToReplace: monaco.IRange,
        afterNew: boolean, withPrimitiveTypes: boolean): monaco.languages.CompletionItem[] {

        let completionItems: monaco.languages.CompletionItem[] = [];

        this.getTypeCompletionItemsRecursive(this.typeMap, classContext, rangeToReplace, afterNew, withPrimitiveTypes, completionItems);
        return completionItems;
    }

    private getTypeCompletionItemsRecursive(typeNode: TypeNode, classContext: NonPrimitiveType | StaticNonPrimitiveType | undefined, rangeToReplace: monaco.IRange,
        afterNew: boolean, withPrimitiveTypes: boolean, completionItems: monaco.languages.CompletionItem[]) {

        if (typeNode.type) {
            const type = typeNode.type;
            if (type instanceof PrimitiveType || type.identifier == "null") {

                if (!withPrimitiveTypes) return;

                completionItems.push({
                    label: type.identifier,
                    detail: type.getCompletionItemDetail(),
                    insertText: type.identifier,
                    documentation: type.getDocumentation(),
                    kind: monaco.languages.CompletionItemKind.Struct,
                    range: rangeToReplace,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    command: {
                        id: "editor.action.triggerParameterHints",
                        title: '123',
                        arguments: []
                    }
                })
            } else {
                let npt = <NonPrimitiveType>type;
                if (npt.isMainClass) return;

                if (classContext instanceof NonPrimitiveType && !npt.isVisibleFrom(classContext)) return;

                let kind: monaco.languages.CompletionItemKind = monaco.languages.CompletionItemKind.Class;
                if (type instanceof IJavaInterface) kind = monaco.languages.CompletionItemKind.Interface;
                if (type instanceof JavaEnum) kind = monaco.languages.CompletionItemKind.Enum;

                let isGeneric: boolean = type.genericTypeParameters && type.genericTypeParameters.length > 0 ? true : false;

                let suffix = "";
                if (afterNew) {
                    suffix = "($0)";
                    if (isGeneric) {
                        suffix = "<>($0)";
                    }
                }

                completionItems.push({
                    label: type.identifier,
                    detail: type.getCompletionItemDetail() + (isGeneric ? "(" + JCM.genericType() + ")" : ""),
                    insertText: npt.pathAndIdentifierAsDotSeparatedString + suffix,
                    documentation: type.getDocumentation(),
                    kind: kind,
                    range: rangeToReplace,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    command: {
                        id: "editor.action.triggerParameterHints",
                        title: '123',
                        arguments: []
                    }
                })

            }
        }
        if (typeNode.children) {
            typeNode.children.forEach((childTypeNode, key) => {
                this.getTypeCompletionItemsRecursive(childTypeNode, classContext, rangeToReplace, afterNew, withPrimitiveTypes, completionItems);
            })
        }
    }


}