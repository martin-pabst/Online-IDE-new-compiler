import { ErrormessageWithId } from "../../../tools/language/LanguageManager.js";
import { Error, ErrorLevel } from "../../common/Error.js";
import { JCM } from "../language/JavaCompilerMessages.js";
import { EscapeSequenceList, keywordList as KeywordList, specialCharList, TokenType, TokenTypeReadable } from "../TokenType.js";
import { ColorHelper } from "./ColorHelper.js";
import { ColorLexer } from "./ColorLexer.js";
import { Token, TokenList } from "./Token.js";
import type * as monaco from 'monaco-editor'



var endChar = "►"; // \u10000

export type LexerOutput = {
    tokens: TokenList, errors: Error[],
    bracketError: string | undefined,
    colorInformation: monaco.languages.IColorInformation[]
}



export class Lexer {

    tokens: TokenList;
    bracketError?: string;
    colorInformation: monaco.languages.IColorInformation[];
    errorList: Error[];

    nonSpaceLastTokenType?: TokenType;

    colorLexer: ColorLexer = new ColorLexer();

    pos: number;
    line: number;
    column: number;

    currentChar: string = '';
    nextChar: string = '';

    spaceTokens: TokenType[] = [
        TokenType.space, TokenType.tab, TokenType.newline
    ];

    bracketStack: TokenType[];
    static correspondingBracket: { [key: number]: TokenType } = {
        [TokenType.leftBracket]: TokenType.rightBracket,
        [TokenType.leftCurlyBracket]: TokenType.rightCurlyBracket,
        [TokenType.leftSquareBracket]: TokenType.rightSquareBracket,
        [TokenType.rightBracket]: TokenType.leftBracket,
        [TokenType.rightCurlyBracket]: TokenType.leftCurlyBracket,
        [TokenType.rightSquareBracket]: TokenType.leftSquareBracket
    };

    static spaceCharacters: string[] = [" ", "\t", "\uc2a0", "\u00a0",];

    colorIndices: number[];

    private input: string = "";

    constructor() {

        this.tokens = [];
        this.bracketError = undefined;
        this.errorList = [];

        this.colorInformation = [];
        this.bracketStack = [];
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.nonSpaceLastTokenType = undefined;
        this.colorIndices = []; // indices of identifier 'Color' inside tokenList
    }

    lex(input?: string): LexerOutput {
        if (!input || input.length == 0) {
            return { tokens: this.tokens, errors: this.errorList, bracketError: undefined, colorInformation: [] };
        }

        this.input = input;

        this.currentChar = this.input.charAt(0);

        this.nextChar = this.input.length > 1 ? this.input.charAt(1) : endChar;


        while (this.currentChar != endChar) {
            this.mainState();
        }

        if (this.bracketStack.length > 0) {
            let bracketOpen = this.bracketStack.pop()!;
            let bracketClosed = Lexer.correspondingBracket[bracketOpen];

            this.setBracketError(TokenTypeReadable[bracketOpen] + " " + TokenTypeReadable[bracketClosed]);
        }

        this.processColorIndices();

        this.tokens.push({
            range: { startLineNumber: this.line, startColumn: this.column, endLineNumber: this.line, endColumn: this.column },
            tt: TokenType.endofSourcecode,
            value: "program end"
        })

        return { tokens: this.tokens, errors: this.errorList, bracketError: this.bracketError, colorInformation: this.colorInformation };


    }

