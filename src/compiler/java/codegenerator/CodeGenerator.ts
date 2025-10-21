import { SettingsStore } from "../../../client/settings/SettingsStore.ts";
import { Program } from "../../common/interpreter/Program";
import { Helpers } from "../../common/interpreter/StepFunction.ts";
import { EmptyRange } from "../../common/range/Range.ts";
import { CompilingProgressManager } from "../CompilingProgressManager.ts";
import { TokenType } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { ASTClassDefinitionNode, ASTEnumDefinitionNode, ASTInterfaceDefinitionNode, ASTStaticInitializerNode, TypeScope } from "../parser/AST";
import { JsonTool } from "../runtime/network/JsonTool.ts";
import { SystemModule } from "../runtime/system/SystemModule.ts";
import { IJavaClass, JavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { JavaInterface } from "../types/JavaInterface.ts";
import { JavaMethod } from "../types/JavaMethod.ts";
import { JavaParameter } from "../types/JavaParameter.ts";
import { CodeSnippet, StringCodeSnippet } from "./CodeSnippet";
import { CodeSnippetContainer } from "./CodeSnippetKinds.ts";
import { OneParameterTemplate } from "./CodeTemplate.ts";
import { ExceptionTree } from "./ExceptionTree.ts";
import { InnerClassCodeGenerator } from "./InnerClassCodeGenerator.ts";
import { SnippetLinker } from "./SnippetLinker";

export class CodeGenerator extends InnerClassCodeGenerator {

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        exceptionTree: ExceptionTree, progressManager: CompilingProgressManager,
        settingsStore?: SettingsStore
    ) {
        super(module, libraryTypestore, compiledTypesTypestore, exceptionTree, settingsStore);
        this.progressManager = progressManager;
        this.linker = new SnippetLinker();
    }

    async start() {
        this.module.programsToCompileToFunctions = [];
        await this.compileClassesEnumsAndInterfaces(this.module.ast);
        // this.compileMainProgram();
    }


    async compileClassesEnumsAndInterfaces(typeScope: TypeScope | undefined) {

        // First compile all static fields and static initializers in all types:
        // If they can be evaluated to constants, then you can use them in switch...case-statements later on
        this.compileStaticFieldsAndInitializerAndEnumValuesRecursive(typeScope);

        this.compileInstanceFieldsInitializersAndStandardConstructorsRecursively(typeScope);

        await this.compileMethodsRecursively(typeScope);

    }

    compileInstanceFieldsInitializersAndStandardConstructorsRecursively(typeScope: TypeScope | undefined) {
        if (!typeScope) return;

        for (let cdef of typeScope.innerTypes) {
            if (cdef.isAnonymousInnerType) continue;     // anonymous inner class
            if (cdef.kind != TokenType.keywordClass && cdef.kind != TokenType.keywordEnum) continue;

            let type = cdef.resolvedType;
            if (!type || !cdef.resolvedType) return;

            if (cdef.annotations) {
                type.setAnnotations(cdef.annotations.map(this.compileAnnotation));
            }

            if (cdef.symbolTable) {
                this.pushSymbolTable(cdef.symbolTable);
            } else {
                cdef.symbolTable = this.pushAndGetNewSymbolTable(cdef.range, false, type);
            }

            this.compileInstanceFieldsAndInitializer(cdef, type as JavaClass | JavaEnum);

            if (cdef.kind == TokenType.keywordClass) {
                this.buildStandardConstructors(type as JavaClass);
                this.insertJsonMethods(type as JavaClass);
            }


            this.compileInstanceFieldsInitializersAndStandardConstructorsRecursively(cdef);

            this.popSymbolTable();
        }
    }

    insertJsonMethods(klass: JavaClass) {

            let hasParameterlessConstructor = klass.methods.filter(m => m.isConstructor && m.parameters.length == 0);
            let doesExtendSystemClass: boolean = false;
            let klass1: IJavaClass | undefined = klass.getExtends();
            while(klass1 != this.objectType){
                if(klass1?.module instanceof SystemModule){
                    doesExtendSystemClass = true;
                    break;
                }
                klass1 = klass1.getExtends();
            }

            if(!hasParameterlessConstructor || doesExtendSystemClass) return;

            let toJsonMethod = new JavaMethod("toJson", EmptyRange.instance, this.module);
            toJsonMethod.hasImplementationWithNativeCallingConvention = true;
            toJsonMethod.isFinal = true;
            toJsonMethod.returnParameterType = this.stringType;

            klass.methods.push(toJsonMethod);

            //@ts-ignore
            klass.runtimeClass!.prototype._mn$toJson$string$ = function(){
                return new JsonTool().toJson(this);
            }

            let fromJsonMethod = new JavaMethod("fromJson", EmptyRange.instance, this.module);
            fromJsonMethod.isStatic = true;
            fromJsonMethod.parameters.push(new JavaParameter("jsonString", EmptyRange.instance, this.module, this.stringType, true, false, false));
            fromJsonMethod.returnParameterType = klass;
            fromJsonMethod.hasImplementationWithNativeCallingConvention = true;

            klass.methods.push(fromJsonMethod);

            //@ts-ignore
            klass.runtimeClass["_mn$fromJson$" + klass.identifier + "$string"] = function(jsonString: string){
                return new JsonTool().fromJson(jsonString, klass);
            }

    }

    compileStaticFieldsAndInitializerAndEnumValuesRecursive(typeScope: TypeScope | undefined) {
        if (!typeScope) return;

        for (let cdef of typeScope.innerTypes) {
            if (cdef.isAnonymousInnerType) continue;     // anonymous inner class

            let type = cdef.resolvedType;
            if (!type || !cdef.resolvedType) return;

            if (cdef.symbolTable) {
                this.pushSymbolTable(cdef.symbolTable);
            } else {
                cdef.symbolTable = this.pushAndGetNewSymbolTable(cdef.range, false, type);
                //@ts-ignore
                if ((<ASTClassDefinitionNode>cdef).isMainClass && cdef.parent["mainProgramNode"]) {
                    cdef.symbolTable.hiddenWhenDebugging = true;
                }

            }

            this.compileStaticFieldsAndInitializerAndEnumValues(type, cdef);

            this.compileStaticFieldsAndInitializerAndEnumValuesRecursive(cdef);

            this.popSymbolTable();
        }
    }


    async compileMethodsRecursively(typeScope: TypeScope | undefined) {
        if (!typeScope) return;

        for (let cdef of typeScope.innerTypes) {
            if (cdef.isAnonymousInnerType) continue;     // anonymous inner class

            let type = cdef.resolvedType;
            if (!type || !cdef.resolvedType) return;

            if (cdef.symbolTable) {
                this.pushSymbolTable(cdef.symbolTable);
            } else {
                cdef.symbolTable = this.pushAndGetNewSymbolTable(cdef.range, false, type);
            }

            await this.compileMethods(cdef, type, true);

            await this.compileMethodsRecursively(cdef);

            this.popSymbolTable();
        }

    }

    private compileStaticFieldsAndInitializerAndEnumValues(classContext: JavaClass | JavaEnum | JavaInterface, cdef: ASTClassDefinitionNode | ASTEnumDefinitionNode | ASTInterfaceDefinitionNode) {
        let staticFieldSnippets: CodeSnippet[] = [];

        if (cdef.kind == TokenType.keywordEnum) {
            this.compileEnumValueConstruction(<JavaEnum>classContext, cdef, staticFieldSnippets);
        }


        for (let fieldOrInitializer of cdef.fieldsOrInstanceInitializers) {

            switch (fieldOrInitializer.kind) {
                case TokenType.fieldDeclaration:
                    if (!fieldOrInitializer.isStatic) {
                        if (classContext instanceof JavaInterface) {
                            this.pushError(JCM.interfaceFieldsMustBeStatic(), "error", cdef);
                        }
                        continue;
                    }
                    let snippet = this.compileFieldDeclaration(fieldOrInitializer, classContext);
                    if (snippet) {
                        staticFieldSnippets.push(snippet);
                    }
                    break;
                case TokenType.staticInitializerBlock:
                    let snippet2 = this.compileStaticInitializerBlock(fieldOrInitializer);
                    if (snippet2) {
                        staticFieldSnippets.push(snippet2);
                    }
                    break;
                default:
                    break;
            }

        }


        classContext.staticInitializer = this.buildInitializer(staticFieldSnippets, "staticInitializer");
        cdef.staticInitializer = classContext.staticInitializer;
    }

    compileEnumValueConstruction(javaEnum: JavaEnum, enumDeclNode: ASTEnumDefinitionNode, staticFieldSnippets: CodeSnippet[]) {

        staticFieldSnippets.push(new StringCodeSnippet(`${Helpers.classes}["${javaEnum.identifier}"].values = [];\n`));

        let parameterlessConstructor = javaEnum.methods.find(m => m.isConstructor && m.parameters.length == 0);

        let enumValueIndex: number = 0;
        for (let valueNode of enumDeclNode.valueNodes) {

            // find suitable constructor and invoke it!
            let callConstructorSnippet: CodeSnippet;
            if (valueNode.parameterValues.length > 0 || parameterlessConstructor) {

                let parameterSnippets = <CodeSnippet[]>valueNode.parameterValues.map(pv => this.compileTerm(pv));
                if (parameterSnippets.some(sn => (!sn || !sn.type))) continue; // if there had been an error when compiling parameter values

                let constructors = this.searchMethod(javaEnum.identifier, javaEnum, parameterSnippets.map(sn => sn!.type!), true, false, false, enumDeclNode.range);

                let constructor = constructors.best;
                if (!constructor) {
                    this.pushError(JCM.cantFindConstructor(), "error", enumDeclNode);
                    continue;
                }

                callConstructorSnippet = this.invokeConstructor(parameterSnippets, constructor, javaEnum, valueNode, undefined, valueNode.identifier, enumValueIndex);
                callConstructorSnippet = new CodeSnippetContainer(callConstructorSnippet);
                (<CodeSnippetContainer>callConstructorSnippet).ensureFinalValueIsOnStack();
                (<CodeSnippetContainer>callConstructorSnippet).addNextStepMark();
            } else {
                callConstructorSnippet = new StringCodeSnippet(`new ${Helpers.classes}["${javaEnum.identifier}"]("${valueNode.identifier}", ${enumValueIndex})`);
            }
            let field = javaEnum.fields.find(f => f.identifier == valueNode.identifier);
            let buildEnumValueSnippet = new OneParameterTemplate(`${Helpers.classes}["${javaEnum.identifier}"].values.push(${Helpers.classes}["${javaEnum.identifier}"]["${field.getInternalName()}"] = §1);\n`).applyToSnippet(javaEnum, valueNode.range, callConstructorSnippet);
            staticFieldSnippets.push(buildEnumValueSnippet);

            enumValueIndex++;
        }
    }



    buildInitializer(snippets: CodeSnippet[], identifier: string): Program {
        let program = new Program(this.module, this.currentSymbolTable, identifier);
        if (snippets.length > 0) {
            snippets.push(new StringCodeSnippet(`${Helpers.return}();`));
        }
        this.linker.link(snippets, program);
        return program;
    }




    compileStaticInitializerBlock(node: ASTStaticInitializerNode): CodeSnippetContainer | undefined {

        this.missingStatementManager.beginMethodBody([]);
        let snippet = new CodeSnippetContainer([], node.range);
        for (let statementNode of node.statements) {
            let statementSnippet = this.compileStatementOrTerm(statementNode);
            if (statementSnippet) snippet.addParts(statementSnippet);
        }
        this.missingStatementManager.endMethodBody(undefined, this.module.errors);

        return snippet;
    }


}
