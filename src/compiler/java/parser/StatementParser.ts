import { EmptyRange, IRange, Range } from "../../common/range/Range.ts";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { Token } from "../lexer/Token.ts";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import { ReplaceTokenQuickfix } from "../monacoproviders/quickfix/ReplaceTokenQuickfix.ts";
import { TokenType } from "../TokenType.ts";
import { JavaType } from "../types/JavaType.ts";
import { ASTDoWhileNode, ASTForLoopNode, ASTIfNode, ASTLocalVariableDeclarations, ASTReturnNode, ASTEnhancedForLoopNode, ASTStatementNode, ASTSwitchCaseNode, ASTTermNode, ASTThrowNode, ASTTryCatchNode, ASTTypeNode, ASTWhileNode, ASTClassDefinitionNode, ASTEnumDefinitionNode, ASTInterfaceDefinitionNode, ASTNodeWithModifiers, ASTSynchronizedBlockNode, ASTFieldDeclarationNode, ASTBinaryNode, ASTInitialFieldAssignmentInMainProgramNodes } from "./AST.ts";
import { TermParser } from "./TermParser.ts";
import * as monaco from 'monaco-editor'


export abstract class StatementParser extends TermParser {

    protected isCodeOutsideClassdeclarations: boolean = false;

    isInsideMainMethod: boolean = false;
    nestingLevel: number = 0;

    constructor(module: JavaCompiledModule) {
        super(module);
    }

    parseStatementOrExpression(expectSemicolonAfterStatement: boolean = true): ASTStatementNode | undefined {

        switch (this.tt) {
            case TokenType.keywordWhile:
                this.nestingLevel++;
                let ret1 = this.parseWhile();
                this.nestingLevel--;
                return ret1;
            case TokenType.keywordDo:
                this.nestingLevel++;
                let ret2 = this.parseDo();
                this.nestingLevel--;
                return ret2;
            case TokenType.keywordIf:
                this.nestingLevel++;
                let ret3 = this.parseIf();
                this.nestingLevel--;
                return ret3;
            case TokenType.leftCurlyBracket:
                this.nestingLevel++;
                let ret4 = this.parseBlock();
                this.nestingLevel--;
                return ret4;
            case TokenType.keywordFor:
                this.nestingLevel++;
                let ret5 = this.parseFor();
                this.nestingLevel--;
                return ret5;
            case TokenType.keywordSwitch:
                this.nestingLevel++;
                let ret6 = this.parseSwitch();
                this.nestingLevel--;
                return ret6;
            case TokenType.keywordBreak:
                return this.nodeFactory.buildBreakNode(this.getAndSkipTokenWithSemicolon());
            case TokenType.keywordContinue:
                return this.nodeFactory.buildContinueNode(this.getAndSkipTokenWithSemicolon());
            case TokenType.keywordTry:
                this.nestingLevel++;
                let ret7 = this.parseTryCatch();
                this.nestingLevel--;
                return ret7;
            case TokenType.keywordThrow:
                return this.parseThrow();
            case TokenType.keywordReturn:
                return this.parseReturn();
            case TokenType.semicolon:
                let node = this.nodeFactory.buildBlockNode(this.cct);
                node.isEmpty = true;
                this.nextToken();
                return node;
            case TokenType.keywordSynchronized:
                this.nestingLevel++;
                let ret8 = this.parseSynchronizedBlock();
                this.nestingLevel--;
                return ret8;
            default:
                let statement = this.parseVariableDeclarationOrMethodDeclarationTerm(expectSemicolonAfterStatement);

                this.firstStatementInsideMethodBodyNotYetCompiled = false;

                return statement;
        }

    }

    parseSynchronizedBlock(): ASTSynchronizedBlockNode | undefined {
        let synchronizedToken = this.getAndSkipToken();
        if (!this.expect(TokenType.leftBracket, true)) return undefined;
        let lockObject = this.parseTermUnary();
        this.expect(TokenType.rightBracket, true);
        if (this.expect(TokenType.leftCurlyBracket, false)) {
            let block = this.parseBlock();
            if (lockObject && block) return this.nodeFactory.buildSynchronizedBlockNode(synchronizedToken, lockObject, block);
        }

        return undefined;

    }



