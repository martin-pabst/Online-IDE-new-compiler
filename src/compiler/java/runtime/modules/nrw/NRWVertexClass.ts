import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { NRWLang } from "./NRWLang";

export class NRWVertexClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Vertex", comment: NRWLang.vertexClassComment },

        { type: "method", signature: "Vertex()", native: NRWVertexClass.prototype._constructor1, comment: NRWLang.vertexConstructorComment },
        { type: "method", signature: "string getID()", native: NRWVertexClass.prototype._getID, comment: NRWLang.vertexGetIDComment },
        { type: "method", signature: "boolean isMarked()", native: NRWVertexClass.prototype._isMarked, comment: NRWLang.vertexIsMarkedComment },
        { type: "method", signature: "void setMark(boolean pMark)", native: NRWVertexClass.prototype._setMark, comment: NRWLang.vertexSetMarkComment },

        //
    ]

    static type: NonPrimitiveType;

    id: string;
    mark: boolean;


    constructor() {
        super();
    }

    _constructor1(pID: string){
        this.id = pID;
        this.mark = false;
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