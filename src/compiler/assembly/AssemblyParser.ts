import { Error, ErrorLevel } from "../common/Error";
import { Step } from "../common/interpreter/Step";
import { CompilerFile } from "../common/module/CompilerFile";
import { IRange } from "../common/range/Range";
import { AbiBayernAssemblyMessages } from "./abibayern/AbiBayernAssemblyMessages";
import { AssemblyToken } from "./AssemblyLexer";
import { AssemblyTokenType, AssemblyTokenTypeReadable } from "./AssemblyTokenType";
import { AssemblyParserMessages } from "./language/AssemblyParserMessages";

export type AssemblyCompiledCodePart = {
    offset: number;
    code: number[];
}

type AssemblyAssertionPartMemory = {
    type: "memory";
    startAddress: number;
    expectedMemoryValues: number[];
}

type AssemblyAssertionPartFlag = {
    type: "flag";
    shortFlagName: string;
    flagValue: boolean;
}


export type AssemblyAssertion = {
    assertionParts: (AssemblyAssertionPartMemory | AssemblyAssertionPartFlag)[];
    message: string;
}

/**
 * Maps memory addresses to assertions that should be checked when the program counter is at that address.
 */
export type AssemblyAssertionMap = Map<number, AssemblyAssertion>;


export type AssemblyParserResult = {
    file: CompilerFile;
    startAddress: number;
    codeParts: AssemblyCompiledCodePart[];
    errors: Error[];

    assertionMap: AssemblyAssertionMap;


    /**
     * Map absolute addresses to source code positions:
     */
    sourceMap: Map<number, { lineNumber: number, column: number }>;

    /**
     * Map line numbers to used instructions:
     */
    instructionMap: AssemblyInstructionMap;
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
    description: (...parameterValues: (string | number)[]) => string,
    parameterCount: number,
    OpCode: number;
}

