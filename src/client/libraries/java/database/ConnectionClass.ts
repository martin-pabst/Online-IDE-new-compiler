import { DatabaseData } from "../../../../client/communication/Data";
import { Main } from "../../../../client/main/Main";
import { Interpreter } from "../../../../compiler/common/interpreter/Interpreter";
import { JRC } from "../../../../compiler/java/language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../compiler/java/module/libraries/LibraryTypeDeclaration";
import { ObjectClass } from "../../../../compiler/java/runtime/system/javalang/ObjectClassStringClass";
import { NonPrimitiveType } from "../../../../compiler/java/types/NonPrimitiveType";
import { DatabaseNewLongPollingListener } from "../../../../tools/database/DatabaseNewLongPollingListener";
import { DatabaseTool, QueryResult } from "../../../../tools/database/DatabaseTool";
import { PreparedStatementClass } from "./PreparedStatementClass";
import { StatementClass } from "./StatementClass";

export class ConnectionClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Connection extends Object", comment: JRC.connectionClassComment },

        { type: "method", signature: "final Statement createStatement()", native: ConnectionClass.prototype._createStatement, comment: JRC.connectionCreateStatementComment },
        { type: "method", signature: "final PreparedStatement prepareStatement(string query)", native: ConnectionClass.prototype._prepareStatement, comment: JRC.connectionPrepareStatementComment },
        { type: "method", signature: "final void close()", native: ConnectionClass.prototype._close, comment: JRC.connectionCloseComment },

    ];

    type: NonPrimitiveType;

    database: DatabaseTool;
    databaseData: DatabaseData;
    token: string;
    databaseSSEListener: DatabaseNewLongPollingListener;

    main: Main;

    constructor(private interpreter: Interpreter) {
        super();
        this.main = <Main>interpreter.getMain()!;
        interpreter.eventManager.once("stop", () => {
            this._close();
        })
    }

    _createStatement(): StatementClass {
        return new StatementClass(this);
    }

    _prepareStatement(query: string): PreparedStatementClass {
        return new PreparedStatementClass(this, query);
    }

    connect(code: string, callback: (error: string) => void) {
        let that = this;
        this.main.networkManager.fetchDatabaseAndToken(code, (dbData, token, error) => {
            if (error == null) {
                that.token = token;
                that.databaseData = dbData;
                that.database = new DatabaseTool(that.main);
                that.database.initializeWorker(dbData.templateDump, dbData.statements, (error) => {

                    that.databaseSSEListener = new DatabaseNewLongPollingListener(that.main.networkManager,
                        that.token, dbData.id, (firstNewStatementIndex, newStatements, rollbackToVersion) => {
                            that.onServerSentStatements(firstNewStatementIndex, newStatements, rollbackToVersion);
                        })

                    callback(null);
                });
            } else {
                callback(error);
            }
        })
    }

    _close() {
        if (this.databaseSSEListener != null) {
            this.databaseSSEListener.close();
            this.databaseSSEListener = null;
        }

        if (this.database != null) {
            this.database.close();
            this.database = null;
        }

    }

    skipNextServerSentStatement: boolean = false;
    onServerSentStatements(firstNewStatementIndex: number, newStatements: string[], rollbackToVersion: number) {

        if (this.skipNextServerSentStatement) {
            this.skipNextServerSentStatement = false;
            return;
        }

        if (rollbackToVersion != null) {
            // Rollback
            this.databaseData.statements.splice(rollbackToVersion);
            this.database.initializeWorker(this.databaseData.templateDump, this.databaseData.statements);
            return;
        } else {
            this.executeStatementsFromServer(firstNewStatementIndex, newStatements);
        }


    }

    executeStatementsFromServer(firstStatementIndex: number, statements: string[],
        callback?: (error: string) => void) {

        // connection already closed?
        if (this.database == null) {
            if (callback) callback("Keine Datenbankverbindung.");
            return;
        }

        let currentDBVersion = this.databaseData.statements.length;
        let delta = currentDBVersion - firstStatementIndex + 1; // these statements are already there
        if (delta >= statements.length) {
            if (callback) callback(null);
            return;
        }
        statements = statements.slice(delta);
        this.databaseData.statements = this.databaseData.statements.concat(statements);

        this.database.executeWriteQueries(statements, () => {
            if (callback != null) callback(null);
        }, (errorMessage) => {
            if (callback != null) callback(errorMessage);
        })
    }

    executeWriteStatement(query: string, callback: (error: string, lastRowId: number) => void, retrieveLastRowId: boolean = false) {

        // connection already closed?
        if (this.database == null) {
            callback("Es besteht keine Verbindung zur Datenbank.", 0);
        }

        let that = this;
        let oldStatementIndex = that.databaseData.statements.length;
        this.database.executeQuery("explain " + query, () => {

            that.skipNextServerSentStatement = true;
            that.main.networkManager.addDatabaseStatement(that.token, oldStatementIndex,
                [query], (statementsBefore, new_version, errorMessage) => {
                    if (errorMessage != null) {
                        callback(errorMessage, 0);
                        return;
                    }

                    that.executeStatementsFromServer(oldStatementIndex + 1, statementsBefore, (error: string) => {

                        that.database.executeWriteQueries([query], () => {
                            that.databaseData.statements.push(query);
                            if (!retrieveLastRowId) {
                                callback(null, 0);
                                return;
                            }
                            that.executeQuery("select last_insert_rowid()", (error, data) => {
                                callback(null, data.values[0][0]);
                            })
                        }, (errorMessage) => {
                            that.databaseData.statements.push(query);
                            if (callback != null) callback(errorMessage, 0);
                            // try rollback so that server doesn't store this statement
                            that.main.networkManager.rollbackDatabaseStatement(that.token, that.databaseData.statements.length, () => { })
                        })


                    });

                })

        }, (error) => {
            callback(error, 0);
        })

    }

    executeQuery(query: string, callback: (error: string, data: QueryResult) => void) {

        if (this.database == null || this.databaseSSEListener == null) {
            callback(JRC.connectionDatabaseConnectionError(), null);
            return;
        }

        this.database.executeQuery(query, (results: QueryResult[]) => {
            callback(null, results.length == 0 ? { columns: [], values: [] } : results[0]);
        }, (error: string) => {
            callback(error, null);
        })

    }


}