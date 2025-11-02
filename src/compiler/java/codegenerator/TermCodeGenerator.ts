import { isBoxedPrimitive } from "util/types";
import { BaseSymbol, SymbolOnStackframe } from "../../common/BaseSymbolTable";
import { CodeReacedAssertion } from "../../common/interpreter/CodeReachedAssertions.ts";
import { Helpers, StepParams } from "../../common/interpreter/StepFunction";
import { EmptyRange, IRange, Range } from "../../common/range/Range";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule.ts";
import { ASTAnonymousClassNode, ASTArrayLiteralNode, ASTAttributeDereferencingNode, ASTBinaryNode, ASTBracketNode, ASTCastNode, ASTEnumValueNode, ASTLambdaFunctionDeclarationNode, ASTLiteralNode, ASTMethodCallNode, ASTNewArrayNode, ASTNewObjectNode, ASTPlusPlusMinusMinusSuffixNode, ASTSelectArrayElementNode, ASTSuperNode, ASTSymbolNode, ASTTermNode, ASTThisNode, ASTUnaryPrefixNode } from "../parser/AST";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { JavaArrayType } from "../types/JavaArrayType";
import { IJavaClass, JavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { JavaField } from "../types/JavaField";
import { IJavaInterface, JavaInterface } from "../types/JavaInterface.ts";
import { GenericMethod, JavaMethod } from "../types/JavaMethod.ts";
import { JavaParameter } from "../types/JavaParameter";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType.ts";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType.ts";
import { Visibility } from "../types/Visibility.ts";
import { BinopCastCodeGenerator } from "./BinopCastCodeGenerator.ts";
import { CodeSnippet, StringCodeSnippet } from "./CodeSnippet";
import { CodeSnippetContainer } from "./CodeSnippetKinds";
import { SnippetFramer } from "./CodeSnippetTools";
import { CodeTemplate, OneParameterTemplate, ParametersJoinedTemplate, SeveralParameterTemplate, TwoParameterTemplate } from "./CodeTemplate";
import { JavaLocalVariable } from "./JavaLocalVariable";
import { JavaSymbolTable } from "./JavaSymbolTable";
import { JumpToLabelCodeSnippet, LabelCodeSnippet } from "./LabelManager.ts";
import { MissingStatementManager } from "./MissingStatementsManager.ts";
import { OuterClassFieldAccessTracker } from "./OuterClassFieldAccessTracker.ts";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { ThisType } from "../types/ThisType.ts";
import { SettingsStore } from "../../../client/settings/SettingsStore.ts";

export abstract class TermCodeGenerator extends BinopCastCodeGenerator {

    constantTypeToTypeMap: { [key: number]: JavaType } = {}


    classOfCurrentlyCompiledStaticInitialization?: NonPrimitiveType;

    missingStatementManager: MissingStatementManager = new MissingStatementManager();

    outerClassFieldAccessTracker: OuterClassFieldAccessTracker = new OuterClassFieldAccessTracker();

    breakStack: LabelCodeSnippet[] = [];
    continueStack: LabelCodeSnippet[] = [];

    nextArrayLiteralTypeExpected: JavaType[] = [];

    isRepl: boolean = false;


    constructor(module: JavaCompiledModule, libraryTypestore: JavaTypeStore, compiledTypesTypestore: JavaTypeStore,
        settingsStore: SettingsStore | undefined) {
        super(module, libraryTypestore, compiledTypesTypestore, settingsStore);

        this.initConstantTypeToTypeMap();
    }

    compileTerm(ast: ASTTermNode | undefined, isWriteAccess: boolean = false): CodeSnippet | undefined {

        if (!ast) return undefined;

        let snippet: CodeSnippet | undefined;

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

        }

        if (snippet && ast.parenthesisNeeded) {
            snippet = SnippetFramer.frame(snippet, '(§1)');
        }

        return snippet;
    }

    compileBrackets(node: ASTBracketNode): CodeSnippet {
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

    addTypePosition(snippet: CodeSnippet | undefined) {
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

    compileKeywordSuper(node: ASTSuperNode): CodeSnippet | undefined {
        let classContext = this.currentSymbolTable.classContext;
        if (!classContext || !(classContext instanceof IJavaClass || classContext instanceof JavaEnum)) {
            this.pushError(JCM.superOnlyInClassesOrEnums(), "error", node);
            return undefined;
        }



        let snippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}`, node.range, classContext.getExtends());
        snippet.isSuperKeywordWithLevel = 1;
        return snippet;
    }

    compileKeywordThis(node: ASTThisNode): CodeSnippet | undefined {
        let classContext = this.currentSymbolTable.classContext;
        if (!classContext || !(classContext instanceof IJavaClass || classContext instanceof JavaEnum)) {
            this.pushError(JCM.thisOnlyInClassesOrEnums(), "error", node);
            return undefined;
        }

        return new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}`, node.range, classContext);
    }

    compileExplicitCast(node: ASTCastNode): CodeSnippet | undefined {

        let objectSnippet = this.compileTerm(node.objectToCast);

        let sourceType = objectSnippet?.type;
        let destType = node.castType.resolvedType;

        if (!objectSnippet || !sourceType || !destType) return undefined;

        if (sourceType instanceof NonPrimitiveType && destType instanceof NonPrimitiveType) {
            return this.compileExplicitCastFromObjectToObject(node, objectSnippet, sourceType, destType);
        }

        if (this.canCastTo(sourceType, destType, "explicit")) {
            return this.compileCast(objectSnippet, destType, "explicit");
        } else {
            this.pushError(JCM.cantCastFromTo(sourceType.identifier, destType.identifier), "error", node);
        }

    }

    compileExplicitCastFromObjectToObject(node: ASTCastNode, objectSnippet: CodeSnippet, sourceType: NonPrimitiveType, destType: NonPrimitiveType): CodeSnippet | undefined {
        if (sourceType.fastExtendsImplements(destType.identifier)) {
            this.pushError(JCM.unneccessaryCast(), "info", node);
            return objectSnippet;
        }

        // if (!destType.fastExtendsImplements(sourceType.identifier)) {
        //     this.pushError(JCM.cantCastFromTo(sourceType.identifier, destType.identifier), "error", node);
        //     return objectSnippet;
        // }

        if (destType instanceof GenericTypeParameter) {
            this.pushError(JCM.cantCastFromTo(sourceType.identifier, destType.identifier), "error", node);

            return undefined;
        }

        let range = node.range;
        return SnippetFramer.frame(objectSnippet, `${Helpers.checkCast}(§1, "${destType.pathAndIdentifier}", ${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn})`
            , destType)
    }


    compileNewObjectNode(node: ASTNewObjectNode, newObjectSnippet?: CodeSnippet): CodeSnippet | undefined {
        // new t.classes[<identifier>]().<constructorIdentifier>(param1, ..., paramN)
        // constructor has to return this or push it to stack!

        let pv = this.getParameterValueSnippets(node);
        let parameterValues = pv.snippets;

        if (!node.type.resolvedType) return;

        let klassType = <IJavaClass>node.type.resolvedType;

        if (!klassType || !(klassType instanceof IJavaClass)) {
            return undefined;
        }

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

        let methods = this.searchMethod(klassType.identifier, klassType, parameterValues.map(p => p?.type), true, false, true, node.range);
        let method = methods.best;

        if (pv.withErrors) {
            if (node.rightBracketPosition) {
                this.module.pushMethodCallPosition(node.klassIdentifierRange,
                    node.commaPositions, methods.possible, node.rightBracketPosition,
                    method);
            }

            return new StringCodeSnippet("null", node.range, klassType);
        }

        if (method) {
            this.registerUsagePosition(method, node.klassIdentifierRange);
        }


        this.module.pushMethodCallPosition(node.klassIdentifierRange, node.commaPositions, methods.possible,
            node.rightBracketPosition!, method
        )

        if (!method) {
            this.pushError(JCM.cantFindConstructor(), "error", node.range);
            return new StringCodeSnippet("null", node.range, klassType);
        }

        for (let i = 0; i < node.parameterValues.length; i++) {
            let pv = node.parameterValues[i];
            if (pv.kind == TokenType.lambdaOperator) {
                let snippet = this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>pv, method.parameters[i].type);
                if (!snippet) return undefined;
                parameterValues[i] = snippet;
            } else {
                if (!parameterValues[i]) {
                    return new StringCodeSnippet("null", node.range, klassType);
                }
            }
        }


        // cast parameter values
        let snippet = this.invokeConstructor(<CodeSnippet[]>parameterValues, method, klassType, node, newObjectSnippet);

        return snippet;

    }

    castParameterValuesAndPackEllipsis(parameterValues: (CodeSnippet | undefined)[], method: JavaMethod): CodeSnippet[] {

        let ellipsisType: JavaType | undefined;
        let castParameters: CodeSnippet[] = [];

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

            castParameters.push(this.compileCast(parameterValues[i]!, destinationType, "implicit"));
        }

        if (!ellipsisType) return castParameters;

        let methodParameterCountMinusOne = method.parameters.length - 1;

        let parametersBeforeEllipsis = castParameters.slice(0, methodParameterCountMinusOne);
        let ellipsisParameters = castParameters.slice(methodParameterCountMinusOne);

        let ellipsisParameterSnippet = ParametersJoinedTemplate.applyToSnippet(method.parameters[methodParameterCountMinusOne].type, ellipsisParameters[0].range!, "[", ", ", "]", ...ellipsisParameters);

        parametersBeforeEllipsis.push(ellipsisParameterSnippet);

        return parametersBeforeEllipsis;
    }

    protected invokeConstructor(parameterValues: CodeSnippet[], method: JavaMethod, klassType: IJavaClass | JavaEnum,
        node: ASTNewObjectNode | ASTEnumValueNode, newObjectSnippet: CodeSnippet | undefined,
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
            newObjectSnippet = new StringCodeSnippet(`new ${Helpers.classes}["${klassType.pathAndIdentifier}"](${enumValueIdentifier ? '"' + enumValueIdentifier + '", ' + enumValueIndex : ""})`);
        }

        // call javascript constructor and directly thereafter call java constructor
        let template: string = `§1.${method.getInternalName(callingConvention)}(`;

        // instantiation of non-static inner class-object?
        // we can't rely on method.hasOuterClassParameter because this object instantiation
        // could be before standard constructor methods have been built.


        // In constructions like a.new A.B()
        // a is the objectSnippet.
        // We compile it even if B has no outer Type because in situations like
        // r.
        // new Circle()
        // we want to get proper code completion if Curser is located just after the dot.
        let objectSnippet: CodeSnippet | undefined;
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
                parameterValues.unshift(new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}`));
                objectType = this.currentSymbolTable.classContext;
            }

            if (!objectType || !this.canCastTo(objectType, klassType.outerType, "implicit")) {
                this.pushError(JCM.objectContextNeededForInstantiation(klassType.identifier, klassType.outerType!.identifier), "error", node);
            }

        }

        if (callingConvention == "java") {
            /*
             * if class is child of Actor or Shape then overridden listener-methos (act, onMouseDown, onKeyDown, ...)
             * must not be called before constructor is FULLY finished. We achieve this by setting the callback-function
             * of the constructor:
             */
            let callRegisterListeners: string = (!klassType.isLibraryType && klassType.fastExtendsImplements("Actor")) ?
                `() => {${StepParams.stack}[${StepParams.stack}.length - 1]._registerListeners(${StepParams.thread}); }` : "undefined";

            template += `${StepParams.thread}, ${callRegisterListeners}` + (parameterValues.length > 0 ? ", " : "");
        }

        let i = 2;
        template += parameterValues.map(_p => "§" + (i++)).join(", ") + ")";

        let snippet = new SeveralParameterTemplate(template).applyToSnippet(klassType, node.range, newObjectSnippet, ...parameterValues);

        if (callingConvention == "java") {
            snippet = new CodeSnippetContainer(SnippetFramer.frame(snippet, '§1;\n'));
            (<CodeSnippetContainer>snippet).addNextStepMark();
            snippet.finalValueIsOnStack = true;
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

    compileSelectArrayElement(node: ASTSelectArrayElementNode, isLeftSideOfAssignment: boolean): CodeSnippet | undefined {
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

        let indexSnippets: CodeSnippet[] = [];
        for (let index of node.indices) {
            let indsnip = this.compileTerm(index);

            if (!(indsnip?.type?.isPrimitive)) {
                indsnip = this.unbox(indsnip);
            }

            if (!(indsnip?.type?.isUsableAsIndex())) {
                if (indsnip) this.pushError(JCM.indexMustHaveIntegerValue(), "error", index);

                // set dummy replacement to keep on compiling...
                indsnip = new StringCodeSnippet('0', index.range, this.intType);
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
        let returnSnippet!: CodeSnippet;

        if (isLeftSideOfAssignment) {
            if (indexSnippets.length == 1) {
                returnSnippet = new TwoParameterTemplate(`${Helpers.array0}(§1)[${Helpers.checkLastIndex}(§2, 1)]`).applyToSnippet(remainingType, node.range, arraySnippet, indexSnippets[0]);
            } else {
                let lastIndexSnippet = indexSnippets.pop();
                let indexSnippet = ParametersJoinedTemplate.applyToSnippet(this.voidType, node.range, '', ', ', '', ...indexSnippets);
                let checkAndReturnArrayMethod = "";
                switch (indexSnippets.length) {
                    case 1: checkAndReturnArrayMethod = Helpers.array1; break;
                    case 2: checkAndReturnArrayMethod = Helpers.array2; break;
                    default: checkAndReturnArrayMethod = Helpers.arrayN; break;
                }

                returnSnippet = new SeveralParameterTemplate(`${checkAndReturnArrayMethod}(§1, §2)[${Helpers.checkLastIndex}(§3, ${indexSnippets.length + 1})]`)
                    .applyToSnippet(remainingType, node.range, arraySnippet, indexSnippet, lastIndexSnippet!);
            }
        } else {
            let indexSnippet = ParametersJoinedTemplate.applyToSnippet(this.voidType, node.range, '', ', ', '', ...indexSnippets);
            let checkerMethod = "";
            switch (indexSnippets.length) {
                case 1: checkerMethod = Helpers.arrayValue1; break;
                case 2: checkerMethod = Helpers.arrayValue2; break;
                case 3: checkerMethod = Helpers.arrayValue3; break;
                default: checkerMethod = Helpers.arrayValueN; break;
            }

            returnSnippet = new TwoParameterTemplate(`${checkerMethod}(§1, §2)`).applyToSnippet(remainingType, node.range, arraySnippet, indexSnippet);
        }

        if (node.parenthesisNeeded) {
            returnSnippet = SnippetFramer.frame(returnSnippet, '(§1)');
        }

        returnSnippet.isLefty = true;

        return returnSnippet;
    }


    compileSelectArrayElementFast(node: ASTSelectArrayElementNode, isLeftSideOfAssignment: boolean,
        arraySnippet: CodeSnippet, indexSnippets: CodeSnippet[], remainingType: JavaType
    ): CodeSnippet | undefined {

        /*
         *  java: 17 + a[3][4]   -> javascript: 17 + __t.ArrayValue2(a, 3, 4)
         *
         *  java: a[4] = 17 -> javascript: (__t.lastCheckedArray = a)[__t.CheckLastIndex(4)] = 17   (__t stores result of __t.Array1(a, 3))
         *  java: a[3][4] = 17 -> javascript: __t.Array1(a, 3)[__t.CheckLastIndex(4)] = 17   (__t stores result of __t.Array1(a, 3))
         *  java: a[3][4][5] = 17 -> javascript: __t.Array2(a, 3, 4)[__t.CheckLastIndex(5)] = 17 (__t stores result of __t.Array2(a, 3, 4))
         */
        let returnSnippet!: CodeSnippet;

        if (isLeftSideOfAssignment) {
            if (indexSnippets.length == 1) {
                returnSnippet = new TwoParameterTemplate(`${Helpers.array0}(§1)[${Helpers.checkLastIndex}(§2, 1)]`).applyToSnippet(remainingType, node.range, arraySnippet, indexSnippets[0]);
            } else {
                let template = "§1";
                for (let i = 0; i < indexSnippets.length - 1; i++) {
                    let range = indexSnippets[i].range || EmptyRange.instance;
                    template = `(${template}[§${i + 2}]??${Helpers.IOBE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))`;
                }

                returnSnippet = new SeveralParameterTemplate(`${Helpers.array0}(${template})[${Helpers.checkLastIndex}(§${indexSnippets.length + 1}, ${indexSnippets.length})]`)
                    .applyToSnippet(remainingType, node.range, arraySnippet, ...indexSnippets);
            }
        } else {
            let template = "§1";
            for (let i = 0; i < indexSnippets.length; i++) {
                let range = indexSnippets[i].range || EmptyRange.instance;
                template = `(${template}[§${i + 2}]??${Helpers.IOBE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))`;
            }

            returnSnippet = new SeveralParameterTemplate(template).applyToSnippet(remainingType, node.range, arraySnippet, ...indexSnippets);
        }

        if (node.parenthesisNeeded) {
            returnSnippet = SnippetFramer.frame(returnSnippet, '(§1)');
        }

        returnSnippet.isLefty = true;

        return returnSnippet;
    }


    /*
     * Helper function for compileNewArrayNode
     *
     */
    private compileDimension(dimensionNode: ASTTermNode): CodeSnippet | undefined {
        let dimensionTerm = this.compileTerm(dimensionNode);

        // if compileTerm failed: insert plausible dummy value to enable further compilation
        let type = dimensionTerm?.type;
        if (!type) return new StringCodeSnippet('1', dimensionNode.range, this.intType);

        let unboxedDimesionTerm = this.unbox(dimensionTerm!);       // type != undefined => dimensionTerm != undefined
        if (unboxedDimesionTerm.type?.isPrimitive) {
            if (unboxedDimesionTerm.type.isUsableAsIndex()) {
                return unboxedDimesionTerm;
            }
        }

        this.pushError(JCM.integerValueExpected(dimensionTerm?.type?.identifier || "---"), "error", dimensionNode);
        return new StringCodeSnippet('1', dimensionNode.range, this.intType);   // return plausible dummy to get on compiling...

    }

    compileNewArrayNode(node: ASTNewArrayNode): CodeSnippet | undefined {
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

    compileArrayLiteral(elementType: JavaType, node: ASTArrayLiteralNode): CodeSnippet | undefined {

        if (node.elements.length == 0) {
            // Empty array gets dimension == -1
            return new StringCodeSnippet("[]", node.range, new JavaArrayType(elementType, 1, this.module, node.range));
        }

        let elementSnippets: CodeSnippet[] = [];

        for (let elementNode of node.elements) {
            if (elementNode.kind == TokenType.arrayLiteral) {
                if (!(elementType instanceof JavaArrayType)) {
                    this.pushError(JCM.arrayLiteralElementDimensionWrong(), "error", node.range);
                    return undefined;
                }
                let snippet = this.compileArrayLiteral(elementType.getElementType(), <ASTArrayLiteralNode>elementNode);
                if (snippet) elementSnippets.push(snippet);
            } else {
                let elementSnippet = this.compileTerm(elementNode);
                if (elementSnippet && elementSnippet.type) {
                    if (this.canCastTo(elementSnippet.type, elementType, "implicit")) {
                        elementSnippet = this.compileCast(elementSnippet, elementType, "implicit");
                        elementSnippets.push(elementSnippet);
                    } else {
                        this.pushError(JCM.cantCastTermTo(elementType.toString()), "error", elementNode.range);
                        return undefined;
                    }
                }
            }
        }

        let type = new JavaArrayType(elementType, 1, this.module, node.range);

        return ParametersJoinedTemplate.applyToSnippet(type, node.range, "[", ", ", "]", ...elementSnippets);

    }

    compileNewArrayWithDefaultElements(elementType: JavaType, node: ASTNewArrayNode): CodeSnippet | undefined {
        let defaultValue = elementType.isPrimitive ? (<PrimitiveType>elementType).defaultValueAsString : "null";

        let maybeUndefinedDimensionTerms: (CodeSnippet | undefined)[] = node.dimensions.map(d => this.compileDimension(d));

        if (maybeUndefinedDimensionTerms.includes(undefined)) return undefined;

        //@ts-ignore
        let dimensionTerms: CodeSnippet[] = maybeUndefinedDimensionTerms;

        let arrayType = new JavaArrayType(elementType, dimensionTerms.length, this.module, node.range);


        let prefix = `${Helpers.newArray}(${defaultValue}, `;
        let suffix = ")";

        return ParametersJoinedTemplate.applyToSnippet(arrayType, node.range, prefix, ', ', suffix, ...dimensionTerms);
    }


    compileSymbolNode(node: ASTSymbolNode, isWriteAccess: boolean): CodeSnippet | undefined {

        // first try: symbol table (parameters, local variables, fields)
        let symbolInformation = this.currentSymbolTable.findSymbol(node.identifier);

        if (symbolInformation) {
            let symbol = symbolInformation.symbol;

            if (symbolInformation.outerClassLevel > 0) this.outerClassFieldAccessTracker.onAccessHappened();


            if (symbol.onStackframe()) {
                this.registerUsagePosition(symbol, node.range);
                if (symbolInformation.outerClassLevel == 0) {
                    this.missingStatementManager.onSymbolAccess(symbol, node.range, this.module.errors, isWriteAccess);
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


        if (type != null && type instanceof NonPrimitiveType) {

            this.registerUsagePosition(type, node.range);

            let staticType = type.staticType;
            return new StringCodeSnippet(`${Helpers.classes}["${type.identifier}"]`, node.range, staticType);
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

        // generate invisible field
        let f: JavaField = new JavaField(symbol.identifier, symbol.identifierRange, this.module, symbol.type, TokenType.keywordPrivate);
        f.isInnerClassCopyOfOuterClassLocalVariable = symbol;
        let klass: JavaClass = <JavaClass>this.currentSymbolTable.classContext;
        klass.fields.push(f);

        let snippet: CodeSnippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}.${f.getInternalName()}`, range, symbol.type);
        snippet.isLefty = false;
        return snippet;
    }

    compileSymbolOnStackframeAccess(symbol: SymbolOnStackframe, range: IRange): CodeSnippet | undefined {
        let type = (<JavaLocalVariable | JavaParameter>symbol).type;
        let snippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(symbol.stackframePosition!)}`, range, type);
        snippet.isLefty = !symbol.isFinal;
        return snippet;
    }

    compileFieldAccess(symbol: BaseSymbol, range: IRange, outerClassLevel: number = 0): CodeSnippet | undefined {
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
            if (outerClassLevel == 0) {   // outerClassLevel > 0 could be inside run-Method or runnable whicht runs on other thread and has other stack than main program
                const snippet = new StringCodeSnippet(`${StepParams.stack}[0].${field.getInternalName()}`, range, field.type);
                snippet.isLefty = !field._isFinal || this.currentSymbolTable.methodContext?.isConstructor && this.currentSymbolTable.classContext == field.classEnum;
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
        //     return new StringCodeSnippet(constantValueAsString, range, type, constantValue);
        // }


        let fieldName = (field).getInternalName();

        let snippet: CodeSnippet;

        if (field._isStatic) {
            let classIdentifier = field.classEnum.identifier;
            snippet = new StringCodeSnippet(`${Helpers.classes}["${classIdentifier}"].${fieldName}`, range, type);
        } else {
            let outerClassPraefix: string = "";
            while (outerClassLevel > 0) {
                outerClassPraefix += "." + Helpers.outerClassAttributeIdentifier;
                outerClassLevel--;
            }

            if (field.template) {
                let objectSnippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}${outerClassPraefix}`, range, type);
                snippet = new OneParameterTemplate(field.template).applyToSnippet(type, range, objectSnippet);
            } else {
                snippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}${outerClassPraefix}.${fieldName}`, range, type);
            }

        }
        snippet.isLefty = !field._isFinal || this.currentSymbolTable.methodContext?.isConstructor && this.currentSymbolTable.classContext == field.classEnum;

        if (field.isInnerClassCopyOfOuterClassLocalVariable) {
            this.registerUsagePosition(field.isInnerClassCopyOfOuterClassLocalVariable, range);
        } else {
            this.registerUsagePosition(field, range);
        }

        return snippet;
    }


    compileLiteralNode(node: ASTLiteralNode): CodeSnippet | undefined {
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

        let snippet = new StringCodeSnippet(valueAsString, node.range, type, node.value);

        return snippet;
    }

    compileBinaryOperator(ast: ASTBinaryNode): CodeSnippet | undefined {

        if (ast.operator == TokenType.ternaryOperator) return this.compileTernaryOperator(ast);

        let leftOperand = this.compileTerm(ast.leftSide, this.isAssignmentOperator(ast.operator));
        if (ast.operator == TokenType.and) {
            ast.instanceofVariables = ast.leftSide.instanceofVariables;
            ast.negatedInstanceofVariables = ast.leftSide.negatedInstanceofVariables;
            if (ast.rightSide) {
                ast.rightSide.instanceofVariables = ast.instanceofVariables;
            }
        }

        let rightOperand: CodeSnippet | undefined;
        if (ast.rightSide) {
            if (ast.rightSide?.instanceofVariables) {
                this.pushAndGetNewSymbolTable(ast.rightSide.range, false);
                ast.rightSide.instanceofVariables.forEach(v => this.currentSymbolTable.addSymbolWithoutAddingToStackframe(v));
            }
            rightOperand = ast.rightSide?.kind == TokenType.lambdaOperator ? this.compileLambdaFunction(<ASTLambdaFunctionDeclarationNode>ast.rightSide, leftOperand?.type) : this.compileTerm(ast.rightSide);
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
    compileTernaryOperator(ast: ASTBinaryNode): CodeSnippet | undefined {
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

        if (firstAlternative.type == this.voidType && secondAlternative.type == this.voidType) {
            let ifSnippet = new CodeSnippetContainer([], ast.range);

            let sn1 = SnippetFramer.frame(leftOperand, "if(§1){\n", this.voidType, leftOperand.range);
            let label1 = new LabelCodeSnippet();
            ifSnippet.addParts(sn1);
            let jumpToLabel1 = new JumpToLabelCodeSnippet(label1);
            ifSnippet.addParts(jumpToLabel1);
            ifSnippet.addStringPart("}\n");

            ifSnippet.addNextStepMark();

            let label2 = new LabelCodeSnippet();
            let jumpToLabel2 = new JumpToLabelCodeSnippet(label2);
            
            ifSnippet.addParts(secondAlternative);

            ifSnippet.addParts(jumpToLabel2);
            ifSnippet.addNextStepMark();

            ifSnippet.addParts(label1);
            ifSnippet.addParts(firstAlternative);

            ifSnippet.addParts(label2);
            ifSnippet.addNextStepMark();

            return ifSnippet;

        } else {
            return new SeveralParameterTemplate(`((§1) ? (§2) : (§3) )`).applyToSnippet(destType, ast.range, leftOperand, firstAlternative, secondAlternative);
        }


    }

    compileUnaryPrefixOperator(ast: ASTUnaryPrefixNode): CodeSnippet | undefined {

        let operand = this.compileTerm(ast.term);
        if (ast.operator == TokenType.not) {
            ast.instanceofVariables = ast.term?.negatedInstanceofVariables;
            ast.negatedInstanceofVariables = ast.term?.instanceofVariables;
        }

        return this.compileUnaryOperator(operand, ast.operator);

    }

    compilePlusPlusMinusMinusSuffixOperator(ast: ASTPlusPlusMinusMinusSuffixNode): CodeSnippet | undefined {
        let operand = this.compileTerm(ast.term, true);

        if (operand && operand.type) {

            if (!operand.isLefty) {
                this.pushError(JCM.plusPlusMinusMinusOnlyForVariables(), "error", ast);
                return undefined;
            }

            if (this.hasBoxedType(operand)) {
                if (["Double", "Float", "Integer", "Byte"].indexOf(operand.type.identifier) >= 0) {
                    let template: CodeTemplate = ast.operator == TokenType.plusPlus ? new OneParameterTemplate(`${Helpers.checkNPE('§1', operand.range)}.value++`) : new OneParameterTemplate(`${Helpers.checkNPE('§1', operand.range)}.value--`);

                    return template.applyToSnippet(this.getUnboxedType(operand.type), ast.range, operand);
                }
            }

            if (!this.isNumberPrimitiveType(operand.type)) {
                this.pushError(JCM.plusPlusMinusMinusOnlyForTypes(), "error", ast);
            }

            let template: CodeTemplate = ast.operator == TokenType.plusPlus ? new OneParameterTemplate("§1++") : new OneParameterTemplate("§1--");

            return template.applyToSnippet(operand.type, ast.range, operand);
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

    compileDereferenceAttribute(node: ASTAttributeDereferencingNode): CodeSnippet | undefined {

        let objectSnippet = this.compileTerm(node.nodeToGetObject);
        if (!objectSnippet || !objectSnippet.type) return undefined;
        let range = node.range;

        if (objectSnippet.isSuperKeywordWithLevel && node.attributeIdentifier == "super") {
            objectSnippet.isSuperKeywordWithLevel++;
            objectSnippet.type = (<IJavaClass>objectSnippet.type).getExtends();
            return objectSnippet;
        }

        if (objectSnippet.type instanceof JavaArrayType) {
            if (node.attributeIdentifier != 'length') {
                this.pushError(JCM.arraysOnlyHaveLengthField(node.attributeIdentifier), "error", node);
                return undefined;
            }
            return new OneParameterTemplate(`(§1 || ${Helpers.throwNPE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn})).length`)
                .applyToSnippet(this.intType, range, objectSnippet);
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
            if (innerType) return new StringCodeSnippet(`${Helpers.classes}["${innerType.pathAndIdentifier}"]`, node.range, innerType.staticType);
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
                return new StringCodeSnippet(`${Helpers.classes}["SpriteLibrary"].getSpriteLibrary(${id}, "${node.attributeIdentifier}")`, node.range, enumType);
            }
        }

        if (field._isFinal && field.initialValueIsConstant && !isEnum) {
            let constantValue = field.initialValue!;
            let constantValueAsString = typeof constantValue == "string" ? `"${constantValue}"` : "" + constantValue;
            return new StringCodeSnippet(constantValueAsString, range, field.type, constantValue);
        }


        if (field._isStatic) {
            let classIdentifier = field.classEnum.pathAndIdentifier;
            if (field.template) {
                let code = field.template.replace("§1", `${Helpers.classes}["${classIdentifier}"]`);
                let snippet = new StringCodeSnippet(code, range, field.type);
                snippet.isLefty = false;
                return snippet;
            } else {
                let snippet = new StringCodeSnippet(`${Helpers.classes}["${classIdentifier}"].${field.getInternalName()}`, range, field.type);
                snippet.isLefty = !field._isFinal;
                return snippet;
            }
        } else {
            let template: string = objectSnippet.type instanceof JavaEnum ? `§1` : `(§1 || ${Helpers.throwNPE}(${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))`;

            if (field.template) {
                let objSnippet1 = new OneParameterTemplate(template).applyToSnippet(objectSnippet.type, objectSnippet.range!, objectSnippet);
                let snippet = new OneParameterTemplate(field.template).applyToSnippet(field.type, range, objSnippet1);
                snippet.isLefty = !field._isFinal;

                return snippet;
            } else {
                let snippet = new OneParameterTemplate(`${template}.${field.getInternalName()}`)
                    .applyToSnippet(field.type, range, objectSnippet);
                snippet.isLefty = !field._isFinal;

                return snippet;
            }

        }


    }

    getParameterValueSnippets(methodCallNode: ASTMethodCallNode | ASTNewObjectNode): { snippets: (CodeSnippet | undefined)[], withErrors: boolean } {
        let snippets: (CodeSnippet | undefined)[] = [];
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
    // a) catch type paramters inside types to get actual types for them
    // b) make sure all catches for one type parameter deliver the same type
    // c) compute actual type for return parameter

    compileMethodCall(node: ASTMethodCallNode): CodeSnippet | undefined {

        let pv = this.getParameterValueSnippets(node);
        let parameterValueSnippets = pv.snippets;

        let methodIsConstructor = false;
        if (node.nodeToGetObject && [TokenType.keywordThis, TokenType.keywordSuper].indexOf(node.nodeToGetObject?.kind) >= 0) {
            if (node.identifier == "") {
                methodIsConstructor = true;
            }
        }

        let objectSnippet: CodeSnippet | undefined;
        if (node.nodeToGetObject) {
            objectSnippet = this.compileTerm(node.nodeToGetObject);
            if (!objectSnippet) return undefined;
            let range = node.nodeToGetObject.range;
            if (
                // !(objectSnippet.type instanceof JavaEnum) &&
                // objectSnippet.type != this.stringType &&
                !(objectSnippet.type instanceof StaticNonPrimitiveType) && !objectSnippet.isSuperKeywordWithLevel) {
                objectSnippet = SnippetFramer.frame(objectSnippet, `${Helpers.checkNPE('§1', range)}`);
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
            objectSnippet = new StringCodeSnippet(`${Helpers.elementRelativeToStackbase(0)}`, EmptyRange.instance, classContext);
        }

        if (!objectSnippet || !objectSnippet.type) {
            return undefined;
        }

        let methods = this.searchMethod(node.identifier, objectSnippet.type, parameterValueSnippets.map(p => p?.type), methodIsConstructor,
            objectSnippet.type instanceof StaticNonPrimitiveType, true, node.identifierRange);
        if ((<NonPrimitiveType>objectSnippet.type).isMainClass && !methods.best) {
            let globalMethod = this.searchGlobalMethod(node.identifier, parameterValueSnippets.map(p => p?.type), node.identifierRange);
            if (globalMethod) {
                methods.best = globalMethod.method;
                objectSnippet = new StringCodeSnippet(`${Helpers.classes}["${globalMethod.staticMainClass.identifier}"]`, node.identifierRange, globalMethod.staticMainClass);
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
            methods = this.searchMethod(node.identifier, this.assertionsType, parameterValueSnippets.map(p => p?.type), false, objectSnippet instanceof StaticNonPrimitiveType, true, node.identifierRange);
            method = methods?.best;
        }

        let outerTypeTemplate: string = "";
        // access method of outer type from inner-class method?
        if (!method && !node.nodeToGetObject && this.currentSymbolTable.classContext?.outerType) {
            let outerType: NonPrimitiveType | StaticNonPrimitiveType | undefined = this.currentSymbolTable.classContext?.outerType;
            while (outerType && outerType instanceof NonPrimitiveType) {
                outerTypeTemplate += "." + Helpers.outerClassAttributeIdentifier;
                methods = this.searchMethod(node.identifier, outerType, parameterValueSnippets.map(p => p?.type), false, objectSnippet instanceof StaticNonPrimitiveType, true, node.identifierRange);
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
            let invisibleMethod = this.searchMethod(node.identifier, objectSnippet.type, parameterValueSnippets.map(p => p?.type), false, objectSnippet.type instanceof StaticNonPrimitiveType, false, node.identifierRange).best;

            if (invisibleMethod) {
                this.pushError(JCM.methodHasWrongVisibility(node.identifier, TokenTypeReadable[invisibleMethod.visibility]), "error", node);
            } else {
                this.pushError(JCM.cantFindMethod(), "error", node.range);
            }
            return undefined;
        }

        this.registerUsagePosition(method, node.identifierRange);

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
            let allParametersConstant: boolean = !parameterValueSnippets.some(v => !v!.isConstant())
            if (allParametersConstant && (method.isStatic || objectSnippet.isConstant())) {
                let constantValues = parameterValueSnippets.map(p => p!.getConstantValue());
                let result = method.isStatic ? method.constantFoldingFunction(...constantValues) : method.constantFoldingFunction(objectSnippet.getConstantValue(), ...constantValues);

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

                return new StringCodeSnippet(resultAsString, node.range, returnParameterType, result);
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
                return new SeveralParameterTemplate(method.template).applyToSnippet(returnParameterType, node.range, ...(<CodeSnippet[]>parameterValueSnippets));
            } else if (callingConvention == "native") {
                return new SeveralParameterTemplate(method.template).applyToSnippet(returnParameterType, node.range, objectSnippet, ...(<CodeSnippet[]>parameterValueSnippets));
            }
        }


        let objectTemplate: string;
        if (objectSnippet.type instanceof StaticNonPrimitiveType) {
            objectTemplate = `§1.${method.getInternalNameWithGenericParameterIdentifiers(callingConvention)}(`
        } else if (objectSnippet.isSuperKeywordWithLevel && !method.isConstructor) {   // constructors of class and base class have distinct names as they include class identifier
            let classIdentifier = (<IJavaClass>objectSnippet.type).pathAndIdentifier;
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

        parameterValueSnippets.unshift(objectSnippet);


        let snippet = new SeveralParameterTemplate(objectTemplate).applyToSnippet(returnParameterType, node.range, ...(<CodeSnippet[]>parameterValueSnippets));
        snippet.finalValueIsOnStack = false;

        if (callingConvention == "java") {
            if (!snippet.endsWith(";\n")) snippet = new CodeSnippetContainer(SnippetFramer.frame(snippet, '§1;\n'));
            (<CodeSnippetContainer>snippet).addNextStepMark();
            if (returnParameterType != this.voidType) snippet.finalValueIsOnStack = true;
        }

        return snippet;
    }

    /**
     *
     */
    searchGlobalMethod(identifier: string, parameterTypes: JavaType[], methodCallRange: IRange): { method: JavaMethod, staticMainClass: StaticNonPrimitiveType } | undefined {
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

    registerCodeReachedAssertion(node: ASTMethodCallNode, parameterValues: (CodeSnippet | undefined)[]): CodeSnippet | undefined {
        if (parameterValues.length != 1 || parameterValues[0]?.type != this.stringType || !parameterValues[0].isConstant()) {
            this.pushError(JCM.assertCodeReachedNeedsStringParameter(), "error", node);
            return undefined;
        }
        let message = <string>parameterValues[0].getConstantValue();
        let codeReachedAssertion = new CodeReacedAssertion(message, this.module, node.range);
        this.module.codeReachedAssertions.registerAssertion(codeReachedAssertion);

        return new StringCodeSnippet(`${Helpers.registerCodeReached}("${codeReachedAssertion.key}")`, node.range);
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

            // The next line is commented out because it's possible that there are catches that are not catched yet,
            // for example public <U> Optional<U> map(Function<T,U> f)
            // When f is a lambda function then U is return parameter of it and therefore
            // only catched after lambda function has been compiled.
            // let errors = bestMethodSoFar.checkCatches(methodCallPosition);




            // TODO!

            // if (errors.length > 0) {
            //     this.module.errors.push(...errors);
            //     return { best: undefined, possible: possibleMethods };
            // }

            return { best: bestMethodSoFar.getNonGenericCopyWithConcreteTypes(), possible: possibleMethods };

        }

        return { best: undefined, possible: possibleMethods };
    }


}