    processColorIndices() {

        for (let colorIndex of this.colorIndices) {

            // new Color(100, 100, 100, 0.1)
            // new Color(100, 100, 100)
            // Color.red

            let colorToken = this.tokens[colorIndex];
            let previousToken = this.getLastNonSpaceToken(colorIndex)

            if (previousToken?.tt == TokenType.keywordNew) {
                let nextTokens = this.getNextNonSpaceTokens(colorIndex, 7);
                if (this.compareTokenTypes(nextTokens, [TokenType.leftBracket, TokenType.integerLiteral, TokenType.comma,
                TokenType.integerLiteral, TokenType.comma, TokenType.integerLiteral,
                TokenType.rightBracket])) {
                    this.colorInformation.push({
                        color: {
                            red: <number>nextTokens[1].value / 255,
                            green: <number>nextTokens[3].value / 255,
                            blue: <number>nextTokens[5].value / 255,
                            alpha: 1
                        },
                        range: {
                            startLineNumber: previousToken!.range.startLineNumber, startColumn: previousToken!.range.startColumn,
                            endLineNumber: nextTokens[6].range.endLineNumber, endColumn: nextTokens[6].range.endColumn
                        }
                    })
                }
            } else {
                let nextTokens = this.getNextNonSpaceTokens(colorIndex, 2);
                if (this.compareTokenTypes(nextTokens, [TokenType.dot, TokenType.identifier])) {
                    let colorIdentifier = <string>nextTokens[1].value;
                    let colorValue = ColorHelper.predefinedColors[colorIdentifier];
                    if (colorValue != null) {
                        this.colorInformation.push({
                            color: {
                                red: (colorValue >> 16) / 255,
                                green: ((colorValue >> 8) & 0xff) / 255,
                                blue: (colorValue & 0xff) / 255,
                                alpha: 1
                            }, range: {
                                startLineNumber: colorToken.range.startLineNumber, startColumn: colorToken.range.startColumn,
                                endLineNumber: nextTokens[1].range.endLineNumber, endColumn: nextTokens[1].range.endColumn
                            }
                        })
                    }
                }
            }


        }

    }

    compareTokenTypes(tokenList: Token[], tokenTypeList: TokenType[]) {
        if (tokenList.length != tokenTypeList.length) return false;
        for (let i = 0; i < tokenList.length; i++) {
            if (tokenList[i].tt != tokenTypeList[i]) return false;
        }
        return true;
    }

    getNextNonSpaceTokens(tokenIndex: number, count: number): Token[] {
        let tokens: Token[] = [];
        let d = tokenIndex;
        while (tokens.length < count && d + 1 < this.tokens.length) {
            let foundToken = this.tokens[d + 1];
            if ([TokenType.space, TokenType.newline].indexOf(foundToken.tt) < 0) {
                tokens.push(foundToken);
            }
            d++;
        }

        return tokens;

    }

    getLastNonSpaceToken(tokenIndex: number) {
        let d = tokenIndex;
        while (d - 1 > 0) {
            let foundToken = this.tokens[d - 1];
            if ([TokenType.space, TokenType.newline].indexOf(foundToken.tt) < 0) {
                return foundToken;
            }
            d--;
        }
        return null;
    }

    checkClosingBracket(tt: TokenType) {
        if (this.bracketStack.length == 0) {
            let bracketOpen = Lexer.correspondingBracket[tt];
            this.setBracketError(TokenTypeReadable[bracketOpen] + " " + TokenTypeReadable[tt]);
            return;
        }
        let openBracket = this.bracketStack.pop()!;
        let correspondingBracket = Lexer.correspondingBracket[openBracket];
        if (tt != correspondingBracket) {
            this.setBracketError(TokenTypeReadable[openBracket] + " " + TokenTypeReadable[correspondingBracket]);
        }
    }

    setBracketError(error: string) {
        if (this.bracketError == null) this.bracketError = error;
    }

    next() {
        this.pos++;
        this.currentChar = this.nextChar;
        if (this.pos + 1 < this.input.length) {
            this.nextChar = this.input.charAt(this.pos + 1);
        } else {
            this.nextChar = endChar;
        }
        this.column++; // column of current char
    }



