import { ErrormessageWithId } from "../../../tools/language/LanguageManager";
import { Error, ErrorLevel, QuickFix } from "../../common/Error";
import { EmptyRange, IRange } from "../../common/range/Range";
import { JavaCompiledModuleMessages } from "../language/JavaCompiledModuleMessages.ts";
import { JCM } from "../language/JavaCompilerMessages.ts";
import { Token, TokenList } from "../lexer/Token";
import { JavaCompiledModule } from "../module/JavaCompiledModule.ts";
import { ReplaceTokenQuickfix } from "../monacoproviders/quickfix/ReplaceTokenQuickfix.ts";
import { TokenType, TokenTypeReadable } from "../TokenType";
import { ASTNode } from "./AST";
import * as monaco from 'monaco-editor'


export class TokenIterator {

    static possibleTokensInsideVariableDeclaration: TokenType[] = [
        TokenType.identifier, TokenType.linefeed, TokenType.newline,
        TokenType.space, TokenType.comment,
        TokenType.lower, TokenType.greater, TokenType.dot,
        TokenType.leftRightSquareBracket, TokenType.comma,
        TokenType.keywordVar, TokenType.ternaryOperator,
        TokenType.keywordExtends, TokenType.keywordSuper,
        TokenType.leftBracket, TokenType.keywordVoid
    ]

    static spaceTokenTypes: TokenType[] = [
        TokenType.space, TokenType.comment, TokenType.linefeed, TokenType.newline
    ]


    pos: number = 0;        // current index in tokens

