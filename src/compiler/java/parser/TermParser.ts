import { EmptyRange, IRange, Range } from "../../common/range/Range.ts";
import { TokenType, TokenTypeReadable } from "../TokenType.ts";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { Token } from "../lexer/Token.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import { ASTBinaryNode, ASTCastNode, ASTClassDefinitionNode, ASTInterfaceDefinitionNode, ASTLambdaFunctionDeclarationNode, ASTNewObjectNode, ASTSelectArrayElementNode, ASTStatementNode, ASTTermNode, ASTTypeNode, ASTSymbolNode, BinaryOperator, ASTAnonymousClassNode, ASTReturnNode, ASTMethodDeclarationNode, ASTWildcardTypeNode, ASTGenericTypeInstantiationNode, ASTArrayTypeNode, ASTArrayLiteralNode, ASTMethodCallNode, ASTBaseTypeNode } from "./AST.ts";
import { ASTNodeFactory } from "./ASTNodeFactory.ts";
import { TokenIterator } from "./TokenIterator.ts";

export abstract class TermParser extends TokenIterator {
    static assignmentOperators = [TokenType.assignment, TokenType.plusAssignment, TokenType.minusAssignment,
    TokenType.multiplicationAssignment, TokenType.divisionAssignment, TokenType.moduloAssignment,
    TokenType.ANDAssigment, TokenType.XORAssigment, TokenType.ORAssigment,
    TokenType.shiftLeftAssigment, TokenType.shiftRightAssigment, TokenType.shiftRightUnsignedAssigment];

    static unaryPrefixOperators: TokenType[] = [
        TokenType.plus, TokenType.minus, TokenType.not, TokenType.tilde, TokenType.plusPlus, TokenType.minusMinus
    ];

    static ternaryOperatorArray = [TokenType.ternaryOperator, TokenType.colon];

    static operatorPrecedence: TokenType[][] = [
        // Lambda-Operator: -1
        TermParser.assignmentOperators, // 0
        TermParser.ternaryOperatorArray,    // 1
        [TokenType.or],                 // 3
        [TokenType.and],                // 4
        [TokenType.OR],                 // 5
        [TokenType.XOR],                // 6
        [TokenType.ampersand],          // 7
        [TokenType.equal, TokenType.notEqual],      // 8
        [TokenType.keywordInstanceof, TokenType.lower, TokenType.lowerOrEqual, TokenType.greater, TokenType.greaterOrEqual],    // 9
        [TokenType.shiftLeft, TokenType.shiftRight, TokenType.shiftRightUnsigned],  // 10
        [TokenType.plus, TokenType.minus],                                          // 11
        [TokenType.multiplication, TokenType.division, TokenType.modulo]           // 12

        // cast: 20
        // unary (pre): 21
        // unary (post): 22
        // array access: 23
        // member access: 24
    ];

    static ternaryOperatorPrecedence = this.operatorPrecedence.indexOf(TermParser.ternaryOperatorArray);

    operatorToPrecedenceMap: { [op: number]: number } = {};

    nodeFactory!: ASTNodeFactory;

    currentClassOrInterface?: ASTClassDefinitionNode | ASTInterfaceDefinitionNode;
    currentMethod?: ASTMethodDeclarationNode;

    firstStatementInsideMethodBodyNotYetCompiled: boolean = true;

    constructor(public module: JavaCompiledModule) {
        super(module.tokens!, module);

        this.initOperatorToPrecedenceMap();

    }

    initOperatorToPrecedenceMap() {
        for (let i = 0; i < TermParser.operatorPrecedence.length; i++) {
            for (let op of TermParser.operatorPrecedence[i]) {
                this.operatorToPrecedenceMap[op] = i;
            }
        }
    }

    abstract parseStatementOrExpression(): ASTStatementNode | undefined;

    /**
     * Grammar:
     * https://docs.oracle.com/javase/specs/jls/se8/html/jls-19.html
     *
     * Operator precedence:
     * https://introcs.cs.princeton.edu/java/11precedence/
     *
     */


    parseTerm(): ASTTermNode | undefined {

        return this.parseTermBinary();

    }

