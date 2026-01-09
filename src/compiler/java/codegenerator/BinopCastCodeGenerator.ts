import { DefaultValueSettingsStore, SettingsStore } from "../../../client/settings/SettingsStore.ts";
import { ErrormessageWithId } from "../../../tools/language/LanguageManager";
import { BaseSymbol } from "../../common/BaseSymbolTable.ts";
import { Error, ErrorLevel, QuickFix } from "../../common/Error";
import { Helpers, StepParams } from "../../common/interpreter/StepFunction";
import { EmptyRange, IRange } from "../../common/range/Range";
import { CompilingProgressManager } from "../CompilingProgressManager";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { JCM } from "../language/JavaCompilerMessages";
import { JavaCompiledModule } from "../module/JavaCompiledModule";
import { JavaTypeStore } from "../module/JavaTypeStore";
import { JavaLibraryModule } from "../module/libraries/JavaLibraryModule.ts";
import { ASTAnonymousClassNode, ASTBinaryNode, ASTBracketNode, ASTLambdaFunctionDeclarationNode, ASTNode, ASTTermNode, ASTUnaryPrefixNode, AssignmentOperator, BinaryOperator, ConstantType, LogicOperator } from "../parser/AST";
import { PrimitiveStringClass } from "../runtime/system/javalang/PrimitiveStringClass";
import { StringPrimitiveType } from "../runtime/system/primitiveTypes/StringPrimitiveType";
import { JavaArrayType } from "../types/JavaArrayType";
import { JavaClass } from "../types/JavaClass";
import { JavaInterface } from "../types/JavaInterface";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import { CodeSnippet, ConstantValue, StringCodeSnippet } from "./CodeSnippet";
import { CodeSnippetContainer } from "./CodeSnippetKinds";
import { SnippetFramer } from "./CodeSnippetTools";
import { BinaryOperatorTemplate, OneParameterTemplate, TwoParameterTemplate } from "./CodeTemplate";
import { JavaLocalVariable } from "./JavaLocalVariable.ts";
import { JavaSymbolTable } from "./JavaSymbolTable.ts";
import { LabelCodeSnippet } from "./LabelManager";

var nOtherClass = 0, nVoid = 1, nBoolean = 2, nChar = 3, nByte = 4, nShort = 5, nInteger = 6, nLong = 7, nFloat = 8, nDouble = 9, nString = 10;

var canCastImplicit: boolean[][] = [
    /*otherClass to ...*/[false, false, false /* boolean */, false, false /* byte */, false, false, false, false, false, false],
    /*void to ...      */[false, true, false /* boolean */, false, false /* byte */, false, false, false, false, false, false],
    /*boolean to ...   */[false, false, true /* boolean */, false, false /* byte */, false, false, false, false, false, false],
    /*char to ...      */[false, false, false /* boolean */, true, true /* byte */, true, true, true, true, true, true],
    /*byte to ...      */[false, false, false /* boolean */, false, true /* byte */, true, true, true, true, true, false],
    /*short to ...     */[false, false, false /* boolean */, false, false /* byte */, true, true, true, true, true, false],
    /*int to ...       */[false, false, false /* boolean */, false, false /* byte */, false, true, true, true, true, false],
    /*long to ...      */[false, false, false /* boolean */, false, false /* byte */, false, false, true, true, true, false],
    /*float to ...     */[false, false, false /* boolean */, false, false /* byte */, false, false, false, true, true, false],
    /*double to ...     */[false, false, false /* boolean */, false, false /* byte */, false, false, false, false, true, false],
    /*string to ...     */[false, false, false /* boolean */, false, false /* byte */, false, false, false, false, false, true]
];

var primitiveTypeIdentifiers: string[] = ["", "void", "boolean", "char", "byte", "short", "int", "long", "float", "double", "string"];
var boxedTypeIdentifiers: string[] = ["", "", "Boolean", "Character", "Byte", "Short", "Integer", "Long", "Float", "Double", "String"];

var boxedTypesMap: { [identifier: string]: number | undefined } = {
    "Boolean": nBoolean,
    "Character": nChar,
    "Byte": nByte,
    "Short": nShort,
    "Integer": nInteger,
    "Long": nLong,
    "Float": nFloat,
    "Double": nDouble,
    "String": nString,
}

var primitiveTypeMap: { [identifier: string]: number | undefined } = {
    "void": nVoid,
    "boolean": nBoolean,
    "char": nChar,
    "byte": nByte,
    "short": nShort,
    "int": nInteger,
    "long": nLong,
    "float": nFloat,
    "double": nDouble,
    "string": nString
}

var assignmentOperators: TokenType[] = [TokenType.assignment, TokenType.plusAssignment, TokenType.minusAssignment, TokenType.multiplicationAssignment, TokenType.divisionAssignment, TokenType.moduloAssignment];
var logicOperators: TokenType[] = [TokenType.and, TokenType.or, TokenType.XOR];
var shiftOperators: TokenType[] = [TokenType.shiftLeft, TokenType.shiftRight, TokenType.shiftRightUnsigned];
var plusMinusMultDivAssignmentOperators: TokenType[] = [TokenType.plusAssignment, TokenType.minusAssignment, TokenType.multiplicationAssignment, TokenType.divisionAssignment, TokenType.moduloAssignment, TokenType.assignment];
var comparisonOperators: TokenType[] = [TokenType.lower, TokenType.greater, TokenType.lowerOrEqual, TokenType.greaterOrEqual, TokenType.notEqual, TokenType.equal];


export abstract class BinopCastCodeGenerator {

    progressManager!: CompilingProgressManager;

