import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import { NRWLang } from "./NRWLang";

export class NRWVertexClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Vertex", comment: NRWLang.vertexClassComment },

        { type: "method", signature: "Vertex(String pID)", native: NRWVertexClass.prototype._constructor1, comment: NRWLang.vertexConstructorComment },
        { type: "method", signature: "String getID()", native: NRWVertexClass.prototype._getID, comment: NRWLang.vertexGetIDComment },
        { type: "method", signature: "boolean isMarked()", native: NRWVertexClass.prototype._isMarked, comment: NRWLang.vertexIsMarkedComment },
        { type: "method", signature: "void setMark(boolean pMark)", native: NRWVertexClass.prototype._setMark, comment: NRWLang.vertexSetMarkComment },

        //
    ]

    static type: NonPrimitiveType;

    id: StringClass;
    mark: boolean;


    constructor() {
        super();
    }

    _constructor1(pID: StringClass){
        this.id = pID;
        this.mark = false;

        return this;
    }

    _getID(){
        return this.id;
    }

    _isMarked(){
        return this.mark;
    }

    _setMark(pMark: boolean){
        this.mark = pMark;
    }


}
