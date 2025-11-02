import { BaseType } from "./BaseType.ts";
import { CompilerFile } from "./module/CompilerFile";
import { Module } from "./module/Module.ts";
import { IPosition, Position } from "./range/Position.ts";
import { IRange, Range } from "./range/Range";

/**
 * Fields, parameters and local variables
 */
export abstract class BaseSymbol {

    documentation?: string | (() => string);
    hiddenWhenDebugging?: boolean;

    constructor(public identifier: string, public identifierRange: IRange, public module: Module) {

    }

    onStackframe(): boolean {
        return false;
    }

    abstract getDeclaration(): string;

    /**
     * For debugger;
     */
    abstract getType(): BaseType;

    getDocumentation(): string | undefined {
        if(!this.documentation) return undefined;
        if(typeof this.documentation === "string") return this.documentation;
        return this.documentation();
    }

}

export abstract class SymbolOnStackframe extends BaseSymbol {
    public stackframePosition?: number;
    public isFinal: boolean = false;

    onStackframe(): boolean {
        return true;
    }

    // mouseover in debugger-mode => show value ...
    getValue(stack: any[], stackframeStart: number): any {
        return stack[stackframeStart + this.stackframePosition!];
    }
}

/**
 * For a given program position the debugger has to know what to expect on the current stackframe
 */
export abstract class BaseSymbolTable {

    childTables: BaseSymbolTable[] = [];

    stackframe?: BaseStackframe;

    identifierToSymbolMap: Map<string, BaseSymbol> = new Map();

    hiddenWhenDebugging?: boolean;

    constructor(public range: IRange, public parent?: BaseSymbolTable) {
        if (parent) parent.childTables.push(this);
    }

    addSymbol(symbol: BaseSymbol) {
        this.identifierToSymbolMap.set(symbol.identifier, symbol);
    }

    abstract getSymbolsOnStackframeForDebugger(): SymbolOnStackframe[];

    findSymbolTableAtPosition(position: IPosition): BaseSymbolTable | undefined {
        if (!Range.containsPosition(this.range, position)) return undefined;
        let bestTable: BaseSymbolTable = this;
        for (let child of this.childTables) {
            let t1 = child.findSymbolTableAtPosition(position);
            if (t1) bestTable = t1;
        }

        return bestTable;
    }


}


export class BaseStackframe {

    nextFreePosition: number = 0;

    numberOfThisObjects: number = 0;
    numberOfParameters: number = 0;         // without "this"
    numberOfLocalVariables: number = 0;

    positionToSymbolMap: { [position: number]: BaseSymbol } = {};

    constructor(firstFreePosition: number) {
        this.nextFreePosition = firstFreePosition;
        this.numberOfThisObjects = firstFreePosition;
    }

    addSymbol(symbol: SymbolOnStackframe, parameterOrLocalVariable: "parameter" | "localVariable") {
        switch (parameterOrLocalVariable) {
            case "parameter":
                this.numberOfParameters++;
                break;
            case "localVariable":
                this.numberOfLocalVariables++;
                break;
        }

        let position: number = this.nextFreePosition++;
        symbol.stackframePosition = position;
        this.positionToSymbolMap[position] = symbol;

    }

    insertInvisibleParameter() {
        this.numberOfParameters++;
    }

    insertInvisibleLocalVariableAndGetItsIndex(): number {
        let index = this.nextFreePosition++;
        this.numberOfLocalVariables++;
        return index;
    }

}

export abstract class BaseField extends BaseSymbol {
    abstract getFieldIndentifier(): string;
    abstract isStatic(): boolean;
    abstract isFinal(): boolean;

    getValueForDebugger?: (o: { [index: string]: any }) => any;


}