    voidType: JavaType;
    charType: JavaType;
    intType: JavaType;
    floatType: JavaType;
    doubleType: JavaType;
    booleanType: JavaType;
    stringType: JavaType;
    nullType: JavaType;
    throwableType: JavaType;
    objectType: JavaClass;
    assertionsType: JavaClass;
    stringNonPrimitiveType: JavaClass;
    iterableType: JavaInterface;
    iteratorType: JavaInterface;

    primitiveStringClass = PrimitiveStringClass;

    primitiveTypes: JavaType[] = [];

    currentSymbolTable!: JavaSymbolTable;

    symbolTableStack: JavaSymbolTable[] = [];

    settingStore: SettingsStore;


    constructor(protected module: JavaCompiledModule,
        protected libraryTypestore: JavaTypeStore,
        protected compiledTypesTypestore: JavaTypeStore,
        settingsStore?: SettingsStore) {

        this.settingStore = settingsStore || new DefaultValueSettingsStore();

        this.voidType = this.libraryTypestore.getType("void")!;
        this.charType = this.libraryTypestore.getType("char")!;
        this.intType = this.libraryTypestore.getType("int")!;
        this.floatType = this.libraryTypestore.getType("float")!;
        this.doubleType = this.libraryTypestore.getType("double")!;
        this.booleanType = this.libraryTypestore.getType("boolean")!;
        this.stringType = this.libraryTypestore.getType("string")!;
        this.nullType = this.libraryTypestore.getType("null")!;
        this.throwableType = this.libraryTypestore.getType("Throwable")!;
        this.objectType = <JavaClass>this.libraryTypestore.getType("Object")!;
        this.stringNonPrimitiveType = <JavaClass>this.libraryTypestore.getType("String")!;
        this.assertionsType = <JavaClass>this.libraryTypestore.getType("Assertions")!;
        this.iterableType = <JavaInterface>this.libraryTypestore.getType("Iterable")!;
        this.iteratorType = <JavaInterface>this.libraryTypestore.getType("Iterator")!;

        this.primitiveTypes.push(this.voidType);  // dummy for "otherClass"
        for (let i = 1; i < primitiveTypeIdentifiers.length; i++) this.primitiveTypes.push(this.libraryTypestore.getType(primitiveTypeIdentifiers[i])!);

    }

    compileBinaryOperation(leftSnippet: CodeSnippet, rightSnippet: CodeSnippet, ast: ASTBinaryNode): CodeSnippet | undefined {
        if (!leftSnippet || !rightSnippet) return leftSnippet; // there had been an error before...

        if (!leftSnippet.type) {
            this.pushError(JCM.typeLeftOperandNotFound(), "error", leftSnippet.range!);
            return undefined;
        }

        if (!rightSnippet.type) {
            this.pushError(JCM.typeRightOperandNotFound(), "error", rightSnippet.range!);
            return undefined;
        }

        let operator: BinaryOperator | AssignmentOperator = ast.operator;
        let operatorRange: IRange = ast.operatorRange;
        let wholeRange: IRange = ast.range;

        if (operator == TokenType.keywordInstanceof) {
            return this.compileInstanceOf(leftSnippet, rightSnippet, ast);
        }

        let leftType: JavaType = leftSnippet.type;
        let rightType: JavaType = rightSnippet.type;


        let lIdentifier = leftType.identifier;
        let rIdentifier = rightType.identifier;
        let lWrapperIndex = boxedTypesMap[lIdentifier];
        let rWrapperIndex = boxedTypesMap[rIdentifier];
        let lTypeIndex: number = lWrapperIndex || primitiveTypeMap[lIdentifier] || nOtherClass;
        let rTypeIndex: number = rWrapperIndex || primitiveTypeMap[rIdentifier] || nOtherClass;

        let operatorIdentifier = TokenTypeReadable[operator];

        if (this.anyOperandHasVoidType(lTypeIndex, rTypeIndex, operator, operatorRange)) return undefined;

        if (assignmentOperators.indexOf(operator) >= 0) return this.compileAssignment(leftSnippet, rightSnippet, lTypeIndex, rTypeIndex, lIdentifier, rIdentifier, <AssignmentOperator>operator, operatorRange, wholeRange);

        // unbox if necessary
        // don't unbox when comparing boxed value to null.
        if (lWrapperIndex && rightSnippet.getConstantValue() !== null) leftSnippet = this.unbox(leftSnippet);
        if (rWrapperIndex && leftSnippet.getConstantValue() !== null) rightSnippet = this.unbox(rightSnippet);

        if (operator == TokenType.equal || operator == TokenType.notEqual) {
            if (leftType == this.nullType && (!rightType.isPrimitive || rightType == this.stringType)
                || rightType == this.nullType && (!leftType.isPrimitive || leftType == this.stringType)) {
                return new BinaryOperatorTemplate(operatorIdentifier, true).applyToSnippet(this.booleanType, wholeRange, leftSnippet, rightSnippet);
            }

            if (lTypeIndex == 0 && rTypeIndex != 0 || lTypeIndex != 0 && rTypeIndex == 0) {
                this.pushError(JCM.badOperandTypesForBinaryOperator(TokenTypeReadable[operator], leftType.toString(), rightType.toString()), "error", operatorRange);
                return undefined;
            }

            return new BinaryOperatorTemplate(operatorIdentifier, true).applyToSnippet(this.booleanType, wholeRange, leftSnippet, rightSnippet);
        }

        // both operators are unboxed and operation is not in [==, !=]
        if (lTypeIndex == nString || rTypeIndex == nString) return this.compileBinaryOperationWithStrings(leftSnippet, rightSnippet, lTypeIndex, rTypeIndex, lIdentifier, rIdentifier, <LogicOperator>operator, operatorRange, wholeRange);
        if (lTypeIndex == nOtherClass || rTypeIndex == nOtherClass) {
            this.pushError(JCM.operatorNotFeasibleForOperands(operatorIdentifier, lIdentifier, rIdentifier), "error", operatorRange);
        }

        // now both types are in [boolean, char, byte, short, int, long, float, double]
        if (logicOperators.indexOf(operator) >= 0) return this.compileLogicOperation(leftSnippet, rightSnippet, lTypeIndex, rTypeIndex, lIdentifier, rIdentifier, <LogicOperator>operator, operatorRange, wholeRange)
        if (lTypeIndex == nBoolean || rTypeIndex == nBoolean) {
            this.pushError(JCM.operatorNotFeasibleForOperands(operatorIdentifier, lIdentifier, rIdentifier), "error", operatorRange);
        }

        // now both types are in [char, byte, short, int, long, float, double]
        // operators are +, -, *, /, %, ShiftOperations and ComparisonOperations but not == or !=

        // char +*/% integer => integer
        if (lTypeIndex == nChar) {
            leftSnippet = this.convertCharToNumber(leftSnippet);
            lTypeIndex = nInteger;
        }
        if (rTypeIndex == nChar) {
            rightSnippet = this.convertCharToNumber(rightSnippet);
            rTypeIndex = nInteger;
        }

        // now both types are in [byte, short, int, long, float, double]
        if (comparisonOperators.indexOf(operator) >= 0) return new BinaryOperatorTemplate(operatorIdentifier, false).applyToSnippet(this.booleanType, wholeRange, leftSnippet, rightSnippet);


        // now both types are in [byte, short, int, long, float, double]
        // operators are +, -, *, /, %, ShiftOperations
        if (shiftOperators.indexOf(operator) >= 0) {
            if (lTypeIndex >= nFloat || rTypeIndex >= nFloat) {
                this.pushError(JCM.operatorNotFeasibleForOperands(operatorIdentifier, lIdentifier, rIdentifier), "error", operatorRange);
                return undefined;
            }
            return new BinaryOperatorTemplate(operatorIdentifier, false).applyToSnippet(leftType, wholeRange, leftSnippet, rightSnippet);
        }

        // now both types are in [byte, short, int, long, float, double]
        // operators are +, -, *, /, %
        let resultType = this.primitiveTypes[Math.max(lTypeIndex, rTypeIndex)];
        return new BinaryOperatorTemplate(operatorIdentifier, false).applyToSnippet(resultType, wholeRange, leftSnippet, rightSnippet);

    }

