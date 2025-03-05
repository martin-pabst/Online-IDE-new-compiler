import { Main } from "../../../../client/main/Main";
import { Thread } from "../../../../compiler/common/interpreter/Thread";
import { ThreadState } from "../../../../compiler/common/interpreter/ThreadState";
import { JRC } from "../../../../compiler/java/language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../../compiler/java/module/libraries/LibraryTypeDeclaration";
import { ObjectClass } from "../../../../compiler/java/runtime/system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../../../../compiler/java/runtime/system/javalang/RuntimeException";
import { NonPrimitiveType } from "../../../../compiler/java/types/NonPrimitiveType";
import { ConnectionClass } from "./ConnectionClass";

export class DatabaseManagerClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class DatabaseManager extends Object", comment: JRC.databaseManagerClassComment},

        {type: "method", signature: "static Connection getConnection(string code)", java: DatabaseManagerClass._mj$getConnection$Connection$string, comment: JRC.databaseManagerGetConnectionComment}
    ];

    type: NonPrimitiveType;

    static _mj$getConnection$Connection$string(t: Thread, code: string){

        let interpreter = t.scheduler.interpreter;
        let main = <Main>interpreter.getMain();

        if(!main || main.isEmbedded()){
            throw new RuntimeExceptionClass(JRC.databaseManagerNotInEmbeddedVersionException());
        }

        let ch: ConnectionClass = new ConnectionClass(t.scheduler.interpreter);

        interpreter.showProgramPointer(undefined, "DatabaseManager");
        main.getBottomDiv().showHideBusyIcon(true);
        t.state = ThreadState.waiting;

        ch.connect(code, (error: string) => {
            main.getBottomDiv().showHideBusyIcon(false);
            if(error == null){
                t.s.push(ch);
            } else {
                t.s.push(null);
            }
            t.state = ThreadState.running;
        })

    }

}