    parseTermBinary(): ASTTermNode | undefined {

        let node: ASTTermNode | undefined = this.parsePraefixSuffix();
        if (!node) return node;

        let precedence: number | undefined;
        let rightRidgeHeight = 1;

        while ((precedence = this.operatorToPrecedenceMap[this.tt]) != null) {

            let operator = this.tt;
            let operatorRange = this.cct.range;
            this.nextToken();
            let newRightNode: ASTTermNode | undefined = this.parsePraefixSuffix();
            if (newRightNode == null) {
                this.pushError(JCM.secondOperandExpected(TokenTypeReadable[operator]), "error")
                return node;
            }

            let instanceofPatternIdentifier: Token;
            if(operator == TokenType.keywordInstanceof && this.comesToken(TokenType.identifier, false)){
                instanceofPatternIdentifier = this.cct;
                this.nextToken();
            }

            let h: number = 1;
            let newLeftNodesParent: ASTBinaryNode | null = null;
            let newLeftNode: ASTTermNode = node;

            if (precedence == TermParser.ternaryOperatorPrecedence) {
                // ternary operator is evaluated right to left: a ? b ? c : d : e -> a ? (b ? c : d) : e
                // The conditional operator is syntactically right-associative (it groups right-to-left). Thus, a?b:c?d:e?f:g means the same as a?b:(c?d:(e?f:g)).
                // See: https://docs.oracle.com/javase/specs/jls/se17/html/jls-15.html#jls-15.25

                while (h < rightRidgeHeight && (<ASTBinaryNode>newLeftNode).precedence! <= precedence &&
                    !(operator == TokenType.colon && (<ASTBinaryNode>(<ASTBinaryNode>newLeftNode).rightSide)?.operator == TokenType.colon)
                ) {
                    newLeftNodesParent = <ASTBinaryNode>newLeftNode;
                    newLeftNode = (<ASTBinaryNode>newLeftNode).rightSide;
                    h++;
                }
            } else {
                while (h < rightRidgeHeight && (<ASTBinaryNode>newLeftNode).precedence! < precedence) {
                    newLeftNodesParent = <ASTBinaryNode>newLeftNode;
                    newLeftNode = (<ASTBinaryNode>newLeftNode).rightSide;
                    h++;
                }
            }

            let newNode: ASTBinaryNode =
            {
                kind: TokenType.binaryOp,
                range: {
                    startLineNumber: newLeftNode.range.startLineNumber, startColumn: newLeftNode.range.startColumn,
                    endLineNumber: newRightNode.range.endLineNumber, endColumn: newRightNode.range.endColumn
                },
                precedence: precedence,
                operator: <BinaryOperator>operator,
                operatorRange: operatorRange,
                leftSide: newLeftNode,
                rightSide: newRightNode,
                instanceofPatternIdentifier: <string>instanceofPatternIdentifier?.value,
                instanceofPatternIdentifierRange: instanceofPatternIdentifier?.range
            }

            if (newLeftNodesParent) {
                newLeftNodesParent.rightSide = newNode;
            } else {
                node = newNode;
            }

            rightRidgeHeight = h + 1;

        }

        return node;

    }

    parsePraefixSuffix(): ASTTermNode | undefined {
        let prefix = TermParser.unaryPrefixOperators.indexOf(this.tt) >= 0 ? this.cct : undefined;
        if (prefix) this.nextToken();

        let term: ASTTermNode | undefined = this.parseTermUnary();

        if (term && prefix) {
            term = this.nodeFactory.buildUnaryPrefixNode(prefix, term);
        }

        let plusPlusMinusMinusSuffix = (this.tt == TokenType.plusPlus || this.tt == TokenType.minusMinus) ? this.cct : undefined;
        if (plusPlusMinusMinusSuffix) {
            this.nextToken();
            if (term) {
                term = this.nodeFactory.buildPlusPlusMinusMinusSuffixNode(plusPlusMinusMinusSuffix, term);
            }
        }

        return term;
    }

    /**
     *
     */