    parseVariableDeclarationOrMethodDeclarationTerm(expectSemicolonAfterStatement: boolean): ASTStatementNode | undefined {
        let type = this.analyzeIfVariableDeclarationOrMethodDeclarationAhead(this.isCodeOutsideClassdeclarations);
        let statement: ASTStatementNode | undefined;
        let pos = this.pos;
        switch (type) {
            case "variabledeclaration":
                // In main program we convert local variables in uppermost nesting level to fields
                // in order to make them usable in methods inside main program.
                if (this.isInsideMainMethod && this.nestingLevel == 0) {
                    statement = this.convertLocalVariableToStaticField();
                } else {
                    statement = this.parseLocalVariableDeclaration();
                }
                break;
            case "statement":
                statement = this.parseTerm();
                if (statement && statement.kind == TokenType.binaryOp) {
                    let binaryNode = statement as ASTBinaryNode;
                    if (binaryNode.operator == TokenType.equal) {
                        let error = this.pushError(JCM.comparisonOperatorInsteadOfAssignment(), "warning", binaryNode.operatorRange);
                        this.module.quickfixes.push(new ReplaceTokenQuickfix(binaryNode.operatorRange, "=",
                            JCM.ReplaceTokenQuickfixDefaultMessage("==", "="), monaco.MarkerSeverity.Warning, error));
                    }
                }
                break;
            // Only if this.isCodeOutsideClassdeclarations == true:
            case "methoddeclaration":
                if (this.isCodeOutsideClassdeclarations && this.currentMethod == null) {
                    let modifiers = this.nodeFactory.buildNodeWithModifiers(this.cct.range);
                    modifiers.isStatic = true;
                    this.parseFieldOrMethodDeclaration(this.module.mainClass!, modifiers, undefined);
                    return undefined;
                } else {
                    this.pushError(JCM.noMethodDeclarationAllowedHere());
                }
        }

        if (!statement || (expectSemicolonAfterStatement && !this.expectSemicolon(true, true))) {
            if (pos == this.pos) {
                if (!this.module.errors.find(error => error.level == "error")) {
                    this.pushError(JCM.unexpectedToken(this.cct.value + ""))
                }
                this.skipTillNextTokenAfter([TokenType.semicolon, TokenType.newline, TokenType.rightCurlyBracket]);
            }
        }

        return statement;
    }

    abstract parseFieldOrMethodDeclaration(classASTNode: ASTClassDefinitionNode | ASTEnumDefinitionNode | ASTInterfaceDefinitionNode,
        modifiers: ASTNodeWithModifiers, documentation: string | undefined);




    convertLocalVariableToStaticField(): ASTStatementNode | undefined {

        let modifiers = this.nodeFactory.buildNodeWithModifiers(this.cct.range);
        modifiers.isStatic = true;
        let type: ASTTypeNode;
        if (this.comesToken(TokenType.varType, true)) {
            type = this.nodeFactory.buildVarTypeNode();
        } else {
            type = this.parseType(false);
        }

        let assignmentStatementNodes: ASTInitialFieldAssignmentInMainProgramNodes = {
            kind: TokenType.initialFieldAssignementInMainProgram,
            range: Object.assign(this.cct.range),
            assignments: []
        }

        while (this.expect(TokenType.identifier, false)) {
            let rangeStart = this.cct.range;
            let identifier = this.expectAndSkipIdentifierAsToken();

            type = this.increaseArrayDimensionIfLeftRightSquareBracketsToCome(type);

            let assignmentOperatorRange = this.cct.range;
            if (this.tt == TokenType.equal) {
                let error = this.pushError(JCM.comparisonOperatorInsteadOfAssignment(), "error", this.cct.range);
                this.module.quickfixes.push(new ReplaceTokenQuickfix(this.cct.range, "=", JCM.ReplaceTokenQuickfixDefaultMessage("==", "="), error));
            }
            let initialization = this.comesToken([TokenType.assignment, TokenType.equal], true) ? this.parseTerm() : undefined;

            if (identifier.value != "" && type != null) {
                let node = this.nodeFactory.buildFieldDeclarationNode(rangeStart, identifier, type, undefined,
                    modifiers, []);
                this.module.mainClass!.fieldsOrInstanceInitializers.push(node);
                this.setEndOfRange(node);
            }

            if (initialization) {
                assignmentStatementNodes.assignments.push(
                    {
                        assignmentOperatorRange: assignmentOperatorRange,
                        fieldNode: this.nodeFactory.buildVariableNode(identifier),
                        initialTerm: initialization
                    });
            }

            if (!this.comesToken(TokenType.comma, true)) break;

        }

        this.setEndOfRange(assignmentStatementNodes);

        if (assignmentStatementNodes.assignments.length == 0) return undefined;

        return assignmentStatementNodes;

    }


