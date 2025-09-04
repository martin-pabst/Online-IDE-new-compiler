import { Program } from "../../common/interpreter/Program.ts";
import { IRange } from "../../common/range/Range";
import { TokenType } from "../TokenType";
import { JavaSymbolTable } from "../codegenerator/JavaSymbolTable.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import { GenericTypeParameter } from "../types/GenericTypeParameter.ts";
import { JavaClass } from "../types/JavaClass.ts";
import { JavaEnum } from "../types/JavaEnum.ts";
import { JavaInterface } from "../types/JavaInterface.ts";
import { JavaType } from "../types/JavaType.ts";
import { JavaMethod } from "../types/JavaMethod.ts";
import { Visibility } from "../types/Visibility.ts";
import type * as monaco from 'monaco-editor'
import { JavaLocalVariable } from "../codegenerator/JavaLocalVariable.ts";
import { JavaField } from "../types/JavaField.ts";


export type ASTNodes = ASTNode[];

export type AssignmentOperator = TokenType.assignment | TokenType.minusAssignment | TokenType.plusAssignment | TokenType.multiplicationAssignment | TokenType.divisionAssignment | TokenType.moduloAssignment;

export type LogicOperator = TokenType.and | TokenType.or | TokenType.XOR;

export type ShiftOperator = TokenType.shiftLeft | TokenType.shiftRight | TokenType.shiftRightUnsigned;

export type ComparisonOperator = TokenType.lower | TokenType.greater | TokenType.lowerOrEqual | TokenType.greaterOrEqual | TokenType.notEqual | TokenType.equal;

export type BinaryOperator = AssignmentOperator |
    TokenType.plus | TokenType.minus | TokenType.multiplication | TokenType.division | TokenType.modulo |
    ShiftOperator | LogicOperator | ComparisonOperator | TokenType.keywordInstanceof | TokenType.ternaryOperator | TokenType.colon;

export type UnaryPrefixOperator = TokenType.minus | TokenType.not | TokenType.tilde | TokenType.plus | TokenType.plusPlus | TokenType.minusMinus;

export type ConstantType = TokenType.shortConstant | TokenType.integerLiteral | TokenType.longConstant | TokenType.charLiteral | TokenType.stringLiteral | TokenType.booleanLiteral;

export interface ASTNode {
    kind: TokenType;
    range: IRange;
}

export interface ASTDebugProgram extends ASTNode {
    kind: TokenType.astProgram,
    program: Program;
}

export interface TypeScope {
    kind: TokenType.keywordClass | TokenType.keywordInterface | TokenType.keywordEnum | TokenType.global | TokenType.methodDeclaration;

    innerTypes: (ASTClassDefinitionNode | ASTInterfaceDefinitionNode | ASTEnumDefinitionNode)[];
    path: string;
    symbolTable?: JavaSymbolTable;

}

export interface ASTGlobalNode extends ASTNode, TypeScope {
    kind: TokenType.global;
    mainProgramNode: ASTProgramNode;

    collectedTypeNodes: ASTTypeNode[];      // if compile target is "Program"

}

/**
 * Building blocks for nodes...
 */

export interface ASTNodeWithIdentifier {
    identifier: string;
    identifierRange: IRange;
}

export interface ASTNodeWithModifiers {
    range: IRange,
    visibility: Visibility;
    isFinal: boolean;
    isStatic: boolean;
    isAbstract: boolean;
    isDefault: boolean;
    isSynchronized: boolean;
    documentation?: string;
}


// e.g. ..., int count, ...
export interface ASTParameterNode extends ASTNode, ASTNodeWithIdentifier {
    kind: TokenType.parameterDeclaration;
    type: ASTTypeNode | undefined;    // lambda functions may have parameters without type declaration
    isEllipsis: boolean;
    isFinal: boolean;
    trackMissingReadAccess: boolean;
}

export interface AnnotatedNode {
    annotations: ASTAnnotationNode[]
}

export interface TypeDefinition {
    resolvedType: JavaType | undefined;
    path: string;
    parent?: TypeScope;
    module: JavaCompiledModule;
}

export interface TypeDefinitionWithMethods {
    methods: ASTMethodDeclarationNode[]
}

export interface ASTTypeDefinitionWithFields {
    fieldsOrInstanceInitializers: (ASTFieldDeclarationNode | ASTInstanceInitializerNode | ASTStaticInitializerNode)[]
}

export interface ASTGenericParameterDeclarationNode extends ASTNodeWithIdentifier, ASTNode {
    kind: TokenType.genericParameterDefinition;
    extends?: ASTTypeNode[];
    super?: ASTTypeNode;
    resolvedType?: GenericTypeParameter;
}

// e.g. class List<E extends Comparable<E>>
export interface ASTTypeDefinitionWithGenerics {
    genericParameterDeclarations: ASTGenericParameterDeclarationNode[]
}


