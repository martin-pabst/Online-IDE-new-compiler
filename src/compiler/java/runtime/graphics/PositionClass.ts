import { CallbackFunction } from "../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../system/javalang/ObjectClassStringClass";

export class PositionClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Position extends Object", comment: JRC.PositionClassComment },

        {type: "field", signature: "int x", comment: JRC.PositionXComment},
        {type: "field", signature: "int y", comment: JRC.PositionYComment},

        { type: "method", signature: "Position(int x, int y)", java: PositionClass.prototype._cj$_constructor_$Position$int$int, comment: JRC.PositionConstructorComment },

        { type: "method", signature: "String toString()", java: PositionClass.prototype._mj$toString$String$ , comment: JRC.objectToStringComment},

    ]

    static type: NonPrimitiveType;
    x!: number;
    y!: number;

    constructor(x?: number, y?: number){
        super();
        this.x = x || 0;
        this.y = y || 0;
    }

    _cj$_constructor_$Position$int$int(t: Thread, callback: CallbackFunction, x: number, y: number){
        this.x = x;
        this.y = y;
        t.s.push(this);
        if(callback) callback();
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction){
        t.s.push(new StringClass(`(${this.x}, ${this.y})`));
        if(callback) callback();
        return;
    }
}
