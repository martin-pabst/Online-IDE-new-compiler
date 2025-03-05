import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ArrayListClass } from "./ArrayListClass.ts";

export class VectorClass extends ArrayListClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Vector<E> extends ArrayList<E>" },

        { type: "method", signature: "Vector()", native: VectorClass.prototype._constructor , comment: JRC.vectorConstructorComment},

        //
    ]

    static type: NonPrimitiveType;

    _constructor() {
        return this;
    }



}