/**
 * Nodes for class, interface, enum
 */
// e.g. HashMap<String, Integer>
export interface ASTTypeNode extends ASTNode {
    kind: TokenType.baseType | TokenType.wildcardType | TokenType.varType
    | TokenType.voidType | TokenType.arrayType | TokenType.genericTypeInstantiation,

    parentTypeScope?: TypeScope
    resolvedType?: JavaType;
}

export interface ASTWildcardTypeNode extends ASTTypeNode {
    kind: TokenType.wildcardType,
    extends: ASTTypeNode[],
    super?: ASTTypeNode
}

export interface ASTVoidTypeNode extends ASTTypeNode {
    kind: TokenType.voidType
}

// type inference...
export interface ASTVarTypeNode extends ASTTypeNode {
    kind: TokenType.varType
}

export interface ASTArrayTypeNode extends ASTTypeNode {
    kind: TokenType.arrayType,
    arrayDimensions: number,
    arrayOf: ASTTypeNode
}

// instantiation of a generic type with actual type arguments
export interface ASTGenericTypeInstantiationNode extends ASTTypeNode {
    kind: TokenType.genericTypeInstantiation,
    baseType: ASTTypeNode,
    actualTypeArguments: ASTTypeNode[]
}

export interface ASTBaseTypeNode extends ASTTypeNode {
    kind: TokenType.baseType,
    identifiers: ASTNodeWithIdentifier[]
}

// e.g. public int getValue(String key)
export interface ASTMethodDeclarationNode extends ASTNode, ASTNodeWithModifiers,
    ASTNodeWithIdentifier, AnnotatedNode, TypeScope, ASTTypeDefinitionWithGenerics {
    kind: TokenType.methodDeclaration;
    parameters: ASTParameterNode[];
    returnParameterType: ASTTypeNode | undefined;  // undefined in case of constructor
    isContructor: boolean;
    isAbstract: boolean;
    statement: ASTStatementNode | undefined;  // undefined in case of abstract method and methoddeclaration in interface
    method?: JavaMethod;
    program?: Program,       // only for debugging purposes
    parentTypeScope: TypeScope,   // class or interface or enum containing this method
    innerTypes: (ASTClassDefinitionNode | ASTInterfaceDefinitionNode | ASTEnumDefinitionNode)[];
    path: string;
}

export interface ASTLambdaFunctionDeclarationNode extends ASTNode {
    kind: TokenType.lambdaOperator,
    parameters: ASTParameterNode[],
    statement: ASTStatementNode | undefined
}

export interface ASTFieldDeclarationNode extends ASTNodeWithModifiers, ASTNode,
    ASTNodeWithIdentifier, AnnotatedNode {
    kind: TokenType.fieldDeclaration;
    type: ASTTypeNode;
    initialization: ASTTermNode | undefined;
    resolvedField?: JavaField;
}

export interface ASTInstanceInitializerNode extends ASTStatementNode {
    kind: TokenType.instanceInitializerBlock,
    statements: ASTStatementNode[]
}

export interface ASTStaticInitializerNode extends ASTStatementNode {
    kind: TokenType.staticInitializerBlock,
    statements: ASTStatementNode[]
}

export interface ASTClassDefinitionNode
    extends ASTNode, TypeDefinitionWithMethods, ASTTypeDefinitionWithGenerics, ASTNodeWithModifiers,
    ASTTypeDefinitionWithFields, TypeScope, ASTNodeWithIdentifier, AnnotatedNode, TypeDefinition {
    kind: TokenType.keywordClass;
    extends: ASTTypeNode | undefined,
    implements: ASTTypeNode[],
    resolvedType: JavaClass | undefined;
    isAnonymousInnerType: boolean;

    isMainClass: boolean;

    staticInitializer?: Program       // only for debugging purposes,
}

export interface ASTInterfaceDefinitionNode
extends ASTNode, TypeDefinitionWithMethods, ASTTypeDefinitionWithGenerics, ASTNodeWithModifiers,
ASTNodeWithIdentifier, AnnotatedNode, ASTTypeDefinitionWithFields, TypeScope, TypeDefinition {
    kind: TokenType.keywordInterface;
    implements: ASTTypeNode[];
    resolvedType: JavaInterface | undefined;
    isAnonymousInnerType: boolean;

    staticInitializer?: Program       // only for debugging purposes,
}

export interface ASTEnumValueNode extends ASTNode {
    kind: TokenType.initializeEnumValue;
    identifier: string;
    identifierRange: IRange;
    parameterValues: ASTTermNode[];
    documentation?: string;
}

