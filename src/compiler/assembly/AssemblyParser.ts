import { Error, ErrorLevel } from "../common/Error";
import { Step } from "../common/interpreter/Step";
import { CompilerFile } from "../common/module/CompilerFile";
import { IRange } from "../common/range/Range";
import { AssemblyToken } from "./AssemblyLexer";
import { AssemblyTokenType, AssemblyTokenTypeReadable } from "./AssemblyTokenType";
import { AssemblyParserMessages } from "./language/AssemblyParserMessages";

export type AssemblyCompiledCodePart = {
    offset: number;
    code: number[];
}


export type AssemblyParserResult = {
    file: CompilerFile;
    startAddress: number;
    codeParts: AssemblyCompiledCodePart[];
    errors: Error[];


    /**
     * Map absolute addresses to source code positions:
     */
    sourceMap: Map<number, { lineNumber: number, column: number }>;

    /**
     * Map line numbers to used instructions:
     */
    instructionMap: Map<number, { instruction: AssemblyInstruction, range: IRange }[]>;
    labels: AssemblyLabel[];

    /**
     * Map line numbers to labels declared or used on this line.
     */
    labelMap: Map<number, { label: AssemblyLabel, range: IRange }[]>;

    /**
     * Map line numbers to hover entries:
     */
    hoverEntries: Map<number, { range: IRange, text: string }[]>;

    commentRanges: IRange[];
}

export type AssemblyLabel = {
    identifier: string;
    address: number | undefined;
    declaration: IRange;
    unresolvedReferences: { absoluteAddress: number, codePart: AssemblyCompiledCodePart, range: IRange }[];
    usages: IRange[];
}

export type AssemblyInstruction = {
    tokenType: AssemblyTokenType;
    description: () => string;
    OpCode:number;
}

export type AssemblySymbol = {
    identifier: string;
    type: "label";
    declaration: IRange;
}


export abstract class AssemblyParser {

    startAddress: number | undefined;

    codeParts: AssemblyCompiledCodePart[] = [];

    currentCodePart: AssemblyCompiledCodePart;

    errors: Error[] = [];
    sourceMap: Map<number, { lineNumber: number, column: number }>;
    // Map line numbers to used instructions:
    instructionMap: Map<number, { instruction: AssemblyInstruction, range: IRange }[]>;

    tokens: AssemblyToken[];
    tokenIndex: number = 0;

    labels: Map<string, AssemblyLabel>;
    // Map line numbers to labels declared or used on this line.
    labelMap: Map<number, { label: AssemblyLabel, range: IRange }[]>;

    hoverEntries: Map<number, { range: IRange, text: string }[]>;

    private programCounterRelative: number;

    constructor() {
    }

    abstract parse(tokens: AssemblyToken[], file: CompilerFile): AssemblyParserResult;

    /**
     * Returns the subset of token types that are relevant for the lexer
     */
    abstract getKeywordTokens(): Set<AssemblyTokenType>;

    initBeforeParsing(tokens: AssemblyToken[]): void {
        this.tokens = tokens;
        this.tokenIndex = 0;
        this.errors = [];
        this.codeParts = [{ offset: 200, code: [] }];
        this.currentCodePart = this.codeParts[0];
        this.sourceMap = new Map();
        this.instructionMap = new Map();
        this.startAddress = undefined;
        this.programCounterRelative = 0;
        this.labels = new Map();
        this.labelMap = new Map();
        this.hoverEntries = new Map();
    }

    makeParserResult(file: CompilerFile): AssemblyParserResult {
        return {
            file: file,
            startAddress: this.startAddress ?? 0x200,
            codeParts: this.codeParts,
            errors: this.errors,
            sourceMap: this.sourceMap,
            instructionMap: this.instructionMap,
            labelMap: this.labelMap,
            labels: Array.from(this.labels.values()),
            hoverEntries: this.hoverEntries,
            commentRanges: []
        }
    }

