import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ArrayListClass } from "./ArrayListClass.ts";

export class VectorClass extends ArrayListClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Vector<E> extends ArrayList<E>" },

        { type: "method", signature: "Vector()", native: VectorClass.prototype._constructor , comment: JRC.vectorConstructorComment},
    { type: "method", signature: "E firstElement()", native: VectorClass.prototype._firstElement , comment: JRC.vectorFirstElementComment},
    { type: "method", signature: "E lastElement()", native: VectorClass.prototype._lastElement , comment: JRC.vectorLastElementComment},
    { type: "method", signature: "void removeElementAt(int index)", native: VectorClass.prototype._removeWithIndex , comment: JRC.vectorRemoveElementAtComment},

        //
    ]

    static type: NonPrimitiveType; 

    _constructor() {
        return this;
    }

    _firstElement() {
        return this._getWithIndex(0);
    }

    _lastElement() {
        return this._getWithIndex(this._size() - 1);
    }


}