    parseTermUnary(): ASTTermNode | undefined {

        let node: ASTTermNode | undefined = undefined;


        switch (this.tt) {
            case TokenType.leftBracket:
                let tokenTypeAfterRightBracket = this.findTokenTypeAfterCorrespondingRightBracket();
                switch (tokenTypeAfterRightBracket) {
                    case TokenType.lambdaOperator: node = this.parseLambdaFunctionDefinition();
                        break;
                    case TokenType.leftBracket:
                    case TokenType.identifier:
                    case TokenType.keywordThis:
                    case TokenType.keywordSuper:
                    case TokenType.shortConstant:
                    case TokenType.integerLiteral:
                    case TokenType.longConstant:
                    case TokenType.floatLiteral:
                    case TokenType.doubleConstant:
                    case TokenType.booleanLiteral:
                    case TokenType.stringLiteral:
                    case TokenType.charLiteral:
                    case TokenType.true:
                    case TokenType.false:

                        node = this.parseCastedObject();
                        break;
                    default:
                        let startPos = this.cct.range;
                        this.nextToken();
                        node = this.parseTerm();
                        if (node) {
                            node.parenthesisNeeded = true;
                            let range: IRange = {
                                startColumn: startPos.startColumn,
                                startLineNumber: startPos.startLineNumber,
                                endColumn: this.cct.range.endColumn,
                                endLineNumber: this.cct.range.endLineNumber
                            }
                            this.expect(TokenType.rightBracket, true);
                            node = this.nodeFactory.buildBracketNode(range, node);
                        }
                }
                break;
            case TokenType.identifier:
                switch (this.lookahead(1).tt) {
                    case TokenType.leftBracket:
                        node = this.parseMethodCall(undefined);
                        break;
                    case TokenType.lambdaOperator:
                        node = this.parseLambdaFunctionDefinition();
                        break;
                    default:
                        node = this.parseVariable();

                }
                break;
            case TokenType.keywordNew:
                // parse new ArrayList<String>(), new int[10][20], new ArrayList<Integer>[20], ...
                let leftBracketOrLeftSquareBracket = this.lookForTokenTillOtherToken([TokenType.leftBracket, TokenType.leftSquareBracket, TokenType.leftRightSquareBracket], [TokenType.semicolon, TokenType.leftCurlyBracket])
                switch (leftBracketOrLeftSquareBracket) {
                    case TokenType.leftBracket:
                        node = this.parseNewObjectInstantiation(undefined);
                        break;
                    case TokenType.leftSquareBracket:
                    case TokenType.leftRightSquareBracket:
                        node = this.parseNewArray();
                        break;
                    default:
                        this.pushError(JCM.wrongSyntaxAfterKeywordNew(), "error");
                        this.skipTokensTillEndOfLineOr([TokenType.semicolon, TokenType.comma, TokenType.rightBracket], false);
                        break;
                }
                break;
            case TokenType.keywordPrint:
            case TokenType.keywordPrintln:
                node = this.parsePrintStatement();
                break;
            case TokenType.shortConstant:
            case TokenType.integerLiteral:
            case TokenType.floatLiteral:
            case TokenType.doubleConstant:
            case TokenType.longConstant:
            case TokenType.charLiteral:
            case TokenType.stringLiteral:
            case TokenType.booleanLiteral:
            case TokenType.keywordNull:
                node = this.nodeFactory.buildConstantNode(this.getAndSkipToken());
                break;
            case TokenType.keywordThis:
                let thisToken = this.getAndSkipToken();
                node = this.nodeFactory.buildThisNode(thisToken);
                if (this.comesToken(TokenType.leftBracket, false)) {
                    node = this.buildMethodCallNode(thisToken, node);
                }
                break;
            case TokenType.keywordSuper:
                let superToken = this.getAndSkipToken();
                node = this.nodeFactory.buildSuperNode(superToken);
                if (this.comesToken(TokenType.leftBracket, false)) {
                    node = this.buildMethodCallNode(superToken, node);
                    if(!this.firstStatementInsideMethodBodyNotYetCompiled){
                        this.pushError(JCM.superCallInsideConstructorAfterFirstStatement(), "error", superToken.range);
                    }
                }
                break;
            case TokenType.leftCurlyBracket:
                node = this.parseArrayLiteral();
                break;
            case TokenType.keywordElse:
                this.pushError(JCM.unexpectedToken("" + this.cct.value));
                this.nextToken();
                break;
        }

        if (node) {
            while ([TokenType.dot, TokenType.leftSquareBracket].indexOf(this.tt) >= 0) {

                switch (this.tt) {
                    case TokenType.dot:
                        this.nextToken(); // skip dot
                        //@ts-ignore
                        if (this.tt == TokenType.keywordNew) {
                            node = this.parseNewObjectInstantiation(node);
                        } else {
                            node = this.parseAttributeOrMethodCall(node)
                        }
                        break;
                    case TokenType.leftSquareBracket:
                        node = this.parseSelectArrayElement(node);
                        break;
                }

            }
        }

        return node;

    }


