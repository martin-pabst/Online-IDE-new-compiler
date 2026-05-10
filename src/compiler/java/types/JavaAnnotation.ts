import { BaseSymbol } from "../../common/BaseSymbolTable";
import { BaseType } from "../../common/BaseType";
import { IRange } from "../../common/range/Range";

export class JavaAnnotation {

    constructor(public identifier: string, public range: IRange, public parameter?: string){

    }

}