    parseLocalVariableDeclaration(): ASTStatementNode | undefined {

        let declarations: ASTLocalVariableDeclarations = {
            kind: TokenType.localVariableDeclarations,
            declarations: [],
            range: EmptyRange.instance
        };

        let isFinal = this.comesToken(TokenType.keywordFinal, true);

        let type = this.parseType(true);
        do {
            let identifer = this.expectAndSkipIdentifierAsToken();

            type = this.increaseArrayDimensionIfLeftRightSquareBracketsToCome(type);

            if (this.tt == TokenType.equal) {
                let error = this.pushError(JCM.comparisonOperatorInsteadOfAssignment(), "error", this.cct.range);
                this.module.quickfixes.push(new ReplaceTokenQuickfix(this.cct.range, "=", JCM.ReplaceTokenQuickfixDefaultMessage("==", "="), error));
            }

            let initialization: ASTTermNode | undefined = undefined;
            if (this.comesToken([TokenType.assignment, TokenType.equal], true)) {
                initialization = this.parseTerm();
            }

            if (type && identifer) {
                declarations.declarations.push(this.nodeFactory.buildLocalVariableDeclaration(type, identifer, initialization, isFinal));
            }

        } while (this.comesToken(TokenType.comma, true))


        return declarations;
    }

    increaseArrayDimensionIfLeftRightSquareBracketsToCome(type: ASTTypeNode | undefined): ASTTypeNode | undefined {
        let additionalDimension: number = 0;
        while (this.comesToken(TokenType.leftRightSquareBracket, true)) {
            additionalDimension++;
        }
        if (type && additionalDimension > 0) {
            type = this.nodeFactory.buildArrayTypeNode(type, type.range, additionalDimension);
        }
        return type;
    }


    parseWhile(): ASTWhileNode | undefined {

        let whileTokenRange = this.getCurrentRangeCopy();

        let whileToken = this.getAndSkipToken();

        if (this.comesToken(TokenType.leftBracket, true)) {
            let condition = this.parseTerm();
            this.expect(TokenType.rightBracket);

            let statementToRepeat = this.parseStatementToRepeat();

            if (condition && statementToRepeat) {

                return this.nodeFactory.buildWhileNode(whileToken,
                    this.cct, condition, statementToRepeat);

            }

        } else {
            this.module.pushMethodCallPosition(whileTokenRange, [], "while", Range.getStartPosition(this.cct.range));
            this.skipTokensTillEndOfLineOr([TokenType.rightBracket]);
        }

        return undefined;

    }

    parseDo(): ASTDoWhileNode | undefined {

        let doToken = this.getAndSkipToken();

        let statementToRepeat = this.parseStatementToRepeat();


        this.expect(TokenType.keywordWhile, true);

        if (this.comesToken(TokenType.leftBracket, true)) {
            let condition = this.parseTerm();
            this.expect(TokenType.rightBracket, true);


            if (condition && statementToRepeat) {

                return this.nodeFactory.buildDoWhileNode(doToken,
                    this.cct, condition, statementToRepeat);

            }

        } else {
            this.skipTokensTillEndOfLineOr([TokenType.rightBracket]);
        }

        return undefined;

    }

    parseIf(): ASTIfNode | undefined {

        let ifTokenRange = this.getCurrentRangeCopy();

        let ifToken = this.getAndSkipToken();

        if (this.comesToken(TokenType.leftBracket, true)) {
            let condition = this.parseTerm();

            this.module.pushMethodCallPosition(ifTokenRange, [], "if", Range.getStartPosition(this.cct.range));

            this.expect(TokenType.rightBracket);

            if (this.comesToken(TokenType.rightCurlyBracket, false)) {
                this.pushError(JCM.statementOrBlockExpected());
                return undefined;
            }

            let statementIfTrue = this.parseStatementOrExpression();

            let statementIfFalse: ASTStatementNode | undefined;

            if (this.comesToken(TokenType.keywordElse, true)) {

                statementIfFalse = this.parseStatementOrExpression();
            }


            return this.nodeFactory.buildIfNode(ifToken,
                this.cct, condition, statementIfTrue, statementIfFalse);


        } else {
            this.pushError(JCM.expectedOtherTokens("(", this.cct.value + ""));
            this.skipTokensTillEndOfLineOr([TokenType.rightBracket]);
        }

        return undefined;

    }