    compileInstanceOf(leftSnippet: CodeSnippet, rightSnippet: CodeSnippet, ast: ASTBinaryNode): CodeSnippet | undefined {
        let leftType = leftSnippet.type!;
        let rightType = rightSnippet.type!;

        if (!(rightType instanceof StaticNonPrimitiveType)) {
            this.pushError(JCM.rightSideOfInstanceofError(), "error", ast.operatorRange);
            return undefined;
        }

        if (!(leftType instanceof NonPrimitiveType)) {
            this.pushError(JCM.leftSideOfInstanceofError(), "error", ast.operatorRange);
            return undefined;
        }

        let stackFramePositionString: string = "";
        if (ast.instanceofPatternIdentifier) {
            let patternVariable: JavaLocalVariable = new JavaLocalVariable(ast.instanceofPatternIdentifier, ast.instanceofPatternIdentifierRange, rightType.nonPrimitiveType, this.currentSymbolTable);
            patternVariable.isFinal = true;
            this.registerUsagePosition(patternVariable, ast.instanceofPatternIdentifierRange);

            this.currentSymbolTable.getStackFrame().addSymbol(patternVariable, "localVariable");
            stackFramePositionString = ", " + StepParams.stackBase + " + " + patternVariable.stackframePosition;
            if (!ast.instanceofVariables) {
                ast.instanceofVariables = [];
            }
            ast.instanceofVariables.push(patternVariable)
        }

        return SnippetFramer.frame(leftSnippet, `${Helpers.instanceof}(§1, "${(<StaticNonPrimitiveType>rightType).nonPrimitiveType.pathAndIdentifier}"${stackFramePositionString})`
            , this.booleanType)

    }



    /**
     * now both types are in [boolean, char, byte, short, int, long, float, double]
     * operation is in &&, ||, ^ ( means: XOR)
     */
    compileLogicOperation(leftSnippet: CodeSnippet, rightSnippet: CodeSnippet, lTypeIndex: number, rTypeIndex: number, lIdentifier: string, rIdentifier: string, operator: LogicOperator, operatorRange: IRange, wholeRange: IRange): CodeSnippet | undefined {
        if (lTypeIndex != nBoolean || rTypeIndex != nBoolean) {
            this.pushError(JCM.operatorNotFeasibleForOperands(TokenTypeReadable[operator], lIdentifier, rIdentifier), "error", operatorRange);
            return undefined;
        }

        let bothSnippetsAreConstant = leftSnippet.isConstant() && rightSnippet.isConstant();

        if (operator == TokenType.XOR || bothSnippetsAreConstant) return new BinaryOperatorTemplate("^", false).applyToSnippet(this.booleanType, wholeRange, leftSnippet, rightSnippet);

        /*
        * lazy and/or
        */
        // pure Term without pop => javascript interpreter does lazy evaluation for us:
        if (leftSnippet.isPureTermWithoutPop() && rightSnippet.isPureTermWithoutPop()) return new BinaryOperatorTemplate(TokenTypeReadable[operator], false).applyToSnippet(this.booleanType, wholeRange, leftSnippet, rightSnippet);

        // ... otherwise we have to model lazy evaluation ourselves:
        let snippetContainer = new CodeSnippetContainer([], wholeRange, this.booleanType);

        leftSnippet.ensureFinalValueIsOnStack();
        snippetContainer.addParts(leftSnippet);

        let label = new LabelCodeSnippet();
        if (operator == TokenType.and) {
            snippetContainer.addStringPart(`if(!${StepParams.stack}.pop()){${StepParams.stack}.push(false);`, EmptyRange.instance);
        } else {
            snippetContainer.addStringPart(`if(${StepParams.stack}.pop()){${StepParams.stack}.push(true);`, EmptyRange.instance);
        }

        snippetContainer.addParts(label.getJumpToSnippet());
        snippetContainer.addStringPart('};', EmptyRange.instance);

        snippetContainer.addNextStepMark();

        rightSnippet.ensureFinalValueIsOnStack();
        snippetContainer.addParts(rightSnippet);

        snippetContainer.addNextStepMark();

        snippetContainer.addParts(label);

        snippetContainer.finalValueIsOnStack = true;

        return snippetContainer;


    }

