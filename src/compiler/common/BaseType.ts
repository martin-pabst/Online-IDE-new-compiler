import { BaseField, BaseSymbol } from "./BaseSymbolTable";
import { Module } from "./module/Module";
import { IRange } from "./range/Range";

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

/**
 * getElements() is used by the debugger to show the elements of a list. Enhanced for loops
 * (for (... : collection)) over objects of runtime classes with a getElements() method also
 * iterate directly over the array returned by getElements(), unless the runtime class declares
 * a static property named by FOR_EACH_VIA_GET_ELEMENTS with value false. Then the enhanced for
 * loop uses iterator() if the class implements Iterable, and is a compile error otherwise.
 */
export interface BaseListType {
    getElements(): any[];
}

export const FOR_EACH_VIA_GET_ELEMENTS = "forEachViaGetElements";
