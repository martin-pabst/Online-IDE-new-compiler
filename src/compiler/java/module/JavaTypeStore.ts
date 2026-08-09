import { KlassObjectRegistry } from "../../common/interpreter/StepFunction";
import type { IRange } from "../../common/range/Range";
import { JCM } from "../language/JavaCompilerMessages";
import type { ASTImportStatementNode, ASTNodeWithIdentifier } from "../parser/AST";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { JavaClass } from "../types/JavaClass";
import { JavaEnum } from "../types/JavaEnum";
import { IJavaInterface } from "../types/JavaInterface";
import { JavaPackage } from "../types/JavaPackage";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import type { JavaBaseModule } from "./JavaBaseModule";
import { JavaCompiledModule } from "./JavaCompiledModule";
import * as monaco from 'monaco-editor'


export class JavaTypeStore {

    /**
     * Type java.lang.A.B is stored in typeMap.get("java").children.get("lang").children.get("A").children.get("B").type
     * Type java.lang.A is stored in typeMap.get("java").children.get("lang").children.get("A").type
     */

    private typeMap: Map<string, JavaType> = new Map();
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
        this.typeMap = new Map();
        this.mainClasses = [];
    }

    addType(type: JavaType) {
        if (type instanceof NonPrimitiveType) {
            let typeMap = this.typeMap;
            let currentPackage: JavaPackage | undefined = undefined;

            let pathParts = type.pathAndIdentifierAsArray;
            for (let i = 0; i < pathParts.length; i++) {
                let part = pathParts[i];

                if (i < pathParts.length - 1) {
                    let package1 = typeMap.get(part);
                    if (!package1) {
                        package1 = new JavaPackage(part, type.identifierRange, type.module, currentPackage);
                        typeMap.set(part, package1);
                    }
                    currentPackage = package1 as JavaPackage;
                    typeMap = currentPackage.childrenMap;
                } else {
                    if(currentPackage) currentPackage.childrenList.push(type);
                    typeMap.set(part, type);
                }

            }
            if (type.isMainClass) this.mainClasses.push(<JavaClass>type);
        } else {
            this.typeMap.set(type.identifier, type);
        }
    }

    getMainClasses(): JavaClass[] {
        return this.mainClasses;
    }

    getType(pathWithIdentifier: string | string[]): JavaType | undefined {
        if (!Array.isArray(pathWithIdentifier)) {
            pathWithIdentifier = pathWithIdentifier.split(".");
        }

        if (pathWithIdentifier.length == 0) return undefined;

        let type: JavaType | undefined = this.typeMap.get(pathWithIdentifier[0]);
        if (!type) return undefined;

        for (let i = 1; i < pathWithIdentifier.length; i++) {
            let part = pathWithIdentifier[i];
            type = type.getChildTypeByIdentifier(part);
            if (!type) return undefined;
        }
        return type;

    }

    getFirstTypeWhichisNoPackage(pathWithIdentifier: ASTNodeWithIdentifier[], module: JavaBaseModule): { type: JavaType, nextIndex: number } | undefined {
        let typeMap = this.typeMap;
        for (let i = 0; i < pathWithIdentifier.length; i++) {
            let part = pathWithIdentifier[i];
            let packageOrType = typeMap.get(part.identifier);
            if (!packageOrType) return undefined;
            if (packageOrType instanceof JavaPackage) {
                typeMap = packageOrType.childrenMap;
                module.registerTypeUsage(packageOrType, part.identifierRange);
            } else {
                return { type: packageOrType, nextIndex: i + 1 };
            }
        }
        return undefined;
    }

    getTypesMatchingImportPath(importedPath: string[], module: JavaCompiledModule = undefined, pathRanges: IRange[] = undefined): JavaType[] {
        let typeMap = this.typeMap;
        let packageOrType: JavaType | undefined = undefined;
        for (let i = 0; i < importedPath.length - 1; i++) {
            let part = importedPath[i];
            packageOrType = typeMap.get(part);
            if (!packageOrType) return [];
            if(pathRanges) module.registerTypeUsage(packageOrType, pathRanges[i]);
            if (packageOrType instanceof JavaPackage) {
                typeMap = packageOrType.childrenMap;
            } else {
                return [];
            }
        }

        let lastPart = importedPath[importedPath.length - 1];
        if (lastPart == "*") {
            return packageOrType instanceof JavaPackage ? packageOrType.childrenList.filter(c => !(c instanceof JavaPackage)) : [];
        }

        let type = typeMap.get(lastPart);
        if (!type) return [];

        if(pathRanges) module.registerTypeUsage(type, pathRanges[pathRanges.length - 1]);

        return [type];
    }

    populateClassObjectRegistry(klassObjectRegistry: KlassObjectRegistry) {
        this.typeMap.forEach((value, key) => {
            this.populateClassObjectRegistryRecursive(value, klassObjectRegistry);
        });
    }

    private populateClassObjectRegistryRecursive(type: JavaType, klassObjectRegistry: KlassObjectRegistry) {
        if (type instanceof JavaPackage) {
            type.childrenList.forEach(childType => {
                this.populateClassObjectRegistryRecursive(childType, klassObjectRegistry);
            });
        } else if (type instanceof NonPrimitiveType && type.runtimeClass) {
            klassObjectRegistry[type.pathAndIdentifierAsDotSeparatedString] = type.runtimeClass;
            type.innerTypes.forEach(innerType => {
                this.populateClassObjectRegistryRecursive(innerType, klassObjectRegistry);
            });
        }
    }


    initFastExtendsImplementsLookup() {
        this.typeMap.forEach((value, key) => {
            this.initFastExtendsImplementsLookupRecursive(value);
        });
    }

    private initFastExtendsImplementsLookupRecursive(type: JavaType) {
        if (type instanceof NonPrimitiveType) {
            type.registerExtendsImplementsOnAncestors();
        } else if (type instanceof JavaPackage) {
            type.childrenList.forEach(childType => {
                this.initFastExtendsImplementsLookupRecursive(childType);
            });
        }
    }

    getClasses(): JavaClass[] {
        let classes: JavaClass[] = [];

        this.typeMap.forEach((value, key) => {
            this.getClassesRecursive(value, classes);
        });

        return classes;
    }

    private getClassesRecursive(type: JavaType, classes: JavaClass[]) {
        if (type instanceof JavaClass) {
            classes.push(type);
        }
        if (type instanceof JavaPackage) {
            type.childrenList.forEach(childType => {
                this.getClassesRecursive(childType, classes);
            });
        }
    }

    getNonPrimitiveTypes(): NonPrimitiveType[] {
        let npts: NonPrimitiveType[] = [];

        this.typeMap.forEach((value, key) => {

            this.getNonPrimitiveTypesRecursive(value, npts);
        });

        return npts;
    }


    private getNonPrimitiveTypesRecursive(type: JavaType, npts: NonPrimitiveType[]) {
        if (type instanceof JavaPackage) {
            type.childrenList.forEach(childType => {
                this.getNonPrimitiveTypesRecursive(childType, npts);
            });
        } else if (type instanceof NonPrimitiveType) {
            npts.push(type);
        }
    }

    private getAllTypes(): JavaType[] {
        let types: JavaType[] = [];
        this.typeMap.forEach((value, key) => {
            this.getAllTypesRecursive(value, types);
        }
        );
        return types;
    }

    private getAllTypesRecursive(type: JavaType, types: JavaType[]) {
        types.push(type);
        if (type instanceof NonPrimitiveType) {
            type.innerTypes.forEach(innerType => {
                this.getAllTypesRecursive(innerType, types);
            });
        } else if (type instanceof JavaPackage) {
            type.childrenList.forEach(childType => {
                this.getAllTypesRecursive(childType, types);
            });
        } 
    }




    getTypeCompletionItems(classContext: NonPrimitiveType | StaticNonPrimitiveType | undefined, rangeToReplace: monaco.IRange,
        afterNew: boolean, withPrimitiveTypes: boolean, imports: string[][] ): monaco.languages.CompletionItem[] {

        let completionItems: monaco.languages.CompletionItem[] = [];

        this.getAllTypes().forEach((type, identifier) => {

            let path = type.getPath();
            let visible = false;
            if(path.length == 1){
                visible = true;
            } else {
                for(let importPath of imports){
                    if(importPath.length == path.length){   
                        let allMatch = true;
                        for(let i = 0; i < path.length; i++){
                            if(importPath[i] == '*'){
                                break;
                            } else if(importPath[i] != path[i]){
                                allMatch = false;
                                break;
                            }
                        }
                        if(allMatch){
                            visible = true;
                            break;
                        }
                    }
                }
            }

            if(!visible) return;

            if (type instanceof JavaPackage) {

                completionItems.push({
                    label: type.identifier,
                    detail: type.getCompletionItemDetail(),
                    insertText: type.identifier + ".",
                    documentation: type.getDocumentation(),
                    kind: monaco.languages.CompletionItemKind.Module,
                    range: rangeToReplace,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    command: {
                        id: "editor.action.triggerSuggest",
                        title: '123',
                        arguments: []
                    }
                })

            } else if (type instanceof PrimitiveType || type.identifier == "null") {

                if (!withPrimitiveTypes) return;

                completionItems.push({
                    label: type.identifier,
                    detail: type.getCompletionItemDetail(),
                    insertText: type.identifier,
                    documentation: type.getDocumentation(),
                    kind: monaco.languages.CompletionItemKind.Struct,
                    range: rangeToReplace,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
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
                    insertText: npt.identifier + suffix,
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
        })

        return completionItems;

    }


}