    /**
     * one of the operands is of type string
     * both operators are unboxed and operation is not in [==, !=]
     */
    compileBinaryOperationWithStrings(leftSnippet: CodeSnippet, rightSnippet: CodeSnippet, lTypeIndex: number, rTypeIndex: number, lIdentifier: string, rIdentifier: string, operator: BinaryOperator, operatorRange: IRange, wholeRange: IRange): CodeSnippet | undefined {
        if (operator != TokenType.plus && comparisonOperators.indexOf(operator) < 0) {
            this.pushError(JCM.operatorNotFeasibleForOperands(TokenTypeReadable[operator], lIdentifier, rIdentifier), "error", operatorRange);
            return undefined;
        }

        if (lTypeIndex == nOtherClass) leftSnippet = this.wrapWithToStringCall(leftSnippet, "string");
        if (rTypeIndex == nOtherClass) rightSnippet = this.wrapWithToStringCall(rightSnippet, "string");

        let returnType: JavaType = operator == TokenType.plus ? this.stringType : this.booleanType;

        return new BinaryOperatorTemplate(TokenTypeReadable[operator], false).applyToSnippet(returnType, wholeRange, leftSnippet, rightSnippet);

    }

    wrapWithArrayToString(source: CodeSnippet, primitiveOrClassNeeded: "string" | "String"): CodeSnippet {
        let newSnippet1: CodeSnippet;

        if ((<JavaArrayType>source.type!).elementType.isPrimitive) {
            newSnippet1 = SnippetFramer.frame(source, `${Helpers.primitiveArrayToString}(§1)`);
        } else {

            let newSnippet2 = SnippetFramer.frame(source, `${Helpers.objectArrayToString}(§1);\n`);
            newSnippet2.finalValueIsOnStack = true;

            let newSnippet3 = new CodeSnippetContainer([newSnippet2]);
            newSnippet3.addNextStepMark();
            newSnippet1 = newSnippet3;
        }

        if (primitiveOrClassNeeded == "String") {
            newSnippet1 = SnippetFramer.frame(newSnippet1, `new ${Helpers.classes}["String"](§1)`);
            newSnippet1.type = this.stringNonPrimitiveType;
        }

        return newSnippet1;
    }

    wrapWithToStringCall(leftSnippet: CodeSnippet, primitiveOrClassNeeded: "string" | "String"): CodeSnippet {
        if (leftSnippet.type?.identifier == "String") {
            if (primitiveOrClassNeeded == "string") {
                return SnippetFramer.frame(leftSnippet, `${Helpers.nullstringIfNull}(§1)`, this.stringType);
            } else {
                return leftSnippet;
            }
        }

        if (leftSnippet.type?.identifier == "string") {
            if (primitiveOrClassNeeded == "String") {
                return SnippetFramer.frame(leftSnippet, `new ${Helpers.classes}["String"](§1)`, this.stringType);
            } else {
                return leftSnippet;
            }
        }

        if (leftSnippet.isConstant()) {
            let value = leftSnippet.getConstantValue();
            if (primitiveOrClassNeeded == "string") {
                return new StringCodeSnippet('', leftSnippet.range, this.stringType, value);
            } else {
                if (value === null) {
                    leftSnippet.type = this.stringNonPrimitiveType;
                    return leftSnippet;
                }
                return new StringCodeSnippet(`new ${Helpers.classes}["String"]("${"" + value}")`, leftSnippet.range, this.stringNonPrimitiveType);
            }
        }


        // let newSnippet1 = SnippetFramer.frame(leftSnippet, `${Helpers.checkNPE('§1', leftSnippet.range!)}._mj$toString$String$(__t, undefined);\n`, this.stringNonPrimitiveType);
        let newSnippet1 = SnippetFramer.frame(leftSnippet, `${Helpers.toString}(__t, undefined, §1);\n`, this.stringNonPrimitiveType);
        newSnippet1.finalValueIsOnStack = true;
        let newSnippet2 = new CodeSnippetContainer(newSnippet1);
        newSnippet2.addNextStepMark();

        if (primitiveOrClassNeeded == "string") {
            let newSnippet3 = SnippetFramer.frame(newSnippet2, `(§1 ||${Helpers.classes}["String"].null).value`, this.stringType);
            return newSnippet3;
        } else {
            return newSnippet2;
        }

    }



