import { isBoxedPrimitive } from "util/types";
import { BaseSymbol, SymbolOnStackframe } from "../../common/BaseSymbolTable";
import { CodeReachedAssertion } from "../../common/interpreter/CodeReachedAssertions.ts";
import { Helpers, StepParams } from "../../common/interpreter/StepFunction";
import { EmptyRange, IRange, Range } from "../../common/range/Range";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule.ts";
import { ASTAnonymousClassNode, ASTArrayLiteralNode, ASTAttributeDereferencingNode, ASTBinaryNode, ASTBracketNode, ASTCastNode, ASTEnumValueNode, ASTGenericTypeInstantiationNode, ASTLambdaFunctionDeclarationNode, ASTLiteralNode, ASTMethodCallNode, ASTNewArrayNode, ASTNewObjectNode, ASTPlusPlusMinusMinusSuffixNode, ASTSelectArrayElementNode, ASTSuperNode, ASTSymbolNode, ASTTermNode, ASTThisNode, ASTTypeNode, ASTUnaryPrefixNode } from "../parser/AST";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { JavaArrayType } from "../types/JavaArrayType";
import { GenericVariantOfJavaClass, IJavaClass, JavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { JavaField } from "../types/JavaField";
import { GenericVariantOfJavaInterface, IJavaInterface, JavaInterface } from "../types/JavaInterface.ts";
import { GenericMethod, JavaMethod } from "../types/JavaMethod.ts";
import { JavaParameter } from "../types/JavaParameter";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType.ts";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType.ts";
import { Visibility } from "../types/Visibility.ts";
import { BinopCastCodeGenerator } from "./BinopCastCodeGenerator.ts";
import { at, Code, jump, Label, STEP } from "./Code";
import { apply, Build, combine, Expr, frame, isConstant, isPure, javaCall, joined, map, parenthesize, template, term, toStack, toStatement } from "./Expr";
import { JavaLocalVariable } from "./JavaLocalVariable";
import { JavaSymbolTable } from "./JavaSymbolTable";
import { FlowAnalyzer } from "./FlowAnalyzer.ts";
import { OuterClassFieldAccessTracker } from "./OuterClassFieldAccessTracker.ts";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { ThisType } from "../types/ThisType.ts";
import { SettingsStore } from "../../../client/settings/SettingsStore.ts";
import { param } from "jquery";
import { JavaPackage } from "../types/JavaPackage.ts";

export abstract class TermCodeGenerator extends BinopCastCodeGenerator {

    constantTypeToTypeMap: { [key: number]: JavaType } = {}


    classOfCurrentlyCompiledStaticInitialization?: NonPrimitiveType;

    /**
     * Flow analysis of the method body, initializer block or lambda body which is currently compiled. Each of them
     * gets its own instance (see InnerClassCodeGenerator.compileMethodDeclaration). The REPL uses this default instance.
     */
    flow: FlowAnalyzer = new FlowAnalyzer();

    outerClassFieldAccessTracker: OuterClassFieldAccessTracker = new OuterClassFieldAccessTracker();

    breakStack: Label[] = [];
    continueStack: Label[] = [];

    // field initializers and instance initializer blocks which have to be executed directly after explicit super(...)-call in constructor
    snippetsToInsertAfterSuperConstructorCall: Code | undefined;

    nextArrayLiteralTypeExpected: JavaType[] = [];

    /**
     * Type expected by the context of a new-expression with diamond operator, e.g. PriorityQueue<Integer> in
     * PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> b - a);
     * Is set by compileTermWithTargetType and consumed by compileNewObjectNode.
     */
    private targetTypeOfNewObject?: JavaType;

    isRepl: boolean = false;


    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        settingsStore: SettingsStore | undefined) {
        super(module, libraryTypestore, compiledTypesTypestore, settingsStore);

        this.initConstantTypeToTypeMap();
    }

    compileTerm(ast: ASTTermNode | undefined, isWriteAccess: boolean = false): Expr | undefined {

        if (!ast) return undefined;

        let snippet: Expr | undefined;

        switch (ast.kind) {
            case TokenType.binaryOp:
                snippet = this.compileBinaryOperator(<ASTBinaryNode>ast); break;
            case TokenType.unaryPrefixOp:
                snippet = this.compileUnaryPrefixOperator(<ASTUnaryPrefixNode>ast); break;
            case TokenType.plusPlusMinusMinusSuffix:
                snippet = this.compilePlusPlusMinusMinusSuffixOperator(<ASTPlusPlusMinusMinusSuffixNode>ast); break;
            case TokenType.literal:
                snippet = this.compileLiteralNode(<ASTLiteralNode>ast);
                this.addTypePosition(snippet);
                break;
            case TokenType.symbol:
                snippet = this.compileSymbolNode(<ASTSymbolNode>ast, isWriteAccess);
                this.addTypePosition(snippet);
                break;
            case TokenType.methodCall:
                snippet = this.compileMethodCall(<ASTMethodCallNode>ast);
                this.addTypePosition(snippet);
                break;
            case TokenType.newArray:
                snippet = this.compileNewArrayNode(<ASTNewArrayNode>ast); break;
            case TokenType.newObject:
                snippet = this.compileNewObjectNode(<ASTNewObjectNode>ast);
                this.addTypePosition(snippet);
                break;
            case TokenType.selectArrayElement:
                snippet = this.compileSelectArrayElement(<ASTSelectArrayElementNode>ast, isWriteAccess);
                this.addTypePosition(snippet);
                break;
            case TokenType.dereferenceAttribute:
                snippet = this.compileDereferenceAttribute(<ASTAttributeDereferencingNode>ast);
                this.addTypePosition(snippet);
                break;
            case TokenType.anonymousClass:
                snippet = this.compileAnonymousInnerClass(<ASTAnonymousClassNode>ast); break;
            case TokenType.castValue:
                snippet = this.compileExplicitCast(<ASTCastNode>ast); break;
            case TokenType.keywordThis:
                snippet = this.compileKeywordThis(<ASTThisNode>ast);
                this.addTypePosition(snippet);
                break;
            case TokenType.keywordSuper:
                snippet = this.compileKeywordSuper(<ASTSuperNode>ast);
                this.addTypePosition(snippet);
                break;
            case TokenType.arrayLiteral:
                if (this.nextArrayLiteralTypeExpected.length > 0) {
                    snippet = this.compileArrayLiteral(this.nextArrayLiteralTypeExpected.pop()!, <ASTArrayLiteralNode>ast);
                } else {
                    this.pushError(JCM.arrayLiteralTypeUnknown(), "error", ast.range)
                }
                break;
            case TokenType.leftBracket:
                snippet = this.compileBrackets(<ASTBracketNode>ast);
                break;
            case TokenType.lambdaOperator:
                // Lambda functions are compiled by compileLambdaFunction in places where a functional interface
                // is expected (see compileTermWithTargetType). Everywhere else they are not possible.
                this.pushError(JCM.lambdaFunctionHereNotPossible(), "error", ast.range);
                break;

        }

        if (snippet && ast.parenthesisNeeded) {
            snippet = parenthesize(snippet);
        }

        return snippet;
    }

    /**
     * Compiles term in a context that expects targetType (variable initialization, assignment, return statement).
     * If term is a new-expression with diamond operator (new X<>(...)) its type arguments are inferred from targetType.
     */
    compileTermWithTargetType(ast: ASTTermNode | undefined, targetType: JavaType | undefined): Expr | undefined {
        if (ast?.kind == TokenType.lambdaOperator) {
            if (!targetType) {
                this.pushError(JCM.lambdaFunctionHereNotPossible(), "error", ast.range);
                return undefined;
            }
            return this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>ast, targetType);
        }
        if (ast?.kind != TokenType.newObject) return this.compileTerm(ast);

        this.targetTypeOfNewObject = targetType;
        let snippet = this.compileTerm(ast);
        this.targetTypeOfNewObject = undefined;
        return snippet;
    }

    /**
     * Diamond operator: infers type arguments of the generic class instantiated by new X<>(...) from the type
     * the context expects, e.g.
     *   PriorityQueue<Integer> pq = new PriorityQueue<>(...)   => PriorityQueue<Integer>
     *   Queue<Integer> q = new PriorityQueue<>(...)            => PriorityQueue<Integer>
     * Returns undefined if nothing can be inferred.
     */
    inferTypeArgumentsOfDiamond(typeNode: ASTTypeNode, klassType: JavaType, targetType: JavaType | undefined): IJavaClass | undefined {
        if (typeNode.kind != TokenType.genericTypeInstantiation || !(<ASTGenericTypeInstantiationNode>typeNode).isDiamond) return undefined;
        if (!(klassType instanceof GenericVariantOfJavaClass)) return undefined;
        if (!(targetType instanceof GenericVariantOfJavaClass || targetType instanceof GenericVariantOfJavaInterface)) return undefined;

        let genericClass = klassType.isGenericVariantOf;
        let targetBase: NonPrimitiveType = targetType.isGenericVariantOf;
        let isSameType = (t1: NonPrimitiveType, t2: NonPrimitiveType) => t1 == t2 ||
            t1.pathAndIdentifierAsDotSeparatedString == t2.pathAndIdentifierAsDotSeparatedString;

        if (isSameType(genericClass, targetBase)) return <GenericVariantOfJavaClass>targetType;

        // find supertype of generic class which is variant of targetType's base type, expressed in
        // generic type parameters of generic class: e.g. Collection<E> for class PriorityQueue<E>
        let supertypes: (GenericVariantOfJavaClass | GenericVariantOfJavaInterface)[] = [];
        let superclass = genericClass.getExtends();
        while (superclass) {
            if (superclass instanceof GenericVariantOfJavaClass) supertypes.push(superclass);
            superclass = superclass.getExtends();
        }
        for (let intf of genericClass.getAllImplementedInterfaces()) {
            if (intf instanceof GenericVariantOfJavaInterface) supertypes.push(intf);
        }

        let supertype = supertypes.find(st => isSameType(st.isGenericVariantOf, targetBase));
        if (!supertype) return undefined;

        let typeMap: Map<GenericTypeParameter, NonPrimitiveType> = new Map(klassType.typeMap);
        let inferredAnything: boolean = false;

        for (let gp of targetType.isGenericVariantOf.genericTypeParameters ?? []) {
            let typeOfClassParameter = supertype.typeMap.get(gp);
            let targetArgument: NonPrimitiveType | undefined = targetType.typeMap.get(gp);

            if (!(typeOfClassParameter instanceof GenericTypeParameter) || !genericClass.genericTypeParameters.includes(typeOfClassParameter)) continue;

            // wildcards: Collection<? super Integer> => Integer, Collection<? extends Number> => Number
            if (targetArgument instanceof GenericTypeParameter && targetArgument.isWildcard) {
                targetArgument = targetArgument.lowerBound ?? targetArgument.upperBounds[0];
            }

            if (targetArgument && typeOfClassParameter.canBeReplacedByConcreteType(targetArgument)) {
                typeMap.set(typeOfClassParameter, targetArgument);
                inferredAnything = true;
            }
        }

        return inferredAnything ? genericClass.getCopyWithConcreteType(typeMap) : undefined;
    }

    compileBrackets(node: ASTBracketNode): Expr {
        let innerSnippet = this.compileTerm(node.nodeInsideBrackets);
        if (innerSnippet?.type && !innerSnippet.type.isPrimitive) {
            this.addTypePositionByTypeAndRange(innerSnippet.type, node.range)
        }
        if (node.nodeInsideBrackets) {
            node.instanceofVariables = node.nodeInsideBrackets.instanceofVariables;
            node.negatedInstanceofVariables = node.nodeInsideBrackets.negatedInstanceofVariables;
        }
        return innerSnippet;
    }

    addTypePosition(snippet: Expr | undefined) {
        if (!snippet) return;
        let type = snippet.type;
        if (!type) return;
        if (type.identifier == "string") {
            type = this.libraryTypestore.getType("String")!;
        }
        if (snippet.range) {
            this.module.addTypePosition(Range.getEndPosition(snippet.range), type);
        }
    }

    addTypePositionByTypeAndRange(type: JavaType, range: IRange) {
        if (!type) return;
        if (type.identifier == "string") {
            type = this.libraryTypestore.getType("String")!;
        }
        if (range) {
            this.module.addTypePosition(Range.getEndPosition(range), type);
        }

    }

    compileKeywordSuper(node: ASTSuperNode): Expr | undefined {
        let classContext = this.currentSymbolTable.classContext;
        if (!classContext || !(classContext instanceof IJavaClass || classContext instanceof JavaEnum)) {
            this.pushError(JCM.superOnlyInClassesOrEnums(), "error", node);
            return undefined;
        }



        return { ...term(Helpers.elementRelativeToStackbase(0), classContext.getExtends(), node.range), superLevel: 1, stable: true };
    }

    compileKeywordThis(node: ASTThisNode): Expr | undefined {
        let classContext = this.currentSymbolTable.classContext;
        if (!classContext || !(classContext instanceof IJavaClass || classContext instanceof JavaEnum)) {
            this.pushError(JCM.thisOnlyInClassesOrEnums(), "error", node);
            return undefined;
        }

        return { ...term(Helpers.elementRelativeToStackbase(0), classContext, node.range), stable: true };
    }

    compileExplicitCast(node: ASTCastNode): Expr | undefined {

        let objectSnippet = this.compileTerm(node.objectToCast);

        let sourceType = objectSnippet?.type;
        let destType = node.castType.resolvedType;

        if (!objectSnippet || !sourceType || !destType) return undefined;

        if (sourceType instanceof NonPrimitiveType && destType instanceof NonPrimitiveType) {
            return this.compileExplicitCastFromObjectToObject(node, objectSnippet, sourceType, destType);
        }

        if (sourceType.identifier == 'Object' && destType instanceof JavaArrayType) {
            let range = node.range;
            return frame(objectSnippet, `${Helpers.checkCastToArray}(§1, ${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn})`
                , destType);

        }

        if (this.canCastTo(sourceType, destType, "explicit")) {
            let castSnippet = this.compileCast(objectSnippet, destType, "explicit");
            // e.g. (Object)"Test": boxing gives type String, but static type of cast expression is Object (relevant for choosing overloaded methods)
            if (castSnippet?.type && destType instanceof NonPrimitiveType && castSnippet.type != destType) {
                castSnippet = frame(castSnippet, '§1', destType);
            }
            return castSnippet;
        } else {
            this.pushError(JCM.cantCastFromTo(sourceType.identifier, destType.identifier), "error", node);
        }

    }

    compileExplicitCastFromObjectToObject(node: ASTCastNode, objectSnippet: Expr, sourceType: NonPrimitiveType, destType: NonPrimitiveType): Expr | undefined {
        if (sourceType.fastExtendsImplements(destType.identifier)) {
            // upcast: no code needed, but static type of cast expression is destType (relevant for choosing overloaded methods)
            if (sourceType == destType) this.pushError(JCM.unneccessaryCast(), "info", node);
            return frame(objectSnippet, '§1', destType);
        }

        // if (!destType.fastExtendsImplements(sourceType.identifier)) {
        //     this.pushError(JCM.cantCastFromTo(sourceType.identifier, destType.identifier), "error", node);
        //     return objectSnippet;
        // }

        if(sourceType.identifier == destType.identifier) {
            return objectSnippet;
        }

        if (destType instanceof GenericTypeParameter) {
            this.pushError(JCM.cantCastFromTo(sourceType.identifier, destType.identifier), "error", node);

            return undefined;
        }

        let range = node.range;
        return frame(objectSnippet, `${Helpers.checkCast}(§1, "${destType.pathAndIdentifierAsDotSeparatedString}", ${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn})`
            , destType)
    }


    compileNewObjectNode(node: ASTNewObjectNode, newObjectSnippet?: Expr): Expr | undefined {
        // new t.classes[<identifier>]().<constructorIdentifier>(param1, ..., paramN)
        // constructor has to return this or push it to stack!

        // consume target type before parameter values (which may contain new-expressions, too) get compiled
        let targetType = this.targetTypeOfNewObject;
        this.targetTypeOfNewObject = undefined;

        let pv = this.getParameterValueSnippets(node);
        let parameterValues = pv.snippets;

        if (!node.type.resolvedType) return;

        let resolvedType = node.type.resolvedType;

        if (!resolvedType) {
            return undefined;
        }

        if (!(resolvedType instanceof IJavaClass)) {
            this.pushError(JCM.cantInstantiateFromType(resolvedType.identifier), "error", node.range);
            return undefined;
        }

        let klassType: IJavaClass = resolvedType;

        if (klassType.isAbstract()) {
            this.pushError(JCM.cantInstantiateFromAbstractClass(), "error", node.range);
        }


        /*
        consider inner classes:
        class A {
            class B {
                class C {
                    
                }
                }
                }
                We need a A-object to construct a new B-object. We need a B-Object to construct a new C-Object
        */

        let parameterTypes = this.convertParameterValueSnippetsToParameterTypes(klassType.identifier, parameterValues);
        if (!parameterTypes) return undefined;

        let methods = this.searchMethod(klassType.identifier, klassType, parameterTypes, true, false, true, node.range);

        // diamond operator (new X<>(...)): infer type arguments from target type. Falls back to the
        // uninferred type if the inferred type has no fitting constructor.
        let inferredKlassType = this.inferTypeArgumentsOfDiamond(node.type, klassType, targetType);
        if (inferredKlassType) {
            let methodsOfInferredType = this.searchMethod(inferredKlassType.identifier, inferredKlassType, parameterTypes, true, false, true, node.range);
            if (methodsOfInferredType.best) {
                klassType = inferredKlassType;
                methods = methodsOfInferredType;
            }
        }

        let method = methods.best;

        if (pv.withErrors) {
            if (node.rightBracketPosition) {
                this.module.pushMethodCallPosition(node.klassIdentifierRange,
                    node.commaPositions, methods.possible, node.rightBracketPosition,
                    method);
            }

            return term("null", klassType, node.range);
        }

        if (method) {
            this.registerUsagePosition(method, node.klassIdentifierRange);
        }


        this.module.pushMethodCallPosition(node.klassIdentifierRange, node.commaPositions, methods.possible,
            node.rightBracketPosition!, method
        )

        if (!method) {
            this.pushError(JCM.cantFindConstructor(), "error", node.range);
            return term("null", klassType, node.range);
        }

        for (let i = 0; i < node.parameterValues.length; i++) {
            let pv = node.parameterValues[i];
            if (pv.kind == TokenType.lambdaOperator) {
                let snippet = this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>pv, method.parameters[i].type);
                if (!snippet) return undefined;
                parameterValues[i] = snippet;
            } else {
                if (!parameterValues[i]) {
                    return term("null", klassType, node.range);
                }
            }
        }


        // cast parameter values
        let snippet = this.invokeConstructor(<Expr[]>parameterValues, method, klassType, node, newObjectSnippet);

        return snippet;

    }

    castParameterValuesAndPackEllipsis(parameterValues: (Expr | undefined)[], method: JavaMethod): Expr[] {

        let ellipsisType: JavaType | undefined;
        let castParameters: Expr[] = [];

        for (let i = 0; i < parameterValues.length; i++) {

            let destinationType = ellipsisType;
            if (!destinationType) {
                let parameter = method.parameters[i];
                if (parameter.isEllipsis) {
                    destinationType = (<JavaArrayType>parameter.type).getElementType();
                    ellipsisType = destinationType;
                } else {
                    destinationType = parameter.type;
                }
            }

            castParameters.
            push(this.compileCast(parameterValues[i]!, destinationType, "implicit"));
        }

        if (!ellipsisType) return castParameters;

        let methodParameterCountMinusOne = method.parameters.length - 1;

        let parametersBeforeEllipsis = castParameters.slice(0, methodParameterCountMinusOne);
        let ellipsisParameters = castParameters.slice(methodParameterCountMinusOne);

        let ellipsisParameterSnippet = joined(method.parameters[methodParameterCountMinusOne].type, ellipsisParameters[0].range!, "[", ", ", "]", ...ellipsisParameters);

        parametersBeforeEllipsis.push(ellipsisParameterSnippet);

        return parametersBeforeEllipsis;
    }

    protected invokeConstructor(parameterValues: Expr[], method: JavaMethod, klassType: IJavaClass | JavaEnum,
        node: ASTNewObjectNode | ASTEnumValueNode, newObjectSnippet: Expr | undefined,
        enumValueIdentifier?: string, enumValueIndex?: number) {

        if (klassType instanceof JavaClass && klassType.genericTypeParameters?.length || 0 > 0) {
            klassType = (<JavaClass>klassType).getMinimumConcreteGenericType(this.libraryTypestore);
        }

        parameterValues = this.castParameterValuesAndPackEllipsis(parameterValues, method);

        let classHasOuterType: boolean = (klassType.outerType && !klassType.isStatic) ? true : false;

        let callingConvention: CallingConvention = method.hasImplementationWithNativeCallingConvention && !classHasOuterType ? "native" : "java";

        // if this is no library class: use java calling convention because
        // new MyClass() could be compiled before standard constructors of MyClass() are built
        // if new MyClass is part of instanceInitializers of other class.
        if (method.classEnumInterface != klassType) callingConvention = 'java';

        if (!newObjectSnippet) {
            newObjectSnippet = term(`new ${Helpers.classes}["${klassType.pathAndIdentifierAsDotSeparatedString}"](${enumValueIdentifier ? '"' + enumValueIdentifier + '", ' + enumValueIndex : ""})`);
        }

        // call javascript constructor and directly thereafter call java constructor
        let template: string = `§1.${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`;

        // instantiation of non-static inner class-object?
        // we can't rely on method.hasOuterClassParameter because this object instantiation
        // could be before standard constructor methods have been built.


        // In constructions like a.new A.B()
        // a is the objectSnippet.
        // We compile it even if B has no outer Type because in situations like
        // r.
        // new Circle()
        // we want to get proper code completion if Curser is located just after the dot.
        let objectSnippet: Expr | undefined;
        let objectNode: ASTTermNode | undefined = (<ASTNewObjectNode>node).object;
        if (objectNode) {
            objectSnippet = this.compileTerm(objectNode);
        }

        if (classHasOuterType) {
            let objectType: JavaType | undefined;
            if (objectSnippet) {
                parameterValues.unshift(objectSnippet);
                objectType = objectSnippet.type;
            } else {
                parameterValues.unshift({ ...term(Helpers.elementRelativeToStackbase(0)), stable: true });
                objectType = this.currentSymbolTable.classContext;
            }

            if (!objectType || !this.canCastTo(objectType, klassType.outerType, "implicit")) {
                this.pushError(JCM.objectContextNeededForInstantiation(klassType.identifier, klassType.outerType!.identifier), "error", node);
            }

        }

        if (callingConvention == "java") {
            /*
             * if class is child of Actor or Shape then overridden listener-method (act, onMouseDown, onKeyDown, ...)
             * must not be called before constructor is FULLY finished. We achieve this by setting the callback-function
             * of the constructor:
             */
            let callRegisterListeners: string = (!klassType.isLibraryType && klassType.fastExtendsImplements("Actor")) ?
                `() => {${StepParams.stack}[${StepParams.stack}.length - 1]._registerListeners(${StepParams.thread}); }` : "undefined";

            template += `${StepParams.thread}, ${callRegisterListeners}` + (parameterValues.length > 0 ? ", " : "");
        }

        let i = 2;
        template += parameterValues.map(_p => "§" + (i++)).join(", ") + ")";

        let snippet = apply(klassType, node.range, template, newObjectSnippet, ...parameterValues);

        if (callingConvention == "java") {
            snippet = javaCall(snippet, true);
        }
        return snippet;
    }

    pushSymbolTable(symbolTable: JavaSymbolTable) {
        this.symbolTableStack.push(symbolTable);
        this.currentSymbolTable = symbolTable;
    }

    pushAndGetNewSymbolTable(range: IRange, withStackframe: boolean,
        classContext?: JavaClass | JavaEnum | JavaInterface | StaticNonPrimitiveType | undefined, methodContext?: JavaMethod): JavaSymbolTable {

        let newSymbolTable = new JavaSymbolTable(this.module, range, withStackframe,
            this.currentSymbolTable,
            classContext, methodContext);

        this.symbolTableStack.push(newSymbolTable);
        this.currentSymbolTable = newSymbolTable;

        return newSymbolTable;

    }

    popSymbolTable() {
        this.symbolTableStack.pop();
        this.currentSymbolTable = this.symbolTableStack[this.symbolTableStack.length - 1];
    }

    compileSelectArrayElement(node: ASTSelectArrayElementNode, isLeftSideOfAssignment: boolean): Expr | undefined {
        let arraySnippet = this.compileTerm(node.array);
        let arrayType = arraySnippet?.type;
        if (!arraySnippet || !arrayType || !(arrayType instanceof JavaArrayType)) {
            this.pushError(JCM.noArrayBracketAfterType(arrayType?.identifier || "---"), "error", node.array)
            return undefined;
        }

        if (arrayType.dimension < node.indices.length) {
            this.pushError(JCM.wrongArrayDimensionCount(arrayType.dimension, node.indices.length), "error", node);
            return undefined;
        }

        let remainingDimensions = arrayType.dimension - node.indices.length;
        let remainingType = remainingDimensions > 0 ? (new JavaArrayType(arrayType.elementType, remainingDimensions, arrayType.module, EmptyRange.instance))
            : arrayType.elementType;

        let indexSnippets: Expr[] = [];
        for (let index of node.indices) {
            let indsnip = this.compileTerm(index);

            if (!(indsnip?.type?.isPrimitive)) {
                indsnip = this.unbox(indsnip);
            }

            if (!(indsnip?.type?.isUsableAsIndex())) {
                if (indsnip) this.pushError(JCM.indexMustHaveIntegerValue(), "error", index);

                // set dummy replacement to keep on compiling...
                indsnip = term('0', this.intType, index.range);
            }

            indexSnippets.push(indsnip);

        }

        if (arrayType.elementType.isPrimitive && arrayType.elementType != this.stringType) return this.compileSelectArrayElementFast(node, isLeftSideOfAssignment,
            arraySnippet, indexSnippets, remainingType
        )

        /*
         *  java: 17 + a[3][4]   -> javascript: 17 + __t.ArrayValue2(a, 3, 4)
         *
         *  java: a[4] = 17 -> javascript: (__t.lastCheckedArray = a)[__t.CheckLastIndex(4)] = 17   (__t stores result of __t.Array1(a, 3))
         *  java: a[3][4] = 17 -> javascript: __t.Array1(a, 3)[__t.CheckLastIndex(4)] = 17   (__t stores result of __t.Array1(a, 3))
         *  java: a[3][4][5] = 17 -> javascript: __t.Array2(a, 3, 4)[__t.CheckLastIndex(5)] = 17 (__t stores result of __t.Array2(a, 3, 4))
         */
        let n = indexSnippets.length;
        let location: Build;
        if (n == 1) {
            location = (a, i) => `${Helpers.array0}(${a})[${Helpers.checkLastIndex}(${i}, 1)]`;
        } else {
            let checkAndReturnArrayMethod = "";
            switch (n - 1) {
                case 1: checkAndReturnArrayMethod = Helpers.array1; break;
                case 2: checkAndReturnArrayMethod = Helpers.array2; break;
                default: checkAndReturnArrayMethod = Helpers.arrayN; break;
            }
            location = (a, ...indices) => `${checkAndReturnArrayMethod}(${a}, ${indices.slice(0, -1).join(", ")})[${Helpers.checkLastIndex}(${indices[n - 1]}, ${n})]`;
        }

        let checkerMethod = "";
        switch (n) {
            case 1: checkerMethod = Helpers.arrayValue1; break;
            case 2: checkerMethod = Helpers.arrayValue2; break;
            case 3: checkerMethod = Helpers.arrayValue3; break;
            default: checkerMethod = Helpers.arrayValueN; break;
        }
        let value: Build = isLeftSideOfAssignment ? location : (a, ...indices) => `${checkerMethod}(${a}, ${indices.join(", ")})`;

        return this.arrayElement(node, remainingType, [arraySnippet, ...indexSnippets], value, location);
    }

    /**
     * Array element: value is built by value, its location (for assignments, ++, --) by location
     */
    arrayElement(node: ASTSelectArrayElementNode, type: JavaType, parts: Expr[], value: Build, location: Build): Expr {
        let element: Expr = { ...combine(type, node.range, parts, value), lefty: true, place: { parts: parts, build: location } };
        return node.parenthesisNeeded ? parenthesize(element) : element;
    }


    compileSelectArrayElementFast(node: ASTSelectArrayElementNode, isLeftSideOfAssignment: boolean,
        arraySnippet: Expr, indexSnippets: Expr[], remainingType: JavaType
    ): Expr | undefined {

        /*
         *  java: 17 + a[3][4]   -> javascript: 17 + (a[3]??IOBE(...))[4]??IOBE(...)
         *
         *  java: a[4] = 17 -> javascript: __t.Array0(a)[__t.CheckLastIndex(4, 1)] = 17
         *  java: a[3][4] = 17 -> javascript: __t.Array0(a[3]??IOBE(...))[__t.CheckLastIndex(4, 2)] = 17
         */
        let n = indexSnippets.length;

        let elementTemplate = (dimensions: number) => {
            let t = "§1";
            for (let i = 0; i < dimensions; i++) {
                let range = indexSnippets[i].range || EmptyRange.instance;
                t = `(${t}[§${i + 2}]??${Helpers.IOBE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))`;
            }
            return t;
        }

        let locationTemplate = n == 1 ? `${Helpers.array0}(§1)[${Helpers.checkLastIndex}(§2, 1)]` :
            `${Helpers.array0}(${elementTemplate(n - 1)})[${Helpers.checkLastIndex}(§${n + 1}, ${n})]`;

        let valueTemplate = isLeftSideOfAssignment ? locationTemplate : elementTemplate(n);

        return this.arrayElement(node, remainingType, [arraySnippet, ...indexSnippets], template(valueTemplate), template(locationTemplate));
    }


    /*
     * Helper function for compileNewArrayNode
     *
     */
    private compileDimension(dimensionNode: ASTTermNode): Expr | undefined {
        let dimensionTerm = this.compileTerm(dimensionNode);

        // if compileTerm failed: insert plausible dummy value to enable further compilation
        let type = dimensionTerm?.type;
        if (!type) return term('1', this.intType, dimensionNode.range);

        let unboxedDimesionTerm = this.unbox(dimensionTerm!);       // type != undefined => dimensionTerm != undefined
        if (unboxedDimesionTerm.type?.isPrimitive) {
            if (unboxedDimesionTerm.type.isUsableAsIndex()) {
                return unboxedDimesionTerm;
            }
        }

        this.pushError(JCM.integerValueExpected(dimensionTerm?.type?.identifier || "---"), "error", dimensionNode);
        return term('1', this.intType, dimensionNode.range);   // return plausible dummy to get on compiling...

    }

    compileNewArrayNode(node: ASTNewArrayNode): Expr | undefined {
        let elementType = node.arrayType.resolvedType;
        if (elementType == undefined) {
            return undefined;
        }

        if (node.initialization) {
            let arrayLiteralSnippet = this.compileArrayLiteral(elementType, node.initialization);
            let literalType = arrayLiteralSnippet?.type;
            if (literalType && literalType instanceof JavaArrayType) {
                if (literalType.dimension == -1) {
                    literalType.dimension = node.dimensionCount || 1;
                } else {
                    if (node.dimensionCount && literalType.dimension != node.dimensionCount) {
                        this.pushError(JCM.declaredArrayDimensionDoesNotFitArrayLiteral(node.dimensionCount, literalType.dimension), "error", node.range);
                    }
                }
            }
            return arrayLiteralSnippet;
        } else {
            return this.compileNewArrayWithDefaultElements(elementType, node);
        }

    }

    compileArrayLiteral(elementType: JavaType, node: ASTArrayLiteralNode): Expr | undefined {

        if (node.elements.length == 0) {
            // Empty array gets dimension == -1
            return term("[]", new JavaArrayType(elementType, 1, this.module, node.range), node.range);
        }

        let elementSnippets: Expr[] = [];

        for (let elementNode of node.elements) {
            if (elementNode.kind == TokenType.arrayLiteral) {
                if (!(elementType instanceof JavaArrayType)) {
                    this.pushError(JCM.arrayLiteralElementDimensionWrong(), "error", node.range);
                    return undefined;
                }
                let snippet = this.compileArrayLiteral(elementType.getElementType(), <ASTArrayLiteralNode>elementNode);
                if (snippet) elementSnippets.push(snippet);
            } else {
                // compileTermWithTargetType compiles lambda functions, too: Runnable[] r = {() -> {...}, ...}
                let elementSnippet = this.compileTermWithTargetType(elementNode, elementType);
                if (!elementSnippet?.type) return undefined; // don't silently create an array with fewer elements

                if (this.canCastTo(elementSnippet.type, elementType, "implicit")) {
                    elementSnippet = this.compileCast(elementSnippet, elementType, "implicit");
                    elementSnippets.push(elementSnippet);
                } else if (this.isImplicitConstantNarrowingPossible(elementSnippet, elementType)) {
                    // byte[] b = {1, 2, 3};
                    elementSnippets.push(this.compileCast(elementSnippet, elementType, "explicit"));
                } else {
                    this.pushError(JCM.cantCastTermTo(elementType.toString()), "error", elementNode.range);
                    return undefined;
                }
            }
        }

        let type = new JavaArrayType(elementType, 1, this.module, node.range);

        return joined(type, node.range, "[", ", ", "]", ...elementSnippets);

    }

    compileNewArrayWithDefaultElements(elementType: JavaType, node: ASTNewArrayNode): Expr | undefined {
        let defaultValue = elementType.isPrimitive ? (<PrimitiveType>elementType).defaultValueAsString : "null";

        let maybeUndefinedDimensionTerms: (Expr | undefined)[] = node.dimensions.map(d => this.compileDimension(d));

        if (maybeUndefinedDimensionTerms.includes(undefined)) return undefined;

        //@ts-ignore
        let dimensionTerms: Expr[] = maybeUndefinedDimensionTerms;

        let arrayType = new JavaArrayType(elementType, dimensionTerms.length, this.module, node.range);


        let prefix = `${Helpers.newArray}(${defaultValue}, `;
        let suffix = ")";

        return joined(arrayType, node.range, prefix, ', ', suffix, ...dimensionTerms);
    }


    compileSymbolNode(node: ASTSymbolNode, isWriteAccess: boolean): Expr | undefined {

        // first try: symbol table (parameters, local variables, fields)
        let symbolInformation = this.currentSymbolTable.findSymbol(node.identifier);

        if (symbolInformation) {
            let symbol = symbolInformation.symbol;

            if (symbolInformation.outerClassLevel > 0) this.outerClassFieldAccessTracker.onAccessHappened();


            if (symbol.onStackframe()) {
                this.registerUsagePosition(symbol, node.range);
                if (symbolInformation.outerClassLevel == 0) {
                    if (isWriteAccess) {
                        this.flow.onWrite(symbol);
                    } else {
                        this.flow.onRead(symbol, node.range, this.module.errors);
                    }
                    return this.compileSymbolOnStackframeAccess(symbol as SymbolOnStackframe, node.range);
                } else {
                    return this.compileOuterClassLocalVariableAccess(symbol as JavaLocalVariable, node.range);
                }
            } else if (symbol instanceof JavaField) {
                let field = <JavaField>symbol;

                if (this.classOfCurrentlyCompiledStaticInitialization && !field._isStatic) {
                    this.pushError(JCM.cantUseNonstaticFieldsToInitializeStaticOne(), "error", node);
                }

                return this.compileFieldAccess(symbol, node.range, symbolInformation.outerClassLevel);
            }

            return undefined; // should be unreachable
        }

        // second try: class identifier?
        let type = this.libraryTypestore.getType(node.identifier);
        if (!type) type = this.compiledTypesTypestore.getType(node.identifier);

        if (!type && this.currentSymbolTable.classContext) {
            let classContextDotIdentifier = this.currentSymbolTable.classContext.identifier + "." + node.identifier;
            type = this.libraryTypestore.getType(classContextDotIdentifier);
            if (!type) type = this.compiledTypesTypestore.getType(classContextDotIdentifier);
        }


        if(type != null){
            if (type instanceof NonPrimitiveType) {
    
                this.registerUsagePosition(type, node.range);
    
                let staticType = type.staticType;
                return { ...term(`${Helpers.classes}["${type.identifier}"]`, staticType, node.range), stable: true };
            } else if (type instanceof JavaPackage){
                this.module.addTypePosition(Range.getEndPosition(node.range), type);
                this.pushError(JCM.packageCannotBeUsedAsType(type.identifier), "error", node);
                return undefined;
            }

        }

        // // does method in inner class access field of outer class?
        // let outerType:  NonPrimitiveType | StaticNonPrimitiveType | undefined =  this.currentSymbolTable.classContext?.outerType;
        // let outerClassLevel: number = 1;
        // while(outerType && outerType instanceof NonPrimitiveType) {
        //     let field = outerType.getField(node.identifier, TokenType.keywordPrivate);
        //     if(field){
        //         return this.compileFieldAccess(field, node.range, outerClassLevel);
        //     }
        //     outerType = outerType.outerType;
        //     outerClassLevel++;
        // }


        // couldn't find symbol => error message

        if (this.currentSymbolTable.classContext) {
            let invisibleField = this.currentSymbolTable.classContext.getField(node.identifier, Number.MAX_SAFE_INTEGER);
            if (invisibleField) {
                this.pushError(JCM.attributeHasWrongVisibility(node.identifier, TokenTypeReadable[invisibleField.visibility]), "error", node);
                return undefined;
            }
        }

        this.pushError(JCM.identifierNotKnown(node.identifier), "error", node);
        return undefined;

    }

    compileOuterClassLocalVariableAccess(symbol: JavaLocalVariable, range: IRange) {

        let klass: JavaClass = <JavaClass>this.currentSymbolTable.classContext;
        let f = klass.fields.find(field => field.innerClassCopyOfOuterClassLocalVariable === symbol);

        if (!f) {
            // generate invisible field
            f = new JavaField(symbol.identifier, symbol.identifierRange, this.module, symbol.type, TokenType.keywordPrivate);
            f.innerClassCopyOfOuterClassLocalVariable = symbol;
            f.classEnum = klass;
            klass.fields.push(f);
        }

        return term(`${Helpers.elementRelativeToStackbase(0)}.${f.getInternalName()}`, symbol.type, range);
    }

    compileSymbolOnStackframeAccess(symbol: SymbolOnStackframe, range: IRange): Expr | undefined {
        let type = (<JavaLocalVariable | JavaParameter>symbol).type;
        return { ...term(Helpers.elementRelativeToStackbase(symbol.stackframePosition!), type, range), lefty: !symbol.isFinal };
    }

    compileFieldAccess(symbol: BaseSymbol, range: IRange, outerClassLevel: number = 0): Expr | undefined {
        let field = <JavaField>symbol;

        if (field._isStatic && this.classOfCurrentlyCompiledStaticInitialization) {
            this.classOfCurrentlyCompiledStaticInitialization.staticConstructorsDependOn.set(field.classEnum, true);
        }

        // local variable in main program declared at outmost scope is
        // modeled as field in order to be able to reach it inside methods declared in main program.
        if (field._isStatic && field.classEnum.isMainClass && !this.isRepl) {
            if (range.startLineNumber < field.identifierRange.startLineNumber) {
                this.pushError(JCM.localVariableUsedBeforeDeclaration(field.identifier), "error", range);
            }
            if (outerClassLevel == 0) {   // outerClassLevel > 0 could be inside run-Method or runnable which runs on other thread and has other stack than main program
                const snippet = term(`${StepParams.stack}[0].${field.getInternalName()}`, field.type, range);
                snippet.lefty = !field._isFinal || this.currentSymbolTable.methodContext?.isConstructor && this.currentSymbolTable.classContext.fastExtendsImplements(field.classEnum.identifier);
                this.registerUsagePosition(field, range);
                return snippet;
            }
        }


        let type = (field).type;


        // This code is bullshit, because final fields can be assigned in constructors.
        // So we always have to access the field, because constructor could have run in the meantime.

        // if (field._isFinal && field.initialValueIsConstant && !(this.currentSymbolTable.methodContext?.isConstructor && this.currentSymbolTable.classContext == field.classEnum)) {
        //     let constantValue = field.initialValue!;
        //     let constantValueAsString = typeof constantValue == "string" ? `"${constantValue}"` : "" + constantValue;
        //     return term(constantValueAsString, type, range, constantValue);
        // }

        let fieldName = (field).getInternalName();

        let snippet: Expr;

        if (field._isStatic) {
            let classIdentifier = field.classEnum.identifier;
            snippet = term(`${Helpers.classes}["${classIdentifier}"].${fieldName}`, type, range);
        } else {
            let outerClassPraefix: string = "";
            while (outerClassLevel > 0) {
                outerClassPraefix += "." + Helpers.outerClassAttributeIdentifier;
                outerClassLevel--;
            }

            if (field.template) {
                let objectSnippet = { ...term(`${Helpers.elementRelativeToStackbase(0)}${outerClassPraefix}`, type, range), stable: true };
                snippet = apply(type, range, field.template, objectSnippet);
            } else {
                snippet = term(`${Helpers.elementRelativeToStackbase(0)}${outerClassPraefix}.${fieldName}`, type, range);
            }

        }
        snippet.lefty = !field._isFinal || this.currentSymbolTable.methodContext?.isConstructor && this.currentSymbolTable.classContext.fastExtendsImplements(field.classEnum.identifier);

        snippet.isFinalField = field._isFinal;

        if (field.innerClassCopyOfOuterClassLocalVariable) {
            this.registerUsagePosition(field.innerClassCopyOfOuterClassLocalVariable, range);
        } else {
            this.registerUsagePosition(field, range);
        }

        return snippet;
    }


    compileLiteralNode(node: ASTLiteralNode): Expr | undefined {
        let type = this.constantTypeToTypeMap[node.constantType];
        if (!type) return undefined;
        let valueAsString: string;

        switch (node.constantType) {
            case TokenType.charLiteral:
            case TokenType.stringLiteral:
                valueAsString = JSON.stringify(node.value);
                break;
            default: valueAsString = "" + node.value;
        }

        return term(valueAsString, type, node.range, node.value);
    }

    compileBinaryOperator(ast: ASTBinaryNode): Expr | undefined {

        if (ast.operator == TokenType.ternaryOperator) return this.compileTernaryOperator(ast);

        let leftOperand = this.compileTerm(ast.leftSide, this.isAssignmentOperator(ast.operator));
        if (ast.operator == TokenType.and) {
            ast.instanceofVariables = ast.leftSide.instanceofVariables;
            ast.negatedInstanceofVariables = ast.leftSide.negatedInstanceofVariables;
            if (ast.rightSide) {
                ast.rightSide.instanceofVariables = ast.instanceofVariables;
            }
        }

        let rightOperand: Expr | undefined;
        if (ast.rightSide) {
            if (ast.rightSide?.instanceofVariables) {
                this.pushAndGetNewSymbolTable(ast.rightSide.range, false);
                ast.rightSide.instanceofVariables.forEach(v => this.currentSymbolTable.addSymbolWithoutAddingToStackframe(v));
            }
            if (ast.rightSide?.kind == TokenType.lambdaOperator) {
                rightOperand = this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>ast.rightSide, leftOperand?.type);
            } else if (ast.operator == TokenType.assignment) {
                rightOperand = this.compileTermWithTargetType(ast.rightSide, leftOperand?.type);
            } else {
                rightOperand = this.compileTerm(ast.rightSide);
            }
            if (ast.rightSide?.instanceofVariables) {
                this.popSymbolTable();
            }
        } else if (ast.instanceofVariables) {
            this.pushAndGetNewSymbolTable({ startLineNumber: ast.operatorRange.startLineNumber, startColumn: ast.operatorRange.startColumn, endLineNumber: ast.operatorRange.endLineNumber, endColumn: ast.operatorRange.endColumn + 3 }, false);
            ast.instanceofVariables.forEach(v => this.currentSymbolTable.addSymbolWithoutAddingToStackframe(v));
            this.popSymbolTable();
        }

        if (leftOperand && rightOperand && leftOperand.type && rightOperand.type) {
            return this.compileBinaryOperation(leftOperand, rightOperand, ast);
        }

        return undefined;
    }

    /**
     * a ? b : c
     */
    compileTernaryOperator(ast: ASTBinaryNode): Expr | undefined {
        let leftOperand = this.compileTerm(ast.leftSide, false); // a
        if (!ast.rightSide) return;
        if (ast.rightSide.kind != TokenType.binaryOp || (<ASTBinaryNode>ast.rightSide).operator != TokenType.colon) {
            this.pushError(JCM.colonExpectedAfterTernaryOperator(), "error", ast);
            return undefined;
        }

        let firstAlternative = this.compileTerm((<ASTBinaryNode>ast.rightSide).leftSide);  // b
        let secondAlternative = this.compileTerm((<ASTBinaryNode>ast.rightSide).rightSide);  // c

        if (!this.canCastTo(leftOperand?.type, this.booleanType, "implicit")) {
            this.pushError(JCM.booleanOperandOnTernaryOperatorLefthand(), "error", ast.leftSide);
            return undefined;
        }

        if (!leftOperand || !firstAlternative || !secondAlternative) return undefined;
        let firstType = firstAlternative.type;
        let secondType = secondAlternative.type;

        if (!firstType || !secondType) return undefined;

        let destType: JavaType | undefined;
        if (this.canCastTo(secondType, firstType, "implicit")) {
            destType = firstType;
            secondAlternative = this.compileCast(secondAlternative, firstType, "implicit")
        } else if (this.canCastTo(firstType, secondType, "implicit")) {
            destType = secondType;
            firstAlternative = this.compileCast(firstAlternative, secondType, "implicit")
        }

        if (!destType) {
            this.pushError(JCM.ternaryOperatorTypesNotCompatible(), "error", ast.rightSide);
            return undefined;
        }

        let bothAlternativesArePureTerms = isPure(firstAlternative) && isPure(secondAlternative);
        let bothAlternativesHaveVoidType = firstAlternative.type == this.voidType && secondAlternative.type == this.voidType;

        if (bothAlternativesHaveVoidType || !bothAlternativesArePureTerms) {
            let codeOf = (alternative: Expr): Code => bothAlternativesHaveVoidType ? toStatement(alternative) : toStack(alternative).pre;

            let label1 = new Label();
            let label2 = new Label();

            return {
                pre: [
                    ...leftOperand.pre, `if(${leftOperand.value}){\n`, ...at(leftOperand.range), jump(label1), "}\n", STEP,
                    ...codeOf(secondAlternative), jump(label2), STEP,
                    label1, ...codeOf(firstAlternative), STEP,
                    label2
                ],
                value: bothAlternativesHaveVoidType ? "" : `${StepParams.stack}.pop()`,
                type: destType,
                range: ast.range
            };

        } else {
            return apply(destType, ast.range, `((§1) ? (§2) : (§3) )`, leftOperand, firstAlternative, secondAlternative);
        }


    }

    compileUnaryPrefixOperator(ast: ASTUnaryPrefixNode): Expr | undefined {

        let operand = this.compileTerm(ast.term);
        if (ast.operator == TokenType.not) {
            ast.instanceofVariables = ast.term?.negatedInstanceofVariables;
            ast.negatedInstanceofVariables = ast.term?.instanceofVariables;
        }

        return this.compileUnaryOperator(operand, ast.operator);

    }

    compilePlusPlusMinusMinusSuffixOperator(ast: ASTPlusPlusMinusMinusSuffixNode): Expr | undefined {
        let operand = this.compileTerm(ast.term, true);

        if (operand && operand.type) {

            if (!operand.lefty) {
                this.pushError(JCM.plusPlusMinusMinusOnlyForVariables(), "error", ast);
                return undefined;
            }

            let operator = ast.operator == TokenType.plusPlus ? "++" : "--";

            if (this.hasBoxedType(operand)) {
                let snippet = this.compileBoxedIncrementOrDecrement(operand, ast.operator, false, ast.range);
                if (snippet) return snippet;

                if (["Double", "Float", "Integer", "Byte"].indexOf(operand.type.identifier) >= 0) {
                    let operandRange = operand.range;
                    return this.updateVariable(operand, this.getUnboxedType(operand.type), ast.range, location => `${Helpers.checkNPE(location, operandRange)}.value${operator}`);
                }
            }

            if (!this.isNumberPrimitiveType(operand.type)) {
                this.pushError(JCM.plusPlusMinusMinusOnlyForTypes(), "error", ast);
            }

            return this.updateVariable(operand, operand.type, ast.range, location => location + operator);
        }

        return undefined;

    }

    initConstantTypeToTypeMap() {
        this.constantTypeToTypeMap[TokenType.booleanLiteral] = this.libraryTypestore.getType("boolean")!;
        this.constantTypeToTypeMap[TokenType.charLiteral] = this.libraryTypestore.getType("char")!;
        this.constantTypeToTypeMap[TokenType.integerLiteral] = this.libraryTypestore.getType("int")!;
        this.constantTypeToTypeMap[TokenType.longConstant] = this.libraryTypestore.getType("long")!;
        this.constantTypeToTypeMap[TokenType.floatLiteral] = this.libraryTypestore.getType("float")!;
        this.constantTypeToTypeMap[TokenType.doubleConstant] = this.libraryTypestore.getType("double")!;
        this.constantTypeToTypeMap[TokenType.stringLiteral] = this.libraryTypestore.getType("string")!;
        this.constantTypeToTypeMap[TokenType.keywordNull] = this.libraryTypestore.getType("null")!;
    }

    compileDereferenceAttribute(node: ASTAttributeDereferencingNode): Expr | undefined {

        let objectSnippet = this.compileTerm(node.nodeToGetObject);
        if (!objectSnippet || !objectSnippet.type) return undefined;
        let range = node.range;

        if (objectSnippet.superLevel && node.attributeIdentifier == "super") {
            return { ...objectSnippet, superLevel: objectSnippet.superLevel + 1, type: (<IJavaClass>objectSnippet.type).getExtends() };
        }

        if (objectSnippet.type instanceof JavaArrayType) {
            if (node.attributeIdentifier != 'length') {
                this.pushError(JCM.arraysOnlyHaveLengthField(node.attributeIdentifier), "error", node);
                return undefined;
            }
            return apply(this.intType, range, `(§1 || ${Helpers.throwNPE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn})).length`, objectSnippet);
        }

        let objectType = objectSnippet.type;
        if (!(objectType instanceof NonPrimitiveType || objectType instanceof StaticNonPrimitiveType)) {
            this.pushError(JCM.typeHasNoFields(objectSnippet.type.identifier), "error", node);
            return undefined;
        }

        let visibility: Visibility = TokenType.keywordPublic;
        if (this.currentSymbolTable.classContext) {
            if (this.currentSymbolTable.classContext.fastExtendsImplements(objectType.identifier)) {
                visibility = TokenType.keywordProtected;
                if (objectType.fastExtendsImplements(this.currentSymbolTable.classContext.identifier)) {
                    visibility = TokenType.keywordPrivate;
                }
            }
        }

        let field = objectType.getField(node.attributeIdentifier, visibility);

        if (!field && objectType instanceof StaticNonPrimitiveType) {
            let innerType = objectType.nonPrimitiveType.innerTypes.find(type => type.identifier == node.attributeIdentifier) as NonPrimitiveType;
            if (innerType) return { ...term(`${Helpers.classes}["${innerType.pathAndIdentifierAsDotSeparatedString}"]`, innerType.staticType, node.range), stable: true };
        }

        if (!field) {
            let invisibleField = objectType.getField(node.attributeIdentifier, Number.MAX_SAFE_INTEGER);

            if (invisibleField) {
                this.pushError(JCM.attributeHasWrongVisibility(node.attributeIdentifier, TokenTypeReadable[invisibleField.visibility]), "error", node);
            } else {
                this.pushError(JCM.fieldUnknown(node.attributeIdentifier), "error", node);
            }

            return undefined;
        }

        this.registerUsagePosition(field, node.range);
        let isEnum = objectType instanceof StaticNonPrimitiveType && objectType.nonPrimitiveType instanceof JavaEnum;

        /**
         * See user-defined-spritesheets.md
         */
        if (isEnum && objectType.identifier == 'SpriteLibrary') {
            let enumType = <JavaEnum>(<StaticNonPrimitiveType>objectType).nonPrimitiveType;
            let id = enumType.id;

            if (!enumType.runtimeClass) return undefined;

            let value = enumType.runtimeClass!.getSpriteLibrary(id, node.attributeIdentifier);
            if (value) {
                return { ...term(`${Helpers.classes}["SpriteLibrary"].getSpriteLibrary(${id}, "${node.attributeIdentifier}")`, enumType, node.range), isFinalField: field.isFinal() };
            }
        }

        // this is bullshit as final fields can be assigned in constructors
        // if (field._isFinal && field.initialValueIsConstant && !isEnum) {
        //     let constantValue = field.initialValue!;
        //     let constantValueAsString = typeof constantValue == "string" ? `"${constantValue}"` : "" + constantValue;
        //     return term(constantValueAsString, field.type, range, constantValue);
        // }


        if (field._isStatic) {
            let classIdentifier = field.classEnum.pathAndIdentifierAsDotSeparatedString;
            if (field.template) {
                let code = field.template.replace("§1", `${Helpers.classes}["${classIdentifier}"]`);
                return { ...term(code, field.type, range), isFinalField: field._isFinal };
            } else {
                return { ...term(`${Helpers.classes}["${classIdentifier}"].${field.getInternalName()}`, field.type, range), lefty: !field._isFinal, isFinalField: field._isFinal };
            }
        } else {
            let objectTemplate: string = objectSnippet.type instanceof JavaEnum ? `§1` : `(§1 || ${Helpers.throwNPE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))`;

            if (field.template) {
                let fieldTemplate = field.template;
                let snippet = apply(field.type, range, fieldTemplate, apply(objectSnippet.type, objectSnippet.range!, objectTemplate, objectSnippet));
                let location = (object: string) => template(fieldTemplate)(template(objectTemplate)(object));
                return { ...snippet, lefty: !field._isFinal, isFinalField: field._isFinal, place: { parts: [objectSnippet], build: location } };
            } else {
                let fieldTemplate = `${objectTemplate}.${field.getInternalName()}`;
                let snippet = apply(field.type, range, fieldTemplate, objectSnippet);
                let lefty = !field._isFinal || this.currentSymbolTable.methodContext?.isConstructor && this.currentSymbolTable.classContext.fastExtendsImplements(field.classEnum.identifier);
                return { ...snippet, lefty: lefty, isFinalField: field._isFinal, place: { parts: [objectSnippet], build: template(fieldTemplate) } };
            }

        }


    }

    getParameterValueSnippets(methodCallNode: ASTMethodCallNode | ASTNewObjectNode): { snippets: (Expr | undefined)[], withErrors: boolean } {
        let snippets: (Expr | undefined)[] = [];
        let withErrors: boolean = false;
        for (let parameterValueNode of methodCallNode.parameterValues) {
            if (parameterValueNode.kind == TokenType.lambdaOperator) {
                snippets.push(undefined);
            } else {
                let snippet = this.compileTerm(parameterValueNode);
                if (!snippet || !snippet.type) {
                    snippets.push(undefined);
                    withErrors = true;
                } else {
                    snippets.push(snippet);
                }
            }
        }
        return {
            snippets: snippets,
            withErrors: withErrors
        };
    }


    // if Method is generic:
    // a) catch type parameters inside types to get actual types for them
    // b) make sure all catches for one type parameter deliver the same type
    // c) compute actual type for return parameter

    compileMethodCall(node: ASTMethodCallNode): Expr | undefined {

        let pv = this.getParameterValueSnippets(node);
        let parameterValueSnippets = pv.snippets;

        let parameterTypes = this.convertParameterValueSnippetsToParameterTypes(node.identifier, parameterValueSnippets);
        if (!parameterTypes) return undefined;

        let methodIsConstructor = false;
        if (node.nodeToGetObject && [TokenType.keywordThis, TokenType.keywordSuper].indexOf(node.nodeToGetObject?.kind) >= 0) {
            if (node.identifier == "") {
                methodIsConstructor = true;
            }
        }

        let objectSnippet: Expr | undefined;
        // object is checked for null after the parameter values have been evaluated, as in java
        let checkObject = (object: string) => object;
        let objectNeedsNullCheck: boolean = false;
        if (node.nodeToGetObject) {
            objectSnippet = this.compileTerm(node.nodeToGetObject);
            if (!objectSnippet) return undefined;
            let range = node.nodeToGetObject.range;
            if (
                // !(objectSnippet.type instanceof JavaEnum) &&
                // objectSnippet.type != this.stringType &&
                !(objectSnippet.type instanceof StaticNonPrimitiveType) && !objectSnippet.superLevel) {
                checkObject = (object: string) => Helpers.checkNPE(object, range);
                objectNeedsNullCheck = true;
            }
        } else {
            let classContext = this.currentSymbolTable.classContext;
            if (!classContext) {

                if (node.identifier.startsWith("assert") || node.identifier.startsWith("fail")) {
                    classContext = this.assertionsType;
                    if (node.identifier == "assertCodeReached" && parameterValueSnippets) {
                        return this.registerCodeReachedAssertion(node, parameterValueSnippets);
                    }
                } else {
                    this.pushError(JCM.methodCallOutsideClassNeedsDotSyntax(), "error", node);
                    return undefined;
                }

            }
            objectSnippet = { ...term(Helpers.elementRelativeToStackbase(0), classContext, EmptyRange.instance), stable: true };
        }

        if (!objectSnippet || !objectSnippet.type) {
            return undefined;
        }

        let methods = this.searchMethod(node.identifier, objectSnippet.type, parameterTypes, methodIsConstructor,
            objectSnippet.type instanceof StaticNonPrimitiveType, true, node.identifierRange);
        if ((<NonPrimitiveType>objectSnippet.type).isMainClass && !methods.best) {
            let globalMethod = this.searchGlobalMethod(node.identifier, parameterTypes, node.identifierRange);
            if (globalMethod) {
                methods.best = globalMethod.method;
                objectSnippet = { ...term(`${Helpers.classes}["${globalMethod.staticMainClass.identifier}"]`, globalMethod.staticMainClass, node.identifierRange), stable: true };
                checkObject = (object: string) => object;
                objectNeedsNullCheck = false;
            }
        }

        // Methods of class String which are not declared for primitive strings (e.g. step-aware methods
        // like formatted(Object... args)) are called on the boxed value:
        if (!methods.best && objectSnippet.type == this.stringType) {
            let stringMethods = this.searchMethod(node.identifier, this.stringNonPrimitiveType, parameterTypes, false, false, true, node.identifierRange);
            if (stringMethods.best) {
                methods = stringMethods;
                objectSnippet = this.box(map(objectSnippet, checkObject));
                checkObject = (object: string) => object;
                objectNeedsNullCheck = false;
            }
        }

        let method = methods?.best;

        if (pv.withErrors) {
            if (node.rightBracketPosition) {
                this.module.pushMethodCallPosition(node.identifierRange,
                    node.commaPositions, methods.possible, node.rightBracketPosition,
                    method);
            }
            if (methods.possible.length > 0) {
                this.registerUsagePosition(method || methods.possible[0], node.identifierRange);
            }
            return undefined;
        }

        if (node.identifier == "assertCodeReached" && (!method || objectSnippet.type.identifier == "Assertions")) {
            return this.registerCodeReachedAssertion(node, parameterValueSnippets);
        }

        if (!method && node.identifier.startsWith("assert") || node.identifier.startsWith("fail")) {

            methods = this.searchMethod(node.identifier, this.assertionsType, parameterTypes, false, objectSnippet instanceof StaticNonPrimitiveType, true, node.identifierRange);
            method = methods?.best;
        }

        let outerTypeTemplate: string = "";
        // access method of outer type from inner-class method?
        if (!method && !node.nodeToGetObject && this.currentSymbolTable.classContext?.outerType) {
            let outerType: NonPrimitiveType | StaticNonPrimitiveType | undefined = this.currentSymbolTable.classContext?.outerType;
            while (outerType && outerType instanceof NonPrimitiveType) {
                outerTypeTemplate += "." + Helpers.outerClassAttributeIdentifier;

                methods = this.searchMethod(node.identifier, outerType, parameterTypes, false, objectSnippet instanceof StaticNonPrimitiveType, true, node.identifierRange);
                method = methods.best;
                if (method) {
                    break;
                }
                outerType = outerType.outerType;
            }
        }

        if (node.rightBracketPosition) {
            this.module.pushMethodCallPosition(node.identifierRange,
                node.commaPositions, methods.possible, node.rightBracketPosition,
                method);
        }

        if (!method) {

            let invisibleMethod = this.searchMethod(node.identifier, objectSnippet.type, parameterTypes, false, objectSnippet.type instanceof StaticNonPrimitiveType, false, node.identifierRange).best;

            if (invisibleMethod) {
                this.pushError(JCM.methodHasWrongVisibility(node.identifier, TokenTypeReadable[invisibleMethod.visibility]), "error", node);
            } else {
                this.pushError(JCM.cantFindMethod(), "error", node.range);
            }
            return undefined;
        }

        this.registerUsagePosition(method, node.identifierRange);

        if(method.isAbstract && objectSnippet.superLevel > 0){
            this.pushError(JCM.cantCallAbstractMethodOfBaseClass(method.identifier), "error", node);
        }

        for (let i = 0; i < node.parameterValues.length; i++) {
            let pv = node.parameterValues[i];
            if (pv.kind == TokenType.lambdaOperator) {
                let snippet = this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>pv, method.parameters[i].type);
                if (!snippet) return undefined;
                parameterValueSnippets[i] = snippet;
            } else {
                if (!parameterValueSnippets[i]) {
                    return undefined;
                }
            }
        }

        parameterValueSnippets = this.castParameterValuesAndPackEllipsis(parameterValueSnippets, method);
        let returnParameterType = method.returnParameterType;
        if (returnParameterType == ThisType.this()) {
            returnParameterType = objectSnippet.type;
        }

        if (method instanceof GenericMethod) {
            method.checkCatches(node.range);
            returnParameterType = method.getNonGenericCopyOfReturnParameterType();
        }

        returnParameterType = returnParameterType || this.voidType;

        // if(node.identifier == "addBlockSquareWithTiles") debugger;
        // cast parameter values

        if (method.constantFoldingFunction) {
            let allParametersConstant: boolean = !parameterValueSnippets.some(v => !isConstant(v!))
            if (allParametersConstant && (method.isStatic || !objectNeedsNullCheck && isConstant(objectSnippet))) {
                let constantValues = parameterValueSnippets.map(p => p!.constant);
                let result = method.isStatic ? method.constantFoldingFunction(...constantValues) : method.constantFoldingFunction(objectSnippet.constant, ...constantValues);

                let resultAsString: string = "";

                if (method.returnParameterType instanceof JavaArrayType && Array.isArray(result)) {
                    if (this.isStringOrChar(method.returnParameterType.elementType)) {
                        resultAsString = "[" + result.map(r => `"${r}"`).join(", ") + "]";
                    } else {
                        resultAsString = "[" + result.map(r => "" + r).join(", ") + "]";
                    }
                } else {
                    resultAsString = typeof result == "string" ? `"${result}"` : "" + result;
                }

                return term(resultAsString, returnParameterType, node.range, result);
            }
        }

        let callingConvention: CallingConvention = method.hasImplementationWithNativeCallingConvention || method.template ? "native" : "java";
        if (callingConvention == "native") {
            let isFinalOrStatic = (objectSnippet.type instanceof IJavaClass && objectSnippet.type.isFinal) || method.isFinal || method.isStatic;
            if (!isFinalOrStatic) {
                if (method.classEnumInterface instanceof IJavaInterface) {
                    callingConvention = "java";
                } else if (this.module.moduleManager && this.module.moduleManager.overriddenOrImplementedMethodPaths[method.getPathWithMethodIdentifier()]) {
                    callingConvention = "java";
                }
            }
        }

        // For library functions like Math.sin, Math.abs, ... we use templates to compile to nativ javascript functions:
        if (method.template) {
            if (method.isStatic) {
                return apply(returnParameterType, node.range, method.template, ...(<Expr[]>parameterValueSnippets));
            } else if (callingConvention == "native") {
                let methodTemplate = template(method.template);
                return combine(returnParameterType, node.range, [objectSnippet, ...(<Expr[]>parameterValueSnippets)],
                    (object, ...parameters) => methodTemplate(checkObject(object), ...parameters));
            }
        }


        let objectTemplate: string;
        if (objectSnippet.type instanceof StaticNonPrimitiveType) {
            objectTemplate = `§1.${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`
        } else if (objectSnippet.superLevel && !method.isConstructor) {   // constructors of class and base class have distinct names as they include class identifier
            let classIdentifier = (<IJavaClass>objectSnippet.type).pathAndIdentifierAsDotSeparatedString;
            if (method.isStatic) {
                objectTemplate = `${Helpers.classes}["${classIdentifier}"].${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`
            } else {
                objectTemplate = `${Helpers.classes}["${classIdentifier}"].prototype`
                    + `.${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}.call(§1,`;
            }
        } else {
            if (method.isStatic) {
                //objectTemplate = `§1.constructor.${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`
                objectTemplate = `§1.${objectSnippet instanceof StaticNonPrimitiveType ? "" : "constructor."}${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`
            } else {
                objectTemplate = `§1${outerTypeTemplate}.${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`
            }
        }

        if (callingConvention == "java") {
            objectTemplate += `${StepParams.thread}` +
                (method.isStatic ? '' : `, undefined`) +     // non-static methods have callback-function as second parameter
                (parameterValueSnippets.length > 0 ? ", " : "");
        }

        let i = 2;
        objectTemplate += parameterValueSnippets.map(_p => "§" + (i++)).join(", ") + ")";

        let callTemplate = template(objectTemplate);
        let snippet = combine(returnParameterType, node.range, [objectSnippet, ...(<Expr[]>parameterValueSnippets)],
            (object, ...parameters) => callTemplate(checkObject(object), ...parameters));

        if (callingConvention == "java") {
            snippet = javaCall(snippet, returnParameterType != this.voidType);
        }

        return snippet;
    }

    /**
     *
     */
    searchGlobalMethod(identifier: string, parameterTypes: (JavaType | undefined)[], methodCallRange: IRange): { method: JavaMethod, staticMainClass: StaticNonPrimitiveType } | undefined {
        for (let mainClass of this.compiledTypesTypestore.getMainClasses()) {
            let methods = this.searchMethod(identifier, mainClass.staticType,
                parameterTypes, false, true, false, methodCallRange
            )
            if (methods.best) {
                return {
                    method: methods.best,
                    staticMainClass: mainClass.staticType
                }
            }
        }

        return undefined;
    }

    isStringOrChar(type: JavaType) {
        return type == this.stringType || type == this.charType;
    }

    registerCodeReachedAssertion(node: ASTMethodCallNode, parameterValues: (Expr | undefined)[]): Expr | undefined {
        if (parameterValues.length != 1 || parameterValues[0]?.type != this.stringType || !isConstant(parameterValues[0])) {
            this.pushError(JCM.assertCodeReachedNeedsStringParameter(), "error", node);
            return undefined;
        }
        let message = <string>parameterValues[0].constant;
        let codeReachedAssertion = new CodeReachedAssertion(message, this.module, node.range);
        this.module.codeReachedAssertions.registerAssertion(codeReachedAssertion);

        return term(`${Helpers.registerCodeReached}("${codeReachedAssertion.key}")`, undefined, node.range);
    }

    convertParameterValueSnippetsToParameterTypes(methodIdentifier: string, parameterSnippets: Expr[]): (JavaType | undefined)[] {
        let parameterTypes: (JavaType | undefined)[] = [];
        for (let i = 0; i < parameterSnippets.length; i++) {
            let snippet = parameterSnippets[i];
            let type = snippet?.type;
            if (type == this.voidType) {
                this.pushError(JCM.voidTypeNotAllowedAsParameterType(methodIdentifier), "error", snippet.range);
                return undefined;
            }
            parameterTypes.push(snippet?.type || undefined);
        }
        return parameterTypes;
    }

    searchMethod(identifier: string, objectType: JavaType, parameterTypes: (JavaType | undefined)[],
        isConstructor: boolean, hasToBeStatic: boolean, takingVisibilityIntoAccount: boolean,
        methodCallPosition: IRange): { best: JavaMethod | undefined, possible: JavaMethod[] } {

        if (objectType == this.stringType) objectType = this.primitiveStringClass.type;

        let possibleMethods: JavaMethod[];

        if (objectType instanceof StaticNonPrimitiveType) {
            possibleMethods = objectType.getPossibleMethods(identifier, isConstructor, hasToBeStatic);
        } else if (objectType instanceof NonPrimitiveType) {
            possibleMethods = objectType.getPossibleMethods(identifier, isConstructor, hasToBeStatic);
            if (objectType instanceof IJavaInterface || objectType instanceof GenericTypeParameter) {
                possibleMethods = possibleMethods.concat(this.objectType.getPossibleMethods(identifier, isConstructor, hasToBeStatic));
            }
        } else {
            return { best: undefined, possible: [] };
        }

        possibleMethods = possibleMethods.filter(m => m.parameters.length >= parameterTypes.length || m.parameters.length > 0 && m.parameters[m.parameters.length - 1]?.isEllipsis);

        if (takingVisibilityIntoAccount) {
            possibleMethods = possibleMethods.filter(m => {
                if (m.visibility == TokenType.keywordPublic) return true;
                if (m.visibility == TokenType.keywordPrivate) {
                    let mClassIdentifier = m.classEnumInterface.identifier;
                    if (this.classOfCurrentlyCompiledStaticInitialization) return this.classOfCurrentlyCompiledStaticInitialization.identifier == mClassIdentifier;
                    if (this.currentSymbolTable.classContext) return this.currentSymbolTable.classContext.identifier == mClassIdentifier;
                    return false;
                }
                if (m.visibility == TokenType.keywordProtected) {
                    let mClassIdentifier = m.classEnumInterface.identifier;
                    if (this.classOfCurrentlyCompiledStaticInitialization) return this.classOfCurrentlyCompiledStaticInitialization.identifier == mClassIdentifier;
                    if (this.currentSymbolTable.classContext) return this.currentSymbolTable.classContext.fastExtendsImplements(mClassIdentifier);
                    return false;
                }
            })
        }

        let bestMethodSoFar: JavaMethod | undefined;
        let castsNeededWithBestMethodSoFar: number = Number.MAX_SAFE_INTEGER;

        for (let method of possibleMethods) {

            if (!method.canTakeNumberOfParameters(parameterTypes.length)) continue;

            if (method instanceof GenericMethod)
                method.initCatches();

            let castsNeeded: number = 0;
            let ellipsisType: JavaType | undefined;

            let suitable: boolean = true;
            for (let i = 0; i < parameterTypes.length; i++) {
                let fromType = parameterTypes[i];

                if (!fromType) continue;

                let toType = ellipsisType;
                if (!toType) {
                    let parameter = method.parameters[i];
                    if (!parameter) continue;
                    if (parameter.isEllipsis) {
                        toType = (<JavaArrayType>parameter.type).getElementType();
                        ellipsisType = toType;
                    } else {
                        toType = parameter.type;
                    }
                }

                if (fromType != toType) {
                    let toTypeString = toType.toString().toLocaleLowerCase();
                    let fromTypeString = fromType.toString().toLocaleLowerCase();
                    if (fromTypeString != toTypeString) {
                        let toTypeIsString = toTypeString == 'string';
                        if (this.canCastTo(fromType, toType, "implicit")) {
                            if (toTypeIsString) {
                                castsNeeded += 3;
                            } else if (toTypeString == 'object') {
                                castsNeeded += 2;
                            } else {
                                castsNeeded++;
                            }
                            if (castsNeeded >= castsNeededWithBestMethodSoFar) {
                                suitable = false;
                                break;
                            }
                        } else {
                            suitable = false;
                            break;
                        }

                    }
                }
            }
            if (suitable && castsNeeded < castsNeededWithBestMethodSoFar) {

                bestMethodSoFar = method;
                castsNeededWithBestMethodSoFar = castsNeeded;

            }
        }

        if (bestMethodSoFar) {
            if (!(bestMethodSoFar instanceof GenericMethod)) {
                return { best: bestMethodSoFar, possible: possibleMethods };
            }

            // The next line is commented out because it's possible that there are catches that are not caught yet,
            // for example public <U> Optional<U> map(Function<T,U> f)
            // When f is a lambda function then U is return parameter of it and therefore
            // only catched after lambda function has been compiled.
            // let errors = bestMethodSoFar.checkCatches(methodCallPosition);




            // TODO!

            // if (errors.length > 0) {
            //     this.module.errors.push(...errors);
            //     return { best: undefined, possible: possibleMethods };
            // }

            for(let gtp of bestMethodSoFar.genericTypeParameters) {
                if(gtp.catches){
                    gtp.catches = gtp.catches.map(c => {
                        if(c == this.primitiveStringClass.type){
                            return this.stringNonPrimitiveType;
                        }
                        return c;
                    })                    
                }
            }

            return { best: bestMethodSoFar.getNonGenericCopyWithConcreteTypes(), possible: possibleMethods };

        }

        return { best: undefined, possible: possibleMethods };
    }


}