    parseAttributeOrMethodCall(node: ASTTermNode | undefined): ASTTermNode | undefined {
        if (!node) {
            this.pushError(JCM.dotOperatorNotExpected(), "error");
            return undefined;
        } else {
            if (this.lookahead(1).tt == TokenType.leftBracket) {
                return this.parseMethodCall(node);
            } else {
                let identifier =
                    this.tt == TokenType.keywordSuper ? this.getAndSkipToken() : this.expectAndSkipIdentifierAsToken();
                if (identifier.value == "") return node;
                return this.nodeFactory.buildAttributeDereferencingNode(node, identifier);
            }
        }
    }

    parseMethodCall(nodeToGetObject: ASTTermNode | undefined): ASTTermNode | undefined {
        let identifier = this.expectAndSkipIdentifierAsToken();
        if (identifier.value == "") return nodeToGetObject;
        return this.buildMethodCallNode(identifier, nodeToGetObject);
    }

    buildMethodCallNode(identifier: Token, nodeToGetObject: ASTTermNode | undefined): ASTMethodCallNode | undefined {
        this.expect(TokenType.leftBracket, true);
        let methodCallNode = this.nodeFactory.buildMethodCallNode(identifier, nodeToGetObject);

        if (this.tt != TokenType.rightBracket) {
            do {
                let termNode = this.parseTerm();
                if (termNode) methodCallNode.parameterValues.push(termNode);
                if (this.comesToken(TokenType.comma, false)) {
                    methodCallNode.commaPositions.push(Range.getStartPosition(this.cct.range));
                }
            } while (this.comesToken(TokenType.comma, true));
        }

        methodCallNode.rightBracketPosition = Range.getStartPosition(this.cct.range);
        this.expect(TokenType.rightBracket, true);
        this.setEndOfRange(methodCallNode);
        return methodCallNode;
    }

    parseLambdaFunctionDefinition(): ASTLambdaFunctionDeclarationNode {

        let lambdaNode = this.nodeFactory.buildLambdaFunctionDeclarationNode(this.cct);

        // form (int x, y) -> ... or
        if (this.tt == TokenType.leftBracket) {
            this.nextToken();
            //@ts-ignore
            if (this.tt != TokenType.rightBracket) {
                do {
                    let startRange = this.cct.range;
                    let withoutType = [TokenType.comma, TokenType.rightBracket].indexOf(this.lookahead(1).tt) >= 0;

                    let type: ASTTypeNode | undefined;

                    if (!withoutType) {
                        type = this.parseType(false);
                    }

                    let identifier = this.expectAndSkipIdentifierAsToken();
                    if (identifier.value != "") {
                        lambdaNode.parameters.push(this.nodeFactory.buildParameterNode(startRange, identifier, type, false, false));
                    }

                } while (this.comesToken(TokenType.comma, true));
            }

            this.expect(TokenType.rightBracket, true);
        } else {
            let identifier = this.expectAndSkipIdentifierAsToken();
            if (identifier.value != "") lambdaNode.parameters.push(this.nodeFactory.buildParameterNode(identifier.range, identifier, undefined, false, false));
        }

        this.expect(TokenType.lambdaOperator, true);

        if (this.comesToken(TokenType.leftCurlyBracket, false)) {
            lambdaNode.statement = this.parseStatementOrExpression();
        } else {
            let expression = this.parseTerm();
            if (expression) {
                let statement: ASTReturnNode = {
                    kind: TokenType.keywordReturn,
                    range: expression?.range,
                    term: expression,
                    keywordReturnRange: expression.range
                }
                lambdaNode.statement = statement;
            } else {
                this.pushError(JCM.cantGetTypeOfExpression())
            }
        }

        this.setEndOfRange(lambdaNode);

        return lambdaNode;
    }