export type AssemblyInstructionMap = Map<number, { instruction: AssemblyInstruction, range: IRange, operands?: any[] }[]>

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
    instructionMap: AssemblyInstructionMap;

    assertionMap: AssemblyAssertionMap;

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

    /**
     * @returns the opcode that is used for assertions in this assembly language. 
     * This is needed to distinguish assertion statements from normal instructions.
     */
    abstract getAssertionOpcode(): number;

    abstract getFlagNamesShort(): string[];


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
        this.assertionMap = new Map();
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
            assertionMap: this.assertionMap,
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

    expectOneToken(tokenType: AssemblyTokenType, message: string, skip: boolean): boolean {
        let token = this.currentToken();
        if (token.type !== tokenType) {
            this.pushError(message, "error", token.range);
            return false;
        } else if (skip) {
            this.next();
        }
        return true;
    }

    isToken(...tokenTypes: AssemblyTokenType[]): boolean {
        return tokenTypes.includes(this.currentToken().type);
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

    checkIfTokenIs16BitUnsignedNumber(token: AssemblyToken, errorMessage?: () => string): boolean {
        if (token.type !== AssemblyTokenType.number) {
            this.pushError((errorMessage || AssemblyParserMessages.NumberExpected)(), "error", token.range);
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
        let _address = address !== undefined ? address : this.getProgramCounterAbsolute();
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

    registerInstruction(instruction: AssemblyInstruction, range: IRange, operands?: (string | number)[]): void {
        let instructionsAtLine = this.instructionMap.get(range.startLineNumber);
        if (!instructionsAtLine) {
            instructionsAtLine = [];
            this.instructionMap.set(range.startLineNumber, instructionsAtLine);
        }
        instructionsAtLine.push({ instruction, range, operands });
    }

    addHoverEntry(range: IRange, text: string): void {
        let hoverEntriesAtLine = this.hoverEntries.get(range.startLineNumber);
        if (!hoverEntriesAtLine) {
            hoverEntriesAtLine = [];
            this.hoverEntries.set(range.startLineNumber, hoverEntriesAtLine);
        }
        hoverEntriesAtLine.push({ range: range, text: text });
    }

    readTillBeginOfNextLine(): void {
        while (this.currentToken().type !== AssemblyTokenType.lineBreak && this.currentToken().type !== AssemblyTokenType.endOfSourcecode) {
            this.next();
        }
    }

    /**
     * Parses an assertion of the form
     * .assert {  100: [42, 38],
     *            110: 20,
     *              N: 1,
     *              Z: 0,
     *              message: "incorrect cpu state after some instruction"
     *             }
     */
    parseAssertion(assertionToken: AssemblyToken): void {
        this.next();   // consume .assert token
        if (!this.expectOneToken(AssemblyTokenType.leftCurlyBracket, AssemblyParserMessages.TokenExpectedInAssertion("{"), true)) {
            this.readTillBeginOfNextLine();
            return;
        }

        let assertion: AssemblyAssertion = {
            assertionParts: [],
            message: "Assertion failed!"
        };

        this.skip(AssemblyTokenType.lineBreak);

        while (this.isToken(AssemblyTokenType.number, AssemblyTokenType.identifier, AssemblyTokenType.stringLiteral)) {
            if (this.currentToken().type === AssemblyTokenType.number) {
                this.parseMemoryAssertion(assertion);
            } else if (("" + this.currentToken().value).toLowerCase() === "message") {
                this.parseAssertionMessage(assertion);
            } else {
                this.parseFlagAssertion(assertion);
            }


            this.skip(AssemblyTokenType.lineBreak);
            if (this.currentToken().type === AssemblyTokenType.rightCurlyBracket) {
                break;
            }
            if (!this.expectOneToken(AssemblyTokenType.comma, AssemblyParserMessages.TokenExpectedInAssertion(","), true)) {
                this.readTillBeginOfNextLine();
                return;
            }

            this.skip(AssemblyTokenType.lineBreak);
        }

        this.addSourceMapEntry(assertionToken.range);
        this.assertionMap.set(this.getProgramCounterAbsolute(), assertion);
        this.writeToMemory(this.getAssertionOpcode());
        this.addHoverEntry(assertionToken.range,
            AbiBayernAssemblyMessages.AssertHoverComment());

        if (!this.expectOneToken(AssemblyTokenType.rightCurlyBracket, AssemblyParserMessages.TokenExpectedInAssertion("}"), true)) {
            this.readTillBeginOfNextLine();
            return;
        }

    }

    private parseFlagAssertion(assertion: AssemblyAssertion): void {
        let flagName = (this.currentToken().value as string).toLowerCase();
        if (!this.getFlagNamesShort().includes(flagName)) {
            this.pushError(AssemblyParserMessages.UnknownFlagInAssertion(flagName, this.getFlagNamesShort()), "error", this.currentToken().range);
            this.readTillBeginOfNextLine();
            return;
        }
        this.next();
        if (!this.expectOneToken(AssemblyTokenType.colon, AssemblyParserMessages.TokenExpectedInAssertion(":"), true)) {
            this.readTillBeginOfNextLine();
            return;
        }
        if (!this.isToken(AssemblyTokenType.number) || [0, 1].indexOf(this.currentToken().value as number) === -1) {
            this.pushError(AssemblyParserMessages.ZeroOrOneExpectedInAssertion(flagName), "error", this.currentToken().range);
            this.readTillBeginOfNextLine();
            return;
        }

        let flagValue = (this.currentToken().value as number) === 1;
        assertion.assertionParts.push({
            type: "flag",
            shortFlagName: flagName,
            flagValue: flagValue
        });
        this.next();
    }

    private parseAssertionMessage(assertion: AssemblyAssertion): void {
        this.next(); // skip "message" identifier token
        if (!this.expectOneToken(AssemblyTokenType.colon, AssemblyParserMessages.TokenExpectedInAssertion(":"), true)) {
            this.readTillBeginOfNextLine();
            return;
        }
        if (!this.expectOneToken(AssemblyTokenType.stringLiteral, AssemblyParserMessages.TokenExpectedInAssertion("string literal"), false)) {
            this.readTillBeginOfNextLine();
            return;
        }
        assertion.message = this.currentToken().value as string;
        this.next();
    }


    private parseMemoryAssertion(assertion: AssemblyAssertion): void {
        let address = this.currentToken().value as number;
        this.next();
        if (!this.expectOneToken(AssemblyTokenType.colon, AssemblyParserMessages.TokenExpectedInAssertion(":"), true)) {
            this.readTillBeginOfNextLine();
            return;
        }

        if (this.isToken(AssemblyTokenType.number)) {
            // short syntax for single memory value, e.g. "100: 42"
            if (this.checkIfTokenIs16BitUnsignedNumber(this.currentToken())) {
                let expectedValue = this.currentToken().value as number;
                this.next();
                assertion.assertionParts.push({
                    type: "memory",
                    startAddress: address,
                    expectedMemoryValues: [expectedValue]
                });
                return;
            }
        }

        if (!this.expectOneToken(AssemblyTokenType.leftSquareBracket, AssemblyParserMessages.TokenExpectedInAssertion("["), true)) {
            this.readTillBeginOfNextLine();
            return;
        }
        let expectedMemoryValues: number[] = [];
        while (this.currentToken().type === AssemblyTokenType.number) {
            if (this.checkIfTokenIs16BitUnsignedNumber(this.currentToken())) {
                expectedMemoryValues.push(this.currentToken().value as number);
            } else {
                this.readTillBeginOfNextLine();
                return;
            }
            this.next();    // skip number token
            if (this.currentToken().type === AssemblyTokenType.comma) {
                this.next();    // skip comma
            } else {
                break;
            }
        }

        if (!this.expectOneToken(AssemblyTokenType.rightSquareBracket, AssemblyParserMessages.TokenExpectedInAssertion("]"), true)) {
            this.readTillBeginOfNextLine();
            return;
        }

        assertion.assertionParts.push({
            type: "memory",
            startAddress: address,
            expectedMemoryValues: expectedMemoryValues
        });
    }
}