import { SettingsStore } from "../../../client/settings/SettingsStore.ts";
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
import { ASTAnnotationNode, ASTAnonymousClassNode, ASTBinaryNode, ASTBlockNode, ASTClassDefinitionNode, ASTEnumDefinitionNode, ASTFieldDeclarationNode, ASTInstanceInitializerNode, ASTInterfaceDefinitionNode, ASTLambdaFunctionDeclarationNode, ASTMethodCallNode, ASTMethodDeclarationNode, ASTReturnNode, ASTStatementNode, ASTStaticInitializerNode, ASTTermNode, ASTUnaryPrefixNode, TypeScope } from "../parser/AST";
import { ObjectClass } from "../runtime/system/javalang/ObjectClassStringClass.ts";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType.ts";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { JavaAnnotation } from "../types/JavaAnnotation.ts";
import { IJavaClass, JavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { IJavaInterface, JavaInterface } from "../types/JavaInterface.ts";
import { JavaType } from "../types/JavaType.ts";
import { at, cleanup, Code, hook, link, STEP } from "./Code";
import { Expr, statement } from "./Expr";
import { ExceptionTree } from "./ExceptionTree.ts";
import { FlowAnalyzer } from "./FlowAnalyzer.ts";
import { StatementCodeGenerator } from "./StatementCodeGenerator";

export class InnerClassCodeGenerator extends StatementCodeGenerator {

    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        exceptionTree: ExceptionTree,
        settingsStore: SettingsStore | undefined) {
        super(module, libraryTypestore, compiledTypesTypestore, exceptionTree, settingsStore);
    }

    /**
     *
     *  Compiles expressions like new MyAbstractClass(p1, p2){ attributeDeclarations, instanceInitializers, methodDeclarations }
     *
     * @param node
     */
    innerclassCounter: number = 0;
    compileAnonymousInnerClass(node: ASTAnonymousClassNode): Expr | undefined {

        // let outerClass = this.currentSymbolTable.classContext;
        let klass = node.klass.resolvedType;
        if (!klass) return undefined;

        // setup provisionally version of runtime class to collect programs:
        klass.runtimeClass = class {

        };  //

        let oldRuntimeClass = klass.runtimeClass;

        node.newObjectNode.type.resolvedType = klass;

        this.compileInstanceFieldsAndInitializer(node.klass, klass);
        this.buildStandardConstructors(klass);
        this.compileMethods(node.klass, klass, false);



        let outerLocalVariables = klass.fields.filter(f => f.innerClassCopyOfOuterClassLocalVariable).map(f => f.innerClassCopyOfOuterClassLocalVariable);
        // the values of these local variables of the enclosing method are copied into the new object here
        outerLocalVariables.forEach(v => this.flow.onRead(v!, node.range, this.module.errors));
        let invisibleFieldIdentifiers = klass.fields.filter(f => f.innerClassCopyOfOuterClassLocalVariable).map(f => f.getInternalName());

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
        // snippet which instantiates object of this class calling its typescript constructor and its java constructor

        // klass.checkIfInterfacesAreImplementedAndSupplementDefaultMethods({});
        // klass.takeSignaturesFromOverriddenMethods({});
        // klass.checkIfAbstractParentsAreImplemented();
        
        let counter = this.innerclassCounter++;
        let template = `new this.$AnonymousInnerClass${counter}(${outerLocalVariables.map(v => Helpers.elementRelativeToStackbase(v!.stackframePosition!)).join(", ")})`;
        // this in context of Step.run-function points to Step-object
        let newClassSnippet: Expr = {
            pre: [hook(step => { step[`$AnonymousInnerClass${counter}`] = klass.runtimeClass; })],
            value: template,
            type: klass,
            range: node.range
        };

        let snippet = this.compileNewObjectNode(node.newObjectNode, newClassSnippet);

        return snippet;
    }

    lambdaCounter: number = 0;
    compileLambdaFunction(node: ASTLambdaFunctionDeclarationNode, expectedType: JavaType | undefined): Expr | undefined {
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
            if (!lambdaParameter.type) {
                this.module.addInlayHint(1, lambdaParameter.range, fiParameterType.toString(),
                    false, true, fiParameterType.toString() + " " + methodToImplement.parameters[i].identifier);
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

        // Parser converts lambda functions with expression body (x -> expression) into lambda functions
        // with body { return expression; }. If the functional interface's method has return type void
        // then expression has to be a statement expression (e.g. method call, assignment, ...) which is
        // executed without returning it's value.
        let statement: ASTStatementNode = node.statement;
        if (statement.kind == TokenType.keywordReturn && (<ASTReturnNode>statement).term &&
            (!method.returnParameterType || method.returnParameterType == this.voidType) &&
            this.isStatementExpression((<ASTReturnNode>statement).term!)) {
            statement = (<ASTReturnNode>statement).term!;
        }

        //@ts-ignore    (fake methodNode to use compileMethodDeclaration later)
        let methodNode: ASTMethodDeclarationNode = {
            range: method.identifierRange,
            statement: statement,
            isConstructor: false,
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

        let outerLocalVariables = klass.fields.filter(f => f.innerClassCopyOfOuterClassLocalVariable).map(f => f.innerClassCopyOfOuterClassLocalVariable);
        // the values of these local variables of the enclosing method are copied into the lambda object here
        outerLocalVariables.forEach(v => this.flow.onRead(v!, node.range, this.module.errors));
        let invisibleFieldIdentifiers = klass.fields.filter(f => f.innerClassCopyOfOuterClassLocalVariable).map(f => f.getInternalName());

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
        // snippet which instantiates object of this class calling its typescript constructor and its java constructor

        let parameterString = Helpers.elementRelativeToStackbase(0);
        if (outerLocalVariables.length > 0) {
            parameterString += ", " + outerLocalVariables.map(v => Helpers.elementRelativeToStackbase(v!.stackframePosition!)).join(", ");
        }

        let instantiationAtRuntimeNeeded = outerClassFieldAccessHappened || outerLocalVariables.length > 0;

        let counter = this.lambdaCounter++;

        let template = instantiationAtRuntimeNeeded ? `new this.innerClass${counter}(${parameterString})` : `this.lambdaObject${counter}`;
        // this in context of Step.run-function points to Step-object
        return {
            pre: [hook(step => {
                if (instantiationAtRuntimeNeeded) {
                    // each lambda function needs its own property as one step may instantiate several of them
                    step["innerClass" + counter] = klass.runtimeClass;
                    step.innerClass = klass.runtimeClass;   // shown by Disassembler
                } else {
                    step["lambdaObject" + counter] = new klass.runtimeClass!(null);
                }
            })],
            value: template,
            type: klass,
            range: node.range
        };
    }

    /**
     * Statement expressions are expressions which may be used as statements:
     * method calls, object creation, assignments, ++ and -- (and print/println in this java dialect)
     * see https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.8
     */
    isStatementExpression(term: ASTTermNode): boolean {
        switch (term.kind) {
            case TokenType.methodCall:
            case TokenType.newObject:
            case TokenType.anonymousClass:
            case TokenType.plusPlusMinusMinusSuffix:
            case TokenType.print:       // print(...) and println(...)
                return true;
            case TokenType.unaryPrefixOp:
                let prefixOperator = (<ASTUnaryPrefixNode>term).operator;
                return prefixOperator == TokenType.plusPlus || prefixOperator == TokenType.minusMinus;
            case TokenType.binaryOp:
                return InnerClassCodeGenerator.assignmentOperators.indexOf((<ASTBinaryNode>term).operator) >= 0;
        }
        return false;
    }

    static assignmentOperators: TokenType[] = [TokenType.assignment, TokenType.plusAssignment, TokenType.minusAssignment,
        TokenType.multiplicationAssignment, TokenType.divisionAssignment, TokenType.moduloAssignment,
        TokenType.ANDAssigment, TokenType.XORAssigment, TokenType.ORAssigment,
        TokenType.shiftLeftAssigment, TokenType.shiftRightAssigment, TokenType.shiftRightUnsignedAssigment];

    isFunctionalInterface(type: JavaType | undefined) {
        if (!type) return false;
        if (!(type instanceof IJavaInterface)) return false;
        if (type.getOwnMethods().filter(m => !m.isDefault).length != 1) return false;
        return true;
    }

    protected compileInstanceFieldsAndInitializer(cdef: ASTClassDefinitionNode | ASTEnumDefinitionNode, classContext: JavaClass | JavaEnum) {
        let fieldCode: Code = [];
        for (let fieldOrInitializer of cdef.fieldsOrInstanceInitializers) {

            switch (fieldOrInitializer.kind) {
                case TokenType.fieldDeclaration:
                    if (fieldOrInitializer.isStatic) continue;
                    fieldCode.push(...this.compileFieldDeclaration(fieldOrInitializer, classContext) ?? []);
                    break;
                case TokenType.instanceInitializerBlock:
                    fieldCode.push(...this.compileInstanceInitializerBlock(fieldOrInitializer, classContext) ?? []);
                    break;
                default:
                    break;
            }

        }

        classContext.instanceInitializer = fieldCode;
    }

    compileInstanceInitializerBlock(node: ASTInstanceInitializerNode, classContext: JavaClass | JavaEnum): Code | undefined {

        this.pushAndGetNewSymbolTable(node.range, true, classContext)

        // instance initializers of anonymous classes are compiled in the middle of the enclosing method
        let flowOfEnclosingMethod = this.flow;
        this.flow = new FlowAnalyzer();

        let code = this.compileStatementSequence(node.statements);

        this.flow.end(undefined, this.module.errors);
        this.flow = flowOfEnclosingMethod;

        this.popSymbolTable();

        return code;
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

            let code: Code = [];

            // reference to outer object is needed by field initializers, so store it first
            if (method.hasOuterClassParameter) {
                code.push(`${Helpers.elementRelativeToStackbase(0)}.${Helpers.outerClassAttributeIdentifier} = ${Helpers.elementRelativeToStackbase(1)};\n`);
            }

            // let getBaseClass: string = `let obj = ${Helpers.elementRelativeToStackbase(0)};\nlet baseKlass = ${Helpers.classes}.Object.getPrototypeOf(Object.getPrototypeOf(obj));\n`
            let getBaseClass: string = `let obj = ${Helpers.elementRelativeToStackbase(0)};\nlet baseKlass = ${Helpers.classes}.${baseClass.identifier};\n`
            let superCall: string = `baseKlass.prototype.${baseConstructor.getInternalName(baseConstructor.hasImplementationWithNativeCallingConvention ? "native" : "java")}.call(obj${parametersForSuperCall});\n`;
            let returnCall: string = `${Helpers.return}(${Helpers.elementRelativeToStackbase(0)});\n`;

            code.push(getBaseClass + superCall);
            if (!baseConstructor.hasImplementationWithNativeCallingConvention) {
                // Constructor with java calling convention runs in the following steps and pushes this onto the stack.
                // Like in java field initializers are executed after it has finished.
                code.push(STEP, cleanup(`${StepParams.stack}.pop();\n`));
            }
            code.push(...classContext.instanceInitializer, STEP, returnCall);

            let parameterIdentifiers = method.parameters.map(p => p.identifier);
            if (method.hasOuterClassParameter) {
                parameterIdentifiers.unshift(Helpers.outerClassAttributeIdentifier);
            }
            let thisFollowedByParameterIdentifiers = ["this"].concat(parameterIdentifiers);

            method.program = new Program(this.module, symbolTable, classContext.identifier + "." + method.identifier);
            method.program.numberOfThisObjects = 1;
            method.program.numberOfParameters = parameterIdentifiers.length;

            link(code, method.program, "Constructor " + method.program.methodIdentifierWithClass);

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
    compileFieldDeclaration(fieldNode: ASTFieldDeclarationNode, classContext: JavaClass | JavaEnum | JavaInterface): Code | undefined {

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


            let code: Code;

            if (snippet) {

                if (snippet.constant !== undefined) {
                    field.initialValue = snippet.constant;
                    field.initialValueIsConstant = field.isFinal();
                } else if (field.isFinal() && snippet.type == this.stringNonPrimitiveType && snippet.constant) {
                    field.initialValueIsConstant = true;
                }

                let initRange = fieldNode.initialization ? fieldNode.initialization.range : EmptyRange.instance;

                code = [...statement(snippet, value => `${Helpers.classes}.${classContext.identifier}.${field.getInternalName()} = ${value};\n`, initRange), STEP];

            } else {
                field.initialValueIsConstant = true;
                let initialValueAsString = field.type instanceof PrimitiveType ? field.type.defaultValueAsString : "null";
                code = [`${Helpers.classes}.${classContext.identifier}.${field.getInternalName()} = ${initialValueAsString};\n`];
            }

            if (classContext.runtimeClass) {
                classContext.runtimeClass[field.getInternalName()] = field.initialValue;
            }

            return code;
        } else {

            if (fieldNode.initialization) field.initializedBeforeConstructor = true;
            let snippet = this.compileInitialValue(fieldNode.initialization, fieldNode.type.resolvedType);

            // Like in java fields get their initial values after the constructor of the base class has been executed.
            // If the base class is a user defined class its constructor may call overridden methods
            // which see the default values (0, false, null) of the fields of this class.
            // Therefore constant initial values can only be stored in the prototype if the base class is a library class.
            let baseClass = classContext instanceof JavaClass ? classContext.getExtends() : undefined;
            let baseClassConstructorMayAccessFields = baseClass != null && !baseClass.isLibraryType;
            let defaultValue = field.initialValue;

            let code: Code | undefined;

            if (snippet) {

                if (snippet.constant !== undefined) {
                    field.initialValue = snippet.constant;
                    field.initialValueIsConstant = field.isFinal();
                    if ((<JavaType>field.getType())?.isPrimitive && !baseClassConstructorMayAccessFields) {
                        snippet = undefined;
                    }
                }
                if (snippet) {
                    code = [...statement(snippet, value => `${Helpers.elementRelativeToStackbase(0)}.${field.getInternalName()} = ${value};\n`), STEP];
                }

            } else {
                field.initialValueIsConstant = true;
            }

            if (classContext.runtimeClass) {
                // if there is an initialization snippet, the prototype holds the default value until it is executed
                classContext.runtimeClass.prototype[field.getInternalName()] = code ? defaultValue : field.initialValue;
            }

            return code;
        }

    }

    compileAnnotation(node: ASTAnnotationNode): JavaAnnotation {
        return new JavaAnnotation(node.identifier, node.range, node.parameter);
    }

    addDependencyInjectionSnippetsToInstanceInitializer(cdef: ASTClassDefinitionNode | ASTEnumDefinitionNode, classContext: JavaClass | JavaEnum) {
        if (!(classContext instanceof JavaClass)) return;
        if(!cdef.hasInjectedFields) return; // optimization to avoid iterating through all fields if there are none with @Inject annotation

        for (const fieldOrInit of cdef.fieldsOrInstanceInitializers) {
            if (fieldOrInit.kind !== TokenType.fieldDeclaration) continue;
            if (fieldOrInit.isStatic) continue;

            const injectAnnotation = fieldOrInit.annotations?.find(a => a.identifier === "Inject");
            if (!injectAnnotation?.parameter) continue;

            const field = classContext.fields.find(f => f.identifier === fieldOrInit.identifier);
            if (!field) continue;

            const instanceName = injectAnnotation.parameter;
            classContext.instanceInitializer.push(
                `${Helpers.elementRelativeToStackbase(0)}.${field.getInternalName()} = ` +
                `(${Helpers.classes}.__di_instances && ${Helpers.classes}.__di_instances["${instanceName}"]) || null;\n`,
                ...at(fieldOrInit.range)
            );
        }
    }



    compileMethodDeclaration(methodNode: ASTMethodDeclarationNode, classContext: JavaClass | JavaEnum | JavaInterface) {

        if (methodNode.identifier != JavaCompilerStringConstants.mainMethodIdentifier || !methodNode.parentTypeScope["isMainClass"]) {
            this.module.methodDeclarationRanges.push(methodNode.range);
        }

        const method = methodNode.method;
        if (!method) return;

        method.setAnnotations(methodNode.annotations.map(this.compileAnnotation));
        if (method.isConstructor) {
            this.registerUsagePosition(method.classEnumInterface, methodNode.identifierRange);
            this.registerUsagePosition(method, methodNode.identifierRange);
        } else {
            this.registerUsagePosition(method, methodNode.identifierRange);
        }

        if (methodNode.isConstructor) {
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


        let code: Code = [];

        if (method.isFullSpeedMethod()) {
            code.push(`${Helpers.enterFullspeedMode}();\n`);
        }

        let thisCallHappened: boolean = false;
        let superCallHappened: boolean = false;
        let insertPositionForImplicitSuperCall: number = 0;

        // methods of lambda functions and anonymous classes inside parameters of super(...)-call are compiled while compiling the
        // enclosing constructor, so save state of enclosing constructor:
        let snippetsToInsertAfterSuperConstructorCallOfEnclosingConstructor = this.snippetsToInsertAfterSuperConstructorCall;
        this.snippetsToInsertAfterSuperConstructorCall = undefined;

        if (method.isConstructor) {

            if (classContext instanceof JavaInterface) {
                this.pushError(JCM.interfacesDontHaveConstructors(), "error", methodNode);
                this.popSymbolTable();
                this.snippetsToInsertAfterSuperConstructorCall = snippetsToInsertAfterSuperConstructorCallOfEnclosingConstructor;
                return undefined;
            }

            [thisCallHappened, superCallHappened] = this.checkIfSuperconstructorCallPresent(methodNode.statement);

            // reference to outer object is needed by field initializers, so store it first
            if (method.hasOuterClassParameter) {
                code.push(`${Helpers.elementRelativeToStackbase(0)}.${Helpers.outerClassAttributeIdentifier} = ${Helpers.elementRelativeToStackbase(1)};\n`);
            }

            insertPositionForImplicitSuperCall = code.length;

            // Like in java field initializers and instance initializer blocks are executed
            // after the constructor of the base class (super(...)) has been called:
            if (superCallHappened) {
                // explicit super(...)-call: see compileStatementOrTerm
                this.snippetsToInsertAfterSuperConstructorCall = classContext.instanceInitializer.length > 0 ? classContext.instanceInitializer : undefined;
            } else if (!thisCallHappened && classContext.instanceInitializer.length > 0) {
                // implicit super()-call is inserted in front of these snippets below
                code.push(...classContext.instanceInitializer);
            }

        } else if (method.identifier == classContext.identifier && method.returnParameterType) {
            this.pushError(JCM.methodImitatesConstructor(method.identifier), "warning", method.identifierRange);
        }

        if (methodNode.statement) {
            if (method.isAbstract) this.pushError(JCM.abstractMethodsDontHaveMethodBodies(), "error", methodNode);
            if (classContext instanceof JavaInterface && !(method.isAbstract || method.isDefault)) this.pushError(JCM.interfaceOnlyDefaultMethodsHaveBody(), "error", methodNode);

            // methods of lambda functions and anonymous classes are compiled in the middle of the enclosing method
            let flowOfEnclosingMethod = this.flow;
            this.flow = new FlowAnalyzer(method.parameters);

            code.push(...this.compileStatementOrTerm(methodNode.statement) ?? []);

            if (method.isFullSpeedMethod()) {
                code.push(`${Helpers.exitFullspeedMode}();\n`);
            }

            if (methodNode.isConstructor) {
                let endOfMethodRange: IRange = Range.fromPositions(Range.getEndPosition(methodNode.range));
                code.push(STEP, `${Helpers.return}(${Helpers.elementRelativeToStackbase(0)});\n`, ...at(endOfMethodRange));

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
                                code.splice(insertPositionForImplicitSuperCall, 0, `${Helpers.elementRelativeToStackbase(0)}.${parameterlessConstructor.getInternalName("native")}();\n`);
                            } else {
                                // A constructor with the java calling convention may hand control
                                // back to the scheduler before it is done, so the rest of this
                                // constructor has to run in a later step - exactly as it does for an
                                // explicit super(...) call (see TermCodeGenerator.compileMethodCall).
                                // Without the step mark the constructor body runs while the base
                                // class constructor is still in flight, and everything it sets up
                                // there is overwritten again once the base constructor resumes.
                                // The base class constructor pushes this onto the stack.
                                code.splice(insertPositionForImplicitSuperCall, 0,
                                    `${Helpers.elementRelativeToStackbase(0)}.${parameterlessConstructor.getInternalName("java")}(${StepParams.thread}, undefined);\n`, STEP,
                                    cleanup(`${StepParams.stack}.pop();\n`));
                            }
                        }
                    }
                }

            }


            method.program = new Program(this.module, symbolTable, classContext.identifier + "." + method.identifier);

            if (method.isSynchronized) {
                code.unshift(`return this.index + ${Helpers.elementRelativeToStackbase(0)}.${ObjectClass.prototype.beforeEnteringSynchronizedBlock.name}(${StepParams.thread});\n`, STEP);

            }

            // end of method body is reachable: implicit return
            if (this.flow.state.alive && !methodNode.isConstructor) {
                let endOfMethodRange: IRange = Range.fromPositions(Range.getEndPosition(methodNode.range));
                if (method.isSynchronized) {
                    code.push(`${Helpers.elementRelativeToStackbase(0)}.${ObjectClass.prototype.leaveSynchronizedBlock.name}(${StepParams.thread});\n`, ...at(endOfMethodRange));
                }
                code.push(STEP, `${Helpers.return}();`, ...at(endOfMethodRange));
            }

            this.flow.end(method, this.module.errors);
            this.flow = flowOfEnclosingMethod;

            link(code, method.program, "Method " + method.program.methodIdentifierWithClass);

            methodNode.program = method.program;    // only for debugging purposes

            let runtimeClass = classContext.runtimeClass;

            if (runtimeClass) {
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
                    // e.g. method with covariant return type which overrides a base class method and implements an interface method
                    for (let bridgeName of method.getBridgeInternalJavaNames()) {
                        runtimeClass.prototype[bridgeName] = functionStub;
                    }
                    functionStub["isEmpty"] = methodNode.statement.isEmpty;         // See ActorClass._registerListeners for usage of this property
                }

                // e.g. copy default method of interface to classes implementing this interface.
                // This has to be done after functionStub has been stored in runtimeClass.
                method.callbackAfterCodeGeneration.forEach(callback => callback());

            }
        }

        this.snippetsToInsertAfterSuperConstructorCall = snippetsToInsertAfterSuperConstructorCallOfEnclosingConstructor;

        this.popSymbolTable();

    }

    checkIfSuperconstructorCallPresent(statement: ASTStatementNode | undefined): [boolean, boolean] {
        if (!statement) return [false, false];
        if (statement.kind == TokenType.block) {
            let blockstatement = <ASTBlockNode>statement;
            if (blockstatement.statements.length > 0) {
                statement = blockstatement.statements[0];
            } else {
                return [false, false];
            }
        }
        //@ts-ignore
        if (statement.kind != TokenType.methodCall) return [false, false];

        let methodCall = <ASTMethodCallNode>statement;

        let objectKind = methodCall.nodeToGetObject?.kind;
        if (!objectKind) return [false, false];

        if (objectKind == TokenType.keywordThis && methodCall.identifier == '') return [true, false];
        if (objectKind == TokenType.keywordSuper) return [false, true];

        return [false, false];
    }



    protected async compileMethods(cdef: ASTClassDefinitionNode | ASTEnumDefinitionNode | ASTInterfaceDefinitionNode,
        classContext: JavaClass | JavaEnum | JavaInterface, interruptIfNeeded: boolean) {
        for (let method of cdef.methods) {

            if (interruptIfNeeded) {
                await this.progressManager.interruptIfNeeded();
            }

            this.compileMethodDeclaration(method, classContext);

            if (method.isConstructor) {
                if (cdef.kind == TokenType.keywordEnum) {
                    if (method.visibility != TokenType.keywordPrivate) {
                        this.pushError(JCM.enumConstructorsMustBePrivate(), "error", method.range);
                    }
                }
            }
        }
    }



}