    /**
     * No operand is void type;
     * operator is any assignment operator (=, +=, -=, /=, *=, %=)
     */
    compileAssignment(leftSnippet: CodeSnippet, rightSnippet: CodeSnippet, lTypeIndex: number, rTypeIndex: number, lIdentifier: string, rIdentifier: string, operator: BinaryOperator, operatorRange: IRange, wholeRange: IRange): CodeSnippet | undefined {

        if (!leftSnippet.isLefty) {
            this.pushError(JCM.cantAssignValueToTerm(), "error", operatorRange);
            return;
        }

        let operatorAsString = TokenTypeReadable[operator];

        if (operator == TokenType.assignment) {
            if (this.canCastTo(rightSnippet.type, leftSnippet.type, "implicit")) {
                rightSnippet = this.compileCast(rightSnippet, leftSnippet.type!, "implicit");
            } else {
                this.pushError(JCM.cantCastType(rightSnippet.type!.identifier, leftSnippet.type!.identifier), "error", rightSnippet.range!);
            }
            return new BinaryOperatorTemplate(operatorAsString, false).applyToSnippet(leftSnippet.type!, wholeRange, leftSnippet, rightSnippet);
        }

        if (!leftSnippet.type!.isPrimitive) {
            if (leftSnippet.type == this.stringNonPrimitiveType && operator == TokenType.plusAssignment) {
                if (!this.canCastTo(rightSnippet.type, this.stringType, "implicit")) {
                    this.pushError(JCM.cantCastRightSideToString(), "error", rightSnippet.range!);
                    return undefined;
                }
                rightSnippet = this.compileCast(rightSnippet, this.stringType, "implicit");
                return new TwoParameterTemplate(`§1 = ${Helpers.checkNPE('§1', leftSnippet.range!)}.add(§2)`).applyToSnippet(leftSnippet.type, wholeRange, leftSnippet, rightSnippet);
            }

            this.pushError(JCM.leftOperatorNotFitForAttribute(operatorAsString), "error", operatorRange);
            return leftSnippet;
        }

        let leftTypeIndex = primitiveTypeMap[leftSnippet.type!.identifier]!;

        rightSnippet = this.unbox(rightSnippet);
        let rightTypeIndex = primitiveTypeMap[rightSnippet.type!.identifier];

        if (leftTypeIndex == nString) {
            if (!rightSnippet.type?.isPrimitive) {
                rightSnippet = this.wrapWithToStringCall(rightSnippet, "string");
            }
            return new BinaryOperatorTemplate(operatorAsString, false).applyToSnippet(leftSnippet.type!, wholeRange, leftSnippet, rightSnippet);
        }

        if (!rightTypeIndex) {
            this.pushError(JCM.rightOperatorNotFitForAttribute(operatorAsString), "error", operatorRange);
            return leftSnippet;
        }

        if (leftTypeIndex < nByte || leftTypeIndex > nDouble) {
            this.pushError(JCM.leftOperatorNotFitForAttribute(operatorAsString), "error", operatorRange);
            return leftSnippet;
        }

        if (rightTypeIndex == nChar) rightSnippet = this.convertCharToNumber(rightSnippet);

        if (leftTypeIndex < rightTypeIndex) {
            this.pushError(JCM.cantUseOperatorForLeftRightTypes(operatorAsString), "error", operatorRange);
            return leftSnippet;
        }

        if (operator == TokenType.divisionAssignment && leftTypeIndex >= nByte && leftTypeIndex <= nLong) {
            return new TwoParameterTemplate(`§1 = Math.trunc(§1/(§2 || ${Helpers.throwArithmeticException}("${JCM.divideByZero()}", ${wholeRange.startLineNumber}, ${wholeRange.startColumn}, ${wholeRange.endLineNumber}, ${wholeRange.endColumn})))`)
                .applyToSnippet(leftSnippet.type!, wholeRange, leftSnippet, rightSnippet);
        }

        return new BinaryOperatorTemplate(operatorAsString, false).applyToSnippet(leftSnippet.type!, wholeRange, leftSnippet, rightSnippet);

    }