    parseType(replaceStringByPrimitiveString: boolean): ASTTypeNode | undefined {

        let returnedType: ASTTypeNode | undefined;

        switch (this.tt) {
            case TokenType.keywordVoid:
                returnedType = this.nodeFactory.buildVoidTypeNode(this.getRangeAndThenSkipToken());
                break;
            case TokenType.keywordVar:
                returnedType = this.nodeFactory.buildVarTypeNode(this.getRangeAndThenSkipToken());
                break;
            case TokenType.ternaryOperator:
                let wildcardType = this.nodeFactory.buildWildcardTypeNode(this.getRangeAndThenSkipToken());
                if (this.comesToken(TokenType.keywordExtends, true)) {
                    do {
                        let t1 = this.parseType(false);
                        if (t1) wildcardType.extends.push(t1);
                    } while (this.comesToken(TokenType.ampersand, true));
                }
                if (this.comesToken(TokenType.keywordSuper, true)) {
                    wildcardType.super = this.parseType(false);
                }
                returnedType = wildcardType;
                break;
            case TokenType.identifier:
                let range: IRange = this.cct.range;
                let identifier = this.expectAndSkipIdentifierAsString();

                if (this.comesToken(TokenType.ellipsis, false)) replaceStringByPrimitiveString = true;

                if (replaceStringByPrimitiveString && identifier == "String") {
                    identifier = "string";
                }

                let type: ASTTypeNode = this.nodeFactory.buildBaseTypeNode(identifier, range);

                while (this.comesToken(TokenType.dot, true)) {
                    let stringToken = this.expectAndSkipIdentifierAsToken();
                    if (stringToken) {
                        (<ASTBaseTypeNode>type).identifiers.push({
                            identifier: <string>stringToken.value,
                            identifierRange: stringToken.range
                        });
                        this.setEndOfRange(type);
                    }
                }


                this.setEndOfRange(type);

                if (this.comesToken(TokenType.lower, true)) {     // generic parameter invocation?
                    type = this.nodeFactory.buildGenericTypeInstantiationNode(type, type.range);
                    do {
                        let actualTypeArgument = this.parseType(false);
                        if (actualTypeArgument) (<ASTGenericTypeInstantiationNode>type).actualTypeArguments.push(actualTypeArgument);
                    } while (this.comesToken(TokenType.comma, true))

                    if (this.comesToken(TokenType.shiftRight, false)) {
                        this.exchangeShiftRightForTwoClosingGreater();
                    }

                    this.expect(TokenType.greater, true);
                    this.setEndOfRange(type);
                }

                if (this.comesToken(TokenType.leftRightSquareBracket, true)) {
                    type = this.nodeFactory.buildArrayTypeNode(type, type.range);
                    // [][][] at the end of type
                    while (this.comesToken(TokenType.leftRightSquareBracket, true)) (<ASTArrayTypeNode>type).arrayDimensions++;
                    this.setEndOfRange(type);
                }

                returnedType = type;
                break;
        }

        if (returnedType) {
            this.module.ast?.collectedTypeNodes!.push(returnedType);
        }

        return returnedType;

    }


    buildBaseType(identifier: string): ASTTypeNode {
        let type: ASTTypeNode;
        if (identifier == "void") {
            type = this.nodeFactory.buildVoidTypeNode(EmptyRange.instance);
        } else {
            type = this.nodeFactory.buildBaseTypeNode(identifier, EmptyRange.instance);
        }

        this.module.ast?.collectedTypeNodes!.push(type);

        return type;
    }


    parseCastedObject(): ASTCastNode | undefined {
        let startToken = this.cct;
        this.nextToken(); // skip (
        let type = this.parseType(true);
        this.expect(TokenType.rightBracket);
        let term = this.parseTermUnary();

        if (type && term) {
            let castNode = this.nodeFactory.buildCastNode(startToken, type, term);
            this.setEndOfRange(castNode);
            return castNode;
        }

        return undefined;
    }

    parseVariable(): ASTSymbolNode | undefined {
        let identifier = this.expectAndSkipIdentifierAsToken();
        if (identifier.value != "") {
            return this.nodeFactory.buildVariableNode(identifier);
        }

        return undefined;
    }


    parseNewArray(): ASTTermNode | undefined {
        let startToken = this.cct;
        this.nextToken(); // skip new keyword
        let type = this.parseType(true);

        if (!type) return undefined;

        let newArrayNode = this.nodeFactory.buildNewArrayNode(startToken, type, []);


        let dimension: number = 0;
        if (this.comesToken(TokenType.leftSquareBracket, false)) {
            do {
                if (this.comesToken(TokenType.leftRightSquareBracket, false)) {
                    if (dimension == 0) {
                        this.pushError(JCM.firstArrayDimensionMustNotBeZero(), "error");
                    } else {
                        newArrayNode.dimensions.push(this.nodeFactory.buildConstantNode({ tt: TokenType.integerLiteral, value: 0, range: this.cct.range }));
                    }
                    this.nextToken();
                } else {
                    this.nextToken();
                    let termNode = this.parseTerm();
                    if (termNode) newArrayNode.dimensions.push(termNode);
                    this.expect(TokenType.rightSquareBracket);
                }
                dimension++;
            } while (this.comesToken([TokenType.leftSquareBracket, TokenType.leftRightSquareBracket], false));


        } else if ('arrayDimensions' in type && 'arrayOf' in type) {
            let dimension = type.arrayDimensions as number;
            newArrayNode.dimensionCount = dimension;
            if (dimension == 1) {
                newArrayNode.arrayType = type.arrayOf as ASTTypeNode;
            } else {
                newArrayNode.arrayType = this.nodeFactory.buildArrayTypeNode(type.arrayOf as ASTTypeNode, undefined, dimension - 1);
            }

            if (this.expect(TokenType.leftCurlyBracket, false)) {
                newArrayNode.initialization = this.parseArrayLiteral();
            }

        } else {
            this.pushError(JCM.squareBracketExpected(), "error", startToken.range);
            return undefined;
        }

        this.setEndOfRange(newArrayNode);
        return newArrayNode;
    }

