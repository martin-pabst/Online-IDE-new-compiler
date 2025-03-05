import { BaseSymbol } from "./BaseSymbolTable";
import type { BaseField } from "./BaseSymbolTable";
import type { Module } from "./module/Module";
import type { IRange } from "./range/Range";

/**
 * encapsultes methods for debugger
 */
export abstract class BaseType extends BaseSymbol {

    constructor(identifier: string, identifierRange: IRange, module: Module) {
        super(identifier, identifierRange, module);
    }

    getType(): BaseType {
        return this;
    }

    abstract getCompletionItemDetail(): string;

}

export interface BaseObjectType {
    getFields(): BaseField[];
}

export interface BaseArrayType {
    getElementType(): BaseType;
}

export interface BaseListType {
    getElements(): any[];
}
