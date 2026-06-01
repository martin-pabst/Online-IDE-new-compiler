import { Error } from "../common/Error";
import { IRange } from "../common/range/Range";
import { AssemblyTokenType } from "./AssemblyTokenType";
import { AssemblyLexerMessages } from "./language/AssemblyLexerMessages";

export type AssemblyToken = {
    type: AssemblyTokenType;
    value: string | number;
    range: IRange;
    text: string;
}

export type AssemblyLexerOutput = {
    /**
     * list tokens doesn't contain 
     *  - whitespace (except: \n)
     *  - comments
     */
    tokens: AssemblyToken[];
    commentRanges: IRange[];
    errors: Error[];
}

export class AssemblyLexer {
    pos: number;
    line: number;
    column: number;
    isBeginningOfLine: boolean;

    static spaceCharacters: string[] = [" ", "\t", "\uc2a0", "\u00a0",];
    input: string;
    tokens: AssemblyToken[];
    commentRanges: IRange[];
    errors: Error[];

    endChar = "►"; // \u10000

    currentChar: string = '';
    nextChar: string = '';
    keywordTokens: Set<AssemblyTokenType>;

    tokenize(input: string, keywordTokens: Set<AssemblyTokenType>): AssemblyLexerOutput {
        this.tokens = [];
        this.commentRanges = [];
        this.errors = [];
        this.keywordTokens = keywordTokens;

        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.isBeginningOfLine = true;

        this.input = input;

        if (input && input.length > 0) {

            this.currentChar = this.input.charAt(0);

            this.nextChar = this.input.length > 1 ? this.input.charAt(1) : this.endChar;

            this.main();
        }

        this.tokens.push({
            type: AssemblyTokenType.endOfSourcecode,
            value: "",
            range: {
                startLineNumber: this.line,
                startColumn: this.column,
                endLineNumber: this.line,
                endColumn: this.column
            },
            text: ""
        });

        return { tokens: this.tokens, commentRanges: this.commentRanges, errors: this.errors };
    }

    next() {
        this.pos++;
        this.currentChar = this.nextChar;
        if (this.pos + 1 < this.input.length) {
            this.nextChar = this.input.charAt(this.pos + 1);
        } else {
            this.nextChar = this.endChar;
        }
        this.column++; // column of current char
    }

    main() {
        while (this.currentChar != this.endChar) {
            let char = this.currentChar;
            // console.log(`Next 10 chars: '${this.input.substring(this.pos, this.pos + 10)}' (Line: ${this.line}, Column: ${this.column})`);
            switch (char) {
                case '\n':
                    this.pushToken(AssemblyTokenType.lineBreak, char);
                    this.line++;
                    this.column = 0;
                    this.isBeginningOfLine = true;
                    this.next();
                    break;
                case this.endChar:
                    return;
                case ' ':
                case '\t':
                case '\uc2a0':
                case '\u00a0':
                    this.next();
                    break;
                case '/':
                    let startLineNumber = this.line;
                    let startColumn = this.column;
                    if (this.nextChar === '/') {
                        this.next(); this.next();
                        while (this.currentChar !== '\n' && this.currentChar !== this.endChar) {
                            this.next();
                        }
                        this.commentRanges.push({
                            startLineNumber,
                            startColumn,
                            endLineNumber: this.line,
                            endColumn: this.column
                        });
                    } else if (this.nextChar === '*') {
                        this.next(); this.next();
                        while (true) {
                            //@ts-ignore
                            if (this.currentChar === this.endChar || (this.currentChar === '*' && this.nextChar === '/')) {
                                if (this.currentChar === '*') {
                                    this.next(); // skip *
                                    this.next(); // skip *
                                }
                                break;
                            }
                            if (this.currentChar === '\n') {
                                this.line++;
                                this.column = 0;
                                this.isBeginningOfLine = true;
                            }
                            this.next();
                        }
                        this.commentRanges.push({
                            startLineNumber,
                            startColumn,
                            endLineNumber: this.line,
                            endColumn: this.column
                        });

                    } else {
                        this.lexInvalidToken();
                    }
                    break;
                case '0':
                    if (this.nextChar === 'b' || this.nextChar === 'B') {
                        this.lexNumber(2);
                    } else if (this.nextChar === 'x' || this.nextChar === 'X') {
                        this.lexNumber(16);
                    } else {
                        this.lexNumber(10);
                    }
                    break;
                case '(':
                    this.pushToken(AssemblyTokenType.leftBracket, char);
                    this.next();
                    break;
                case ')':
                    this.pushToken(AssemblyTokenType.rightBracket, char);
                    this.next();
                    break;
                case ':':
                    this.pushToken(AssemblyTokenType.colon, char);
                    this.next();
                    break;
                case ',':
                    this.pushToken(AssemblyTokenType.comma, char);
                    this.next();
                    break;
                case '.':
                    this.pushToken(AssemblyTokenType.dot, char);
                    this.next();
                    break;
                case '#':
                    if (this.nextChar === '$' || this.nextChar >= '0' && this.nextChar <= '9') {    // 6502 assemby uses # for immediate values, e.g. LDA #10; LDA #$ff
                        this.pushToken(AssemblyTokenType.hash, char);
                        this.next();
                    } else {
                        // comment until end of line
                        let startLineNumber = this.line;
                        let startColumn = this.column;
                        this.next();
                        while (this.currentChar !== '\n' && this.currentChar !== this.endChar) {
                            this.next();
                        }
                        this.commentRanges.push({
                            startLineNumber,
                            startColumn,
                            endLineNumber: this.line,
                            endColumn: this.column
                        });
                    }
                    this.next();
                    break;
                default:
                    if (/[a-zA-Z_\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]/.test(char)) {
                        this.lexIdentifierOrKeyword();
                    } else if (/[1-9\-]/.test(char)) {
                        this.lexNumber(10);
                    } else {
                        this.lexInvalidToken();
                    }
                    break;
            }
        }
    }

