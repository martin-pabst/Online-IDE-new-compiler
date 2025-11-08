import { on } from "events";
import { IRange } from "../../common/range/Range";
import { Lexer } from "../lexer/Lexer";
import { Token, TokenList } from "../lexer/Token";
import { TokenType } from "../TokenType";
import * as monaco from 'monaco-editor'


export class JavaFormatter implements monaco.languages.DocumentFormattingEditProvider,
    monaco.languages.OnTypeFormattingEditProvider {

    autoFormatTriggerCharacters: string[] = ['\n'];

    displayName?: string = "Java-Autoformat";

    provideOnTypeFormattingEdits(model: monaco.editor.ITextModel, position: monaco.Position, ch: string, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {

        let edits: monaco.languages.TextEdit[] = this.format(model);

        return Promise.resolve(
            edits
        );

    }
    deleteOverlappingRanges(edits: monaco.languages.TextEdit[]) {
        for (let i = 0; i < edits.length - 1; i++) {
            let e = edits[i];
            let e1 = edits[i + 1];
            if (e.range.endLineNumber < e1.range.startLineNumber) continue;
            if (e.range.endLineNumber == e1.range.startLineNumber) {
                if (e.range.endColumn >= e1.range.startColumn) {
                    edits.splice(i + 1, 1);
                } else {
                    if (e.range.endColumn == 0 && e.text.length > 0 && e1.range.startColumn == 1 && e1.range.endColumn > e1.range.startColumn && e1.text == "") {
                        let delta = e.text.length - (e1.range.endColumn - e1.range.startColumn);
                        if (delta > 0) {
                            e.text = e.text.substr(0, delta);
                            edits.splice(i + 1, 1);
                        }
                        else if (delta < 0) {
                            //@ts-ignore
                            e1.range.endColumn = e1.range.startColumn - delta;
                            edits.splice(i, 1);
                            i--;

                        }
                        else {
                            edits.splice(i, 2);
                            i--;
                        }
                    }
                }
            }
        }
    }


    provideDocumentFormattingEdits(model: monaco.editor.ITextModel,
        options: monaco.languages.FormattingOptions,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {

        let edits: monaco.languages.TextEdit[] = this.format(model);

        return Promise.resolve(
            edits
        );

    }

    format(model: monaco.editor.ITextModel): monaco.languages.TextEdit[] {

        let edits: monaco.languages.TextEdit[] = [];

        // if (this.main.currentWorkspace == null || this.main.currentWorkspace.currentlyOpenModule == null) {
        //     return [];
        // }

        // let text = this.main.monaco_editor.getValue({ preserveBOM: false, lineEnding: "\n" });

        let text = model.getValue(monaco.editor.EndOfLinePreference.LF);

        let tokenlist = new Lexer().lex(text).tokens;

        // let tokenlist = this.main.currentWorkspace.currentlyOpenModule.tokenList;

        if (tokenlist == null) return [];

        // TODO:
        // { at the end of line, with one space before; followed only by spaces and \n
        // indent lines according to { and }
        // Beware: int i[] = { ... }
        // exactly one space before/after binary operators
        // no space after ( and no space before )
        // (   ) -> ()
        // (  ()) -> (())
        // (()  ) -> (())

        let lastNonSpaceToken: Token | undefined = undefined;
        let indentLevel = 0;
        let tabSize = 3;
        let curlyBracesOpenAtLines: number[] = [];
        let indentLevelAtSwitchStatements: number[] = [];
        let switchHappend: boolean = false;
        let lastTokenWasNewLine: number = 0;
        let roundBracketsOpen: number = 0;

        let oneTimeIndent: boolean = false; // if after for, while, ... there's no { } and therefore only one line is indented

        for (let i = 0; i < tokenlist.length; i++) {

            let t = tokenlist[i];
            lastTokenWasNewLine--;

            switch (t.tt) {

                case TokenType.keywordSwitch:
                    switchHappend = true;
                    break;
                case TokenType.keywordCase:
                case TokenType.keywordDefault:
                    // outdent: line with case:
                    if (t.range.startColumn > 3) {
                        this.deleteSpaces(edits, t.range.startLineNumber, 1, 3);
                    }
                    break;
                case TokenType.leftCurlyBracket:
                    oneTimeIndent = false;
                    if (switchHappend) {
                        switchHappend = false;
                        indentLevelAtSwitchStatements.push(indentLevel + 2);
                        indentLevel++;
                    }
                    indentLevel++;
                    curlyBracesOpenAtLines.push(t.range.startLineNumber);
                    if (lastNonSpaceToken != null) {
                        let tt = lastNonSpaceToken.tt;
                        if (tt == TokenType.rightBracket || tt == TokenType.identifier || tt == TokenType.leftRightSquareBracket) {
                            if (lastNonSpaceToken.range.startLineNumber == t.range.startLineNumber) {
                                this.replaceBetween(lastNonSpaceToken, t, edits, " ");
                            }
                        }
                    }
                    if (i < tokenlist.length - 1) {
                        let token1 = tokenlist[i + 1];
                        if (token1.tt != TokenType.newline && token1.tt != TokenType.space) {
                            this.insertSpaces(edits, token1.range.startLineNumber, token1.range.startColumn, 1);
                        }
                    }
                    break;
                case TokenType.rightCurlyBracket:
                    if (indentLevelAtSwitchStatements && indentLevelAtSwitchStatements[indentLevelAtSwitchStatements.length - 1] == indentLevel) {
                        indentLevelAtSwitchStatements.pop();
                        indentLevel--;
                        // if(t.range.startColumn >= 3){
                        this.deleteSpaces(edits, t.range.startLineNumber, 1, 3);
                        // }
                    }
                    let openedAtLine = curlyBracesOpenAtLines.pop();
                    if (openedAtLine != null && openedAtLine != t.range.startLineNumber) {
                        if (lastNonSpaceToken != null && lastNonSpaceToken.range.startLineNumber == t.range.startLineNumber) {
                            this.replace(edits, lastNonSpaceToken.range, t.range, "\n" + " ".repeat(indentLevel * tabSize));
                        }
                    } else {
                        if (i > 0) {
                            let token1 = tokenlist[i - 1];
                            if (token1.tt != TokenType.space && token1.tt != TokenType.newline) {
                                this.insertSpaces(edits, t.range.startLineNumber, t.range.startColumn, 1);
                            }
                        }
                    }
                    indentLevel--;
                    break;
                case TokenType.leftBracket:
                    roundBracketsOpen++;
                    if (i < tokenlist.length - 2) {
                        let nextToken1 = tokenlist[i + 1];
                        let nextToken2 = tokenlist[i + 2];
                        if (nextToken1.tt == TokenType.space && nextToken2.tt != TokenType.newline) {
                            this.deleteSpaces(edits, nextToken1.range.startLineNumber, nextToken1.range.startColumn, this.lengthOfRange(nextToken1.range));
                            i++;
                            if (nextToken2.tt == TokenType.rightBracket) {
                                i++;
                                roundBracketsOpen--;
                            }
                        }
                    }
                    if (i > 1) {
                        let lastToken1 = tokenlist[i - 1];
                        let lastToken2 = tokenlist[i - 2];
                        if (lastToken1.tt == TokenType.space && [TokenType.newline, TokenType.keywordFor, TokenType.keywordWhile].indexOf(lastToken2.tt) < 0 && !this.isBinaryOperator(lastToken2.tt)) {
                            if (this.lengthOfRange(lastToken1.range) == 1) {
                                this.deleteSpaces(edits, lastToken1.range.startLineNumber, lastToken1.range.startColumn, 1);
                            }
                        }
                    }
                    break;
                case TokenType.rightBracket:
                    roundBracketsOpen--;
                    if (i > 1) {
                        let nextToken1 = tokenlist[i - 1];
                        let nextToken2 = tokenlist[i - 2];
                        if (nextToken1.tt == TokenType.space && nextToken2.tt != TokenType.newline) {
                            this.deleteSpaces(edits, nextToken1.range.startLineNumber, nextToken1.range.startColumn, this.lengthOfRange(nextToken1.range));
                        }
                    }
                    break;
                case TokenType.newline:
                    lastTokenWasNewLine = 2;
                    if (i < tokenlist.length - 2) {

                        let nextNonSpaceToken = this.getNextNonSpaceToken(i, tokenlist);

                        // no additional indent after "case 12 :"
                        let lastTokenIsOperator = this.isBinaryOperator(lastNonSpaceToken?.tt) && lastNonSpaceToken?.tt != TokenType.colon;
                        let nextTokenIsOperator = this.isBinaryOperator(nextNonSpaceToken.tt);

                        let beginNextLine = tokenlist[i + 1];
                        let token2 = tokenlist[i + 2];
                        let currentIndentation = 0;

                        if (beginNextLine.tt == TokenType.newline || nextNonSpaceToken.tt == TokenType.comment) {
                            break;
                        }

                        let delta: number = 0;
                        if (beginNextLine.tt == TokenType.space) {
                            if (token2.tt == TokenType.newline) {
                                break;
                            }
                            currentIndentation = this.lengthOfRange(beginNextLine.range);
                            i++;
                            if (token2.tt == TokenType.rightCurlyBracket) {
                                delta = -1;
                            }
                        }

                        if (beginNextLine.tt == TokenType.rightCurlyBracket) {
                            delta = -1;
                            // indentLevel--;
                            // curlyBracesOpenAtLines.pop();
                            // lastNonSpaceToken = beginNextLine;
                            // i++;
                        }

                        if (nextTokenIsOperator || lastTokenIsOperator) delta = 1;

                        let il = indentLevel + delta;
                        if (roundBracketsOpen > 0) {
                            il++;
                        }
                        if (il < 0) il = 0;

                        let correctIndentation = il * tabSize + (oneTimeIndent ? tabSize : 0);
                        oneTimeIndent = false;

                        if (correctIndentation > currentIndentation) {
                            this.insertSpaces(edits, t.range.startLineNumber + 1, 0, correctIndentation - currentIndentation);
                        } else if (correctIndentation < currentIndentation) {
                            this.deleteSpaces(edits, t.range.startLineNumber + 1, 0, currentIndentation - correctIndentation);
                        }
                    }
                    break;
                case TokenType.space:
                    if (i < tokenlist.length - 1) {
                        let nextToken = tokenlist[i + 1];
                        if (nextToken.tt != TokenType.comment) {
                            if (i > 0) {
                                let lastToken = tokenlist[i - 1];
                                if (lastToken.tt != TokenType.newline) {
                                    if (this.lengthOfRange(t.range) > 1) {
                                        this.deleteSpaces(edits, t.range.startLineNumber, t.range.startColumn, this.lengthOfRange(t.range) - 1);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case TokenType.keywordFor:
                case TokenType.keywordWhile:
                    if (i < tokenlist.length - 1) {
                        let nextToken = tokenlist[i + 1];
                        if (nextToken.tt == TokenType.leftBracket) {
                            this.insertSpaces(edits, nextToken.range.startLineNumber, nextToken.range.startColumn, 1);
                        }
                    }
                    oneTimeIndent = true;
                    break;
                case TokenType.keywordIf:
                case TokenType.keywordElse:
                case TokenType.keywordDo:
                    oneTimeIndent = true;
                    break;
                case TokenType.comma:
                case TokenType.semicolon:
                    oneTimeIndent = false;
                    if (i > 1) {
                        let lastToken1 = tokenlist[i - 1];
                        let lastToken2 = tokenlist[i - 2];
                        if (lastToken1.tt != TokenType.newline && lastToken2.tt != TokenType.newline && !this.isBinaryOperator(lastToken2.tt)) {
                            if (lastToken1.tt == TokenType.space && this.lengthOfRange(lastToken1.range) == 1) {
                                this.deleteSpaces(edits, lastToken1.range.startLineNumber,
                                    lastToken1.range.startColumn, 1);
                            }
                        }
                    }
                    if (i < tokenlist.length - 1) {
                        let nextToken = tokenlist[i + 1];
                        if (nextToken.tt != TokenType.comment && nextToken.tt != TokenType.space && nextToken.tt != TokenType.newline) {
                            this.insertSpaces(edits, nextToken.range.startLineNumber, nextToken.range.startColumn, 1);
                        }
                    }
                    break;
                case TokenType.rightSquareBracket:
                    if (lastNonSpaceToken != null && lastNonSpaceToken.tt == TokenType.leftSquareBracket) {
                        this.replaceBetween(lastNonSpaceToken, t, edits, "");

                    }
                    break;

            }

            // binary operator?
            if (this.isBinaryOperator(t.tt)) {

                let lowerGeneric = t.tt == TokenType.lower && this.lowerBelongsToGenericExpression(i, tokenlist);
                let greaterGeneric = t.tt == TokenType.greater && this.greaterBelongsToGenericExpression(i, tokenlist);

                if (lastTokenWasNewLine <= 0 && lastNonSpaceToken != null && [TokenType.leftBracket, TokenType.assignment, TokenType.comma].indexOf(lastNonSpaceToken.tt) < 0) {

                    if (i > 0) {
                        let tokenBefore = tokenlist[i - 1];
                        let spaces = (lowerGeneric || greaterGeneric) ? 0 : 1;
                        if (tokenBefore.tt == TokenType.space) {
                            if (this.lengthOfRange(tokenBefore.range) != spaces) {
                                this.insertSpaces(edits, tokenBefore.range.startLineNumber,
                                    tokenBefore.range.startColumn, spaces - this.lengthOfRange(tokenBefore.range));
                            }
                        } else {
                            if (spaces == 1)
                                this.insertSpaces(edits, t.range.startLineNumber, t.range.startColumn, 1);
                        }
                    }

                    if (i < tokenlist.length - 1) {
                        let nextToken = tokenlist[i + 1];
                        let spaces = (lowerGeneric) ? 0 : 1;
                        if (nextToken.tt == TokenType.space) {
                            if (greaterGeneric && i < tokenlist.length - 2 && tokenlist[i + 2].tt == TokenType.leftBracket) {
                                spaces = 0;
                            }
                            if (this.lengthOfRange(nextToken.range) != spaces) {
                                this.insertSpaces(edits, nextToken.range.startLineNumber,
                                    nextToken.range.startColumn, spaces - this.lengthOfRange(nextToken.range));
                            }
                        } else {
                            if (greaterGeneric && nextToken.tt == TokenType.leftBracket) {
                                spaces = 0;
                            }
                            if (spaces == 1) this.insertSpaces(edits, nextToken.range.startLineNumber, nextToken.range.startColumn, 1);
                        }
                    }

                }
            }

            if (t.tt != TokenType.space && t.tt != TokenType.newline) {
                lastNonSpaceToken = t;
            }

        }

        this.deleteOverlappingRanges(edits);

        return edits;

    }
    getNextNonSpaceToken(currentIndex: number, tokenlist: TokenList): Token {

        if (currentIndex == tokenlist.length - 1) return tokenlist[currentIndex];

        let j = currentIndex + 1;
        while (j < tokenlist.length - 1 && (tokenlist[j].tt == TokenType.space || tokenlist[j].tt == TokenType.keywordReturn)) {
            j++;
        }
        return tokenlist[j];

    }

    lowerBelongsToGenericExpression(position: number, tokenlist: TokenList) {
        let i = position + 1;
        while (i < tokenlist.length) {
            let tt = tokenlist[i].tt;
            if (tt == TokenType.greater) {
                return true;
            }
            if ([TokenType.space, TokenType.comma, TokenType.identifier].indexOf(tt) < 0) {
                return false;
            }
            i++;
        }
        return false;
    }

    greaterBelongsToGenericExpression(position: number, tokenlist: TokenList) {
        let i = position - 1;
        while (i >= 0) {
            let tt = tokenlist[i].tt;
            if (tt == TokenType.lower) {
                return true;
            }
            if ([TokenType.space, TokenType.comma, TokenType.identifier].indexOf(tt) < 0) {
                return false;
            }
            i--;
        }
        return false;
    }

    isBinaryOperator(token?: TokenType) {
        return token && token >= TokenType.modulo && token <= TokenType.colon;
    }

    private replaceBetween(lastNonSpaceToken: Token, t: Token, edits: monaco.languages.TextEdit[], text: string) {
        let positionFrom = lastNonSpaceToken.range;
        let positionTo = t.range;
        if (positionFrom.endLineNumber != positionTo.startLineNumber ||
            positionTo.startColumn - positionFrom.endColumn != text.length) {
            this.replace(edits, positionFrom, positionTo, text);
        }
    }

    deleteSpaces(edits: monaco.languages.TextEdit[], line: number, column: number, numberOfSpaces: number) {
        edits.push({
            range: {
                startColumn: column,
                startLineNumber: line,
                endColumn: column + numberOfSpaces + (column == 0 ? 1 : 0),
                endLineNumber: line
            },
            text: ""
        });
    }

    insertSpaces(edits: monaco.languages.TextEdit[], line: number, column: number, numberOfSpaces: number) {

        if (numberOfSpaces < 0) {
            this.deleteSpaces(edits, line, column, -numberOfSpaces);
            return;
        }

        edits.push({
            range: {
                startColumn: column,
                startLineNumber: line,
                endColumn: column,
                endLineNumber: line
            },
            text: " ".repeat(numberOfSpaces)
        });
    }

    replace(edits: monaco.languages.TextEdit[], positionFrom: IRange, positionTo: IRange, text: string) {

        edits.push({
            range: {
                startColumn: positionFrom.endColumn,
                startLineNumber: positionFrom.endLineNumber,
                endColumn: positionTo.startColumn,
                endLineNumber: positionTo.startLineNumber
            },
            text: text
        });

    }


    lengthOfRange(range: IRange) {
        return range.endColumn - range.startColumn;
    }


}