    compileCast(snippet: CodeSnippet, castTo: JavaType, castType: "explicit" | "implicit", fromToStringMethod: boolean = false): CodeSnippet {
        if (!snippet || !snippet.type || !castTo) return snippet;
        let type: JavaType = snippet.type;

        if (snippet.type == castTo) return snippet;

        if (!type.isPrimitive) {
            if (type.identifier == "String" && castTo == this.stringType) {
                return new OneParameterTemplate('(§1?.value ?? null)').applyToSnippet(this.stringType, snippet.range, snippet);
            }
            // if (castTo.identifier == "string" || castTo.identifier == "String") {
            //     if (type instanceof JavaArrayType) {
            //         snippet = this.wrapWithArrayToString(snippet, castTo.identifier);
            //     } else {
            //         snippet = this.wrapWithToStringCall(snippet, castTo.identifier);
            //     }
            //     return snippet;
            // }
            if (type == this.nullType) {
                return snippet;
            }
            if (castTo.isPrimitive) {
                let boxedIndex = boxedTypesMap[type.identifier];
                if (boxedIndex) {
                    if (castTo == this.stringType) {
                        if (fromToStringMethod) {
                            return new OneParameterTemplate('((§1?.value ?? null) + "")').applyToSnippet(this.stringType, snippet.range, snippet);
                        } else {
                            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
                            return snippet;
                        }
                    }
                    snippet = this.unbox(snippet);
                    // continue below...
                } else {
                    if (type.identifier == "Object") {
                        let castToIndex = primitiveTypeMap[castTo.identifier];
                        let boxedTypeIdentifier = boxedTypeIdentifiers[castToIndex!];

                        let range = snippet.range;
                        return SnippetFramer.frame(snippet, `${Helpers.checkCast}(§1, "${boxedTypeIdentifier}", ${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}).value`
                            , castTo);
                    } else {
                        this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
                    }

                    return snippet;
                }
            } else {
                // cast object to object
                if (castType == "explicit" && this.canCastTo(snippet.type, castTo, "explicit")
                    || (castType == "implicit" && this.canCastTo(snippet.type, castTo, "implicit"))) {
                    return snippet;
                }
                this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
                return snippet;
            }
        }

        // from here on type is primitive!
        if (!castTo.isPrimitive) {
            let boxedTypeIndex = boxedTypesMap[castTo.identifier];
            let fromIndex = primitiveTypeMap[type.identifier];
            let toIndex = boxedTypeIndex;
            if (fromIndex == toIndex || castTo.identifier == "Object") {
                return this.box(snippet);
            }

            if (fromIndex >= nByte && fromIndex <= nDouble && toIndex >= nByte && toIndex <= nDouble && fromIndex <= toIndex) {
                snippet.type = this.primitiveTypes[boxedTypeIndex];
                return this.box(snippet);
            }

            if (castTo == this.stringNonPrimitiveType || type == this.stringType) {
                let templ = type == this.stringType ? '§1' : '"" + (§1)'
                let constantValue = snippet.getConstantValue();
                let sn1 = SnippetFramer.frame(snippet, `new ${Helpers.classes}["String"](${templ})`, this.stringNonPrimitiveType);
                if (typeof constantValue == "string" && sn1 instanceof StringCodeSnippet) {
                    sn1.setConstantValue(constantValue);
                }
                return sn1;
            }



            // snippet has primitive type. boxing?

            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }

        // now snippet.type and castTo are primitive.
        // nVoid = 1, nBoolean = 2, nChar = 3, nByte = 4, nShort = 5, nInteger = 6, nLong = 7, nFloat = 8, nDouble = 9, nString = 10
        let snippetTypeIndex = primitiveTypeMap[snippet.type!.identifier]!;
        let castToTypeIndex = primitiveTypeMap[castTo.identifier]!;
        if (snippetTypeIndex == castToTypeIndex) {
            if (castType == "explicit") this.pushError(JCM.unneccessaryCast(), "info", snippet.range!);
            return snippet;
        }

        if (snippetTypeIndex == nChar) {
            if (castToTypeIndex == nString) return snippet;
            if (castToTypeIndex >= nByte && castToTypeIndex <= nDouble) {
                return this.convertCharToNumber(snippet);
            }
            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }

        if (castToTypeIndex == nChar) {
            if ([nByte, nShort, nInteger, nLong].indexOf(snippetTypeIndex) >= 0) {
                return this.convertNumberToChar(snippet);
            }
            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }

        if (castToTypeIndex == nString) {
            if (snippet.isConstant()) return new StringCodeSnippet(`"${snippet.getConstantValue()}"`, snippet.range, this.stringType, "" + snippet.getConstantValue);
            return new OneParameterTemplate('("" + (§1))').applyToSnippet(this.stringType, snippet.range!, snippet);
        }

        // no cast from string, no cast from/to void, boolean
        if (snippetTypeIndex == nString || snippetTypeIndex == nVoid || castToTypeIndex == nVoid || snippetTypeIndex == nBoolean || castToTypeIndex == nBoolean) {
            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }


        // now both types are in nByte = 5, nShort = 6, nInteger = 7, nLong = 8, nFloat = 9, nDouble = 10
        if (snippetTypeIndex <= castToTypeIndex) {
            snippet.type = castTo;
            return snippet;
        }

        if (castType == "implicit") {
            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }


        if (snippet.isConstant()) {
            let value: number = <number>snippet.getConstantValue();
            let result: number;

            switch (castToTypeIndex) {
                case nByte: result = snippetTypeIndex <= nLong ? ((value + 128) % 256 - 128) : ((Math.trunc(value) + 128) % 256 - 128);
                    break;
                case nShort: result = snippetTypeIndex <= nLong ? ((value + 0x8000) % 0x10000 - 0x8000) : ((Math.trunc(value) + 0x8000) % 0x10000 - 0x8000);
                    break;
                // case nInteger: result = snippetTypeIndex <= nLong ? ((value + 0x80000000) % 0x100000000 - 0x80000000) : ((Math.trunc(value) + 0x80000000) % 0x100000000 - 0x80000000);
                case nInteger: result = snippetTypeIndex <= nLong ? value | 0 : Math.trunc(value) | 0;
                    break;
                case nLong: result = Math.trunc(value);
                    break;
                case nFloat: result = Math.fround(value);
                    break;
            }

            return new StringCodeSnippet("" + value, snippet.range!, castTo, value);

        } else {
            let template: OneParameterTemplate | undefined;

            switch (castToTypeIndex) {
                case nByte: template = snippetTypeIndex <= nLong ? new OneParameterTemplate('((§1 + 128) % 256 - 128)') : new OneParameterTemplate('((Math.trunc(§1) + 128) % 256 - 128)');
                    break;
                case nShort: template = snippetTypeIndex <= nLong ? new OneParameterTemplate('((§1 + 0x8000) % 0x10000 - 0x8000)') : new OneParameterTemplate('((Math.trunc(§1) + 0x80000000) % 0x100000000 - 0x80000000)');
                    break;
                // case nInteger: template = snippetTypeIndex <= nLong ? new OneParameterTemplate('((§1 + 0x80000000) % 0x100000000 - 0x80000000)') : new OneParameterTemplate('((Math.trunc(§1) + 0x80000000) % 0x100000000 - 0x80000000)');
                case nInteger: template = snippetTypeIndex <= nLong ? new OneParameterTemplate('((§1) | 0)') : new OneParameterTemplate('(Math.trunc(§1) | 0)');
                    break;
                case nLong: template = new OneParameterTemplate('Math.trunc(§1)');
                    break;
                case nFloat: template = new OneParameterTemplate('Math.fround(§1)');
                    break;
            }

            if (template) return template.applyToSnippet(castTo, snippet.range!, snippet);
            return snippet;
        }



    }


