import { CallbackParameter } from "../../common/interpreter/CallbackParameter.ts";
import { Program } from "../../common/interpreter/Program";
import { CallbackFunction, Helpers, StepParams } from "../../common/interpreter/StepFunction.ts";
import { Thread } from "../../common/interpreter/Thread.ts";
import { EmptyRange, IRange, Range } from "../../common/range/Range.ts";
import { JavaCompilerStringConstants } from "../JavaCompilerStringConstants.ts";
import { TokenType } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { ASTAnnotationNode, ASTAnonymousClassNode, ASTBlockNode, ASTClassDefinitionNode, ASTEnumDefinitionNode, ASTFieldDeclarationNode, ASTInstanceInitializerNode, ASTInterfaceDefinitionNode, ASTLambdaFunctionDeclarationNode, ASTMethodCallNode, ASTMethodDeclarationNode, ASTStatementNode, ASTStaticInitializerNode, TypeScope } from "../parser/AST";
import { ObjectClass } from "../runtime/system/javalang/ObjectClassStringClass.ts";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType.ts";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { JavaAnnotation } from "../types/JavaAnnotation.ts";
import { IJavaClass, JavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { IJavaInterface, JavaInterface } from "../types/JavaInterface.ts";
import { JavaType } from "../types/JavaType.ts";
import { CodeSnippet, StringCodeSnippet } from "./CodeSnippet";
import { CodeSnippetContainer } from "./CodeSnippetKinds.ts";
import { OneParameterTemplate } from "./CodeTemplate.ts";
import { ExceptionTree } from "./ExceptionTree.ts";
import { MissingStatementManager } from "./MissingStatementsManager.ts";
import { SnippetLinker } from "./SnippetLinker";
import { StatementCodeGenerator } from "./StatementCodeGenerator";

export class InnerClassCodeGenerator extends StatementCodeGenerator {

    linker: SnippetLinker;

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        exceptionTree: ExceptionTree) {
        super(module, libraryTypestore, compiledTypesTypestore, exceptionTree);
        this.linker = new SnippetLinker();
    }

    /**
     *
     *  Compiles expressions like new MyAbstractClass(p1, p2){ attributeDeclarations, instanceInitializers, methodDeclarations }
     *
     * @param node
     */
    compileAnonymousInnerClass(node: ASTAnonymousClassNode): CodeSnippet | undefined {

        // let outerClass = this.currentSymbolTable.classContext;
        let klass = node.klass.resolvedType;
        if(!klass) return undefined;

        // setup provisionally version of runtime class to collect programs:
        klass.runtimeClass = class {

        };  //

        let oldRuntimeClass = klass.runtimeClass;

        node.newObjectNode.type.resolvedType = klass;

        this.compileInstanceFieldsAndInitializer(node.klass, klass);
        this.buildStandardConstructors(klass);
        this.compileMethods(node.klass, klass, false);



        let outerLocalVariables = klass.fields.filter(f => f.isInnerClassCopyOfOuterClassLocalVariable).map(f => f.isInnerClassCopyOfOuterClassLocalVariable);
        let invisibleFieldIdentifiers = klass.fields.filter(f => f.isInnerClassCopyOfOuterClassLocalVariable).map(f => f.getInternalName());

        // final version of runtime class:
        klass.runtimeClass = class extends klass.getExtends()?.runtimeClass!{

            constructor(...args: any) {
                super();
                for (let i = 0; i < invisibleFieldIdentifiers.length; i++) {
                    this[invisibleFieldIdentifiers[i]] = args[i];
                }
            }

        };  //

        klass.runtimeClass.type = klass;

        Object.assign(klass.runtimeClass, oldRuntimeClass);
        Object.assign(klass.runtimeClass.prototype, oldRuntimeClass.prototype);
        // snippet which instantiates object of this class calling it's typescript constructor and it's java constructor

        // klass.checkIfInterfacesAreImplementedAndSupplementDefaultMethods({});
        // klass.takeSignaturesFromOverriddenMethods({});
        // klass.checkIfAbstractParentsAreImplemented();

        let template = `new this.innerClass(${outerLocalVariables.map(v => Helpers.elementRelativeToStackbase(v!.stackframePosition!)).join(", ")})`;
        let newClassSnippet = new StringCodeSnippet(template, node.range, klass);
        newClassSnippet.addEmitToStepListener((step) => {
            step.innerClass = klass.runtimeClass;
        });

        let snippet = this.compileNewObjectNode(node.newObjectNode, newClassSnippet);

        return snippet;
    }

    compileLambdaFunction(node: ASTLambdaFunctionDeclarationNode, expectedType: JavaType | undefined): CodeSnippet | undefined {
         if (!node || !expectedType) return undefined;

        if (!this.isFunctionalInterface(expectedType)) {
            this.pushError(JCM.lambdaFunctionHereNotPossible(), "error", node.range);
            return undefined;
        }

        if (!node.statement) return undefined;

        let functionalInterface = <IJavaInterface>expectedType;
        let methodToImplement = functionalInterface.getOwnMethods().find(m => !m.isDefault)!;

        if (node.parameters.length != methodToImplement.parameters.length) {
            this.pushError(JCM.lambdaFunctionWrongParameterCount(node.parameters.length, methodToImplement.parameters.length, functionalInterface.identifier), "error", node.range);
            return;
        }

        let methodToImplementParameterTypes: JavaType[] = methodToImplement.parameters.map(p => {
            if (p.type instanceof GenericTypeParameter) {
                if (p.type.lowerBound) return p.type.lowerBound;
                return p.type;
            } else {
                return p.type;
            }
        })

        for (let i = 0; i < node.parameters.length; i++) {
            let lambdaParameter = node.parameters[i];
            let fiParameterType = methodToImplementParameterTypes[i];
            if (lambdaParameter.type && lambdaParameter.type.resolvedType) {
                if (!this.canCastTo(fiParameterType, lambdaParameter.type.resolvedType, "implicit")) {
                    this.pushError(JCM.lambdaFunctionWrongParameterType(lambdaParameter.identifier, fiParameterType.toString()), "error", lambdaParameter.range);
                }
            }
        }

        let method = methodToImplement.getCopy();
        for (let i = 0; i < method.parameters.length; i++) {
            method.parameters[i].identifier = node.parameters[i].identifier;
            method.parameters[i].type = methodToImplementParameterTypes[i];
            method.parameters[i].identifierRange = node.parameters[i].identifierRange;
            this.registerUsagePosition(method.parameters[i], node.parameters[i].identifierRange);
        }
        method.takeInternalJavaNameWithGenericParamterIdentifiersFrom(methodToImplement);

        method.identifierRange = node.statement?.range || node.range;

        //@ts-ignore    (fake methodNode to use compileMethodDeclaration later)
        let methodNode: ASTMethodDeclarationNode = {
            range: method.identifierRange,
            statement: node.statement,
            isContructor: false,
            identifier: method.identifier,
            method: method,
            program: undefined,
            annotations: []
        }

        // build class...
        //
        let outerClass = this.currentSymbolTable.classContext!;
        let klass = new JavaClass("", node.range, "", this.module);
        klass.outerType = outerClass;
        klass.setExtends(this.objectType);

        // setup provisionally version of runtime class to collect programs:
        klass.runtimeClass = class {

        };  //

        let oldRuntimeClass = klass.runtimeClass;
        // oldClass.__programs = [];
        klass.addImplements(functionalInterface);

        klass.methods = [method];

        this.outerClassFieldAccessTracker.startTracking();

        this.compileMethodDeclaration(methodNode, klass);

        let outerClassFieldAccessHappened = this.outerClassFieldAccessTracker.hasAccessHappened();

        klass.checkIfInterfacesAreImplementedAndSupplementDefaultMethods();

        let outerLocalVariables = klass.fields.filter(f => f.isInnerClassCopyOfOuterClassLocalVariable).map(f => f.isInnerClassCopyOfOuterClassLocalVariable);
        outerLocalVariables.forEach(v => this.missingStatementManager.onSymbolRead(v!, EmptyRange.instance, this.module.errors));
        let invisibleFieldIdentifiers = klass.fields.filter(f => f.isInnerClassCopyOfOuterClassLocalVariable).map(f => f.getInternalName());

        // final version of runtime class:
        klass.runtimeClass = class extends klass.getExtends()?.runtimeClass!{

            constructor(__outer__: any, ...args: any) {
                super();
                this[Helpers.outerClassAttributeIdentifier] = __outer__;
                for (let i = 0; i < invisibleFieldIdentifiers.length; i++) {
                    this[invisibleFieldIdentifiers[i]] = args[i];
                }
            }

        };  //

        klass.runtimeClass.type = klass;

        Object.assign(klass.runtimeClass, oldRuntimeClass);
        Object.assign(klass.runtimeClass.prototype, oldRuntimeClass.prototype);
        // snippet which instantiates object of this class calling it's typescript constructor and it's java constructor

        let parameterString = Helpers.elementRelativeToStackbase(0);
        if (outerLocalVariables.length > 0) {
            parameterString += ", " + outerLocalVariables.map(v => Helpers.elementRelativeToStackbase(v!.stackframePosition!)).join(", ");
        }

        let instantiationAtRuntimeNeeded = outerClassFieldAccessHappened || outerLocalVariables.length > 0;

        let template = instantiationAtRuntimeNeeded ? `new this.innerClass(${parameterString})` : `this.lambdaObject`;
        let newClassSnippet = new StringCodeSnippet(template, node.range, klass);
        newClassSnippet.addEmitToStepListener((step) => {
            if (instantiationAtRuntimeNeeded) {
                step.innerClass = klass.runtimeClass;
            } else {
                step.lambdaObject = new klass.runtimeClass!(null);
            }
        });

        return newClassSnippet;
    }

    isFunctionalInterface(type: JavaType | undefined) {
        if (!type) return false;
        if (!(type instanceof IJavaInterface)) return false;
        if (type.getOwnMethods().filter(m => !m.isDefault).length != 1) return false;
        return true;
    }

    protected compileInstanceFieldsAndInitializer(cdef: ASTClassDefinitionNode | ASTEnumDefinitionNode, classContext: JavaClass | JavaEnum) {
        let fieldSnippets: CodeSnippet[] = [];
        for (let fieldOrInitializer of cdef.fieldsOrInstanceInitializers) {

            switch (fieldOrInitializer.kind) {
                case TokenType.fieldDeclaration:
                    if (fieldOrInitializer.isStatic) continue;
                    let snippet = this.compileFieldDeclaration(fieldOrInitializer, classContext);
                    if (snippet) {
                        fieldSnippets.push(snippet);
                    }
                    break;
                case TokenType.instanceInitializerBlock:
                    let snippet1 = this.compileInstanceInitializerBlock(fieldOrInitializer, classContext);
                    if (snippet1) {
                        fieldSnippets.push(snippet1);
                    }
                    break;
                default:
                    break;
            }

        }

        classContext.instanceInitializer = fieldSnippets;
    }

    compileInstanceInitializerBlock(node: ASTInstanceInitializerNode, classContext: JavaClass | JavaEnum): CodeSnippetContainer | undefined {

        this.pushAndGetNewSymbolTable(node.range, true, classContext)
        this.missingStatementManager.beginMethodBody([]);

        let snippet = new CodeSnippetContainer([], node.range);
        for (let statementNode of node.statements) {
            let statementSnippet = this.compileStatementOrTerm(statementNode);
            if (statementSnippet) snippet.addParts(statementSnippet);
        }

        this.missingStatementManager.endMethodBody(undefined, this.module.errors);

        this.popSymbolTable();

        return snippet;
    }


    /**
     * if a class has no explicitly declared constructor then foreach constructor of it's base class build
     * a constructor with same signature
     */
    buildStandardConstructors(classContext: JavaClass) {
        if (classContext.methods.some(m => m.isConstructor)) return;

        // if(classContext.identifier == 'History') debugger;

        let baseClass: IJavaClass = classContext;
        while (!baseClass.getOwnMethods().find(m => m.isConstructor && m.visibility != TokenType.keywordPrivate)) baseClass = baseClass.getExtends()!;
        // TypeResolver enforces base class to be at least Object
        for (let baseConstructor of baseClass.getOwnMethods().filter(m => m.isConstructor && m.visibility != TokenType.keywordPrivate)) {

            let method = baseConstructor.getCopy();
            if (classContext.outerType && !classContext.isStatic) {
                method.hasOuterClassParameter = true;
            }

            classContext.methods.push(method);
            method.classEnumInterface = classContext;

            if (classContext.instanceInitializer?.length == 0 && !method.hasOuterClassParameter) {
                method.hasImplementationWithNativeCallingConvention = baseConstructor.hasImplementationWithNativeCallingConvention;
                continue; // unaltered implementation of base class constructor suffices for child class
            }

            // let's build a new method!
            let symbolTable = this.pushAndGetNewSymbolTable(EmptyRange.instance, true, classContext, method);

            method.identifier = classContext.identifier;
            method.hasImplementationWithNativeCallingConvention = false;

            let stackframePosition: number = 1;  // 0 is thread, 1 is callback
            let parametersForSuperCall = baseConstructor.parameters.map(p => `${StepParams.stack}[${StepParams.stackBase} + ${stackframePosition++}]`).join(", ");

            if (!baseConstructor.hasImplementationWithNativeCallingConvention) {
                // undefined für callback
                parametersForSuperCall = StepParams.thread + ", undefined" + (parametersForSuperCall.length == 0 ? "" : ", ") + parametersForSuperCall;
            }

            if (parametersForSuperCall.length > 0) parametersForSuperCall = ", " + parametersForSuperCall;

            let steps = classContext.instanceInitializer.slice();

            if (method.hasOuterClassParameter) {
                let storeOuterClassReferenceSnippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${Helpers.outerClassAttributeIdentifier} = ${Helpers.elementRelativeToStackbase(1)};\n`);
                steps.unshift(storeOuterClassReferenceSnippet);
            }

            // let getBaseClass: string = `let obj = ${Helpers.elementRelativeToStackbase(0)};\nlet baseKlass = ${Helpers.classes}.Object.getPrototypeOf(Object.getPrototypeOf(obj));\n`
            let getBaseClass: string = `let obj = ${Helpers.elementRelativeToStackbase(0)};\nlet baseKlass = ${Helpers.classes}.${baseClass.identifier};\n`
            let superCall: string = `baseKlass.prototype.${baseConstructor.getInternalName(baseConstructor.hasImplementationWithNativeCallingConvention ? "native" : "java")}.call(obj${parametersForSuperCall});\n`;
            let returnCall: string = `${Helpers.return}(${Helpers.elementRelativeToStackbase(0)});\n`;

            steps.unshift(new StringCodeSnippet(getBaseClass + superCall));
            let returnSnippet = new CodeSnippetContainer(new StringCodeSnippet(returnCall));
            returnSnippet.enforceNewStepBeforeSnippet();
            steps.push(returnSnippet);

            let parameterIdentifiers = method.parameters.map(p => p.identifier);
            if (method.hasOuterClassParameter) {
                parameterIdentifiers.unshift(Helpers.outerClassAttributeIdentifier);
            }
            let thisFollowedByParameterIdentifiers = ["this"].concat(parameterIdentifiers);

            method.program = new Program(this.module, symbolTable, classContext.identifier + "." + method.identifier);
            method.program.numberOfThisObjects = 1;
            method.program.numberOfParameters = parameterIdentifiers.length;

            this.linker.link(steps, method.program);

            let runtimeClass = classContext.runtimeClass;

            if (runtimeClass) {

                // runtimeClass.__programs.push(method.program);
                // let methodIndex = runtimeClass.__programs.length - 1;


                // runtimeClass.prototype[method.getInternalName("java")] = new Function(StepParams.thread, ...parameterIdentifiers,
                //     `${Helpers.threadStack}.push(${thisFollowedByParameterIdentifiers.join(", ")});` +
                //                  `${Helpers.pushProgram}(this.constructor.__programs[${methodIndex}]);`);


                let functionStub = function (this: any, __t: Thread, callback: CallbackParameter, ...parameters: any) {
                    __t.s.push(this, ...parameters);
                    __t.pushProgram(method!.program!, callback);
                }

                runtimeClass.prototype[method.getInternalName("java")] = functionStub;

            }

            this.popSymbolTable();
        }

    }


    /**
 * All fields inside types are already built by TypeResolver.
 * This method handles field initialization and adds all fields to the
 * symbol table.
 * @see TypeResolver#buildRuntimeClassesAndTheirFields
 * @returns
 */
    compileFieldDeclaration(fieldNode: ASTFieldDeclarationNode, classContext: JavaClass | JavaEnum | JavaInterface): CodeSnippet | undefined {

        if (fieldNode.type.kind != TokenType.varType && !fieldNode.type.resolvedType) return undefined;

        let field = classContext.fields.find(f => f.identifier == fieldNode.identifier);
        if (!field) return undefined;

        this.registerUsagePosition(field, fieldNode.identifierRange);

        // this.currentSymbolTable.addSymbol(field);

        field.initialValue = field.type instanceof PrimitiveType ? field.type.getDefaultValue() : null;

        if (classContext instanceof JavaInterface) {
            if (!fieldNode.isStatic || !fieldNode.isFinal) {
                this.pushError(JCM.interfaceFieldsMustBeStatic(), "error", fieldNode);
            }
        }

        if (fieldNode.isStatic) {

            this.classOfCurrentlyCompiledStaticInitialization = classContext;
            let snippet = this.compileInitialValue(fieldNode.initialization, fieldNode.type.resolvedType);
            this.classOfCurrentlyCompiledStaticInitialization = undefined;


            if (snippet) {

                if (snippet.isConstant()) {
                    field.initialValue = snippet.getConstantValue();
                    field.initialValueIsConstant = field.isFinal();
                } else if (field.isFinal() && snippet.type == this.stringNonPrimitiveType && snippet.getConstantValue()) {
                    field.initialValueIsConstant = true;
                }

                let assignmentTemplate = `${Helpers.classes}.${classContext.identifier}.${field.getInternalName()} = §1;\n`;

                let initRange = fieldNode.initialization ? fieldNode.initialization.range : EmptyRange.instance;

                snippet = new OneParameterTemplate(assignmentTemplate).applyToSnippet(field.type, initRange, snippet);

                snippet = new CodeSnippetContainer(snippet);
                (<CodeSnippetContainer>snippet).addNextStepMark();

            } else {
                field.initialValueIsConstant = true;
                let initialValueAsString = field.type instanceof PrimitiveType ? field.type.defaultValueAsString : "null";
                snippet = new StringCodeSnippet(`${Helpers.classes}.${classContext.identifier}.${field.getInternalName()} = ${initialValueAsString};\n`);
            }

            if (classContext.runtimeClass) {
                classContext.runtimeClass[field.getInternalName()] = field.initialValue;
            }

            return snippet;
        } else {

            if(fieldNode.initialization) field.initializedBeforeConstructor = true;
            let snippet = this.compileInitialValue(fieldNode.initialization, fieldNode.type.resolvedType);
            if (snippet) {

                if (snippet.isConstant()) {
                    field.initialValue = snippet.getConstantValue();
                    field.initialValueIsConstant = field.isFinal();
                    if ((<JavaType>field.getType())?.isPrimitive) {
                        snippet = undefined;
                    }
                }
                if (snippet) {
                    let assignmentTemplate = `${Helpers.elementRelativeToStackbase(0)}.${field.getInternalName()} = §1;\n`;

                    snippet = new OneParameterTemplate(assignmentTemplate).applyToSnippet(field.type, snippet.range!, snippet);

                    snippet = new CodeSnippetContainer(snippet);
                    (<CodeSnippetContainer>snippet).addNextStepMark();
                }

            } else {
                field.initialValueIsConstant = true;
            }

            if (classContext.runtimeClass) {
                classContext.runtimeClass.prototype[field.getInternalName()] = field.initialValue;
            }

            return snippet;
        }

    }

    compileAnnotation(node: ASTAnnotationNode): JavaAnnotation {
        return new JavaAnnotation(node.identifier, node.range);
    }



    compileMethodDeclaration(methodNode: ASTMethodDeclarationNode, classContext: JavaClass | JavaEnum | JavaInterface) {

        if (methodNode.identifier != JavaCompilerStringConstants.mainMethodIdentifier || !methodNode.parentTypeScope["isMainClass"]) {
            this.module.methodDeclarationRanges.push(methodNode.range);
        }

        const method = methodNode.method;
        if (!method) return;

        method.setAnnotations(methodNode.annotations.map(this.compileAnnotation));
        if(method.isConstructor){
            this.registerUsagePosition(method.classEnumInterface, methodNode.identifierRange);
        } else {
            this.registerUsagePosition(method, methodNode.identifierRange);
        }

        if (methodNode.isContructor) {
            if (classContext.outerType && !classContext.isStatic) {
                method.hasOuterClassParameter = true;
            }
        }

        let symbolTable = this.pushAndGetNewSymbolTable(methodNode.range, true, method.isStatic ? classContext.staticType : classContext, method);

        if (method.hasOuterClassParameter) {
            this.currentSymbolTable.insertInvisibleParameter(); // make room for __outer-Parameter
        }

        for (let parameter of method.parameters) {
            this.currentSymbolTable.addSymbol(parameter);
            // The following line is not necessary as parameters already got registered
            // at TypeResolver.buildMethods:
            // this.registerUsagePosition(parameter, parameter.identifierRange);
        }


        let snippets: CodeSnippet[] = [];

        let thisCallHappened: boolean = false;
        let superCallHappened: boolean = false;

        if (method.isConstructor) {

            if (classContext instanceof JavaInterface) {
                this.pushError(JCM.interfacesDontHaveConstructors(), "error", methodNode);
                this.popSymbolTable();
                return undefined;
            }

            [thisCallHappened, superCallHappened] = this.checkIfSuperconstructorCallPresent(methodNode.statement);

            if (!thisCallHappened && classContext.instanceInitializer.length > 0) {
                snippets = snippets.concat(classContext.instanceInitializer);
            }

            if (method.hasOuterClassParameter) {
                let storeOuterClassReferenceSnippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${Helpers.outerClassAttributeIdentifier} = ${Helpers.elementRelativeToStackbase(1)};\n`);
                snippets.push(storeOuterClassReferenceSnippet);
            }

        } else if (method.identifier == classContext.identifier && method.returnParameterType) {
            this.pushError(JCM.methodImitatesConstructor(method.identifier), "warning", method.identifierRange);
        }

        if (methodNode.statement) {
            if (method.isAbstract) this.pushError(JCM.abstractMethodsDontHaveMethodBodies(), "error", methodNode);
            if (classContext instanceof JavaInterface && !(method.isAbstract || method.isDefault)) this.pushError(JCM.interfaceOnlyDefaultMethodsHaveBody(), "error", methodNode);

            let msm = this.missingStatementManager;
            this.missingStatementManager = new MissingStatementManager();
            this.missingStatementManager.beginMethodBody(method.parameters);

            let snippet = methodNode.statement ? this.compileStatementOrTerm(methodNode.statement) : undefined;
            if (snippet) snippets.push(snippet);

            if (methodNode.isContructor) {
                let endOfMethodRange: IRange = Range.fromPositions(Range.getEndPosition(methodNode.range));
                let returnSnippet = new CodeSnippetContainer([new StringCodeSnippet(`${Helpers.return}(${Helpers.elementRelativeToStackbase(0)});\n`, endOfMethodRange)]);
                returnSnippet.enforceNewStepBeforeSnippet();
                snippets.push(returnSnippet);

                if (!(thisCallHappened || superCallHappened)) {
                    // Has base class a parameterless super constructor?
                    let baseClass = classContext.getExtends();
                    if (baseClass instanceof IJavaClass) {
                        let parameterlessConstructors = baseClass.getPossibleMethods(baseClass.identifier, true, false).filter(m => m.parameters.length == 0);
                        if (parameterlessConstructors.length == 0) {
                            this.pushError(JCM.superCallInConstructorMissing(baseClass.identifier), "error", methodNode.identifierRange);
                        } else {
                            let parameterlessConstructor = parameterlessConstructors[0];
                            if (parameterlessConstructor.hasImplementationWithNativeCallingConvention) {
                                let superConstructorCall = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${parameterlessConstructor.getInternalName("native")}();\n`);
                                snippets.unshift(superConstructorCall);
                            } else {
                                let superConstructorCall = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${parameterlessConstructor.getInternalName("java")}(${StepParams.thread}, undefined);\n`);
                                snippets.unshift(superConstructorCall);
                            }
                        }
                    }
                }

            }


            method.program = new Program(this.module, symbolTable, classContext.identifier + "." + method.identifier);

            if (method.isSynchronized) {
                // snippets.unshift(new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${ObjectClass.prototype.enterSynchronizedBlock.name}(${StepParams.thread});\n`));

                let beforeEnteringSynchronizedBlockStatement = new StringCodeSnippet(`return this.index + ${Helpers.elementRelativeToStackbase(0)}.${ObjectClass.prototype.beforeEnteringSynchronizedBlock.name}(${StepParams.thread});\n`);
                let sn = new CodeSnippetContainer([beforeEnteringSynchronizedBlockStatement]);
                sn.addNextStepMark();
                snippets.unshift(sn);

            }

            if (!this.missingStatementManager.hasReturnHappened() && !methodNode.isContructor) {
                let endOfMethodRange: IRange = Range.fromPositions(Range.getEndPosition(methodNode.range));
                if (method.isSynchronized) {
                    snippets.push(new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${ObjectClass.prototype.leaveSynchronizedBlock.name}(${StepParams.thread});\n`, endOfMethodRange));
                }
                let sn1 = new CodeSnippetContainer([new StringCodeSnippet(`${Helpers.return}();`, endOfMethodRange)]);
                sn1.enforceNewStepBeforeSnippet();
                snippets.push(sn1);
            }

            this.missingStatementManager.endMethodBody(method, this.module.errors);
            this.missingStatementManager = msm;

            this.linker.link(snippets, method.program);

            methodNode.program = method.program;    // only for debugging purposes

            let runtimeClass = classContext.runtimeClass;

            if (runtimeClass) {
                method.callbackAfterCodeGeneration.forEach(callback => callback());

                let functionStub: Function;
                if (method.isStatic) {
                    functionStub = function (this: any, __t: Thread, ...parameters: any) {
                        __t.s.push(this, ...parameters);
                        __t.pushProgram(method!.program!);
                    }
                    runtimeClass[method.getInternalNameWithGenericParameterIdentifiers("java")] = functionStub;
                } else {
                    functionStub = function (this: any, __t: Thread, __callback: CallbackFunction, ...parameters: any) {
                        __t.s.push(this, ...parameters);
                        __t.pushProgram(method!.program!, __callback);
                    }
                    runtimeClass.prototype[method.getInternalNameWithGenericParameterIdentifiers("java")] = functionStub;
                }

            }
        }


        this.popSymbolTable();

    }

    checkIfSuperconstructorCallPresent(statement: ASTStatementNode | undefined): [boolean, boolean] {
        if (!statement) return [false, false];
        if (statement.kind = TokenType.block) {
            let blockstatement = <ASTBlockNode>statement;
            if (blockstatement.statements.length > 0) {
                statement = blockstatement.statements[0];
            } else {
                return [false, false];
            }
        }
        //@ts-ignore
        if (!statement.kind == TokenType.methodCall) return [false, false];

        let methodCall = <ASTMethodCallNode>statement;

        let objectKind = methodCall.nodeToGetObject?.kind;
        if (!objectKind) return [false, false];

        if (objectKind == TokenType.keywordThis) return [true, false];
        if (objectKind == TokenType.keywordSuper) return [false, true];

        return [false, false];
    }



    protected async compileMethods(cdef: ASTClassDefinitionNode | ASTEnumDefinitionNode | ASTInterfaceDefinitionNode,
        classContext: JavaClass | JavaEnum | JavaInterface, interruptIfNeeded: boolean) {
        for (let method of cdef.methods) {

            if(interruptIfNeeded){
                await this.progressManager.interruptIfNeeded();
            }

            this.compileMethodDeclaration(method, classContext);

            if (method.isContructor) {
                if (cdef.kind == TokenType.keywordEnum) {
                    if (method.visibility != TokenType.keywordPrivate) {
                        this.pushError(JCM.enumConstructorsMustBePrivate(), "error", method.range);
                    }
                }
            }
        }
    }



}