    /**
     * Returns the current token without advancing the token index.
     * @returns current token
     */
    currentToken(): AssemblyToken {
        return this.tokens[this.tokenIndex];
    }

    /**
     * Advances to the next token. Does nothing if the end of the token list 
     * has already been reached.
     */
    next(): void {
        if (this.tokenIndex < this.tokens.length - 1) {
            this.tokenIndex++;
        }
    }

    expectLineBreakOrEndOfSourcecode(): void {
        let token = this.currentToken();
        if (token.type !== AssemblyTokenType.lineBreak && token.type !== AssemblyTokenType.endOfSourcecode) {
            this.pushError(AssemblyParserMessages.LineBreakOrEndOfSourcecodeExpected(), "error", token.range);
        }

        while (![AssemblyTokenType.lineBreak, AssemblyTokenType.endOfSourcecode].includes(this.currentToken().type)) {
            this.next();
        }

        this.next();    // consume line break; doesn't move past endOfSourcecode token, so it's safe

        while (this.currentToken().type === AssemblyTokenType.lineBreak) {
            this.next();
        }

    }

    expect(...tokenTypes: AssemblyTokenType[]): boolean {
        let token = this.currentToken();
        if (!tokenTypes.includes(token.type)) {
            this.pushError(AssemblyParserMessages.TokensExpected(tokenTypes.map(t => AssemblyTokenTypeReadable[t] || AssemblyTokenType[t])), "error", token.range);
            return false;
        }
        return true;
    }

    skip(...tokenTypes: AssemblyTokenType[]): void {
        while (tokenTypes.includes(this.currentToken().type)) {
            this.next();
        }
    }

    /**
     * @returns true, if end of token list is reached
     */
    isProgramEndReached(): boolean {
        // The lexer adds an endOfSourcecode token at the end of the token list at position tokens.length - 1.
        return this.tokenIndex >= this.tokens.length - 1;
    }

    pushError(message: string, level: ErrorLevel, range: IRange, rangeEnd?: IRange): void {
        let _range = rangeEnd ? {
            startLineNumber: range.startLineNumber,
            startColumn: range.startColumn,
            endLineNumber: rangeEnd.endLineNumber,
            endColumn: rangeEnd.endColumn
        } : range;
        this.errors.push({
            message: message,
            level: level,
            id: "",
            range: _range
        });
    }

    resolveLabel(token: AssemblyToken): void {
        let labelName = token.value as string;

        if (this.currentToken().type !== AssemblyTokenType.colon) {
            this.pushError(AssemblyParserMessages.StatementUnknown(labelName), "error", token.range);
            return;
        } else {
            this.next();
        }

        let label = this.labels.get(labelName);
        if (label) {
            if (typeof label.address === "number") {
                this.pushError(AssemblyParserMessages.LabelAlreadyDefined(labelName), "error", token.range);
                return;
            } else {
                label.address = this.getProgramCounterAbsolute();
                label.declaration = token.range;
                for (let referenceAddress of label.unresolvedReferences) {
                    let codePart = referenceAddress.codePart;
                    codePart.code[referenceAddress.absoluteAddress - codePart.offset] = label.address;
                }
                label.unresolvedReferences = [];
            }
        } else {
            label = {
                identifier: labelName,
                address: this.getProgramCounterAbsolute(),
                declaration: token.range,
                unresolvedReferences: [],
                usages: []
            }
            this.labels.set(labelName, label);
        }

        this.setLabelMapEntry(label, token.range);

        this.skip(AssemblyTokenType.lineBreak);
    }

    setLabelMapEntry(label: AssemblyLabel, range: IRange): void {
        let labelMapEntry = this.labelMap.get(range.startLineNumber);
        if (!labelMapEntry) {
            labelMapEntry = [];
            this.labelMap.set(range.startLineNumber, labelMapEntry);
        }
        labelMapEntry.push({ label: label, range: range });
    }

