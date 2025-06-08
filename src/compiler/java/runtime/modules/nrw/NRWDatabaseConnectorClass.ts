import { ConnectionClass } from "../../../../../client/libraries/java/database/ConnectionClass";
import { Main } from "../../../../../client/main/Main";
import { QueryResult } from "../../../../../tools/database/DatabaseTool";
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import { NRWLang } from "./NRWLang";
import { NRWQueryResultClass } from "./NRWQueryResultClass";

/*
  Usage:
  DatabaseConnector c = new DatabaseConnector("239348H2NcLAvd");
  c.executeStatement("select * from fluss");
  var result = c.getCurrentQueryResult();
  String[][] data = result.getData();
  println(data[0]);
*/

export class NRWDatabaseConnectorClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class DatabaseConnector", comment: NRWLang.databaseConnectorClassComment },

        { type: "method", signature: "public DatabaseConnector(string code)", java: NRWDatabaseConnectorClass.prototype._cj$_constructor_$DatabaseConnector$string, comment: NRWLang.databaseConnectorConstructorComment},

        { type: "method", signature: "void executeStatement(string statement)", java: NRWDatabaseConnectorClass.prototype._mj$executeStatement$void$string, comment: NRWLang.databaseConnectorExecuteStatementComment },
        { type: "method", signature: "QueryResult getCurrentQueryResult()", native: NRWDatabaseConnectorClass.prototype._getCurrentQueryResult, comment: NRWLang.databaseConnectorGetCurrentQueryResultComment },
        { type: "method", signature: "string getErrorMessage()", native: NRWDatabaseConnectorClass.prototype._getErrorMessage, comment: NRWLang.databaseConnectorGetErrorMessageComment },
        { type: "method", signature: "void close()", native: NRWDatabaseConnectorClass.prototype._close, comment: NRWLang.databaseConnectorCloseComment },

    ]

    static type: NonPrimitiveType;

    ch: ConnectionClass;
    message: string = null;
    currentQueryResult: NRWQueryResultClass;

    constructor() {
        super();
        
    }

    _cj$_constructor_$DatabaseConnector$string(t: Thread, callback: CallbackParameter, code: string){

        let interpreter = t.scheduler.interpreter;
        let main = <Main>interpreter.getMain();

        if(!main || main.isEmbedded()){
            this.message = NRWLang.databaseConnectorNotInEmbeddedVersionException();
            t.s.push(this)
            if(callback) callback();
            return;
        }

        this.ch = new ConnectionClass(t.scheduler.interpreter);

        interpreter.showProgramPointer(undefined, "DatabaseManager");
        main.getBottomDiv().showHideDBBusyIcon(true);
        t.state = ThreadState.waiting;

        this.ch.connect(code, (error: string) => {
            main.getBottomDiv().showHideDBBusyIcon(false);
            if(error){
                this.message = NRWLang.connectionError() + ": " + error;
            }
            t.s.push(this);
            t.state = ThreadState.running;
            if(callback) callback();
        })

    }

    _mj$executeStatement$void$string(t: Thread, callback: CallbackFunction, statement: string){

        if(!this.ch){
            if(callback) callback();
            return;
        }

        t.scheduler.interpreter.showProgramPointer(undefined, "DatabaseManager");
        this.ch.main.getBottomDiv().showHideDBBusyIcon(true);
        t.state = ThreadState.waiting;

        if(statement.trim().toLowerCase().startsWith('select')){

            this.ch.executeQuery(statement, (error: string, data: QueryResult) => {
                
                this.ch.main.getBottomDiv().showHideDBBusyIcon(false);
                t.state = ThreadState.running;
    
                if(error){
                    this.message = error;
                    if(callback) callback();
                    return;        
                }

                this.currentQueryResult = new NRWQueryResultClass();

                const values: string[][] = data.values.map(line => line.map(s => "" + s));
                const types = data.columns.map( c => "String");
                for(let line of data.values){
                    for(let c = 0; c < line.length; c++){
                        let d = line[c];
                        if(typeof d == "number"){
                            types[c] = "Number";
                        } else if(typeof d == "boolean"){
                            types[c] = "Boolean";
                        }
                    }
                }


                this.currentQueryResult._constructor1(values, data.columns, types);

                if(callback) callback();
            });

        } else {

            this.ch.executeWriteStatement(statement, (error: string) => {
                
                this.ch.main.getBottomDiv().showHideDBBusyIcon(false);
                t.state = ThreadState.running;
    
                if(error){
                    this.message = error;
                    if(callback) callback();
                    return;        
                }

                this.currentQueryResult = new NRWQueryResultClass();
                this.currentQueryResult._constructor1([], [], []);

                if(callback) callback();
            });

        }

    }


    _getCurrentQueryResult(){
        return this.currentQueryResult ? this.currentQueryResult : null;
    }

    _getErrorMessage(){
        return this.message;
    }

    _close(){
        if(this.ch) this.ch._close();
    }
}