    canCastTo(typeFrom: JavaType | undefined, typeTo: JavaType | undefined, castType: "explicit" | "implicit"): boolean {

        if (!typeFrom || !typeTo) return false;

        let typeFromIndex = primitiveTypeMap[typeFrom.identifier] || boxedTypesMap[typeFrom.identifier];
        let typeToIndex = primitiveTypeMap[typeTo.identifier] || boxedTypesMap[typeTo.identifier];

        if (typeToIndex == nString) {
            if (castType == "explicit" || typeFromIndex == nString) return true;
        }


        if ((!typeFrom.isPrimitive || typeFrom == this.stringType) && !typeTo.isPrimitive) {
            if (typeFrom == this.nullType) return true;
            if (typeFrom == this.stringType) typeFrom = this.primitiveStringClass.type;

            if (typeFrom instanceof JavaArrayType || typeTo instanceof JavaArrayType) {
                if (typeFrom instanceof JavaArrayType && typeTo instanceof JavaArrayType) {
                    return typeFrom.dimension == typeTo.dimension && this.canCastTo(typeFrom.elementType, typeTo.elementType, castType);
                }
                if(typeFrom instanceof JavaArrayType){
                    return typeTo.identifier == "Object";
                }
                return false;
            }
            if (castType == "explicit") {
                return (<NonPrimitiveType>typeFrom).canExplicitlyCastTo(typeTo);
            } else {
                return (<NonPrimitiveType>typeFrom).canImplicitlyCastTo(typeTo);
            }
        }

        if (typeTo == this.stringType && typeFrom == this.nullType) return true;

        if (typeFrom.isPrimitive && typeTo.identifier == "Object" || typeFrom.identifier == "Object" && typeTo.isPrimitive) {
            return true;
        }

        if (!typeFromIndex || !typeToIndex) return false;

        if (typeFromIndex == typeToIndex) return true;


        if (castType == "explicit") {
            if (typeFromIndex == nBoolean) return false;

            if (typeFromIndex == nChar) {
                return typeToIndex >= nByte && typeToIndex <= nDouble;
            }
            return true;
        }

        return canCastImplicit[typeFromIndex][typeToIndex];
    }

    anyOperandHasVoidType(lTypeIndex: number, rTypeIndex: number, operator: TokenType, operatorRange: IRange): boolean {
        if (lTypeIndex == nVoid) {
            this.pushError(JCM.leftExpressionHasNoType(TokenTypeReadable[operator]), "error", operatorRange);
            return true;
        }
        if (rTypeIndex == nVoid) {
            this.pushError(JCM.rightExpressionHasNoType(TokenTypeReadable[operator]), "error", operatorRange);
            return true;
        }
        return false;
    }

    pushError(messageWithId: ErrormessageWithId, errorLevel: ErrorLevel = "error", nodeOrRange: ASTNode | IRange): Error {

        //@ts-ignore
        let range: IRange = nodeOrRange["kind"] ? nodeOrRange.range : nodeOrRange;

        const error: Error = {
            message: messageWithId.message,
            id: messageWithId.id,
            range: range,
            level: errorLevel
        };

        this.module.errors.push(error);

        return error;
    }


    unbox(snippet: CodeSnippet | undefined): CodeSnippet {
        if (!snippet || !snippet.type) return snippet;
        let boxedTypeIndex: number | undefined = boxedTypesMap[snippet.type.identifier];
        if (!boxedTypeIndex) return snippet;  // type is not boxed

        let unboxedType = this.primitiveTypes[boxedTypeIndex];

        if(boxedTypeIndex == nString){
            // special handling for String:
            // (§1 || String.null).value
            return SnippetFramer.frame(snippet, `(§1 || ${Helpers.classes}["String"].null).value`, unboxedType);
        } else {
            // return SnippetFramer.frame(snippet, `(§1 || {value: ${unboxedNullValuesMap[snippet.type.identifier]}}).value`, unboxedType);
    
            // better variant:
            return SnippetFramer.frame(snippet, `${Helpers.checkNPE('§1', snippet.range!)}.value`, unboxedType);
        }

    }

    getUnboxedType(type: JavaType): JavaType {
        if (!type) return undefined;
        let boxedTypeIndex: number | undefined = boxedTypesMap[type.identifier];
        if (!boxedTypeIndex) return undefined;  // type is not boxed

        return this.primitiveTypes[boxedTypeIndex];

    }

    hasBoxedType(snippet: CodeSnippet): boolean {
        if (!snippet.type) return false;
        let unboxedTypeIndex = boxedTypesMap[snippet.type.identifier];

        return unboxedTypeIndex != null;

    }