    dummy: Token = {
        range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 },
        tt: TokenType.comment,
        value: ""
    }

    lastToken: Token = this.dummy;
    cct: Token = this.dummy;                // current token
    tt: TokenType = TokenType.comment;      // current tokentype
    lastComment?: Token;

    endToken: Token;

    static operators = [
        TokenType.assignment, TokenType.plusAssignment, TokenType.minusAssignment,
        TokenType.multiplicationAssignment, TokenType.divisionAssignment, TokenType.moduloAssignment,
        TokenType.ANDAssigment, TokenType.XORAssigment, TokenType.ORAssigment,
        TokenType.shiftLeftAssigment, TokenType.shiftRightAssigment, TokenType.shiftRightUnsignedAssigment,
        TokenType.ternaryOperator, TokenType.colon,

        TokenType.or, TokenType.and, TokenType.OR, TokenType.XOR, TokenType.ampersand,
        TokenType.equal, TokenType.notEqual,
        TokenType.keywordInstanceof, TokenType.lower, TokenType.lowerOrEqual, TokenType.greater, TokenType.greaterOrEqual,
        TokenType.shiftLeft, TokenType.shiftRight, TokenType.shiftRightUnsigned,

        TokenType.plus, TokenType.minus, TokenType.multiplication, TokenType.division, TokenType.modulo
    ];



    constructor(private tokenList: TokenList, protected module: JavaCompiledModule) {
        if (tokenList.length == 0) {
            tokenList.push({
                tt: TokenType.endofSourcecode,
                value: "",
                range: EmptyRange.instance
            })
        }
        this.endToken = tokenList[tokenList.length - 1];
        this.pos = -1;
        if (tokenList.length > 0) this.nextToken(); // fetch first non-space token
    }

    getAndSkipToken(): Token {
        this.nextToken();
        return this.lastToken;
    }

    getRangeAndThenSkipToken(): IRange {
        let range = this.cct.range;
        this.nextToken();
        return range;
    }

    getAndSkipTokenWithSemicolon(): Token {
        let token = this.cct;
        this.nextToken();
        this.expectSemicolon();
        return token;
    }

    nextToken() {

        let token: Token;

        if (this.pos >= this.tokenList.length) return;

        this.lastToken = this.cct;

        while (true) {

            this.pos++;

            if (this.pos >= this.tokenList.length) {
                token = this.endToken;
                break;
            }

            token = this.tokenList[this.pos]
            if (token.tt == TokenType.comment) {
                this.lastComment = token;
            }

            if (token.tt != TokenType.newline && token.tt != TokenType.space && token.tt != TokenType.comment) {
                token.commentBefore = this.lastComment;
                this.lastComment = undefined;
                break;
            }

        }

        this.cct = token;
        this.tt = this.cct.tt;

    }

    exchangeShiftRightForTwoClosingGreater() {
        this.cct.tt = TokenType.greater;
        this.tt = TokenType.greater;
        this.cct.value = '>';
        let newToken: Token = {
            tt: TokenType.greater,
            value: '>',
            range: {
                startLineNumber: this.cct.range.startLineNumber,
                startColumn: this.cct.range.startColumn + 1,
                endLineNumber: this.cct.range.endLineNumber,
                endColumn: this.cct.range.endColumn + 1
            }
        }
        this.tokenList.splice(this.pos + 1, 0, newToken);
    }

    /**
     * Looks n tokens ahead, omitting space, comments and newLine
     * n == 0 => return current token
     * @param n
     */
    lookahead(n: number): Token {
        let k = n;
        let pos = this.pos;
        let token = this.cct;

        while (k > 0 && pos < this.tokenList.length - 1) {
            pos++;
            let t: Token = this.tokenList[pos];
            if (TokenIterator.spaceTokenTypes.indexOf(t.tt) < 0) {
                k--;
                token = t;
            }
        }

        return token;
    }

    pushErrorAndSkipToken() {
        this.pushError(JCM.unexpectedToken("" + this.cct.value), "error");
        this.nextToken();
    }

    skipTokensTillEndOfLineOr(skippedTokens: TokenType | TokenType[], skipFoundToken: boolean = true) {
        if (!Array.isArray(skippedTokens)) skippedTokens = [skippedTokens];
        let line = this.cct.range.endLineNumber;

        while (this.pos < this.tokenList.length && skippedTokens.indexOf(this.tokenList[this.pos].tt) < 0 && this.cct.range.startLineNumber <= line) {
            this.nextToken();
        }
        if (this.pos < this.tokenList.length && skipFoundToken) {
            this.nextToken();
        }

    }


    pushError(messageWithId: ErrormessageWithId, errorLevel: ErrorLevel = "error", range?: IRange) {
        if (range == null) range = Object.assign({}, this.cct.range);
        const error = {
            message: messageWithId.message,
            id: messageWithId.id,
            range: range,
            level: errorLevel
        };
        this.module.errors.push(error);
        return error;
    }

    expect(tt: TokenType | TokenType[], skipIfTrue: boolean = true): boolean {

        if (!Array.isArray(tt)) {
            if (this.tt == tt) {
                if (skipIfTrue) this.nextToken();
                return true;
            }
            this.pushError(JCM.expectedOtherToken(TokenTypeReadable[tt], "" + this.cct.value), "error");
            return false;
        }

        if (tt.indexOf(this.tt) >= 0) {
            if (skipIfTrue) this.nextToken();
            return true;
        }

        let tokenListReadable = tt.map(tt1 => TokenTypeReadable[tt1]).join(", ");

        this.pushError(JCM.expectedOtherTokens(tokenListReadable, TokenTypeReadable[this.tt]), "error");
        return false;
    }

    expectSemicolon(skip: boolean = true, invokeSemicolonAngel: boolean = false): boolean {
        if (this.tt == TokenType.semicolon) {
            if (skip) {
                this.nextToken();
            }

            return true;
        }
        else {
            // if (this.tt == TokenType.endofSourcecode) {
            //     return true;
            // }

            let quickFix: QuickFix | undefined = undefined;
            let range: IRange = this.cct.range;
            if (this.lastToken != null) {

                if (this.lastToken.range.endLineNumber < this.cct.range.startLineNumber) {
                    range = {
                        startLineNumber: this.lastToken.range.endLineNumber,
                        startColumn: this.lastToken.range.endColumn,
                        endLineNumber: this.lastToken.range.endLineNumber,
                        endColumn: this.lastToken.range.endColumn
                    }

                    if (!this.isOperatorOrDot(this.lastToken.tt)) {
                        let error: Error = {
                            message: JCM.insertSemicolonHere(),
                            id: "1",
                            level: "error",
                            range: this.cct.range
                        }
                        this.module.errors.push(error);
                        this.module.quickfixes.push(new ReplaceTokenQuickfix(range, ";", JCM.insertSemicolonHere(), error,
                            {
                                startLineNumber: range.startLineNumber,
                                startColumn: 0,
                                endLineNumber: range.endLineNumber,
                                endColumn: range.endColumn
                            }))
                    }

                    // if (invokeSemicolonAngel && this.module.errors.length < 3) {
                    //     this.module.main.getSemicolonAngel().register(range, this.module);
                    // }

                }


            }



            this.pushError(JCM.semicolonExpected(TokenTypeReadable[this.tt]), "error",
                range);
            return false;
        }

    }

    skipTillNextTokenAfter(tt: TokenType[]) {

        while (this.pos < this.tokenList.length - 1) {
            let token = this.tokenList[this.pos];
            if (TokenIterator.spaceTokenTypes.indexOf(token.tt) < 0) {
                this.lastToken = this.cct;
                this.cct = token;
            }
            if (tt.indexOf(token.tt) >= 0) {
                this.nextToken();
                return;
            }
            this.pos++;
        }
    }

    expectAndSkipIdentifierAsString(): string {
        if (this.tt == TokenType.identifier) {
            let identifier: string = <string>this.cct.value;
            this.nextToken();
            return identifier;
        }

        this.pushError(JCM.identifierExpected("" + this.cct.value));
        return "";
    }

    expectAndSkipIdentifierAsToken(): Token {
        if (this.tt == TokenType.identifier) {
            let t = this.cct;
            this.nextToken();
            return t;
        }

        this.pushError(JCM.identifierExpected("" + this.cct.value));

        return {
            tt: TokenType.identifier,
            value: "",
            range: this.cct.range
        };
    }

    isOperatorOrDot(tt: TokenType): boolean {
        if (tt == TokenType.dot) return true;
        for (let op of TokenIterator.operators) {
            if (tt == op) return true;
        }
        return false;
    }

    isEnd(): boolean {
        return this.cct == this.endToken;
    }

    comesToken(token: TokenType | TokenType[], skipIfTrue: boolean): boolean {

        // comestoken is called very often, so we try to implement this in a performant way:
        if (!Array.isArray(token)) {
            if (!skipIfTrue) return this.tt == token;
            if (this.tt == token) {
                this.nextToken();
                return true;
            }
            return false;
        }

        // token is of type TokenType[]
        if (!skipIfTrue) return token.indexOf(this.tt) >= 0;

        if (token.indexOf(this.tt) >= 0) {
            this.nextToken();
            return true;
        }

        return false;

    }

    getCurrentRangeCopy(): IRange {
        return Object.assign({}, this.cct.range);
    }

    setEndOfRange(node: ASTNode): ASTNode {
        let r1 = node.range;
        let lastRange = this.lastToken.range;

        node.range = {
            startLineNumber: r1.startLineNumber,
            startColumn: r1.startColumn,
            endLineNumber: lastRange.endLineNumber,
            endColumn: lastRange.endColumn
        }

        return node;
    }

    comesIdentifier(identifier: string) {
        return this.tt == TokenType.identifier && this.cct.value == identifier;
    }


    findTokenTypeAfterCorrespondingRightBracket(): TokenType {
        let p = this.pos + 1; // skip left bracket
        let depth = 1;
        while (p < this.tokenList.length && depth > 0) {
            switch (this.tokenList[p++].tt) {
                case TokenType.leftBracket: depth++;
                    break;
                case TokenType.rightBracket: depth--;
            }
        }

        if (depth == 0) {
            while (p < this.tokenList.length && TokenIterator.spaceTokenTypes.indexOf(this.tokenList[p].tt) >= 0) {
                p++;
            }

            if (p < this.tokenList.length) {
                return this.tokenList[p].tt;
            }
        }

        return TokenType.endofSourcecode;

    }

    lookForTokenTillOtherToken(tokensToLookFor: TokenType | TokenType[], tillToken: TokenType | TokenType[]): TokenType | null {
        if (!Array.isArray(tokensToLookFor)) tokensToLookFor = [tokensToLookFor];
        if (!Array.isArray(tillToken)) tillToken = [tillToken];

        let pos1: number = this.pos;
        while (pos1 < this.tokenList.length) {
            let tt = this.tokenList[pos1].tt;
            if (tokensToLookFor.indexOf(tt) >= 0) return tt;
            if (tillToken.indexOf(tt) >= 0) break;
            pos1++;
        }

        return null;

    }

    analyzeIfVariableDeclarationOrMethodDeclarationAhead(isCodeOutsideClassdeclarations: boolean): "variabledeclaration" | "methoddeclaration" | "statement" {

        if (this.tt == TokenType.keywordFinal) return "variabledeclaration";
        if ([TokenType.keywordPrivate, TokenType.keywordProtected, TokenType.keywordPublic, TokenType.keywordStatic, TokenType.keywordVoid].indexOf(this.tt) >= 0) return "methoddeclaration";

        let pos = this.pos;
        let nonSpaceTokenTypesFound: TokenType[] = [];

        while (pos < this.tokenList.length) {
            let token = this.tokenList[pos];
            let tt = token.tt;
            if (tt == TokenType.semicolon || tt == TokenType.assignment) break;
            if (tt == TokenType.newline) {
                if (nonSpaceTokenTypesFound.length == 1 || nonSpaceTokenTypesFound.length == 2 && nonSpaceTokenTypesFound[1] == TokenType.dot) {
                    return "statement";
                }
            }
            if (tt == TokenType.leftBracket) {
                if (isCodeOutsideClassdeclarations) {
                    nonSpaceTokenTypesFound.push(tt);
                    break;
                }
                return "statement";
            }
            if (TokenIterator.possibleTokensInsideVariableDeclaration.indexOf(tt) < 0) {
                if (tt == TokenType.equal && !nonSpaceTokenTypesFound.find(tt => tt != TokenType.identifier) && nonSpaceTokenTypesFound.length >= 2) {
                    // this is for cases like "int a == 10;"
                    // strategy: assume variable declaration and then print helping error message.
                    // this is better than assuming "statement" and then giving unhelpful error message.
                    return "variabledeclaration";
                }
                return "statement";
            }
            if (TokenIterator.spaceTokenTypes.indexOf(tt) < 0) nonSpaceTokenTypesFound.push(tt);
            pos++;
        }

        let length = nonSpaceTokenTypesFound.length;
        if (length < 2) return "statement";

        let lastToken1 = nonSpaceTokenTypesFound[length - 1];
        let lastToken2 = nonSpaceTokenTypesFound[length - 2];
        let lastToken3 = length < 3 ? TokenType.endofSourcecode : nonSpaceTokenTypesFound[length - 3];

        if (isCodeOutsideClassdeclarations) {
            if (lastToken1 == TokenType.leftBracket && lastToken2 == TokenType.identifier
                && [TokenType.greater, TokenType.identifier, TokenType.leftRightSquareBracket,
                TokenType.keywordVoid].indexOf(lastToken3) >= 0) {
                return "methoddeclaration"
            }
        }


        if ([TokenType.identifier, TokenType.leftRightSquareBracket].indexOf(lastToken1) < 0) return "statement";

        if ([TokenType.identifier, TokenType.greater, TokenType.leftRightSquareBracket, TokenType.keywordVar, TokenType.comma].indexOf(lastToken2) < 0) {
            return "statement";
        }

        return "variabledeclaration";

    }

}