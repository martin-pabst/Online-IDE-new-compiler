import { KlassObjectRegistry } from "../../common/interpreter/RuntimeConstants";
import { MonacoConstants } from "../../common/monacoproviders/MonacoConstants";
import { JCM } from "../language/JavaCompilerMessages";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { JavaClass } from "../types/JavaClass";
import { JavaEnum } from "../types/JavaEnum";
import { IJavaInterface } from "../types/JavaInterface";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import { JavaCompiledModule } from "./JavaCompiledModule";
import type * as monaco from 'monaco-editor'


export class JavaTypeStore {

    private typeMap: Map<string, JavaType> = new Map();
    private mainClasses: JavaClass[] = [];

    constructor() {

    }

    copy(excludeTypesOfModule?: JavaCompiledModule): JavaTypeStore {
        let jts = new JavaTypeStore();
        if (excludeTypesOfModule) {
            this.typeMap.forEach((value, key) => { if (value.module !== excludeTypesOfModule) jts.typeMap.set(key, value) });
        } else {
            this.typeMap.forEach((value, key) => { jts.typeMap.set(key, value) });
        }
        return jts;
    }

    empty() {
        this.typeMap = new Map();
        this.mainClasses = [];
    }

    addType(type: JavaType) {
        if (type instanceof NonPrimitiveType) {
            this.typeMap.set(type.pathAndIdentifier, type);
            if(type.isMainClass) this.mainClasses.push(<JavaClass>type);
        } else {
            this.typeMap.set(type.identifier, type);
        }
    }

    getMainClasses(): JavaClass[] {
        return this.mainClasses;
    }

    getType(identifierWithPath: string): JavaType | undefined {
        return this.typeMap.get(identifierWithPath);
    }

    populateClassObjectRegistry(klassObjectRegistry: KlassObjectRegistry) {
        this.typeMap.forEach((type, key) => {
            if (type instanceof NonPrimitiveType && type.runtimeClass) {
                klassObjectRegistry[type.pathAndIdentifier] = type.runtimeClass;
            }
        })
    }

    initFastExtendsImplementsLookup() {
        this.typeMap.forEach((type, key) => {
            type.registerExtendsImplementsOnAncestors();
        })
    }

    getClasses(): JavaClass[] {
        let classes: JavaClass[] = [];

        this.typeMap.forEach((type, identifier) => {
            if (type instanceof JavaClass) {
                classes.push(type);
            }
        })

        return classes;
    }

    getNonPrimitiveTypes(): NonPrimitiveType[] {
        let npts: NonPrimitiveType[] = [];

        this.typeMap.forEach((type, identifier) => {
            if (type instanceof NonPrimitiveType) {
                npts.push(type);
            }
        })

        return npts;
    }


    getTypeCompletionItems(classContext: NonPrimitiveType | StaticNonPrimitiveType | undefined, rangeToReplace: monaco.IRange,
        afterNew: boolean, withPrimitiveTypes: boolean): monaco.languages.CompletionItem[] {

        let completionItems: monaco.languages.CompletionItem[] = [];

        this.typeMap.forEach((type, identifier) => {

            if (type instanceof PrimitiveType || type.identifier == "null") {

                if (!withPrimitiveTypes) return;

                completionItems.push({
                    label: type.identifier,
                    detail: type.getCompletionItemDetail(),
                    insertText: type.identifier,
                    documentation: type.getDocumentation(),
                    kind: MonacoConstants.CompletionItemKind.Struct, 
                    range: rangeToReplace,
                    insertTextRules: 4, //monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    command: {
                        id: "editor.action.triggerParameterHints",
                        title: '123',
                        arguments: []
                    }
                })
            } else {
                let npt = <NonPrimitiveType>type;
                if(npt.isMainClass) return;
                
                if (classContext instanceof NonPrimitiveType && !npt.isVisibleFrom(classContext)) return;

                let kind: monaco.languages.CompletionItemKind = MonacoConstants.CompletionItemKind.Class; 
                if (type instanceof IJavaInterface) kind = MonacoConstants.CompletionItemKind.Interface; 
                if (type instanceof JavaEnum) kind = MonacoConstants.CompletionItemKind.Enum; 

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
                    insertText: npt.pathAndIdentifier + suffix,
                    documentation: type.getDocumentation(),
                    kind: kind,
                    range: rangeToReplace,
                    insertTextRules: 4, // monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    command: {
                        id: "editor.action.triggerParameterHints",
                        title: '123',
                        arguments: []
                    }
                })

            }
        })

        return completionItems;

    }


}