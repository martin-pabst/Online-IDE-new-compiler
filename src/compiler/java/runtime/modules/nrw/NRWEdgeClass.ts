import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { NRWLang } from "./NRWLang";
import { NRWVertexClass } from "./NRWVertexClass";

export class NRWEdgeClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Edge", comment: NRWLang.edgeClassComment },

        { type: "method", signature: "Edge()", native: NRWEdgeClass.prototype._constructor1, comment: NRWLang.edgeConstructorComment },

        { type: "method", signature: "boolean isMarked()", native: NRWEdgeClass.prototype._isMarked, comment: NRWLang.edgeIsMarkedComment },
        { type: "method", signature: "void setMark(boolean pMark)", native: NRWEdgeClass.prototype._setMark, comment: NRWLang.edgeSetMarkComment },
        { type: "method", signature: "Vertex[] getVertices()", native: NRWEdgeClass.prototype._getVertices, comment: NRWLang.edgeGetVerticesComment },
        
        { type: "method", signature: "void setWeight(double pWeight)", native: NRWEdgeClass.prototype._setWeight, comment: NRWLang.edgeSetWeightComment },
        { type: "method", signature: "double getWeight(double pWeight)", native: NRWEdgeClass.prototype._getWeight, comment: NRWLang.edgeGetWeightComment },

    ]

    static type: NonPrimitiveType;

    vertices: NRWVertexClass[];
    weight: number;
    mark: boolean;

    constructor() {
        super();
    }

    _constructor1(pVertex: NRWVertexClass, pAnotherVertex: NRWVertexClass, pWeight: number){
        this.vertices = [pVertex, pAnotherVertex];
        this.weight = pWeight;
        this.mark = false;
    }



    _isMarked(){
        return this.mark;
    }

    _setMark(pMark: boolean){
        this.mark = pMark;
    }

    _getVertices(){
        return this.vertices.slice();
    }

    _setWeight(weight: number){
        this.weight = weight;
    }

    _getWeight(): number {
        return this.weight;
    }
}