    parseBlock() {
        let blockNode = this.nodeFactory.buildBlockNode(this.cct);
        this.nextToken(); // skip {

        let posLastSeen: number = -1;   // watchdog!
        while (!this.isEnd() && this.tt != TokenType.rightCurlyBracket
            && posLastSeen != this.pos) {
            posLastSeen = this.pos;
            let statement = this.parseStatementOrExpression();
            if (statement) blockNode.statements.push(statement);
        }

        if (blockNode.statements.length == 0) blockNode.isEmpty = true;

        this.expect(TokenType.rightCurlyBracket, true);
        this.setEndOfRange(blockNode);

        return blockNode;
    }

    parseFor(): ASTForLoopNode | ASTEnhancedForLoopNode | undefined {

        let forTokenRange = this.getCurrentRangeCopy();
        let semicolonPositions: monaco.IPosition[] = [];

        let tokenFor = this.getAndSkipToken();  // preserve first token to compute range later on

        if (!this.expect(TokenType.leftBracket, true)) return undefined;

        // We have to differentiate between for(int i = 0; i < 10; i++) and for(<Type> <id>: <Term>)
        // therefore we parse till ) and look for :
        let colonFound = this.lookForTokenTillOtherToken(TokenType.colon, [TokenType.rightBracket, TokenType.leftCurlyBracket, TokenType.rightCurlyBracket]);
        if (colonFound) return this.parseEnhancedForLoop(tokenFor);

        let firstStatement: ASTStatementNode | undefined = undefined;
        if (!this.comesToken(TokenType.semicolon, false)) {
            firstStatement = this.parseStatementOrExpression(false);
        }
        semicolonPositions.push(Range.getStartPosition(this.cct.range));
        this.expect(TokenType.semicolon, true);
        let condition: ASTTermNode | undefined = undefined;
        if (!this.comesToken(TokenType.semicolon, false)) {
            condition = this.parseTerm();
            if (!condition) this.skipTokensTillEndOfLineOr(TokenType.semicolon)
        }
        // else {
        //     condition = this.nodeFactory.buildConstantNode({
        //         tt: TokenType.true,
        //         value: "true",
        //         range: this.cct.range
        //     })
        // }
        semicolonPositions.push(Range.getStartPosition(this.cct.range));
        this.expect(TokenType.semicolon, true);
        let lastStatement = this.parseTerm();
        let rightBracketPosition = Range.getStartPosition(this.cct.range);
        this.expect(TokenType.rightBracket, true);

        this.module.pushMethodCallPosition(forTokenRange, semicolonPositions, "for", rightBracketPosition);

        let statementToRepeat = this.parseStatementToRepeat();

        if (!statementToRepeat) {
            this.pushError(JCM.statementOrBlockExpected());
            return undefined;
        }

        return this.nodeFactory.buildForLoopNode(tokenFor, firstStatement, condition, lastStatement, statementToRepeat);

    }

    parseStatementToRepeat(): ASTStatementNode | undefined {
        if (this.comesToken(TokenType.semicolon, false)) {
            this.pushError(JCM.loopOverEmptyStatement(), "warning");
        }
        let statementToRepeat = this.parseStatementOrExpression(false);
        // if (statementToRepeat?.isEmpty) {
        //     let beginOfBlockRange: IRange = Range.fromPositions(Range.getStartPosition(statementToRepeat.range));
        //     this.pushError(JCM.loopOverEmptyStatement(), "info", beginOfBlockRange);
        // }
        return statementToRepeat;
    }

