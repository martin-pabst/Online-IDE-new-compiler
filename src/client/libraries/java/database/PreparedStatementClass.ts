import { CallbackParameter } from "../../../../compiler/common/interpreter/CallbackParameter";
import { Thread } from "../../../../compiler/common/interpreter/Thread";
import { ThreadState } from "../../../../compiler/common/interpreter/ThreadState";
import { JRC } from "../../../../compiler/java/language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../compiler/java/module/libraries/LibraryTypeDeclaration";
import { ObjectClass } from "../../../../compiler/java/runtime/system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../../../../compiler/java/runtime/system/javalang/RuntimeException";
import { NonPrimitiveType } from "../../../../compiler/java/types/NonPrimitiveType";
import { QueryResult } from "../../../../tools/database/DatabaseTool";
import { ConnectionClass } from "./ConnectionClass";
import { ResultSetClass } from "./ResultSetClass";

export class PreparedStatementClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class PreparedStatement extends Object", comment: JRC.preparedStatementClassComment },

        { type: "method", signature: "final ResultSet executeQuery()", java: PreparedStatementClass.prototype._mj$executeQuery$ResultSet$, comment: JRC.statementExecuteQueryComment },
        { type: "method", signature: "final int executeUpdate()", java: PreparedStatementClass.prototype._mj$executeUpdate$int$, comment: JRC.statementExecuteUpdateComment },

        { type: "method", signature: "final boolean setBoolean(int parameterIndex, boolean value)", native: PreparedStatementClass.prototype._setValue, comment: JRC.preparedStatementSetComment("boolean") },
        { type: "method", signature: "final int setInt(int parameterIndex, int value)", native: PreparedStatementClass.prototype._setValue, comment: JRC.preparedStatementSetComment("int") },
        { type: "method", signature: "final float setFloat(int parameterIndex, float value)", native: PreparedStatementClass.prototype._setValue, comment: JRC.preparedStatementSetComment("float") },
        { type: "method", signature: "final double setDouble(int parameterIndex, double value)", native: PreparedStatementClass.prototype._setValue, comment: JRC.preparedStatementSetComment("double") },
        { type: "method", signature: "final String setString(int parameterIndex, string value)", native: PreparedStatementClass.prototype._setValue, comment: JRC.preparedStatementSetComment("string") },

    ];

    type: NonPrimitiveType;

    parameterValues: string[];
    parameterPositions: number[];
    query: string;

    constructor(private connection: ConnectionClass, query: string){
        super();
        this.query = query.trim();
        this.prepareStatement(this.query);
    }

    prepareStatement(sql: string) {

        let insideQuotation: boolean = false;
        this.parameterPositions = [];

        for (let i = 0; i < sql.length; i++) {

            let c = sql.charAt(i);
            switch (c) {
                case "'": insideQuotation = !insideQuotation;
                    break;
                case "?": if (!insideQuotation) {
                    this.parameterPositions.push(i);
                }
                    break;
                default:
                    break;
            }
        }

        this.parameterValues = new Array(this.parameterPositions.length);

    }

    _setValue(position: number, value) {
        if (position < 1 || position > this.parameterPositions.length) {
            if (this.parameterPositions.length == 0) {
                throw new RuntimeExceptionClass(JRC.preparedStatementParametersMissingException());
            }
            throw new RuntimeExceptionClass(JRC.preparedStatementWrongParameterIndex(this.parameterPositions.length, position));
        }

        if(value == null){
            this.parameterValues[position - 1] = "null";
        } else
        if (typeof value == "string") {
            value = value.replace(/'/g, "''");
            this.parameterValues[position - 1] = "'" + value + "'";
        } else {
            this.parameterValues[position - 1] = "" + value;
        }
        return;
    }

    checkQuery(): string {
        return null;
    }

    getQueryWithParameterValuesFilledIn(): string {
        let query = this.query;
        let queryParts: string[] = [];
        let pos = 0;

        for (let i = 0; i < this.parameterPositions.length; i++) {
            queryParts.push(query.substring(pos, this.parameterPositions[i]));
            pos = this.parameterPositions[i] + 1;
        }

        if (pos < query.length) {
            queryParts.push(query.substring(pos));
        }

        let queryWithParameterValues = "";
        for (let i = 0; i < this.parameterPositions.length; i++) {
            queryWithParameterValues += queryParts[i] + this.parameterValues[i];
        }

        if (queryParts.length > this.parameterPositions.length) {
            queryWithParameterValues += queryParts[queryParts.length - 1];
        }

        return queryWithParameterValues;
    }




    _mj$executeQuery$ResultSet$(t: Thread, callback: CallbackParameter) {
        let query = this.getQueryWithParameterValuesFilledIn();

        if (!query.toLocaleLowerCase().startsWith("select"))
            throw new RuntimeExceptionClass(JRC.statementOnlySelectionStatementsWithQueryException());

        t.scheduler.interpreter.showProgramPointer(undefined, "DatabaseManager");
        this.connection.main.getBottomDiv().showHideBusyIcon(true);
        t.state = ThreadState.waiting;

        this.connection.executeQuery(query, (error: string, queryResult: QueryResult) => {

            if(error != null){
                // this callback is called by a network-event, so if we just throw an exception
                // it won't get catched by thread.run.
                t.throwRuntimeExceptionOnLastExecutedStep(new RuntimeExceptionClass(error));
                return;
            }

            let resultSet = new ResultSetClass(queryResult);
            t.s.push(resultSet);

            this.connection.main.getBottomDiv().showHideBusyIcon(false);
            t.state = ThreadState.running;

        })


    }

    _mj$executeUpdate$int$(t: Thread, callback: CallbackParameter) {
        let query = this.getQueryWithParameterValuesFilledIn();
        if (query.toLocaleLowerCase().startsWith("select"))
            throw new RuntimeExceptionClass(JRC.statementExecuteUpdateException());

        t.scheduler.interpreter.showProgramPointer(undefined, "DatabaseManager");
        this.connection.main.getBottomDiv().showHideBusyIcon(true);
        t.state = ThreadState.waiting;

        this.connection.executeWriteStatement(query, (error: string, lastRowId: number) => {

            if(error != null){
                // this callback is called by a network-event, so if we just throw an exception
                // it won't get catched by thread.run.
                t.throwRuntimeExceptionOnLastExecutedStep(new RuntimeExceptionClass(error));
                return;
            }

            t.s.push(lastRowId);

            this.connection.main.getBottomDiv().showHideBusyIcon(false);
            t.state = ThreadState.running;

        })


    }


}