export interface ASTEnumDefinitionNode
    extends ASTNode, TypeDefinitionWithMethods, ASTNodeWithModifiers,
    ASTTypeDefinitionWithFields, ASTNodeWithIdentifier,
    AnnotatedNode, TypeDefinition, TypeScope {
    kind: TokenType.keywordEnum;
    valueNodes: ASTEnumValueNode[];
    resolvedType: JavaEnum | undefined;
    isAnonymousInnerType: boolean;

    staticInitializer?: Program       // only for debugging purposes,
}


/**
 * Nodes for Program, statements
 */

export interface ASTSynchronizedBlockNode extends ASTStatementNode {
    kind: TokenType.synchronizedBlock,
    lockObject: ASTTermNode,
    block: ASTBlockNode
}


export interface ASTBlockNode extends ASTStatementNode {
    kind: TokenType.block;
    statements: ASTStatementNode[];
    collectedTypeNodes?: ASTTypeNode[];      // if compile target is "REPL"
}

export interface ASTProgramNode extends ASTNode {
    kind: TokenType.program;
    statements: ASTStatementNode[];
}

export interface ASTStatementNode extends ASTNode {
    isEmpty?: boolean;
}

/**
 * Nodes for Terms
 */

export interface ASTTermNode extends ASTStatementNode {
    parenthesisNeeded?: boolean;

    instanceofVariables?: JavaLocalVariable[];
    negatedInstanceofVariables?: JavaLocalVariable[];
}

export interface ASTBracketNode extends ASTTermNode {
    kind: TokenType.leftBracket;
    nodeInsideBrackets: ASTTermNode;
}

export interface ASTCastNode extends ASTTermNode {
    kind: TokenType.castValue;
    castType: ASTTypeNode;
    objectToCast: ASTTermNode;
}

export interface ASTSymbolNode extends ASTTermNode {
    kind: TokenType.symbol;
    identifier: string;
}

// export interface ASTAssignmentNode extends ASTTermNode {
//     kind: AssignmentOperator;
//     leftSide: ASTTermNode;
//     rightSide: ASTTermNode;
// }

export interface ASTFirstMainMethodStatementNode extends ASTStatementNode {
    kind: TokenType.firstMainProgramStatement
}

export interface ASTTernaryNode extends ASTTermNode {
    kind: TokenType.ternaryOperator;
    condition: ASTTermNode;
    termIfTrue: ASTTermNode;
    termIfFalse: ASTTermNode;
}

export interface ASTInitialFieldAssignmentInMainProgramNodes extends ASTTermNode {
    kind: TokenType.initialFieldAssignementInMainProgram,
    assignments: ASTInitialFieldAssignmentInMain[]
}

export type ASTInitialFieldAssignmentInMain = {
    fieldNode: ASTSymbolNode;
    assignmentOperatorRange: IRange,
    initialTerm: ASTTermNode;
} 

export interface ASTBinaryNode extends ASTTermNode {
    kind: TokenType.binaryOp;
    precedence?: number;
    operator: BinaryOperator;
    operatorRange: IRange,
    leftSide: ASTTermNode;
    rightSide: ASTTermNode;

    instanceofPatternIdentifier?: string;
    instanceofPatternIdentifierRange?: IRange;
}

export interface ASTUnaryPrefixNode extends ASTTermNode {
    kind: TokenType.unaryPrefixOp;
    operator: UnaryPrefixOperator;
    term: ASTTermNode;
}

export interface ASTPlusPlusMinusMinusSuffixNode extends ASTTermNode {
    kind: TokenType.plusPlusMinusMinusSuffix;
    operator: TokenType.plusPlus | TokenType.minusMinus;
    term: ASTTermNode;
}

export interface ASTMethodCallNode extends ASTNodeWithIdentifier, ASTTermNode {
    kind: TokenType.methodCall;
    nodeToGetObject: ASTTermNode | undefined; // undefined if method is called inside class
    parameterValues: ASTTermNode[];
    commaPositions: monaco.IPosition[];
    rightBracketPosition?: monaco.IPosition;
}

export interface ASTAttributeDereferencingNode extends ASTTermNode {
    kind: TokenType.dereferenceAttribute;
    nodeToGetObject: ASTTermNode | undefined;
    attributeIdentifier: string;
}

export interface ASTNewObjectNode extends ASTTermNode {
    kind: TokenType.newObject;
    klassIdentifierRange: monaco.IRange;
    type: ASTTypeNode;
    parameterValues: ASTTermNode[];
    object?: ASTTermNode;
    commaPositions: monaco.IPosition[];
    rightBracketPosition?: monaco.IPosition;
}

export interface ASTAnonymousClassNode extends ASTTermNode {
    kind: TokenType.anonymousClass;
    newObjectNode: ASTNewObjectNode;
    klass: ASTClassDefinitionNode;
}