    getLabelAddressAbsolute(labelToken: AssemblyToken, absoluteReferenceAddress: number): number | undefined {
        let labelName = labelToken.value as string;
        let label = this.labels.get(labelName);
        if (!label) {
            label = {
                identifier: labelName,
                address: undefined,
                declaration: labelToken.range,
                unresolvedReferences: [{ absoluteAddress: absoluteReferenceAddress, codePart: this.currentCodePart, range: labelToken.range }],
                usages: [labelToken.range]
            };
            this.labels.set(labelName, label);
            this.setLabelMapEntry(label, labelToken.range);
            return undefined;
        }
        
        this.setLabelMapEntry(label, labelToken.range);
        
        label.usages.push(labelToken.range);

        if (label.address === undefined) {
            label.unresolvedReferences.push({ absoluteAddress: absoluteReferenceAddress, codePart: this.currentCodePart, range: labelToken.range });
            return undefined;
        }
        
        return label.address;
    }
    
    checkForUnresolvedLabelsAtEndOfParsing(): void {
        for (let label of this.labels.values()) {
            if (label.address === undefined) {
                for (let unresolvedReference of label.unresolvedReferences) {
                    this.pushError(AssemblyParserMessages.UnresolvedLabel(label.identifier), "error", unresolvedReference.range);
                }
            }
        }
    }

    checkIfTokenIs16BitUnsignedNumber(token: AssemblyToken): boolean {
        if (token.type !== AssemblyTokenType.number) {
            this.pushError(AssemblyParserMessages.NumberExpected(), "error", token.range);
            return false;
        }
        const value = token.value as number;
        if (value >= 0 && value <= 65535) return true;
        this.pushError(AssemblyParserMessages.NumberOutOfRange(value, 0, 65535), "error", token.range);
        return false;
    }

    checkIfTokenIs16BitSignedNumber(token: AssemblyToken): boolean {
        if (token.type !== AssemblyTokenType.number) {
            this.pushError(AssemblyParserMessages.NumberExpected(), "error", token.range);
            return false;
        }
        const value = token.value as number;
        if (value >= -32768 && value <= 32767) return true;
        this.pushError(AssemblyParserMessages.NumberOutOfRange(value, -32768, 32767), "error", token.range);
        return false;
    }

    addSourceMapEntry(range: IRange, address?: number): void {
        let _address = address !== undefined ? address : this.programCounterRelative;
        this.sourceMap.set(_address, {
            lineNumber: range.startLineNumber,
            column: range.startColumn
        });
    }

    writeToMemory(...values: (number | undefined)[]): void {
        for (let value of values) {
            this.currentCodePart.code[this.programCounterRelative] = value;
            this.programCounterRelative++;
        }
    }

    /**
     * @returns program pointer relative to start of current code part. 
     */
    getProgramCounterRelative(): number {
        return this.programCounterRelative;
    }

    getProgramCounterAbsolute(): number {
        return this.currentCodePart.offset + this.programCounterRelative;
    }

    /**
     * Starts new code part
     */
    setOrigin(origin: number): void {
        if (this.currentCodePart?.code.length === 0) {
            this.currentCodePart.offset = origin;
        } else {
            this.currentCodePart = { offset: origin, code: [] };
            this.codeParts.push(this.currentCodePart);
        }
        this.programCounterRelative = 0;
    }

    registerInstruction(instruction: AssemblyInstruction, range: IRange): void {
        let instructionsAtLine = this.instructionMap.get(range.startLineNumber);
        if (!instructionsAtLine) {
            instructionsAtLine = [];
            this.instructionMap.set(range.startLineNumber, instructionsAtLine);
        }
        instructionsAtLine.push({ instruction, range });
    }

    addHoverEntry(range: IRange, text: string): void {
        let hoverEntriesAtLine = this.hoverEntries.get(range.startLineNumber);
        if (!hoverEntriesAtLine) {
            hoverEntriesAtLine = [];
            this.hoverEntries.set(range.startLineNumber, hoverEntriesAtLine);
        }
        hoverEntriesAtLine.push({ range: range, text: text });
    }
}