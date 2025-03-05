import { JRC } from "../../../../compiler/java/language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../compiler/java/module/libraries/LibraryTypeDeclaration";
import { ObjectClass } from "../../../../compiler/java/runtime/system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../../../../compiler/java/runtime/system/javalang/RuntimeException";
import { NonPrimitiveType } from "../../../../compiler/java/types/NonPrimitiveType";
import { QueryResult } from "../../../../tools/database/DatabaseTool";

export class ResultSetClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class ResultSet extends Object", comment: JRC.resultSetClassComment },

        { type: "method", signature: "final boolean next()", native: ResultSetClass.prototype._next, comment: JRC.resultSetNextComment },
        { type: "method", signature: "final int size()", native: ResultSetClass.prototype._size, comment: JRC.resultSetSizeComment },
        { type: "method", signature: "final int getIndex()", native: ResultSetClass.prototype._getIndex, comment: JRC.resultSetGetIndexComment },
        { type: "method", signature: "final boolean wasNull()", native: ResultSetClass.prototype._wasNull, comment: JRC.resultSetWasNullComment },

        { type: "method", signature: "final boolean getBoolean(int index)", native: ResultSetClass.prototype._getBoolean, comment: JRC.resultSetGetByIndexComment("boolean") },
        { type: "method", signature: "final int getInt(int index)", native: ResultSetClass.prototype._getInt, comment: JRC.resultSetGetByIndexComment("int") },
        { type: "method", signature: "final float getFloat(int index)", native: ResultSetClass.prototype._getFloat, comment: JRC.resultSetGetByIndexComment("float") },
        { type: "method", signature: "final double getDouble(int index)", native: ResultSetClass.prototype._getFloat, comment: JRC.resultSetGetByIndexComment("double") },
        { type: "method", signature: "final String getString(int index)", native: ResultSetClass.prototype._getString, comment: JRC.resultSetGetByIndexComment("string") },

        { type: "method", signature: "final boolean getBoolean(string columnLabel)", native: ResultSetClass.prototype._getBoolean, comment: JRC.resultSetGetByLabelComment("boolean") },
        { type: "method", signature: "final int getInt(string columnLabel)", native: ResultSetClass.prototype._getInt, comment: JRC.resultSetGetByLabelComment("int") },
        { type: "method", signature: "final float getFloat(string columnLabel)", native: ResultSetClass.prototype._getFloat, comment: JRC.resultSetGetByLabelComment("float") },
        { type: "method", signature: "final double getDouble(string columnLabel)", native: ResultSetClass.prototype._getFloat, comment: JRC.resultSetGetByLabelComment("double") },
        { type: "method", signature: "final string getString(string columnLabel)", native: ResultSetClass.prototype._getString, comment: JRC.resultSetGetByLabelComment("String") },
    ];

    type: NonPrimitiveType;

    cursor: number = -1;
    wasNull: boolean = false;

    constructor(private result: QueryResult) {
        super();
    }

    getColumnIndex(indexOrLabel: string | number): number {

        if (typeof indexOrLabel == "number") return indexOrLabel;

        indexOrLabel = indexOrLabel.toLocaleLowerCase();

        let index = this.result.columns.findIndex((value, index) => { return value.toLocaleLowerCase() == indexOrLabel });
        if (index < 0) return index;
        return index + 1;
    }

    _wasNull(): boolean {
        return this.wasNull;
    }

    _getIndex(): number {
        return this.cursor;
    }

    _next(): boolean {
        this.cursor++;
        if (this.result == null) return false;
        return this.cursor < this.result.values.length;
    }

    _size(): number {
        return this.result.values.length;
    }

    columnCount(): number {
        return this.result.columns.length;
    }

    checkCursorAndRetrieveValue(columnIndex: number): any {
        if (this.cursor < 0) this.cursor = 0;

        if (this.cursor >= this.result.values.length) {
            throw new RuntimeExceptionClass(JRC.cursorAfterLastRecordException());
        }

        let value = this.result.values[this.cursor][columnIndex - 1];
        this.wasNull = value == null;

        return value;
    }



    _getBoolean(indexOrLabel: number | string): boolean {
        indexOrLabel = this.getColumnIndex(indexOrLabel);
        let value = this.checkCursorAndRetrieveValue(indexOrLabel);
        if (value == null) return false;
        return (value + "").indexOf("1") >= 0;
    }

    _getInt(indexOrLabel: number | string): number {
        indexOrLabel = this.getColumnIndex(indexOrLabel);
        let value = this.checkCursorAndRetrieveValue(indexOrLabel);
        if (value == null || !(typeof value == "number")) {
            return 0;
        }
        return Math.floor(value);
    }

    _getFloat(indexOrLabel: number | string): number {
        indexOrLabel = this.getColumnIndex(indexOrLabel);
        let value = this.checkCursorAndRetrieveValue(indexOrLabel);
        if (value == null || !(typeof value == "number")) {
            return 0;
        }
        return value;
    }

    _getString(indexOrLabel: number | string): string {
        indexOrLabel = this.getColumnIndex(indexOrLabel);
        let value = this.checkCursorAndRetrieveValue(indexOrLabel);
        return value == null ? null : "" + value;
    }

    isAfterLast(): boolean {
        return this.cursor > this.result.values.length - 1;
    }


}