import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { NRWEdgeClass } from "./NRWEdgeClass";
import { NRWLang } from "./NRWLang";
import { NRWListClass } from "./NRWListClass";
import { NRWVertexClass } from "./NRWVertexClass";

export class NRWGraphClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Graph", comment: NRWLang.graphClassComment },

        { type: "method", signature: "Graph()", native: NRWGraphClass.prototype._constructor1, comment: NRWLang.graphConstructorComment },

        { type: "method", signature: "List<Vertex> getVertices()", native: NRWGraphClass.prototype._getVertices, comment: NRWLang.graphGetVerticesComment },
        { type: "method", signature: "List<Edge> getEdges()", native: NRWGraphClass.prototype._getEdges, comment: NRWLang.graphGetEdgesComment },
        
        { type: "method", signature: "Vertex getVertex(string pID)", native: NRWGraphClass.prototype._getVertex, comment: NRWLang.graphGetVertexComment },

        { type: "method", signature: "void addVertex(Vertex pVertex)", native: NRWGraphClass.prototype._addVertex, comment: NRWLang.graphAddVertexComment },
        { type: "method", signature: "void addEdge(Edge pEdge)", native: NRWGraphClass.prototype._addEdge, comment: NRWLang.graphAddEdgeComment },
        { type: "method", signature: "void removeVertex(Vertex pVertex)", native: NRWGraphClass.prototype._removeVertex, comment: NRWLang.graphRemoveVertexComment },
        { type: "method", signature: "void removeEdge(Edge pEdge)", native: NRWGraphClass.prototype._removeEdge, comment: NRWLang.graphRemoveEdgeComment },
        
        { type: "method", signature: "void setAllVertexMarks(boolean pMark)", native: NRWGraphClass.prototype._setAllVertexMarks, comment: NRWLang.graphSetAllVertexMarksComment },
        { type: "method", signature: "void setAllEdgeMarks(boolean pMark)", native: NRWGraphClass.prototype._setAllEdgeMarks, comment: NRWLang.graphSetAllEdgeMarksComment },
        
        { type: "method", signature: "boolean allVerticesMarked()", native: NRWGraphClass.prototype._allVerticesMarked, comment: NRWLang.graphAllVerticesMarkedComment },
        { type: "method", signature: "boolean allEdgesMarked()", native: NRWGraphClass.prototype._allEdgesMarked, comment: NRWLang.graphAllEdgesMarkedComment },
        
        { type: "method", signature: "List<Vertex> getNeighbours(Vertex pVertex)", native: NRWGraphClass.prototype._getNeighbours, comment: NRWLang.graphGetNeighboursComment },
        { type: "method", signature: "List<Edge> getEdges(Vertex pVertex)", native: NRWGraphClass.prototype._getEdgesForVertex, comment: NRWLang.graphGetEdgesForVertexComment },
        
        { type: "method", signature: "Edge getEdge(Vertex pVertex, Vertex pAnotherVertex)", native: NRWGraphClass.prototype._getEdge, comment: NRWLang.graphGetEdgeComment },
        
        { type: "method", signature: "boolean isEmpty()", native: NRWGraphClass.prototype._isEmpty, comment: NRWLang.graphIsEmptyComment },

    ]

    static type: NonPrimitiveType;

    vertices: NRWVertexClass[];
    edges: NRWEdgeClass[];

    constructor() {
        super();
    }

    _constructor1(){
        this.vertices = [];
        this.edges = [];
    }

    _getVertices(){
        let result = new NRWListClass();
        for(let vertex of this.vertices){
            result._append(vertex);
        }
        return result;
    }

    _getEdges(){
        let result = new NRWListClass();
        for(let edge of this.edges){
            result._append(edge);
        }
        return result;
    }

    _getVertex(pID: string){
        let vertex = this.vertices.find(v => v.id == pID);
        return vertex ? vertex : null;
    }

    _addVertex(pVertex: NRWVertexClass){
        if(pVertex == null || pVertex.id == null) return;
        let vertexWithSameID = this.vertices.find(v => v.id == pVertex.id);
        if(vertexWithSameID) return;

        this.vertices.push(pVertex);
    }

    _addEdge(pEdge: NRWEdgeClass){
        if(pEdge == null) return;
        if(pEdge.vertices[0] == null || pEdge.vertices[1] == null) return;
        if(this._getVertex(pEdge.vertices[0].id) != pEdge.vertices[0]) return;
        if(this._getVertex(pEdge.vertices[1].id) != pEdge.vertices[1]) return;
        if(this._getEdge(pEdge.vertices[0], pEdge.vertices[1]) != null) return;
        if(pEdge.vertices[0] == pEdge.vertices[1]) return;

        this.edges.push(pEdge);
    }

    _removeVertex(pVertex: NRWVertexClass){
        // remove edges connected to this vertex
        this.edges = this.edges.filter(edge => edge.vertices[0] != pVertex && edge.vertices[1] != pVertex);
        let index = this.vertices.indexOf(pVertex);
        if(index >= 0) this.vertices.splice(index, 1);
    }

    _removeEdge(pEdge: NRWEdgeClass){
        this.edges = this.edges.filter(edge => edge != pEdge);
    }

    _setAllVertexMarks(pMark: boolean){
        this.vertices.forEach(v => v.mark = pMark);
    }

    _setAllEdgeMarks(pMark: boolean){
        this.edges.forEach(edge => edge.mark = pMark);
    }

    _allVerticesMarked(): boolean {
        return  typeof this.vertices.find(v => !v.mark) == "undefined";
    }

    _allEdgesMarked(): boolean {
        return  typeof this.edges.find(e => !e.mark) == "undefined";
    }

    _getNeighbours(pVertex: NRWVertexClass): NRWListClass {
        let list = new NRWListClass();

        for(let edge of this.edges){
            if(edge.vertices[0] == pVertex){
                list._append(edge.vertices[1]);
            } else if(edge.vertices[1] == pVertex){
                list._append(edge.vertices[0]);
            }
        }

        return list;
    }

    _getEdgesForVertex(pVertex: NRWVertexClass): NRWListClass {
        let list = new NRWListClass();

        for(let edge of this.edges){
            if(edge.vertices[0] == pVertex){
                list._append(edge);
            } else if(edge.vertices[1] == pVertex){
                list._append(edge);
            }
        }

        return list;

    }

    _getEdge(pVertex: NRWVertexClass, pAnotherVertex: NRWVertexClass): NRWEdgeClass {

        for(let edge of this.edges){
            if(edge.vertices[0] == pVertex && edge.vertices[1] == pAnotherVertex) return edge;
            if(edge.vertices[1] == pVertex && edge.vertices[0] == pAnotherVertex) return edge;
        }

        return null;

    }

    _isEmpty(): boolean {
        return this.vertices.length == 0;
    }

}