// Tobias: new Array
export interface ASTNewArrayNode extends ASTTermNode {
    kind: TokenType.newArray;
    arrayType: ASTTypeNode;
    // first alternative: Array with given number of null/0-entries:
    dimensions: ASTTermNode[];

    // second alternative: Array literal
    dimensionCount?: number,
    initialization?: ASTArrayLiteralNode
}

export interface ASTSelectArrayElementNode extends ASTTermNode {
    kind: TokenType.selectArrayElement,
    array: ASTTermNode,
    indices: ASTTermNode[]
}

export interface ASTPrintStatementNode extends ASTTermNode {
    kind: TokenType.print,
    isPrintln: boolean,
    firstParameter: ASTTermNode | undefined,
    secondParameter: ASTTermNode | undefined,
    commaPositions: monaco.IPosition[],
    rightBracketPosition?: monaco.IPosition
}

export interface ASTLiteralNode extends ASTTermNode {
    kind: TokenType.literal,
    constantType: TokenType,
    value: string | boolean | number | null
}

export interface ASTArrayLiteralNode extends ASTTermNode {
    kind: TokenType.arrayLiteral,
    elements: ASTTermNode[]
}

export interface ASTThisNode extends ASTTermNode {
    kind: TokenType.keywordThis;
}

export interface ASTSuperNode extends ASTTermNode {
    kind: TokenType.keywordSuper;
}

export interface ASTLocalVariableDeclarations extends ASTStatementNode {
    kind: TokenType.localVariableDeclarations,
    declarations: ASTLocalVariableDeclaration[]
}

export interface ASTLocalVariableDeclaration extends ASTStatementNode, ASTNodeWithIdentifier {
    kind: TokenType.localVariableDeclaration;
    type: ASTTypeNode;
    initialization: ASTTermNode | undefined;
    isFinal: boolean;
}

/**
 * Structural statements: while, if, for, case, do...while
 */
export interface ASTWhileNode extends ASTStatementNode {
    kind: TokenType.keywordWhile;
    condition: ASTTermNode;
    statementToRepeat: ASTStatementNode;
}

export interface ASTDoWhileNode extends ASTStatementNode {
    kind: TokenType.keywordDo;
    condition: ASTTermNode;
    statementToRepeat: ASTStatementNode;
}

export interface ASTIfNode extends ASTStatementNode {
    kind: TokenType.keywordIf;
    condition: ASTTermNode;
    statementIfTrue: ASTStatementNode;
    statementIfFalse: ASTStatementNode | undefined;
}

export interface ASTForLoopNode extends ASTStatementNode {
    kind: TokenType.keywordFor;
    firstStatement: ASTStatementNode | undefined;
    condition: ASTTermNode | undefined;
    lastStatement: ASTStatementNode | undefined;
    statementToRepeat: ASTStatementNode;
}

export interface ASTEnhancedForLoopNode extends ASTStatementNode {
    kind: TokenType.enhancedForLoop;
    elementIsFinal: boolean,
    elementType: ASTTypeNode;
    elementIdentifier: string;
    elementIdentifierPosition: IRange;
    collection: ASTTermNode;
    statementToRepeat: ASTStatementNode;
}

export interface ASTCaseNode extends ASTNode {
    kind: TokenType.keywordCase;
    constant: ASTTermNode | undefined;  // undefined in case of default:
    statements: ASTStatementNode[];
}

export interface ASTSwitchCaseNode extends ASTStatementNode {
    kind: TokenType.keywordSwitch;
    term: ASTTermNode;
    caseNodes: ASTCaseNode[];
    defaultNode: ASTCaseNode | undefined;
}

export interface ASTContinueNode extends ASTStatementNode {
    kind: TokenType.keywordContinue;
}

export interface ASTBreakNode extends ASTStatementNode {
    kind: TokenType.keywordBreak;
}

export interface ASTContinueNode extends ASTStatementNode {
    kind: TokenType.keywordContinue;
}

export interface ASTReturnNode extends ASTStatementNode {
    kind: TokenType.keywordReturn;
    term: ASTTermNode | undefined;
    keywordReturnRange: IRange;
}

export interface ASTCatchNode extends ASTStatementNode {
    kind: TokenType.keywordCatch;
    exceptionTypes: ASTTypeNode[],
    exceptionIdentifier: string,
    exceptionIdentifierPosition: IRange,
    statement: ASTStatementNode
}

export interface ASTThrowNode extends ASTStatementNode {
    kind: TokenType.keywordThrow;
    exception: ASTTermNode;
}

export interface ASTTryCatchNode extends ASTStatementNode {
    kind: TokenType.keywordTry;
    tryStatement: ASTStatementNode;
    catchCases: ASTCatchNode[];
    finallyStatement?: ASTStatementNode;
}

export interface ASTAnnotationNode extends ASTStatementNode {
    kind: TokenType.annotation;
    identifier: string;
}