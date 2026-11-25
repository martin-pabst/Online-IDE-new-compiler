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
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { JavaArrayType } from "../types/JavaArrayType";
import { JavaClass } from "../types/JavaClass";
import { JavaInterface } from "../types/JavaInterface";
import { JavaType } from "../types/JavaType";
import { NonPrimitiveType } from "../types/NonPrimitiveType";
import { StaticNonPrimitiveType } from "../types/StaticNonPrimitiveType";
import { PrimitiveType } from "../runtime/system/primitiveTypes/PrimitiveType";
import { jump, Label, STEP } from "./Code";
import { apply, Build, combine, compoundAssignment, ConstantValue, Expr, frame, isConstant, isPure, javaCall, term, toStack } from "./Expr";
import { JavaLocalVariable } from "./JavaLocalVariable.ts";
import { JavaSymbolTable } from "./JavaSymbolTable.ts";

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

    compileBinaryOperation(leftSnippet: Expr, rightSnippet: Expr, ast: ASTBinaryNode): Expr | undefined {
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

        let isEqualityOperator = operator == TokenType.equal || operator == TokenType.notEqual;

        if (isEqualityOperator && this.settingStore.getValue("compiler.equalityOperatorForStringsCompares") == "references"
            && lTypeIndex == nString && rTypeIndex == nString) {

            return this.binaryOperation(operatorIdentifier + "=", this.booleanType, wholeRange, leftSnippet, rightSnippet);

        }

        // unbox if necessary
        // don't unbox when comparing boxed value to null.
        if (lWrapperIndex && rightSnippet.constant !== null) leftSnippet = this.unbox(leftSnippet);
        if (rWrapperIndex && leftSnippet.constant !== null) rightSnippet = this.unbox(rightSnippet);

        if (isEqualityOperator) {
            if (leftType == this.nullType && (!rightType.isPrimitive || rightType == this.stringType)
                || rightType == this.nullType && (!leftType.isPrimitive || leftType == this.stringType)) {
                return this.binaryOperation(operatorIdentifier, this.booleanType, wholeRange, leftSnippet, rightSnippet);
            }

            if (lTypeIndex == 0 && rTypeIndex != 0 || lTypeIndex != 0 && rTypeIndex == 0) {
                this.pushError(JCM.badOperandTypesForBinaryOperator(TokenTypeReadable[operator], leftType.toString(), rightType.toString()), "error", operatorRange);
                return undefined;
            }

            return this.binaryOperation(operatorIdentifier, this.booleanType, wholeRange, leftSnippet, rightSnippet);
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
        if (comparisonOperators.indexOf(operator) >= 0) return this.binaryOperation(operatorIdentifier, this.booleanType, wholeRange, leftSnippet, rightSnippet);


        // now both types are in [byte, short, int, long, float, double]
        // operators are +, -, *, /, %, ShiftOperations
        if (shiftOperators.indexOf(operator) >= 0) {
            if (lTypeIndex >= nFloat || rTypeIndex >= nFloat) {
                this.pushError(JCM.operatorNotFeasibleForOperands(operatorIdentifier, lIdentifier, rIdentifier), "error", operatorRange);
                return undefined;
            }
            return this.binaryOperation(operatorIdentifier, leftType, wholeRange, leftSnippet, rightSnippet);
        }

        // now both types are in [byte, short, int, long, float, double]
        // operators are +, -, *, /, %
        let resultType = this.primitiveTypes[Math.max(lTypeIndex, rTypeIndex)];
        return this.binaryOperation(operatorIdentifier, resultType, wholeRange, leftSnippet, rightSnippet);

    }

    compileInstanceOf(leftSnippet: Expr, rightSnippet: Expr, ast: ASTBinaryNode): Expr | undefined {
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

        return frame(leftSnippet, `${Helpers.instanceof}(§1, "${(<StaticNonPrimitiveType>rightType).nonPrimitiveType.pathAndIdentifierAsDotSeparatedString}"${stackFramePositionString})`
            , this.booleanType)

    }



    compileLogicOperation(leftSnippet: Expr, rightSnippet: Expr, lTypeIndex: number, rTypeIndex: number, lIdentifier: string, rIdentifier: string, operator: LogicOperator, operatorRange: IRange, wholeRange: IRange): Expr | undefined {
        if (lTypeIndex != nBoolean || rTypeIndex != nBoolean) {
            this.pushError(JCM.operatorNotFeasibleForOperands(TokenTypeReadable[operator], lIdentifier, rIdentifier), "error", operatorRange);
            return undefined;
        }

        let bothSnippetsAreConstant = isConstant(leftSnippet) && isConstant(rightSnippet);

        if (operator == TokenType.XOR || bothSnippetsAreConstant) return this.binaryOperation(TokenTypeReadable[operator], this.booleanType, wholeRange, leftSnippet, rightSnippet);

        /*
        * lazy and/or
        */
        // pure terms => javascript interpreter does lazy evaluation for us:
        if (isPure(leftSnippet) && isPure(rightSnippet)) return this.binaryOperation(TokenTypeReadable[operator], this.booleanType, wholeRange, leftSnippet, rightSnippet);

        // ... otherwise we have to model lazy evaluation ourselves:
        let label = new Label();
        let shortCircuit = operator == TokenType.and ? `if(!${StepParams.stack}.pop()){${StepParams.stack}.push(false);` : `if(${StepParams.stack}.pop()){${StepParams.stack}.push(true);`;

        return {
            pre: [
                ...toStack(leftSnippet).pre, shortCircuit, jump(label), '};', STEP,
                ...toStack(rightSnippet).pre, STEP,
                label
            ],
            value: `${StepParams.stack}.pop()`,
            type: this.booleanType,
            range: wholeRange
        }

    }

    /**
     * one of the operands is of type string
     * both operators are unboxed and operation is not in [==, !=]
     */
    compileBinaryOperationWithStrings(leftSnippet: Expr, rightSnippet: Expr, lTypeIndex: number, rTypeIndex: number, lIdentifier: string, rIdentifier: string, operator: BinaryOperator, operatorRange: IRange, wholeRange: IRange): Expr | undefined {
        if (operator != TokenType.plus && comparisonOperators.indexOf(operator) < 0) {
            this.pushError(JCM.operatorNotFeasibleForOperands(TokenTypeReadable[operator], lIdentifier, rIdentifier), "error", operatorRange);
            return undefined;
        }

        if (lTypeIndex == nOtherClass) leftSnippet = this.wrapWithToStringCall(leftSnippet, "string");
        if (rTypeIndex == nOtherClass) rightSnippet = this.wrapWithToStringCall(rightSnippet, "string");

        let returnType: JavaType = operator == TokenType.plus ? this.stringType : this.booleanType;

        return this.binaryOperation(TokenTypeReadable[operator], returnType, wholeRange, leftSnippet, rightSnippet);

    }

    wrapWithArrayToString(source: Expr, primitiveOrClassNeeded: "string" | "String"): Expr {
        let newSnippet1: Expr;

        if ((<JavaArrayType>source.type!).elementType.isPrimitive) {
            newSnippet1 = frame(source, `${Helpers.primitiveArrayToString}(§1)`);
        } else {
            newSnippet1 = javaCall(frame(source, `${Helpers.objectArrayToString}(§1)`), true);
        }

        if (primitiveOrClassNeeded == "String") {
            newSnippet1 = frame(newSnippet1, `new ${Helpers.classes}["String"](§1)`, this.stringNonPrimitiveType);
        }

        return newSnippet1;
    }

    wrapWithToStringCall(leftSnippet: Expr, primitiveOrClassNeeded: "string" | "String"): Expr {
        if (leftSnippet.type?.identifier == "String") {
            if (primitiveOrClassNeeded == "string") {
                return frame(leftSnippet, `${Helpers.nullstringIfNull}(§1)`, this.stringType);
            } else {
                return leftSnippet;
            }
        }

        if (leftSnippet.type?.identifier == "string") {
            if (primitiveOrClassNeeded == "String") {
                return frame(leftSnippet, `new ${Helpers.classes}["String"](§1)`, this.stringType);
            } else {
                return leftSnippet;
            }
        }

        if (isConstant(leftSnippet)) {
            let text = "" + leftSnippet.constant;
            if (primitiveOrClassNeeded == "string") {
                return term(JSON.stringify(text), this.stringType, leftSnippet.range, text);
            } else {
                if (leftSnippet.constant === null) {
                    return { ...leftSnippet, type: this.stringNonPrimitiveType };
                }
                return term(`new ${Helpers.classes}["String"](${JSON.stringify(text)})`, this.stringNonPrimitiveType, leftSnippet.range);
            }
        }

        let newSnippet = javaCall(frame(leftSnippet, `${Helpers.toString}(__t, undefined, §1)`, this.stringNonPrimitiveType), true);

        if (primitiveOrClassNeeded == "string") {
            return frame(newSnippet, `(§1 ||${Helpers.classes}["String"].null).value`, this.stringType);
        } else {
            return newSnippet;
        }

    }



    /**
     * No operand is void type;
     * operator is any assignment operator (=, +=, -=, /=, *=, %=)
     */
    compileAssignment(leftSnippet: Expr, rightSnippet: Expr, lTypeIndex: number, rTypeIndex: number, lIdentifier: string, rIdentifier: string, operator: BinaryOperator, operatorRange: IRange, wholeRange: IRange): Expr | undefined {

        if (!leftSnippet.lefty) {
            this.pushError(JCM.cantAssignValueToTerm(), "error", operatorRange);
            return;
        }

        let operatorAsString = TokenTypeReadable[operator];

        if (operator == TokenType.assignment) {
            if (this.canCastTo(rightSnippet.type, leftSnippet.type, "implicit")) {
                rightSnippet = this.compileCast(rightSnippet, leftSnippet.type!, "implicit");
            } else if (this.isImplicitConstantNarrowingPossible(rightSnippet, leftSnippet.type)) {
                // byte b; b = 10;
                rightSnippet = this.compileCast(rightSnippet, leftSnippet.type!, "explicit");
            } else {
                this.pushError(JCM.cantCastType(rightSnippet.type!.identifier, leftSnippet.type!.identifier), "error", rightSnippet.range!);
            }
            return this.assign(leftSnippet, rightSnippet, leftSnippet.type!, wholeRange, (l, r) => `${l} = ${r}`);
        }

        if (!leftSnippet.type!.isPrimitive) {
            if (leftSnippet.type == this.stringNonPrimitiveType && operator == TokenType.plusAssignment) {
                // Objects other than String are appended by calling their toString() method (see last else-branch).
                // canCastTo(Object/Character/..., string, "implicit") is true, but such a cast would fail at
                // compile time or (if the object is no String) at runtime.
                let rightType = rightSnippet.type;
                let rightIsPrimitiveStringOrNull = rightType?.isPrimitive || rightType == this.stringNonPrimitiveType || rightType == this.nullType;
                if (rightIsPrimitiveStringOrNull && this.canCastTo(rightType, this.stringType, "implicit")) {
                    rightSnippet = this.compileCast(rightSnippet, this.stringType, "implicit");
                } else if (rightSnippet.type == this.voidType) {
                    this.pushError(JCM.cantCastRightSideToString(), "error", rightSnippet.range!);
                    return undefined;
                } else if (rightSnippet.type?.isPrimitive) {
                    // String s; s += 5;
                    rightSnippet = this.compileCast(rightSnippet, this.stringType, "explicit");
                } else if (rightSnippet.type instanceof JavaArrayType) {
                    rightSnippet = this.wrapWithArrayToString(rightSnippet, "string");
                } else {
                    // String s; s += object;  (calls object.toString(); appends "null" if object is null)
                    rightSnippet = this.wrapWithToStringCall(rightSnippet, "string");
                }
                let leftRange = leftSnippet.range!;
                return this.compoundAssign(leftSnippet, rightSnippet, leftSnippet.type, wholeRange,
                    (l, r) => `${l} = ${Helpers.checkNPE(l, leftRange)}.add(${r})`,
                    (old, r) => `${Helpers.checkNPE(old, leftRange)}.add(${r})`);
            }

            this.pushError(JCM.leftOperatorNotFitForAttribute(operatorAsString), "error", operatorRange);
            return leftSnippet;
        }

        let leftTypeIndex = primitiveTypeMap[leftSnippet.type!.identifier]!;

        rightSnippet = this.unbox(rightSnippet);
        let rightTypeIndex = primitiveTypeMap[rightSnippet.type!.identifier];

        // += => +
        let binaryOperator = operatorAsString.substring(0, operatorAsString.length - 1);

        if (leftTypeIndex == nString) {
            if (!rightSnippet.type?.isPrimitive) {
                rightSnippet = this.wrapWithToStringCall(rightSnippet, "string");
            }
            return this.compoundAssign(leftSnippet, rightSnippet, leftSnippet.type!, wholeRange,
                (l, r) => `${l} ${operatorAsString} ${r}`, (old, r) => `${old} ${binaryOperator} ${r}`);
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
            let divide = (dividend: string, divisor: string) => `Math.trunc(${dividend}/(${divisor} || ${Helpers.throwArithmeticException}("${JCM.divideByZero()}", ${wholeRange.startLineNumber}, ${wholeRange.startColumn}, ${wholeRange.endLineNumber}, ${wholeRange.endColumn})))`;
            return this.compoundAssign(leftSnippet, rightSnippet, leftSnippet.type!, wholeRange,
                (l, r) => `${l} = ${divide(l, r)}`, divide);
        }

        return this.compoundAssign(leftSnippet, rightSnippet, leftSnippet.type!, wholeRange,
            (l, r) => `${l} ${operatorAsString} ${r}`, (old, r) => `${old} ${binaryOperator} ${r}`);

    }

    /**
     * Compound assignment (+=, -=, ...)
     * @param build used if right side is pure: gets location and value of right side
     * @param newValue used otherwise: gets old value of variable and value of right side
     */
    compoundAssign(left: Expr, right: Expr, type: JavaType, range: IRange, build: (location: string, value: string) => string,
        newValue: (oldValue: string, value: string) => string): Expr {
        // javascript reads the variable before evaluating the right side (like java), so this is only an issue
        // if the right side has code which runs in steps before
        if (isPure(right)) return this.assign(left, right, type, range, build);

        let place = left.place ?? { parts: [], build: () => left.value };
        return compoundAssignment(type, range, place, right, (location, oldValue, value) => `${location} = ${newValue(oldValue, value)}`);
    }

    /**
     * Assignment: parts of the location of the variable (object, array, index) are evaluated before the right side,
     * as in java. build gets the location and the value of the right side.
     */
    assign(left: Expr, right: Expr, type: JavaType, range: IRange, build: (location: string, value: string) => string): Expr {
        if (left.place) {
            let place = left.place;
            return combine(type, range, [...place.parts, right], (...values) => build(place.build(...values.slice(0, -1)), values[values.length - 1]));
        }
        // location of local variable, static field, field of this doesn't change
        return combine(type, range, [{ ...left, stable: true }, right], build);
    }

    /**
     * ++, --: build gets location of variable
     */
    updateVariable(operand: Expr, type: JavaType, range: IRange, build: (location: string) => string): Expr {
        if (operand.place) {
            let place = operand.place;
            return combine(type, range, place.parts, (...values) => build(place.build(...values)));
        }
        return combine(type, range, [operand], build);
    }

    compileCast(snippet: Expr, castTo: JavaType, castType: "explicit" | "implicit", fromToStringMethod: boolean = false): Expr {
        if (!snippet || !snippet.type || !castTo) return snippet;
        let type: JavaType = snippet.type;

        if (snippet.type == castTo) return snippet;

        if (!type.isPrimitive) {
            if (type.identifier == "String" && castTo == this.stringType) {
                return apply(this.stringType, snippet.range, '(§1?.value ?? null)', snippet);
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
                            return apply(this.stringType, snippet.range, '((§1?.value ?? null) + "")', snippet);
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
                        return frame(snippet, `${Helpers.checkCast}(§1, "${boxedTypeIdentifier}", ${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}).value`
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
            // wildcard with lower bound, e.g. Collection<? super Integer> c; c.add(5);
            // Value fits to ? super X if it fits to X.
            if (castTo instanceof GenericTypeParameter && castTo.isWildcard && castTo.lowerBound) {
                return this.compileCast(snippet, castTo.lowerBound, castType);
            }

            let boxedTypeIndex = boxedTypesMap[castTo.identifier];
            let fromIndex = primitiveTypeMap[type.identifier];
            let toIndex = boxedTypeIndex;
            if (fromIndex == toIndex || castTo.identifier == "Object") {
                return this.box(snippet);
            }

            if (fromIndex >= nByte && fromIndex <= nDouble && toIndex >= nByte && toIndex <= nDouble && fromIndex <= toIndex) {
                return this.box({ ...snippet, type: this.primitiveTypes[boxedTypeIndex] });
            }

            if (castTo == this.stringNonPrimitiveType || type == this.stringType) {
                let templ = type == this.stringType ? '§1' : '"" + (§1)'
                let sn1 = frame(snippet, `new ${Helpers.classes}["String"](${templ})`, this.stringNonPrimitiveType);
                if (typeof snippet.constant == "string" && isPure(sn1)) {
                    sn1.constant = snippet.constant;
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
            if (isConstant(snippet)) return term(JSON.stringify("" + snippet.constant), this.stringType, snippet.range, "" + snippet.constant);
            return apply(this.stringType, snippet.range!, '("" + (§1))', snippet);
        }

        // no cast from string, no cast from/to void, boolean
        if (snippetTypeIndex == nString || snippetTypeIndex == nVoid || castToTypeIndex == nVoid || snippetTypeIndex == nBoolean || castToTypeIndex == nBoolean) {
            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }


        // now both types are in nByte = 5, nShort = 6, nInteger = 7, nLong = 8, nFloat = 9, nDouble = 10
        if (snippetTypeIndex <= castToTypeIndex) {
            return { ...snippet, type: castTo };
        }

        if (castType == "implicit") {
            this.pushError(JCM.cantCastType(type.identifier, castTo.identifier), "error", snippet.range!);
            return snippet;
        }


        // Narrowing primitive conversion like in Java:
        // floating point -> integral type: first convert to int (rounding towards zero, NaN -> 0, values out of range are clamped)
        // (resp. long for cast to long), then wrap around to target type
        let fromFloatingPoint = snippetTypeIndex >= nFloat;

        if (isConstant(snippet)) {
            let value: number = <number>snippet.constant;
            let result: number = value;

            let toInt = (v: number) => fromFloatingPoint ? (Math.max(-2147483648, Math.min(2147483647, v)) | 0) : (v | 0);

            switch (castToTypeIndex) {
                case nByte: result = (toInt(value) << 24) >> 24;
                    break;
                case nShort: result = (toInt(value) << 16) >> 16;
                    break;
                case nInteger: result = toInt(value);
                    break;
                case nLong: result = fromFloatingPoint ? (Math.trunc(Math.max(-9223372036854775808, Math.min(9223372036854775807, value))) || 0) : value;
                    break;
                case nFloat: result = Math.fround(value);
                    break;
            }

            return term(result < 0 ? "(" + result + ")" : "" + result, castTo, snippet.range!, result);

        } else {
            let template: string | undefined;

            let toInt = fromFloatingPoint ? 'Math.max(-2147483648, Math.min(2147483647, §1))' : '(§1)';

            switch (castToTypeIndex) {
                case nByte: template = `((${toInt} << 24) >> 24)`;
                    break;
                case nShort: template = `((${toInt} << 16) >> 16)`;
                    break;
                case nInteger: template = `(${toInt} | 0)`;
                    break;
                case nLong: template = fromFloatingPoint ? '(Math.trunc(Math.max(-9223372036854775808, Math.min(9223372036854775807, §1))) || 0)' : undefined;
                    break;
                case nFloat: template = 'Math.fround(§1)';
                    break;
            }

            if (template) return apply(castTo, snippet.range!, template, snippet);
            return { ...snippet, type: castTo };
        }



    }


    /**
     * In assignment contexts java allows implicit narrowing of constant values of type byte, short, char or int
     * to type byte, short or char if the value is representable in the destination type, e.g. byte b = 10;
     * (see https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.2)
     */
    isImplicitConstantNarrowingPossible(snippet: Expr | undefined, destinationType: JavaType | undefined): boolean {
        if (!snippet?.type || !destinationType || !isConstant(snippet)) return false;
        if (!snippet.type.isPrimitive || !destinationType.isPrimitive) return false;

        let fromIndex = primitiveTypeMap[snippet.type.identifier];
        let toIndex = primitiveTypeMap[destinationType.identifier];
        if ([nByte, nShort, nInteger, nChar].indexOf(fromIndex) < 0) return false;

        let value = snippet.constant;
        if (typeof value == "string") value = value.charCodeAt(0);
        if (typeof value != "number") return false;

        switch (toIndex) {
            case nByte: return value >= -128 && value <= 127;
            case nShort: return value >= -32768 && value <= 32767;
            case nChar: return value >= 0 && value <= 65535;
        }

        return false;
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
                    if(typeFrom.dimension != typeTo.dimension) return false;
                    if(typeFrom.elementType instanceof NonPrimitiveType && typeTo.elementType instanceof NonPrimitiveType) {
                        return this.canCastTo(typeFrom.elementType, typeTo.elementType, castType);
                    }

                    return typeFrom.elementType?.toString() == typeTo.elementType?.toString();
                }
                if (typeFrom instanceof JavaArrayType) {
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

        if (typeFrom.isPrimitive && typeTo.identifier == "Object"   // automatic boxing
            // unboxing with explicit cast needed for Niedersachsen: int i = (int) o
            || (typeFrom.identifier == "Object" && typeTo.isPrimitive) // && castType == "explicit")  
        ) {
            return true;
        }

        if (typeFrom.isPrimitive && typeTo instanceof GenericTypeParameter) {
            if (typeTo.catches) {
                typeTo.catches.push(this.getBoxedType(typeFrom));
            }
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


    unbox(snippet: Expr | undefined): Expr {
        if (!snippet || !snippet.type) return snippet;
        let boxedTypeIndex: number | undefined = boxedTypesMap[snippet.type.identifier];
        if (!boxedTypeIndex) return snippet;  // type is not boxed

        let unboxedType = this.primitiveTypes[boxedTypeIndex];

        if (boxedTypeIndex == nString) {
            // special handling for String:
            // (§1 || String.null).value
            return frame(snippet, `(§1 || ${Helpers.classes}["String"].null).value`, unboxedType);
        } else {
            // return frame(snippet, `(§1 || {value: ${unboxedNullValuesMap[snippet.type.identifier]}}).value`, unboxedType);

            // better variant:
            return frame(snippet, `${Helpers.checkNPE('§1', snippet.range!)}.value`, unboxedType);
        }

    }

    getUnboxedType(type: JavaType): JavaType {
        if (!type) return undefined;
        let boxedTypeIndex: number | undefined = boxedTypesMap[type.identifier];
        if (!boxedTypeIndex) return undefined;  // type is not boxed

        return this.primitiveTypes[boxedTypeIndex];

    }

    hasBoxedType(snippet: Expr): boolean {
        if (!snippet.type) return false;
        let unboxedTypeIndex = boxedTypesMap[snippet.type.identifier];

        return unboxedTypeIndex != null;

    }

    box(snippet: Expr): Expr {
        if (!snippet.type) return snippet;
        let unboxedTypeIndex = primitiveTypeMap[snippet.type.identifier];

        if (!unboxedTypeIndex) return snippet;
        let boxedIdentifier = boxedTypeIdentifiers[unboxedTypeIndex];
        if (!boxedIdentifier || boxedIdentifier.length == 0) return snippet;

        let boxedType = this.libraryTypestore.getType(boxedIdentifier);
        if (unboxedTypeIndex == nString) {
            return frame(snippet, `${Helpers.primitiveStringToStringObject}(§1)`, boxedType);
        } else {
            return frame(snippet, `new ${Helpers.classes}["${boxedIdentifier}"](§1)`, boxedType);
        }

    }

    getBoxedType(type: JavaType): NonPrimitiveType | undefined {
        if (!type) return undefined;
        let unboxedTypeIndex = primitiveTypeMap[type.identifier];
        if (!unboxedTypeIndex) return undefined;

        return <NonPrimitiveType>this.libraryTypestore.getType(boxedTypeIdentifiers[unboxedTypeIndex]);
    }

    convertCharToNumber(snippet: Expr): Expr {
        if (!snippet.type) return snippet;
        if (snippet.type.identifier != 'char') return snippet;

        if (isConstant(snippet)) {
            let result = (<string>snippet.constant).charCodeAt(0);
            return term(result + "", this.intType, snippet.range, result);
        }

        return frame(snippet, '§1.charCodeAt(0)', this.intType);
    }

    convertNumberToChar(snippet: Expr): Expr {
        if (!snippet.type) return snippet;

        if (isConstant(snippet)) {
            let result = String.fromCharCode(<number>snippet.constant);
            return term(`"${result}"`, this.charType, snippet.range, result);
        }

        return frame(snippet, 'String.fromCharCode(§1)', this.charType);
    }

    isNumberPrimitiveType(type: JavaType): boolean {
        if (!type) return false;
        let index = primitiveTypeMap[type.identifier];
        if (!index) return false;
        return index >= nByte && index <= nDouble;
    }

    compileUnaryOperator(operand: Expr | undefined, operator: TokenType): Expr | undefined {
        if (!operand) return undefined;
        if (!operand.type) {
            this.pushError(JCM.cantGetTypeOfExpression(), "error", operand.range!);
            return;
        }

        if ([TokenType.plusPlus, TokenType.minusMinus].indexOf(operator) >= 0 && boxedTypesMap[operand.type.identifier]) {
            let snippet = this.compileBoxedIncrementOrDecrement(operand, operator, true, operand.range!);
            if (snippet) return snippet;
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
            if (!operand.lefty) {
                this.pushError(JCM.plusPlusMinusMinusOnlyForLeftyOperands(operatorAsString), "error", operand.range!);
                return;
            }
            if (primitiveIndex >= nByte && primitiveIndex <= nDouble) {
                return this.updateVariable(operand, operand.type!, operand.range!, location => operatorAsString + location);
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

    /**
     * ++ and -- for variables of type Integer, Double, ...
     * Objects of these wrapper classes are immutable in java, so the variable gets a new object
     * (otherwise other variables referencing the same object would see the change).
     * Returns undefined if operand is not suitable.
     */
    compileBoxedIncrementOrDecrement(operand: Expr, operator: TokenType, isPrefix: boolean, range: IRange): Expr | undefined {
        let boxedIdentifier = operand.type?.identifier;
        if (["Byte", "Short", "Integer", "Long", "Float", "Double"].indexOf(boxedIdentifier) < 0) return undefined;
        // operand is inserted twice into the template, so it has to be free of side effects
        if (!operand.lefty || !isPure(operand)) return undefined;

        let unboxedType = this.getUnboxedType(operand.type);
        let op = operator == TokenType.plusPlus ? "+" : "-";
        let newObject = (oldObject: string) => `new ${Helpers.classes}["${boxedIdentifier}"](${oldObject}.value ${op} 1)`;

        let build = isPrefix ?
            // ++i: assign new object, value of expression is new value
            (v: string) => `(${v} = ${newObject(Helpers.checkNPE(v, range))}).value` :
            // i++: assign new object, value of expression is old value
            (v: string) => `((__boxed) => (${v} = ${newObject('__boxed')}, __boxed.value))(${Helpers.checkNPE(v, range)})`;

        return this.updateVariable(operand, unboxedType, range, build);
    }

    applyUnaryOperatorConsideringConstantFolding(operator: string, resultType: JavaType, range: IRange, snippet: Expr): Expr {
        if (isConstant(snippet)) {
            let operand = snippet.constant!;
            let result!: ConstantValue;

            switch (operator) {
                case "-": result = -operand; break;
                case "+": return snippet;
                case "~": result = ~operand; break;
                case "!": result = !operand; break;
            }

            return term("" + result, resultType, range, result);

        } else {

            return apply(resultType, range, operator + "(§1)", snippet);

        }

    }

    /**
     * left operator right
     */
    binaryOperation(operator: string, resultType: JavaType, range: IRange, left: Expr, right: Expr): Expr {
        if (isConstant(left) && isConstant(right)) {
            return this.foldConstants(left, right, operator, resultType, range);
        }

        return combine(resultType, range, [left, right], this.getBinaryOperationBuild(operator, left, right, range));
    }

    getBinaryOperationBuild(operator: string, left: Expr, right: Expr, range: IRange): Build {
        if (operator != "/" && operator != "%") return (l, r) => l + " " + operator + " " + r;

        let prefix: string = "";
        let suffix: string = "";
        let isIntegral = (type: JavaType | undefined) => type instanceof PrimitiveType && type.isByteShortIntLong();
        if (operator == "/" && isIntegral(left.type) && isIntegral(right.type)) {
            prefix = "Math.trunc( ";
            suffix = ")";
        }

        if (isConstant(right) && right.constant != 0) {
            return (l, r) => prefix + l + " " + operator + " " + r + suffix;
        }

        return (l, r) => prefix + l + " " + operator + " (" + r +
            `|| ${Helpers.throwArithmeticException}("${JCM.divideByZero()}", ${range.startLineNumber}, ${range.startColumn}, ${range.endLineNumber}, ${range.endColumn}))` + suffix;
    }

    foldConstants(left: Expr, right: Expr, operator: string, resultType: JavaType, range: IRange): Expr {

        let value0: any = left.constant!;
        let value1: any = right.constant!;

        let result!: ConstantValue;

        switch (operator) {
            case "+": result = value0 + value1; break;
            case "-": result = value0 - value1; break;
            case "*": result = value0 * value1; break;
            case "/":
                if ((<PrimitiveType>left.type).isByteShortIntLong() && (<PrimitiveType>right.type).isByteShortIntLong()) {
                    result = Math.trunc(Math.trunc(<number>value0) / Math.trunc(<number>value1));
                    break;
                }
                result = <number>value0 / <number>value1; break;
            case "%": result = value0 % value1; break;
            case "<": result = value0 < value1; break;
            case ">": result = value0 > value1; break;
            case "<=": result = value0 <= value1; break;
            case ">=": result = value0 >= value1; break;
            case "!=": result = value0 != value1; break;
            case "==": result = value0 == value1; break;
            case "&&": result = value0 && value1; break;
            case "||": result = value0 || value1; break;
            case "&": result = value0 & value1; break;
            case "|": result = value0 | value1; break;
            case "^": result = value0 ^ value1; break;
            case "<<": result = value0 << value1; break;
            case ">>": result = value0 >> value1; break;
            case ">>>": result = value0 >>> value1; break;
        }

        let resultAsCode = typeof result == "string" ? `"${this.escapeString(result)}"` : result + "";

        return term(resultAsCode, resultType, range, result);

    }

    escapeString(s: string): string {
        s = s.replaceAll("\\", "\\\\");
        s = s.replaceAll("\n", "\\n");
        s = s.replaceAll("\t", "\\t");
        s = s.replaceAll("\r", "\\r");
        s = s.replaceAll("\"", "\\\"");
        return s;
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
    abstract compileAnonymousInnerClass(node: ASTAnonymousClassNode): Expr | undefined;

    abstract compileLambdaFunction(node: ASTLambdaFunctionDeclarationNode, expectedType: JavaType | undefined): Expr | undefined;


}