    /**
     *
     * @param node  is undefinded except for instantiating objects of named private classes like object.new ClassIdentifier(...)
     * @returns
     */
    parseNewObjectInstantiation(node: ASTTermNode | undefined): ASTNewObjectNode | ASTAnonymousClassNode | undefined {
        let startToken = this.cct;
        this.nextToken(); // skip new keyword
        let type = this.parseType(false);

        if (!type) return undefined;

        let newObjectNode = this.nodeFactory.buildNewObjectNode(startToken, type, node);

        if (this.expect(TokenType.leftBracket), true) {

            if (this.tt != TokenType.rightBracket) {
                do {
                    let termNode = this.parseTerm();
                    if (termNode) newObjectNode.parameterValues.push(termNode);

                    if (this.comesToken(TokenType.comma, false)) {
                        newObjectNode.commaPositions.push(Range.getStartPosition(this.getCurrentRangeCopy()));
                    }

                } while (this.comesToken(TokenType.comma, true));
            }

            newObjectNode.rightBracketPosition = Range.getStartPosition(this.getCurrentRangeCopy());
            this.expect(TokenType.rightBracket, true);
        }

        this.setEndOfRange(newObjectNode);

        if (this.comesToken(TokenType.leftCurlyBracket, false)) {
            return this.parseAnonymousInnerClassBody(newObjectNode);
        } else {
            return newObjectNode;
        }

    }

    abstract parseAnonymousInnerClassBody(newObjectNode: ASTNewObjectNode): ASTAnonymousClassNode | undefined;

    parseSelectArrayElement(array: ASTTermNode | undefined): ASTSelectArrayElementNode | undefined {
        if (!array) {
            this.skipTokensTillEndOfLineOr([TokenType.rightSquareBracket]);
            return undefined;
        }

        let saeNode = this.nodeFactory.buildSelectArrayElement(array);

        while (this.tt == TokenType.leftSquareBracket) {
            this.nextToken();
            let term = this.parseTerm();
            if (term) saeNode.indices.push(term)
            this.expect(TokenType.rightSquareBracket, true);
        }

        this.setEndOfRange(saeNode);

        return saeNode;

    }

    parsePrintStatement() {
        let printlnStatement = this.nodeFactory.buildPrintStatement(this.cct, this.tt == TokenType.keywordPrintln);

        let printTokenRange = this.getCurrentRangeCopy();

        this.nextToken();


        if (this.expect(TokenType.leftBracket, true)) {
            if (this.tt != TokenType.rightBracket) {
                printlnStatement.firstParameter = this.parseTerm();
            }

            if (this.comesToken(TokenType.comma, true)) {
                printlnStatement.commaPositions.push(Range.getStartPosition(this.lastToken.range));
                printlnStatement.secondParameter = this.parseTerm();
            }

            printlnStatement.rightBracketPosition = Range.getStartPosition(this.cct.range);
            this.module.pushMethodCallPosition(printTokenRange, printlnStatement.commaPositions,
                printlnStatement.isPrintln ? "println" : "print", printlnStatement.rightBracketPosition!
            );

            this.expect(TokenType.rightBracket, true);
        }

        return printlnStatement;
    }

    parseArrayLiteral(): ASTArrayLiteralNode {
        let node: ASTArrayLiteralNode = this.nodeFactory.buildArrayLiteralNode();
        this.expect(TokenType.leftCurlyBracket, true);

        if (!this.comesToken(TokenType.rightCurlyBracket, false)) {
            do {
                let elementNode = this.parseTerm();
                if (elementNode) node.elements.push(elementNode);
            } while (this.comesToken(TokenType.comma, true))
        }

        this.setEndOfRange(node);
        this.expect(TokenType.rightCurlyBracket, true);

        return node;
    }
}