    parseEnhancedForLoop(tokenFor: Token): ASTEnhancedForLoopNode | undefined {
        // for and ( are already parsed
        let elementType = this.parseType(true);
        let elementIdentifier = this.expectAndSkipIdentifierAsToken();
        this.expect(TokenType.colon, true);
        let collection = this.parseTerm();
        this.expect(TokenType.rightBracket);
        let statementToRepeat = this.parseStatementOrExpression();

        if (!statementToRepeat) {
            this.pushError(JCM.statementOrBlockExpected());
            return undefined;
        }

        if (elementType && elementIdentifier && collection && statementToRepeat) {
            return this.nodeFactory.buildEnhancedForLoop(tokenFor, elementType, elementIdentifier, collection, statementToRepeat);
        }

        return undefined;
    }

    parseSwitch(): ASTSwitchCaseNode | undefined {

        let switchTokenRange = this.getCurrentRangeCopy();

        let switchToken = this.getAndSkipToken(); // preserve for later to compute range
        if (!this.expect(TokenType.leftBracket, true)) return;
        let term = this.parseTerm();

        this.module.pushMethodCallPosition(switchTokenRange, [], "switch", Range.getStartPosition(this.cct.range));

        this.expect(TokenType.rightBracket, true);
        if (!this.expect(TokenType.leftCurlyBracket, true) || !term) return undefined;

        let switchNode = this.nodeFactory.buildSwitchCaseNode(switchToken, term);
        while (this.comesToken([TokenType.keywordCase, TokenType.keywordDefault], false)) {
            let isCase = this.tt == TokenType.keywordCase;
            let caseDefaultToken = this.cct;
            this.nextToken(); // skip case or default
            let constant = isCase ? this.parseTermUnary() : undefined;

            if (typeof constant == "undefined" && isCase) {
                this.pushError(JCM.constantMissingInCaseStatement(), "error", caseDefaultToken.range)
            }

            this.expect(TokenType.colon, true);

            let caseNode = this.nodeFactory.buildCaseNode(caseDefaultToken, constant);
            while (!this.isEnd() && !this.comesToken([TokenType.keywordCase, TokenType.keywordDefault, TokenType.rightCurlyBracket], false)) {
                let statement = this.parseStatementOrExpression();
                if (statement) caseNode.statements.push(statement);
            }
            this.setEndOfRange(caseNode);
            if (isCase) {
                switchNode.caseNodes.push(caseNode);
            } else {
                switchNode.defaultNode = caseNode;
            }
        }

        this.expect(TokenType.rightCurlyBracket, true);
        this.setEndOfRange(switchNode);
        return switchNode;
    }

    parseThrow(): ASTThrowNode | undefined {
        let throwToken = this.getAndSkipToken();
        let exception = this.parseTerm();
        this.expectSemicolon(true, true);

        if (!exception) return undefined;

        return {
            kind: TokenType.keywordThrow,
            exception: exception,
            range: throwToken.range
        }
    }

    parseTryCatch(): ASTTryCatchNode | undefined {
        let tryToken = this.getAndSkipToken();
        let statement = this.parseStatementOrExpression();
        if (!statement) return undefined;
        let tryNode = this.nodeFactory.buildTryCatchNode(tryToken, statement);

        while (this.comesToken(TokenType.keywordCatch, false)) {
            let catchToken = this.getAndSkipToken();
            if (!this.expect(TokenType.leftBracket, true)) continue;
            let exceptionTypes: ASTTypeNode[] = [];
            do {
                let type = this.parseType(false);
                if (type) exceptionTypes.push(type);
            } while (this.comesToken(TokenType.OR, true))
            let identifier = this.expectAndSkipIdentifierAsToken();
            if (!this.expect(TokenType.rightBracket, true)) continue;
            let statement = this.parseStatementOrExpression();
            if (exceptionTypes.length > 0 && identifier && statement) {
                tryNode.catchCases.push(this.nodeFactory.buildCatchNode(catchToken, exceptionTypes, identifier, statement));
            }
        }

        if (this.comesToken(TokenType.keywordFinally, true)) {
            tryNode.finallyStatement = this.parseStatementOrExpression(true);
        }

        return tryNode;
    }

    parseReturn(): ASTReturnNode {
        let returnToken = this.getAndSkipToken();
        let term;
        if (this.tt == TokenType.semicolon) {
            term = undefined;
        } else {
            term = this.parseTerm();
            this.expect(TokenType.semicolon);
        }
        while (this.comesToken(TokenType.semicolon, true)) { }
        return this.nodeFactory.buildReturnNode(returnToken, term);
    }

}