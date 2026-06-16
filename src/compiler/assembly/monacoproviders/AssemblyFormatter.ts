import * as monaco from 'monaco-editor'
import { BaseMonacoProvider } from '../../common/monacoproviders/BaseMonacoProvider';
import { ByAssemblyLanguage } from '../byassembly/ByAssemblyLanguage';
import { AssemblyLexer, AssemblyToken } from '../AssemblyLexer';
import { AssemblyTokenType } from '../AssemblyTokenType';

type LineInfo = {
    lineNumber: number;
    labelIdentifierAtLineBegin?: AssemblyToken;
    hasWordInstruction: boolean;
    labelColon?: AssemblyToken;
    tokenAfterColon?: AssemblyToken;
    parameters?: AssemblyToken[];
    commasBetweenParameters?: AssemblyToken[];
    maxIdentifierLengthInsideDirective?: number;
}

export class AssemblyFormatter extends BaseMonacoProvider
    implements monaco.languages.DocumentFormattingEditProvider,
    monaco.languages.OnTypeFormattingEditProvider {

    autoFormatTriggerCharacters: string[] = ['\n'];

    displayName?: string = "Assembly-Autoformat";

    tokens: AssemblyToken[];
    currentTokenIndex: number;
    currentToken: AssemblyToken;

    constructor(language: ByAssemblyLanguage) {
        super(language);

        monaco.languages.registerDocumentFormattingEditProvider(language.monacoLanguageSelector, this);
        monaco.languages.registerOnTypeFormattingEditProvider(language.monacoLanguageSelector, this);

    }

    provideOnTypeFormattingEdits(model: monaco.editor.ITextModel, position: monaco.Position, ch: string, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        let edits: monaco.languages.TextEdit[] = this.format(model);

        return Promise.resolve(
            edits
        );

    }

    provideDocumentFormattingEdits(model: monaco.editor.ITextModel, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken):
        monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {

        let edits: monaco.languages.TextEdit[] = this.format(model);

        return Promise.resolve(
            edits
        );

    }

    format(model: monaco.editor.ITextModel): monaco.languages.TextEdit[] {

        let main = this.findMainForModel(model);
        if (!main) return [];

        let edits: monaco.languages.TextEdit[] = [];

        let text = model.getValue(monaco.editor.EndOfLinePreference.LF);
        let tokenized = new AssemblyLexer().tokenize(text, new Set(), false);

        let lineInfos = this.generateLineInfos(tokenized.tokens);

        let maxIndentLevelCode = -1;
        let maxIndentLevelData = -1;
        let leftMostInstructionColumn = Number.MAX_SAFE_INTEGER;

        for (let lineInfo of lineInfos) {
            if(lineInfo.maxIdentifierLengthInsideDirective) continue;
            if (lineInfo.labelIdentifierAtLineBegin) {
                let il = (lineInfo.labelIdentifierAtLineBegin.range.endColumn - lineInfo.labelIdentifierAtLineBegin.range.startColumn) + 2; // add colon and one space
                if(lineInfo.hasWordInstruction) {
                    if (il > maxIndentLevelData) maxIndentLevelData = il;
                } else {
                    if (il > maxIndentLevelCode) maxIndentLevelCode = il;
                }
            } else if (lineInfo.tokenAfterColon) {
                let il = lineInfo.tokenAfterColon.range.startColumn;
                if (il < leftMostInstructionColumn) leftMostInstructionColumn = il;
            }
        }

        let codeIndentLevel = maxIndentLevelCode != -1 ? maxIndentLevelCode + 1 : leftMostInstructionColumn;
        if (codeIndentLevel == Number.MAX_SAFE_INTEGER) codeIndentLevel = 3;
        
        let dataIndentLevel = maxIndentLevelData != -1 ? maxIndentLevelData + 1 : codeIndentLevel;
        if (dataIndentLevel == Number.MAX_SAFE_INTEGER) dataIndentLevel = 3;

        for (let lineInfo of lineInfos) {
            let columnOffset = 0;
            if (lineInfo.labelIdentifierAtLineBegin) {
                let labelStartColumn = lineInfo.labelIdentifierAtLineBegin.range.startColumn;
                if(lineInfo.maxIdentifierLengthInsideDirective) {
                    let expectedLabelStartColumn = codeIndentLevel + 3;
                    let delta = expectedLabelStartColumn - labelStartColumn;
                    if (delta != 0) {
                        columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber, labelStartColumn, delta);
                    }
                } else {
                    let delta = 1 - labelStartColumn;
                    if (delta != 0) {
                        columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber, labelStartColumn, delta);
                    }
                }
            }

            if(lineInfo.maxIdentifierLengthInsideDirective && lineInfo.labelColon){
                let expectedColonColumn = 
                codeIndentLevel + 3 + lineInfo.maxIdentifierLengthInsideDirective;
                let delta = expectedColonColumn - (lineInfo.labelColon.range.startColumn + columnOffset);
                if(delta != 0) {
                    columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber, lineInfo.labelColon.range.startColumn, delta);
                }
            }

            if (lineInfo.tokenAfterColon) {
                let instructionStartColumn = lineInfo.tokenAfterColon.range.startColumn;
                if(lineInfo.maxIdentifierLengthInsideDirective) {
                    let expectedInstructionStartColumn = codeIndentLevel + 3 + lineInfo.maxIdentifierLengthInsideDirective + 3;
                    let delta = expectedInstructionStartColumn - (instructionStartColumn + columnOffset);
                    if (delta != 0) {
                        columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber, instructionStartColumn, delta);
                    }
                } else{
                    let indentLevel = lineInfo.hasWordInstruction ? dataIndentLevel : codeIndentLevel;
                    let delta = indentLevel - (instructionStartColumn + columnOffset);
                    if (delta != 0) {
                        columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber,
                            instructionStartColumn, delta);
                    }
                } 
            }
        }

        return edits;

    }

    insertOrDeleteSpaces(model: monaco.editor.ITextModel, edits: monaco.languages.TextEdit[],
        lineNumber: number, columnActual: number, delta: number) {
        if (delta == 0) return 0;   // nothing to do
        if (delta > 0) {
            edits.push({
                range: {
                    startLineNumber: lineNumber,
                    startColumn: columnActual,
                    endLineNumber: lineNumber,
                    endColumn: columnActual
                },
                text: ' '.repeat(delta)
            });
        } else {
            edits.push({
                range: {
                    startLineNumber: lineNumber,
                    startColumn: columnActual + delta,  // N.B.: delta is negative
                    endLineNumber: lineNumber,
                    endColumn: columnActual
                },
                text: ''
            });
        }

        return delta;
    }



    generateLineInfos(tokens: AssemblyToken[]): LineInfo[] {
        this.tokens = tokens;
        if (this.tokens.length == 0) return [];

        this.currentTokenIndex = 0;
        this.currentToken = this.tokens[0];

        let lineInfos = [];
        let currentLineInfo: LineInfo;

        let isInsideDirective = false;
        let maxLengthOfFieldIdentifierInsideDirective = 0;
        let lineInfosInsideDirective: LineInfo[] = [];

        let openCurlyBrackets: number = 0;

        while (!this.lastTokenReached()) {
            while (this.currentToken.type == AssemblyTokenType.whitespace || this.currentToken.type == AssemblyTokenType.lineBreak) {
                this.next();
            }

            switch (this.currentToken.type) {
                case AssemblyTokenType.comment:
                    this.readTillEndOfLineOrLeftCurlyBracket();
                    continue;
                case AssemblyTokenType.dot:
                    currentLineInfo = { lineNumber: this.currentToken.range.startLineNumber, tokenAfterColon: this.currentToken, hasWordInstruction: false };
                    lineInfos.push(currentLineInfo);
                    this.readTillEndOfLineOrLeftCurlyBracket();
                    continue;
                case AssemblyTokenType.identifier:
                case AssemblyTokenType.number:
                    if (isInsideDirective) {
                        currentLineInfo = { lineNumber: this.currentToken.range.startLineNumber, tokenAfterColon: this.currentToken, hasWordInstruction: false };
                        lineInfosInsideDirective.push(currentLineInfo);
                        lineInfos.push(currentLineInfo);
                        let lineNumber = currentLineInfo.lineNumber;

                        let fieldIdentifierLength = this.currentToken.value?.toString().length ?? 0;
                        if (fieldIdentifierLength > maxLengthOfFieldIdentifierInsideDirective) maxLengthOfFieldIdentifierInsideDirective = fieldIdentifierLength;

                        this.next();
                        this.skipWhitespaceWhileOnLine(lineNumber);
                        if (this.currentToken.range.endLineNumber != lineNumber) {
                            continue;
                        }

                        //@ts-ignore
                        if (this.currentToken.type == AssemblyTokenType.colon) {
                            currentLineInfo.labelIdentifierAtLineBegin = currentLineInfo.tokenAfterColon;
                            currentLineInfo.labelColon = this.currentToken;
                            this.next();
                            this.skipWhitespaceWhileOnLine(lineNumber);
                            if (this.currentToken.range.endLineNumber != lineNumber) {
                                continue;
                            }
                            currentLineInfo.tokenAfterColon = this.currentToken;
                        }
                        this.readTillEndOfLineOrRightCurlyBracket();

                    } else {
                        currentLineInfo = { lineNumber: this.currentToken.range.startLineNumber, tokenAfterColon: this.currentToken, hasWordInstruction: false };
                        lineInfos.push(currentLineInfo);
                        let lineNumber = currentLineInfo.lineNumber;
                        this.next();
                        this.skipWhitespaceWhileOnLine(lineNumber);
                        if (this.currentToken.range.endLineNumber != lineNumber) {
                            continue;
                        }
                        //@ts-ignore
                        if (this.currentToken.type == AssemblyTokenType.colon) {
                            currentLineInfo.labelIdentifierAtLineBegin = currentLineInfo.tokenAfterColon;
                            currentLineInfo.labelColon = this.currentToken;
                            this.next();
                            this.skipWhitespaceWhileOnLine(lineNumber);
                            currentLineInfo.tokenAfterColon = this.currentToken;
                            if(this.currentToken.text?.toLocaleLowerCase() == 'word'){
                                currentLineInfo.hasWordInstruction = true;
                            }
                        }
                        // We are now at the instruction identifier.
                        this.readTillEndOfLineOrLeftCurlyBracket();
                    }
                    continue;

                case AssemblyTokenType.leftCurlyBracket:
                    openCurlyBrackets++;
                    isInsideDirective = true;
                    maxLengthOfFieldIdentifierInsideDirective = 0;
                    this.next();
                    this.readTillEndOfLineOrRightCurlyBracket();
                    //@ts-ignore
                    if (this.currentToken.type == AssemblyTokenType.rightCurlyBracket) {
                        openCurlyBrackets--;
                        if (openCurlyBrackets == 0) {
                            isInsideDirective = false;
                            for (let lineInfo of lineInfosInsideDirective) {
                                lineInfo.maxIdentifierLengthInsideDirective = maxLengthOfFieldIdentifierInsideDirective;
                            }
                            lineInfosInsideDirective = [];
                        }
                    }
                    continue;
                case AssemblyTokenType.rightCurlyBracket:
                    if (openCurlyBrackets > 0) {
                        openCurlyBrackets--;
                        if (openCurlyBrackets == 0) {
                            isInsideDirective = false;
                            for (let lineInfo of lineInfosInsideDirective) {
                                lineInfo.maxIdentifierLengthInsideDirective = maxLengthOfFieldIdentifierInsideDirective;
                            }
                            lineInfosInsideDirective = [];
                        }
                    }
                    this.next();
                    this.readTillEndOfLineOrLeftCurlyBracket();
                    continue;
                default:
                    this.readTillEndOfLineOrLeftCurlyBracket();
                    continue;
            }

        }

        for (let lineInfo of lineInfosInsideDirective) {
            lineInfo.maxIdentifierLengthInsideDirective = maxLengthOfFieldIdentifierInsideDirective;
        }

        return lineInfos;
    }

    skipWhitespaceWhileOnLine(lineNumber: number) {
        while (this.currentToken.type == AssemblyTokenType.whitespace &&
            this.currentToken.range.endLineNumber == lineNumber) {
            this.next();
        }
    }

    readTillEndOfLineOrLeftCurlyBracket() {
        let lineNumber = this.currentToken.range.endLineNumber;
        do {
            this.next();
        } while (!this.lastTokenReached() && this.currentToken.range.startLineNumber == lineNumber && this.currentToken.type != AssemblyTokenType.leftCurlyBracket);
    }

    readTillEndOfLineOrRightCurlyBracket() {
        let lineNumber = this.currentToken.range.endLineNumber;
        do {
            this.next();
        } while (!this.lastTokenReached() && this.currentToken.range.startLineNumber == lineNumber && this.currentToken.type != AssemblyTokenType.rightCurlyBracket);
    }

    next() {
        if (this.currentTokenIndex < this.tokens.length - 1) {
            this.currentTokenIndex++;
            this.currentToken = this.tokens[this.currentTokenIndex];
        }
    }

    lastTokenReached(): boolean {
        return this.currentTokenIndex >= this.tokens.length - 1;
    }

}