    mainState() {

        let char = this.currentChar;

        let specialCharToken = specialCharList[char];

        if (specialCharToken != null) {
            switch (specialCharToken) {
                case TokenType.leftSquareBracket:
                    if (this.nextChar == "]") {
                        this.pushToken(TokenType.leftRightSquareBracket, "[]");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.leftSquareBracket, "[");
                        this.bracketStack.push(specialCharToken);
                        this.next();
                        return;
                    }
                case TokenType.rightSquareBracket:
                    this.checkClosingBracket(specialCharToken);
                    break;
                case TokenType.leftBracket:
                    this.bracketStack.push(specialCharToken);
                    break;
                case TokenType.rightBracket:
                    this.checkClosingBracket(specialCharToken);
                    break;
                case TokenType.leftCurlyBracket:
                    this.bracketStack.push(specialCharToken);
                    break;
                case TokenType.rightCurlyBracket:
                    this.checkClosingBracket(specialCharToken);
                    break;
                case TokenType.and:
                    if (this.nextChar == "&") {
                        this.pushToken(TokenType.and, "&&");
                        this.next();
                        this.next();
                        return;
                    } else if (this.nextChar == "=") {
                        this.pushToken(TokenType.ANDAssigment, "&=");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.ampersand, "&");
                        this.next();
                        return;
                    }
                case TokenType.or:
                    if (this.nextChar == "|") {
                        this.pushToken(TokenType.or, "||");
                        this.next();
                        this.next();
                        return;
                    } else if (this.nextChar == "=") {
                        this.pushToken(TokenType.ORAssigment, "&=");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.OR, "|");
                        this.next();
                        return;
                    }
                case TokenType.XOR:
                    if (this.nextChar == "=") {
                        this.pushToken(TokenType.XORAssigment, "^=");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.XOR, "^");
                        this.next();
                        return;
                    }
                case TokenType.multiplication:
                    if (this.nextChar == "=") {
                        this.pushToken(TokenType.multiplicationAssignment, "*=");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.multiplication, "*");
                        this.next();
                        return;
                    }
                case TokenType.not:
                    if (this.nextChar == "=") {
                        this.pushToken(TokenType.notEqual, "!=");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.not, "!");
                        this.next();
                        return;
                    }
                case TokenType.division:
                    if (this.nextChar == "=") {
                        this.pushToken(TokenType.divisionAssignment, "/=");
                        this.next();
                        this.next();
                        return;
                    } else if (this.nextChar == '*') {
                        this.lexMultilineComment();
                        return;
                    } else if (this.nextChar == '/') {
                        this.lexEndofLineComment();
                        return;
                    }
                    this.pushToken(TokenType.division, '/');
                    this.next();
                    return;
                case TokenType.modulo:
                    if (this.nextChar == "=") {
                        this.pushToken(TokenType.moduloAssignment, "%=");
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.modulo, "/");
                        this.next();
                        return;
                    }
                case TokenType.plus:
                    if (this.nextChar == '+') {
                        this.pushToken(TokenType.plusPlus, '++');
                        this.next();
                        this.next();
                        return;
                    } else if (this.isDigit(this.nextChar, 10) && !
                        ([TokenType.identifier, TokenType.integerLiteral, TokenType.floatLiteral, TokenType.charLiteral, TokenType.rightBracket, TokenType.rightSquareBracket].indexOf(this.nonSpaceLastTokenType!) >= 0)
                    ) {
                        this.lexNumber();
                        return;
                    } else if (this.nextChar == '=') {
                        this.pushToken(TokenType.plusAssignment, '+=');
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.plus, '+');
                        this.next();
                        return;
                    }
                case TokenType.lower:
                    if (this.nextChar == '=') {
                        this.pushToken(TokenType.lowerOrEqual, '<=');
                        this.next();
                        this.next();
                        return;
                    } else if (this.nextChar == '<') {
                        this.lexShiftLeft();
                        return;
                    } else {
                        this.pushToken(TokenType.lower, '<');
                        this.next();
                        return;
                    }
                case TokenType.greater:
                    if (this.nextChar == '=') {
                        this.pushToken(TokenType.greaterOrEqual, '>=');
                        this.next();
                        this.next();
                        return;
                    } else if (this.nextChar == '>') {
                        this.lexShiftRight();
                        return;
                    } else {
                        this.pushToken(TokenType.greater, '>');
                        this.next();
                        return;
                    }
                case TokenType.dot:
                    if (this.nextChar == '.' && this.pos + 2 < this.input.length && this.input[this.pos + 2] == ".") {
                        this.pushToken(TokenType.ellipsis, '...');
                        this.next();
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.dot, '.');
                        this.next();
                        return;
                    }

                case TokenType.assignment:
                    if (this.nextChar == '=') {
                        this.pushToken(TokenType.equal, '==');
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.assignment, '=');
                        this.next();
                        return;
                    }
                case TokenType.minus:
                    if (this.nextChar == '-') {
                        this.pushToken(TokenType.minusMinus, '--');
                        this.next();
                        this.next();
                        return;
                    }
                    else if (this.nextChar == '>') {
                        this.pushToken(TokenType.lambdaOperator, '->');
                        this.next();
                        this.next();
                        return;
                    }
                    else if (this.isDigit(this.nextChar, 10) && !
                        ([TokenType.identifier, TokenType.integerLiteral, TokenType.floatLiteral, TokenType.stringLiteral, TokenType.rightBracket, TokenType.rightSquareBracket].indexOf(this.nonSpaceLastTokenType!) >= 0)
                    ) {
                        this.lexNumber();
                        return;
                    }
                    else if (this.nextChar == '=') {
                        this.pushToken(TokenType.minusAssignment, '-=');
                        this.next();
                        this.next();
                        return;
                    } else {
                        this.pushToken(TokenType.minus, '-');
                        this.next();
                        return;
                    }
                case TokenType.singleQuote:
                    this.lexCharacterConstant();
                    return;
                case TokenType.doubleQuote:
                    // triple double quote?
                    if (this.nextChar == "\"" && this.pos + 3 < this.input.length && this.input[this.pos + 2] == "\"") {
                        this.lexTripleQuoteStringConstant();
                    } else {
                        this.lexStringConstant();
                    }
                    return;
                case TokenType.newline:
                    this.pushToken(TokenType.newline, '\n');
                    this.line++;
                    this.column = 0;
                    this.next();
                    return;
                case TokenType.space:
                case TokenType.tab:
                    this.lexSpace();
                    return;
                case TokenType.linefeed:
                    this.next();
                    return;
                case TokenType.at:
                    this.lexAnnotation();
                    return;
            }

            this.pushToken(specialCharToken, char);
            this.next();
            return;

        }

        // no special char. Number?

        if (this.isDigit(char, 10)) {
            this.lexNumber();
            return;
        }

        this.lexIdentifierOrKeyword();

    }

    lexShiftRight() {
        this.next(); // Consume first > of >>

        if (this.nextChar == ">") {
            this.lexShiftRightUnsigned();
        } else if (this.nextChar == "=") {
            this.pushToken(TokenType.shiftRightAssigment, ">>=")
            this.next(); // Consume second >
            this.next(); // Consume =
        } else {
            this.pushToken(TokenType.shiftRight, ">>");
            this.next(); // Consume second >
        }
        return;
    }

    lexShiftRightUnsigned() {
        this.next(); // Consume second > of >>>

        if (this.nextChar == "=") {
            this.pushToken(TokenType.shiftRightUnsignedAssigment, ">>>=")
            this.next(); // Consume second >
            this.next(); // Consume =
        } else {
            this.pushToken(TokenType.shiftRightUnsigned, ">>>");
            this.next(); // Consume next
        }
        return;
    }

    lexShiftLeft() {
        this.next(); // Consume first < of <<

        if (this.nextChar == '=') {
            this.pushToken(TokenType.shiftLeftAssigment, "<<=")
            this.next(); // Consume second <
            this.next(); // Consume =
        } else {
            this.pushToken(TokenType.shiftLeft, "<<")
            this.next(); // Consume second <
        }
        return;
    }

    pushToken(tt: TokenType, text: string | number | boolean,
        startLineNumber: number = this.line, startColumn: number = this.column,
        endLineNumber?: number, endColumn?: number) {

        if (!endLineNumber) endLineNumber = startLineNumber;
        if (!endColumn) endColumn = startColumn + ("" + text).length;

        let t: Token = {
            tt: tt,
            value: text,
            range: {
                startLineNumber: startLineNumber,
                startColumn: startColumn,
                endLineNumber: endLineNumber,
                endColumn: endColumn
            }
        }

        if (!(this.spaceTokens.indexOf(tt) >= 0)) {
            this.nonSpaceLastTokenType = tt;
        }

        this.tokens.push(t);
    }

    pushError(messageWithId: ErrormessageWithId, length: number, errorLevel: ErrorLevel = "error",
        startLineNumber: number = this.line, startColumn: number = this.column,
        endLineNumber?: number, endColumn?: number) {

        if (!endLineNumber) endLineNumber = startLineNumber;
        if (!endColumn) endColumn = startColumn + length;

        this.errorList.push({
            message: messageWithId.message,
            id: messageWithId.id,
            range: {
                startLineNumber: startLineNumber,
                startColumn: startColumn,
                endLineNumber: 10,
                endColumn: 10
            },
            level: errorLevel
        });
    }



    isDigit(a: string, base: number) {
        var charCode = a.charCodeAt(0);

        if (base == 10) return (charCode >= 48 && charCode <= 57); // 0 - 9
        if (base == 2) return (charCode >= 48 && charCode <= 49); // 0, 1
        if (base == 8) return (charCode >= 48 && charCode <= 55); // 0 - 7
        if (base == 16) return (charCode >= 48 && charCode <= 57) || (charCode >= 97 && charCode <= 102) ||
            (charCode >= 65 && charCode <= 70); // 0 - 9 || a - f || A - F
    }

    lexSpace() {
        let startColumn = this.column;
        let startLine = this.line;

        let posStart = this.pos;
        while (Lexer.spaceCharacters.indexOf(this.currentChar) >= 0) {
            this.next();
        }

        let posEnd = this.pos;
        this.pushToken(TokenType.space, this.input.substring(posStart, posEnd), startLine, startColumn, this.line, this.column);
        return;

    }

    lexCharacterConstant() {
        let column = this.column;
        let line = this.line;
        this.next();
        let char = this.currentChar;
        if (char == "\\") {
            let escapeChar = EscapeSequenceList[this.nextChar];
            if (escapeChar == null) {
                this.pushError(JCM.unknownEscapeSequence(this.nextChar), 2);
                if (this.nextChar != "'") {
                    char = this.nextChar;
                    this.next();
                }
            } else {
                char = escapeChar;
                this.next();
            }
        }
        this.next();
        if (this.currentChar != "'") {
            this.pushError(JCM.expectingEndOfCharConstant(), 1);
        } else {
            this.next();
        }

        this.pushToken(TokenType.charLiteral, char, line, column, this.line, this.column);

    }

    lexStringConstant() {
        let line = this.line;
        let column = this.column;
        let text = "";

        this.next();

        while (true) {
            let char = this.currentChar;
            if (char == "\\") {
                char = this.parseStringLiteralEscapeCharacter();
                text += char;
                continue;
            } else if (char == '"') {
                this.next();
                break;
            } else if (char == "\n" || char == endChar) {
                this.pushError(JCM.endOfLineInsideStringLiteral(), text.length + 1, "error", line, column);
                text += " "; // make open string literal longer so that JavaCompletionItemProvider realizes that cursor is inside string literal
                this.next();
                break;
            }
            text += char;
            this.next();
        }

        this.pushToken(TokenType.stringLiteral, text, line, column, this.line, this.column);

        let color = this.colorLexer.getColorInfo(text);

        if (color != null) {
            this.colorInformation.push({
                color: color,
                range: { startLineNumber: line, endLineNumber: line, startColumn: column + 1, endColumn: this.column - 1 }
            });
        }

    }

    lexTripleQuoteStringConstant() {
        let line = this.line;
        let column = this.column;
        let StringLines: string[] = [];

        // skip """ and all characters in same line

        this.next(); // skip "
        this.next(); // skip "
        this.next(); // skip "

        let restOfLine: string = "";
        while (["\n", "\r"].indexOf(this.currentChar) < 0 && this.currentChar != endChar) {
            restOfLine += this.currentChar;
            this.next();
        }

        restOfLine = restOfLine.trim();
        if (restOfLine.length > 0 && !restOfLine.startsWith("//") && !restOfLine.startsWith("/*")) {
            this.pushError(JCM.charactersAfterMultilineStringLiteralStart(), restOfLine.length + 3);
        }

        if (this.currentChar == '\r') {
            this.next();
        }

        if (this.currentChar == '\n') {
            this.next();
            this.line++;
            this.column = 1;
        }

        let currentStringLine: string = "";

        while (true) {
            let char = this.currentChar;
            if (char == "\\") {
                currentStringLine += this.parseStringLiteralEscapeCharacter();
            } else if (char == '"' && this.nextChar == '"' && this.pos + 2 < this.input.length && this.input[this.pos + 2] == '"') {
                this.next();
                this.next();
                this.next();
                StringLines.push(currentStringLine);
                break;
            } else if (char == endChar) {
                let length = 0;
                for (let s of StringLines) length += s.length;
                this.pushError(JCM.endOfTextInsideStringLiteral(), length, "error", line, column);
                StringLines.push(currentStringLine);
                break;
            } else
                if (char == "\r" || char == "\n") {
                    if(char == "\r") this.next();
                    if (this.currentChar == "\n") this.next();
                    char = this.currentChar;
                    StringLines.push(currentStringLine);
                    currentStringLine = "";
                    this.line++;
                    this.column = 1;
                    continue;
                } else {
                    currentStringLine += char;
                }
            this.next();
        }

        if (StringLines.length == 0) return;
        let lastLine = StringLines.pop()!;
        let indent = 0;
        while (lastLine.length > indent && lastLine.charAt(indent) == " ") {
            indent++;
        }

        let text: string = "";
        text = StringLines.map(s => s.substring(indent)).join("\n");

        this.pushToken(TokenType.stringLiteral, text, line, column, this.line, this.column);

    }

    parseStringLiteralEscapeCharacter(): string {
        this.next(); // skip \
        if (this.currentChar == "u") {
            let hex: string = "";
            this.next();
            while ("abcdef0123456789".indexOf(this.currentChar) >= 0 && hex.length < 4) {
                hex += this.currentChar;
                this.next();
            }
            if (hex.length < 4) {
                this.pushError(JCM.unknownEscapeSequence("u" + hex), 1 + hex.length);
                return "";
            } else {
                return String.fromCodePoint(parseInt(hex, 16));
            }
        } else if (EscapeSequenceList[this.currentChar] != null) {
            let c = EscapeSequenceList[this.currentChar];
            this.next();
            return c;
        } else {
            this.pushError(JCM.unknownEscapeSequence(this.currentChar), 2);
            this.next();
            return "";
        }

    }

    lexMultilineComment() {
        let line = this.line;
        let column = this.column;
        let lastCharWasNewline: boolean = false;

        let text = "/*";
        this.next();
        this.next();

        while (true) {
            let char = this.currentChar;
            if (char == "*" && this.nextChar == "/") {
                this.next();
                this.next();
                text += "*/";
                break;
            }
            if (char == endChar) {
                this.pushError(JCM.endOfTextInsideJavadocComment(), 1);
                break;
            }
            if (char == "\n") {
                this.line++;
                this.column = 0;
                lastCharWasNewline = true;
                text += char;
            } else if (!(lastCharWasNewline && char == " ")) {
                text += char;
                lastCharWasNewline = false;
            }

            this.next();
        }

        this.pushToken(TokenType.comment, text, line, column, this.line, this.column);

    }

    lexEndofLineComment() {
        let line = this.line;
        let column = this.column;

        let text = "//";
        this.next();
        this.next();

        while (true) {
            let char = this.currentChar;
            if (char == "\n") {
                break;
            }
            if (char == endChar) {
                // this.pushError("Innerhalb eines Einzeilenkommentars (//... ) wurde das Dateiende erreicht.", 1);
                break;
            }
            text += char;
            this.next();
        }

        this.pushToken(TokenType.comment, text, line, column, this.line, this.column);

    }


    lexNumber() {
        let line = this.line;
        let column = this.column;

        let sign: number = 1;
        if (this.currentChar == '-') {
            sign = -1;
            this.next();
        } else if (this.currentChar == '+') {
            this.next();
        }

        let posStart = this.pos;

        let firstChar = this.currentChar;

        this.next();

        let radix: number = 10;

        if (firstChar == '0' && (['b', 'x', '0', '1', '2', '3', '4', '5', '6', '7'].indexOf(this.currentChar) >= 0)) {
            if (this.currentChar == 'x') {
                radix = 16;
                this.next();
            } else if (this.currentChar == 'b') {
                radix = 2;
                this.next();
            } else radix = 8;
            posStart = this.pos;
        }

        while (this.isDigit(this.currentChar, radix)) {
            this.next();
        }

        let tt = TokenType.integerLiteral;

        let exponent: number = 0;
        let base: string = "";

        if (this.currentChar == "L") {
            base = this.input.substring(posStart, this.pos);
            tt = TokenType.longConstant;
            this.next();
        } else {

            if (this.currentChar == ".") {
                tt = TokenType.floatLiteral;

                this.next();
                while (this.isDigit(this.currentChar, 10)) {
                    this.next();
                }


                if (radix != 10) {
                    this.pushError(JCM.wrongFloatConstantBegin(), this.pos - posStart, "error", this.line, this.column - (this.pos - posStart));
                }

            }

            base = this.input.substring(posStart, this.pos);

            posStart = this.pos;

            //@ts-ignore
            if (this.currentChar == "e") {
                this.next();
                let posExponentStart: number = this.pos;

                //@ts-ignore
                if (this.currentChar == '-') {
                    this.next();
                }

                while (this.isDigit(this.currentChar, 10)) {
                    this.next();
                }
                if (radix != 10) {
                    this.pushError(JCM.wrongFloatConstantBegin(), this.pos - posStart, "error", this.line, this.column - (this.pos - posStart));
                }
                let exponentString = this.input.substring(posExponentStart, this.pos);
                exponent = Number.parseInt(exponentString);
            }

            if (this.currentChar == 'd' || this.currentChar == 'f') {
                tt = TokenType.floatLiteral;
                if (this.currentChar == 'd') tt = TokenType.doubleConstant;
                this.next();
                if (radix != 10) {
                    this.pushError(JCM.wrongFloatConstantBegin(), this.pos - posStart, "error", this.line, this.column - (this.pos - posStart));
                }
            }
        }


        let value: number = (tt == TokenType.integerLiteral) ? Number.parseInt(base, radix) : Number.parseFloat(base);
        value *= sign;
        if (exponent != 0) value *= Math.pow(10, exponent);

        this.pushToken(tt, value, line, column, this.line, this.column);

        if (radix == 16 && this.column - column == 8) {
            this.colorInformation.push({
                color: {
                    red: (value >> 16) / 255,
                    green: ((value >> 8) & 0xff) / 255,
                    blue: (value & 0xff) / 255,
                    alpha: 1
                },
                range: {
                    startLineNumber: line, endLineNumber: this.line, startColumn: column, endColumn: this.column
                }
            })
        }

    }

    lexAnnotation() {
        let line = this.line;
        let column = this.column - 1;
        let posStart = this.pos;

        this.next(); // consume @

        this.pushToken(TokenType.at, "@", line, column, this.line, column + 1);

        let char = this.currentChar;

        while (specialCharList[char] == null && !this.isSpace(char) && !(char == endChar)) {
            this.next();
            char = this.currentChar;
        }

        let posEnd = this.pos;

        let text = this.input.substring(posStart + 1, posEnd);

        // TODO: Check if valid indentifier?
        this.pushToken(TokenType.identifier, text, line, column + 1, this.line, this.column);
    }

    lexIdentifierOrKeyword() {
        let line = this.line;
        let column = this.column;

        let posStart = this.pos;
        let char = this.currentChar;

        while (specialCharList[char] == null && !this.isSpace(char) && !(char == endChar)) {
            this.next();
            char = this.currentChar;
        }

        let posEnd = this.pos;

        let text = this.input.substring(posStart, posEnd);

        let tt = KeywordList[text];
        if (tt != null && typeof tt == "number") {

            switch (tt) {
                case TokenType.true:
                    this.pushToken(TokenType.booleanLiteral, true, line, column, this.line, this.column);
                    break;
                case TokenType.false:
                    this.pushToken(TokenType.booleanLiteral, false, line, column, this.line, this.column);
                    break;
                case TokenType.keywordPrint:
                case TokenType.keywordPrintln:
                    if (this.nonSpaceLastTokenType == TokenType.dot) {
                        this.pushToken(TokenType.identifier, text, line, column, this.line, this.column);
                    } else {
                        this.pushToken(tt, text, line, column, this.line, this.column);
                    }
                    break;
                case TokenType.keywordClass:
                    if(this.tokens[this.tokens.length - 1]?.tt == TokenType.dot){
                        this.pushToken(TokenType.identifier, "class", line, column, this.line, this.column);
                    } else {
                        this.pushToken(tt, text, line, column, this.line, this.column);
                    }
                    break;
                default:
                    this.pushToken(tt, text, line, column, this.line, this.column);
                    break;
            }

            return;
        }

        if (text == 'Color') {
            this.colorIndices.push(this.tokens.length);
        }

        this.pushToken(TokenType.identifier, text, line, column, this.line, this.column);

    }

    isSpace(char: string): boolean {
        return Lexer.spaceCharacters.indexOf(char) >= 0 || char == "\n";
    }


}

export function errorListToString(errorList: Error[]): string {
    let s = "";

    for (let error of errorList) {

        s += "Z " + error.range.startLineNumber + ", S " + error.range.startColumn + ": ";
        s += error.message + "<br>";

    }

    return s;
}