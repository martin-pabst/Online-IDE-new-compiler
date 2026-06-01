import * as monaco from 'monaco-editor'
import { BaseMonacoProvider } from '../../common/monacoproviders/BaseMonacoProvider';
import { AssemblyLanguage } from '../AssemblyLanguage';
import { AssemblyLexer, AssemblyToken } from '../AssemblyLexer';
import { AssemblyTokenType } from '../AssemblyTokenType';

type LineInfo = {
    lineNumber: number;
    labelIdentifierAtLineBegin?: AssemblyToken;
    labelColon?: AssemblyToken;
    instructionIdentifierOrDot?: AssemblyToken;
    parameters?: AssemblyToken[];
    commasBetweenParameters?: AssemblyToken[];
}

export class AssemblyFormatter extends BaseMonacoProvider
    implements monaco.languages.DocumentFormattingEditProvider,
    monaco.languages.OnTypeFormattingEditProvider {

    autoFormatTriggerCharacters: string[] = ['\n'];

    displayName?: string = "Assembly-Autoformat";

    tokens: AssemblyToken[];
    currentTokenIndex: number;
    currentToken: AssemblyToken;

    constructor(language: AssemblyLanguage) {
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

        let indentLevelAfterLabel = -1;
        let leftMostInstructionColumn = Number.MAX_SAFE_INTEGER;

        for (let lineInfo of lineInfos) {
            if(lineInfo.labelIdentifierAtLineBegin){
                let il = lineInfo.labelIdentifierAtLineBegin.range.endColumn + 2; // ad colon and one space
                if(il > indentLevelAfterLabel) indentLevelAfterLabel = il;
            } else if(lineInfo.instructionIdentifierOrDot){
                let il = lineInfo.instructionIdentifierOrDot.range.startColumn;
                if(il < leftMostInstructionColumn) leftMostInstructionColumn = il;
            }
        }        

        let indentLevel = indentLevelAfterLabel != -1 ? indentLevelAfterLabel : leftMostInstructionColumn;
        if(indentLevel == Number.MAX_SAFE_INTEGER) indentLevel = 3;

        for (let lineInfo of lineInfos) {
            let columnOffset = 0;
            if(lineInfo.labelIdentifierAtLineBegin){
                let labelStartColumn = lineInfo.labelIdentifierAtLineBegin.range.startColumn;
                if(labelStartColumn != 1){
                    columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber, labelStartColumn, 1);
                }
            }
            if(lineInfo.instructionIdentifierOrDot){
                let instructionStartColumn = lineInfo.instructionIdentifierOrDot.range.startColumn + columnOffset;
                if(instructionStartColumn != indentLevel){
                    columnOffset += this.insertOrDeleteSpaces(model, edits, lineInfo.lineNumber, 
                        instructionStartColumn + columnOffset, indentLevel);
                }
            }
        }

        return edits;

    }

    insertOrDeleteSpaces(model: monaco.editor.ITextModel, edits: monaco.languages.TextEdit[], 
        lineNumber: number, columnActual: number, columnExpected: number) {
        let offset = columnExpected - columnActual;
        if(offset == 0) return 0;   // nothing to do
        if(offset > 0){
            edits.push({
                range: {
                    startLineNumber: lineNumber,
                    startColumn: columnActual,
                    endLineNumber: lineNumber,
                    endColumn: columnActual
                },
                text: ' '.repeat(offset)
            });
        } else {
            edits.push({
                range: {
                    startLineNumber: lineNumber,
                    startColumn: columnActual,
                    endLineNumber: lineNumber,
                    endColumn: columnActual + offset
                },
                text: ''
            });
        }

        return offset;
    }

    

    generateLineInfos(tokens: AssemblyToken[]): LineInfo[] {
        this.tokens = tokens;
        if (this.tokens.length == 0) return [];

        this.currentTokenIndex = 0;
        this.currentToken = this.tokens[0];

        let lineInfos = [];
        let currentLineInfo: LineInfo;

        while (!this.lastTokenReached()) {
            while (this.currentToken.type == AssemblyTokenType.whitespace || this.currentToken.type == AssemblyTokenType.lineBreak) {
                this.next();
            }

            switch (this.currentToken.type) {
                case AssemblyTokenType.comment:
                    this.readTillEndOfLine();
                    continue;
                case AssemblyTokenType.dot:
                    currentLineInfo = { lineNumber: this.currentToken.range.startLineNumber, instructionIdentifierOrDot: this.currentToken };
                    lineInfos.push(currentLineInfo);
                    this.readTillEndOfLine();
                    continue;
                case AssemblyTokenType.identifier:
                    currentLineInfo = { lineNumber: this.currentToken.range.startLineNumber, instructionIdentifierOrDot: this.currentToken };
                    lineInfos.push(currentLineInfo);
                    let lineNumber = currentLineInfo.lineNumber;
                    this.next();
                    this.skipWhitespaceWhileOnLine(lineNumber);
                    if (this.currentToken.range.endLineNumber != lineNumber) {
                        continue;
                    }
                    //@ts-ignore
                    if (this.currentToken.type == AssemblyTokenType.colon) {
                        currentLineInfo.labelIdentifierAtLineBegin = currentLineInfo.instructionIdentifierOrDot;
                        currentLineInfo.labelColon = this.currentToken;
                        this.next();
                        this.skipWhitespaceWhileOnLine(lineNumber);
                        if (this.currentToken.range.endLineNumber != lineNumber) {
                            continue;
                        }
                        if (this.currentToken.type != AssemblyTokenType.identifier && this.currentToken.type != AssemblyTokenType.dot) {
                            continue;
                        }
                        currentLineInfo.instructionIdentifierOrDot = this.currentToken;
                        if (this.currentToken.type == AssemblyTokenType.dot) continue;
                    }
                    // We are now at the instruction identifier.
                    this.readTillEndOfLine();
                    continue;

                    break;
            }

        }

        return lineInfos;
    }

    skipWhitespaceWhileOnLine(lineNumber: number) {
        while (this.currentToken.type == AssemblyTokenType.whitespace &&
            this.currentToken.range.endLineNumber == lineNumber) {
            this.next();
        }
    }

    readTillEndOfLine() {
        let lineNumber = this.currentToken.range.endLineNumber;
        do {
            this.next();
        } while (!this.lastTokenReached() && this.currentToken.range.startLineNumber == lineNumber);
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