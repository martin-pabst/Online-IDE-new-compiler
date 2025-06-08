import { CallbackParameter } from "../../../../compiler/common/interpreter/CallbackParameter";
import { Thread } from "../../../../compiler/common/interpreter/Thread";
import { ThreadState } from "../../../../compiler/common/interpreter/ThreadState";
import { JRC } from "../../../../compiler/java/language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../compiler/java/module/libraries/DeclareType";
import { ObjectClass } from "../../../../compiler/java/runtime/system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../../../../compiler/java/runtime/system/javalang/RuntimeException";
import { NonPrimitiveType } from "../../../../compiler/java/types/NonPrimitiveType";
import { QueryResult } from "../../../../tools/database/DatabaseTool";
import { ConnectionClass } from "./ConnectionClass";
import { ResultSetClass } from "./ResultSetClass";

export class StatementClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Statement extends Object", comment: JRC.statementClassComment },

        { type: "method", signature: "final ResultSet executeQuery(string query)", java: StatementClass.prototype._mj$executeQuery$ResultSet$string, comment: JRC.statementExecuteQueryComment },
        { type: "method", signature: "final int executeUpdate(string query)", java: StatementClass.prototype._mj$executeUpdate$int$string, comment: JRC.statementExecuteUpdateComment },
    ];

    type: NonPrimitiveType;

    constructor(private connection: ConnectionClass) {
        super();
    }

    _mj$executeQuery$ResultSet$string(t: Thread, callback: CallbackParameter, query: string) {
        query = query.trim();
        if (!query.toLocaleLowerCase().startsWith("select"))
            throw new RuntimeExceptionClass(JRC.statementOnlySelectionStatementsWithQueryException());

        t.scheduler.interpreter.showProgramPointer(undefined, "DatabaseManager");
        this.connection.main.getBottomDiv().showHideDBBusyIcon(true);
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

            this.connection.main.getBottomDiv().showHideDBBusyIcon(false);
            t.state = ThreadState.running;

        })


    }

    _mj$executeUpdate$int$string(t: Thread, callback: CallbackParameter, query: string) {
        query = query.trim();
        if (query.toLocaleLowerCase().startsWith("select"))
            throw new RuntimeExceptionClass(JRC.statementExecuteUpdateException());

        t.scheduler.interpreter.showProgramPointer(undefined, "DatabaseManager");
        this.connection.main.getBottomDiv().showHideDBBusyIcon(true);
        t.state = ThreadState.waiting;

        this.connection.executeWriteStatement(query, (error: string, lastRowId: number) => {

            if(error != null){
                // this callback is called by a network-event, so if we just throw an exception
                // it won't get catched by thread.run.
                t.throwRuntimeExceptionOnLastExecutedStep(new RuntimeExceptionClass(error));
                return;
            }

            t.s.push(lastRowId);

            this.connection.main.getBottomDiv().showHideDBBusyIcon(false);
            t.state = ThreadState.running;

        })


    }

}