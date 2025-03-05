import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants";
import type { Thread } from "../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "./ObjectClassStringClass";

export class EnumClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Enum extends Object"},
        {type: "method", signature: "public String name()", native: EnumClass.prototype._name},
        {type: "method", signature: "public int ordinal()", native: EnumClass.prototype._ordinal},
        {type: "method", signature: "public String toString()", java: EnumClass.prototype._mj$toString$String$},
    ]

    public name: string;
    public ordinal: number;

    static type: NonPrimitiveType;

    static values: EnumClass[] = [];

    constructor(name: string, ordinal: number){
        super();
        this.name = name;
        this.ordinal = ordinal;
    }

    _name(): StringClass {
        return new StringClass(this.name);
    }

    _ordinal(): number {
        return this.ordinal;
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        t.s.push(new StringClass(this.name));
        if(callback) callback();
    }

}