    isDigit(a: string, base: number) {
        var charCode = a.charCodeAt(0);

        if (base == 10) return (charCode >= 48 && charCode <= 57); // 0 - 9
        if (base == 2) return (charCode >= 48 && charCode <= 49); // 0, 1
        if (base == 8) return (charCode >= 48 && charCode <= 55); // 0 - 7
        if (base == 16) return (charCode >= 48 && charCode <= 57) || (charCode >= 97 && charCode <= 102) ||
            (charCode >= 65 && charCode <= 70); // 0 - 9 || a - f || A - F
    }

    lexNumber(base: number) {
        let startLineNumber = this.line;
        let startColumn = this.column;
        let numberPraefix = "";

        if (base === 2 || base === 16) {
            numberPraefix = this.currentChar + this.nextChar;
            this.next(); this.next();    // skip 0x or 0b
        }

        let sign = 1;
        if (base === 10 && this.currentChar === '-') {
            sign = -1;
            this.next();
        }

        let numberString = "";
        while (this.isDigit(this.currentChar, base)) {
            numberString += this.currentChar;
            this.next();
        }

        if (numberString.length === 0) {
            this.errors.push({
                message: AssemblyLexerMessages.invalidNumberLiteral(),
                range: {
                    startLineNumber,
                    startColumn,
                    endLineNumber: this.line,
                    endColumn: this.column
                },
                level: "error",
                id: ""
            });
            return;
        }

        let value: number = parseInt(numberString, base) * sign;
        if (isNaN(value)) {
            this.errors.push({
                message: AssemblyLexerMessages.invalidNumberLiteral(),
                range: {
                    startLineNumber,
                    startColumn,
                    endLineNumber: this.line,
                    endColumn: this.column
                },
                level: "error",
                id: ""
            });
            return;
        }

        this.tokens.push({
            type: AssemblyTokenType.number,
            value: value,
            text: sign == 1 ? numberString : `-${numberString}`,
            range: {
                startLineNumber,
                startColumn,
                endLineNumber: this.line,
                endColumn: this.column - 1
            }
        });

    }

    pushToken(tt: AssemblyTokenType, text: string | number,
        startLineNumber: number = this.line, startColumn: number = this.column,
        endLineNumber?: number, endColumn?: number) {

        if (!endLineNumber) endLineNumber = startLineNumber;
        if (!endColumn) endColumn = startColumn + ("" + text).length;

        let t: AssemblyToken = {
            type: tt,
            value: text,
            text: typeof text === "string" ? text : `${text}`,
            range: {
                startLineNumber: startLineNumber,
                startColumn: startColumn,
                endLineNumber: endLineNumber,
                endColumn: endColumn
            }
        }

        this.tokens.push(t);
    }

    lexIdentifierOrKeyword() {
        let startLineNumber = this.line;
        let startColumn = this.column;
        let identifier = "";

        while (/[a-zA-Z\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df0-9_]/.test(this.currentChar)) {
            identifier += this.currentChar;
            this.next();
        }

        let tokenType = AssemblyTokenType[identifier.toLowerCase()];

        if (this.keywordTokens.has(tokenType)) {
            this.pushToken(tokenType, identifier, startLineNumber, startColumn);
        } else {
            this.pushToken(AssemblyTokenType.identifier, identifier, startLineNumber, startColumn);
        }
    }

    lexInvalidToken() {
        let startLineNumber = this.line;
        let startColumn = this.column;
        let invalidToken = "";
        while (this.currentChar !== this.endChar && !["\n", " ", "\t"].includes(this.currentChar)) {
            invalidToken += this.currentChar;
            this.next();
        }
        // this.tokens.push({
        //     type: AssemblyTokenType.invalid,
        //     value: invalidToken,
        //     range: {
        //         startLineNumber,
        //         startColumn,
        //         endLineNumber: this.line,
        //         endColumn: this.column - 1
        //     }
        // });
        this.errors.push({
            message: AssemblyLexerMessages.invalidCharacter(invalidToken),
            range: {
                startLineNumber,
                startColumn,
                endLineNumber: this.line,
                endColumn: this.column
            },
            level: "error",
            id: ""
        });
    }

    debugOutputTokens() {
        console.log("Tokens:");
        for (let token of this.tokens) {
            console.log(`Type: ${AssemblyTokenType[token.type]}, Value: ${token.value}, Range: (${token.range.startLineNumber}, ${token.range.startColumn}) - (${token.range.endLineNumber}, ${token.range.endColumn})`);
        }
    }
}