    box(snippet: CodeSnippet): CodeSnippet {
        if (!snippet.type) return snippet;
        let unboxedTypeIndex = primitiveTypeMap[snippet.type.identifier];

        if (!unboxedTypeIndex) return snippet;
        let boxedIdentifier = boxedTypeIdentifiers[unboxedTypeIndex];
        if (!boxedIdentifier || boxedIdentifier.length == 0) return snippet;

        let constant = snippet.getConstantValue();
        if (snippet instanceof StringCodeSnippet) snippet.setConstantValue(constant || null);

        let boxedType = this.libraryTypestore.getType(boxedIdentifier);
        if (unboxedTypeIndex == nString) {
            return SnippetFramer.frame(snippet, `${Helpers.primitiveStringToStringObject}(§1)`, boxedType);
        } else {
            return SnippetFramer.frame(snippet, `new ${Helpers.classes}["${boxedIdentifier}"](§1)`, boxedType);
        }

    }

    convertCharToNumber(snippet: CodeSnippet): CodeSnippet {
        if (!snippet.type) return snippet;
        if (snippet.type.identifier != 'char') return snippet;

        if (snippet.isConstant()) {
            let result = (<string>snippet.getConstantValue()).charCodeAt(0);
            return new StringCodeSnippet(result + "", snippet.range, this.intType, result);
        }

        return SnippetFramer.frame(snippet, '§1.charCodeAt(0)', this.intType);
    }

    convertNumberToChar(snippet: CodeSnippet): CodeSnippet {
        if (!snippet.type) return snippet;

        if (snippet.isConstant()) {
            let result = String.fromCharCode(<number>snippet.getConstantValue());
            return new StringCodeSnippet(`"${result}"`, snippet.range, this.charType, result);
        }

        return SnippetFramer.frame(snippet, 'String.fromCharCode(§1)', this.charType);
    }

    isNumberPrimitiveType(type: JavaType): boolean {
        if (!type) return false;
        let index = primitiveTypeMap[type.identifier];
        if (!index) return false;
        return index >= nByte && index <= nDouble;
    }

    compileUnaryOperator(operand: CodeSnippet | undefined, operator: TokenType): CodeSnippet | undefined {
        if (!operand) return undefined;
        if (!operand.type) {
            this.pushError(JCM.cantGetTypeOfExpression(), "error", operand.range!);
            return;
        }

        operand = this.unbox(operand);
        let operatorAsString = TokenTypeReadable[operator];

        let primitiveIndex = primitiveTypeMap[operand.type!.identifier];
        if (!primitiveIndex) {
            this.pushError(JCM.operatorNotUsableForOperands(operatorAsString, operand.type!.identifier), "error", operand.range!);
            return;
        }

        if (operator == TokenType.not) {
            if (primitiveIndex == nBoolean) {
                return this.applyUnaryOperatorConsideringConstantFolding("!", this.booleanType, operand.range!, operand);
            }
            this.pushError(JCM.notOperatorNeedsBooleanOperands(operand.type!.identifier), "error", operand.range!);
            return operand;
        }

        if ([TokenType.plusPlus, TokenType.minusMinus].indexOf(operator) >= 0) {
            if (!operand.isLefty) {
                this.pushError(JCM.plusPlusMinusMinusOnlyForLeftyOperands(operatorAsString), "error", operand.range!);
                return;
            }
            if (primitiveIndex >= nByte && primitiveIndex <= nDouble) {
                return new OneParameterTemplate(operatorAsString + "§1").applyToSnippet(operand.type!, operand.range!, operand);
            }
            this.pushError(JCM.operatorNotUsableForOperands(operatorAsString, operand.type!.identifier), "error", operand.range!);
            return;
        }

        if ([TokenType.minus, TokenType.plus].indexOf(operator) >= 0) {
            if (primitiveIndex >= nByte && primitiveIndex <= nDouble) {
                return this.applyUnaryOperatorConsideringConstantFolding(operatorAsString, operand.type!, operand.range!, operand);
            }
            this.pushError(JCM.operatorNotUsableForOperands(operatorAsString, operand.type!.identifier), "error", operand.range!);
            return;
        }

        // Tilde-Operator
        if (primitiveIndex >= nByte && primitiveIndex <= nLong) {
            return this.applyUnaryOperatorConsideringConstantFolding(operatorAsString, operand.type!, operand.range!, operand);
        }

        this.pushError(JCM.operatorNotUsableForOperands(operatorAsString, operand.type!.identifier), "error", operand.range!);
        return;


    }

    applyUnaryOperatorConsideringConstantFolding(operator: string, resultType: JavaType, range: IRange, snippet: CodeSnippet): CodeSnippet {
        if (snippet.isConstant()) {
            let operand = snippet.getConstantValue()!;
            let result!: ConstantValue;

            switch (operator) {
                case "-": result = -operand; break;
                case "+": return snippet;
                case "~": result = ~operand; break;
                case "!": result = !operand; break;
            }

            return new StringCodeSnippet("" + result, range, resultType, result);

        } else {

            return new OneParameterTemplate(operator + "§1").applyToSnippet(resultType, range, snippet);

        }

    }

    isAssignmentOperator(tt: TokenType): boolean {
        return assignmentOperators.indexOf(tt) >= 0;
    }

    registerUsagePosition(symbol: BaseSymbol, range: IRange) {
        if (symbol.module instanceof JavaLibraryModule) {
            this.module.systemSymbolsUsageTracker.registerUsagePosition(symbol, this.module.file, range);
        } else {
            this.module.compiledSymbolsUsageTracker.registerUsagePosition(symbol, this.module.file, range);
        }
    }

    /**
 *
 *  Compiles expressions like new MyAbstractClass(p1, p2){ attributeDeclarations, instanceInitializers, methodDeclarations }
 *
 * @param node
 */
    abstract compileAnonymousInnerClass(node: ASTAnonymousClassNode): CodeSnippet | undefined;

    abstract compileLambdaFunction(node: ASTLambdaFunctionDeclarationNode, expectedType: JavaType | undefined): CodeSnippet | undefined;


}