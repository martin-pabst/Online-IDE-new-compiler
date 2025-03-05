import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import { NRWLang } from "./NRWLang";

export class NRWQueryResultClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class QueryResult", comment: NRWLang.queryResultClassComment },

        { type: "method", signature: "private QueryResult(string[][] pData, string[] pColumnNames, string[] pColumnTypes)", native: NRWQueryResultClass.prototype._constructor1 },

        { type: "method", signature: "string[][] getData()", native: NRWQueryResultClass.prototype._getData, comment: NRWLang.queryResultGetDataComment },
        { type: "method", signature: "string[] getColumnNames()", native: NRWQueryResultClass.prototype._getColumnNames, comment: NRWLang.queryResultGetColumnNamesComment },
        { type: "method", signature: "string[] getColumnTypes()", native: NRWQueryResultClass.prototype._getColumnTypes, comment: NRWLang.queryResultGetColumnTypesComment },
        { type: "method", signature: "int getColumnCount()", native: NRWQueryResultClass.prototype._getColumnCount, comment: NRWLang.queryResultGetColumnCountComment },

    ]

    static type: NonPrimitiveType;

    data: string[][] = [];
    columnNames: string[] = [];
    columnTypes: string[] = [];

    constructor() {
        super();
        
    }

    _constructor1(data: string[][], columnNames: string[], columnTypes: string[]){
        this.data = data;
        this.columnNames = columnNames;
        this.columnTypes = columnTypes;
    }

    _getData(): string[][] {
        let dest: string[][] = [];
        for(let srcArray of this.data){
            let dstArray: string[] = [];
            dest.push(dstArray);
            for(let src of srcArray){
                if(src == null) dstArray.push(null);
                dstArray.push(src);
            }
        }

        return dest;
    }

    _getColumnNames(): string[] {
        return this.columnNames.map(cn => {
            if(cn == null) return null;
            return cn;
        })
    }

    _getColumnTypes(): string[] {
        return this.columnTypes.map(cn => {
            if(cn == null) return null;
            return cn;
        })
    }

    _getColumnCount(): number {
        if(this.data != null && this.data.length > 0 && this.data[0] != null){
            return this.data[0].length;
        }

        return 0;
    }



}