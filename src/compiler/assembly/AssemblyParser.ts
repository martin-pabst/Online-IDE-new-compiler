import { Error, ErrorLevel } from "../common/Error";
import { Step } from "../common/interpreter/Step";
import { CompilerFile } from "../common/module/CompilerFile";
import { IRange } from "../common/range/Range";
import { AssemblyToken } from "./AssemblyLexer";
import { AssemblyTokenType, AssemblyTokenTypeReadable } from "./AssemblyTokens";
import { AssemblyParserMessages } from "./language/AssemblyParserMessages";

export type AssemblyParserResult = {
    file: CompilerFile;
    startAddress: number;
    offsetAddress: number;
    compiledInMemory: number[];
    errors: Error[];
    sourceMap: Map<number, { lineNumber: number, column: number }>;
}

export type Label = {
    name: string;
    address: number | undefined;
    unresolvedReferences: { absoluteAddress: number, range: IRange }[];
}

export abstract class AssemblyParser {

    steps: Step[] = [];
    startAddress: number | undefined;
    offsetAddress: number;
    compiledCode: number[] = [];
    errors: Error[] = [];
    sourceMap: Map<number, { lineNumber: number, column: number }>;

    tokens: AssemblyToken[];
    tokenIndex: number = 0;

    labels: Map<string, Label>;

    private programCounterRelative: number;
    
    constructor() {
    }

    initBeforeParsing(): void {
        this.steps = [];
        this.errors = [];
        this.compiledCode = [];
        this.sourceMap = new Map();
        this.startAddress = undefined;
        this.offsetAddress = 0x200;
        this.programCounterRelative = 0;
        this.labels = new Map();
    }

    makeParserResult(file: CompilerFile): AssemblyParserResult {
        return {
            file: file,
            startAddress: this.startAddress ?? 0x200,
            offsetAddress: this.offsetAddress,
            compiledInMemory: this.compiledCode,
            errors: this.errors,
            sourceMap: this.sourceMap
        }
    }

    currentToken(): AssemblyToken {
        return this.tokens[this.tokenIndex];
    }

    next(): void {
        if (this.tokenIndex < this.tokens.length - 1) {
            this.tokenIndex++;
        }
    }

    programEndReached(): boolean {
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

    parseSetLabel(token: AssemblyToken): void {
        let labelName = token.value as string;

        if (this.expect(AssemblyTokenType.colon)) {
            this.next();
        }

        let label = this.labels.get(labelName);
        if (label) {
            if (typeof label.address === "number") {
                this.pushError(AssemblyParserMessages.LabelAlreadyDefined(labelName), "error", token.range);
                return;
            } else {
                label.address = this.getProgramCounterAbsolute();
                for (let referenceAddress of label.unresolvedReferences) {
                    this.compiledCode[referenceAddress.absoluteAddress - this.offsetAddress] = label.address;
                }
                label.unresolvedReferences = [];
            }
        } else {
            this.labels.set(labelName, {
                name: labelName,
                address: this.getProgramCounterAbsolute(),
                unresolvedReferences: []
            });
        }

        this.skip(AssemblyTokenType.lineBreak);
    }

    getLabelAddressAbsolute(labelToken: AssemblyToken, referenceAddress: number): number | undefined {
        let labelName = labelToken.value as string;
        let label = this.labels.get(labelName);
        if (!label) {
            this.labels.set(labelName, {
                name: labelName,
                address: undefined,
                unresolvedReferences: [{ absoluteAddress: referenceAddress, range: labelToken.range }]
            });
            return undefined;
        }

        if (label.address === undefined) {
            label.unresolvedReferences.push({ absoluteAddress: referenceAddress, range: labelToken.range });
            return undefined;
        }

        return label.address;
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
            this.compiledCode[this.programCounterRelative] = value;
            this.programCounterRelative++;
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

    getProgramCounterRelative(): number {
        return this.programCounterRelative;
    }

    getProgramCounterAbsolute(): number {
        return this.offsetAddress + this.programCounterRelative;
    }

    checkForUnresolvedLabelsAtEndOfParsing(): void {
        for (let label of this.labels.values()) {
            if (label.address === undefined) {
                for (let unresolvedReference of label.unresolvedReferences) {
                    this.pushError(AssemblyParserMessages.UnresolvedLabel(label.name), "error", unresolvedReference.range);
                }
            }
        }
    }

    abstract parse(tokens: AssemblyToken[], file: CompilerFile): AssemblyParserResult;
    abstract getTokenSet(): Set<AssemblyTokenType>;

}