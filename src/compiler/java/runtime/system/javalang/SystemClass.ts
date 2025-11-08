import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../javalang/ObjectClassStringClass";

export class PrintStreamClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class PrintStream extends Object", comment: JRC.PrintStreamClassComment },
        { type: "method", signature: "void print(char text)", java: PrintStreamClass.prototype._mn$print$void$string, comment: JRC.PrintStreamPrintComment},
        { type: "method", signature: "void print(string text)", java: PrintStreamClass.prototype._mn$print$void$string, comment: JRC.PrintStreamPrintComment},
        { type: "method", signature: "void print(int number)", java: PrintStreamClass.prototype._mn$print$void$int, comment: JRC.PrintStreamPrintComment},
        { type: "method", signature: "void print(double number)", java: PrintStreamClass.prototype._mn$print$void$double, comment: JRC.PrintStreamPrintComment},
        { type: "method", signature: "void print(boolean b)", java: PrintStreamClass.prototype._mn$print$void$boolean, comment: JRC.PrintStreamPrintComment},
        { type: "method", signature: "void print(Object o)", java: PrintStreamClass.prototype._mn$print$void$Object, comment: JRC.PrintStreamPrintComment},
        { type: "method", signature: "void println(char text)", java: PrintStreamClass.prototype._mn$println$void$string, comment: JRC.PrintStreamPrintlnComment},
        { type: "method", signature: "void println(string text)", java: PrintStreamClass.prototype._mn$println$void$string, comment: JRC.PrintStreamPrintlnComment},
        { type: "method", signature: "void println(int number)", java: PrintStreamClass.prototype._mn$println$void$int, comment: JRC.PrintStreamPrintlnComment},
        { type: "method", signature: "void println(double number)", java: PrintStreamClass.prototype._mn$println$void$double, comment: JRC.PrintStreamPrintlnComment},
        { type: "method", signature: "void println(boolean b)", java: PrintStreamClass.prototype._mn$println$void$boolean, comment: JRC.PrintStreamPrintlnComment},
        { type: "method", signature: "void println(Object o)", java: PrintStreamClass.prototype._mn$println$void$Object, comment: JRC.PrintStreamPrintlnComment},
        { type: "method", signature: "void println()", java: PrintStreamClass.prototype._mn$println$void$string, comment: JRC.PrintStreamPrintlnComment2},
    ];

    static type: NonPrimitiveType;

    _mn$print$void$string(t: Thread, callback: CallbackFunction, text: string){
        if(text == null) return;
        t.print(text, undefined);
        if(callback) callback();
    }

    _mn$print$void$int(t: Thread, callback: CallbackFunction, n: number){
        if(n == null) return;
        t.print(n + "", undefined);
        if(callback) callback();
    }

    _mn$print$void$double(t: Thread, callback: CallbackFunction, n: number){
        if(n == null) return;
        t.print(n + "", undefined);
        if(callback) callback();
    }

    _mn$print$void$boolean(t: Thread, callback: CallbackFunction, n: boolean){
        if(n == null) return;
        t.print(n + "", undefined);
        if(callback) callback();
    }

    _mn$println$void$string(t: Thread, callback: CallbackFunction, text?: string){
        if(text == null){
            t.println("", undefined);
        } else {
            t.println(text, undefined);
        }

        if(callback) callback();
    }

    _mn$println$void$int(t: Thread, callback: CallbackFunction, n?: number){
        if(n == null){
            t.println("", undefined);
        } else {
            t.println(n + "", undefined);
        }

        if(callback) callback();
    }

    _mn$println$void$double(t: Thread, callback: CallbackFunction, n?: number){
        if(n == null){
            t.println("", undefined);
        } else {
            t.println(n + "", undefined);
        }

        if(callback) callback();
    }

    _mn$println$void$boolean(t: Thread, callback: CallbackFunction, n?: boolean){
        if(n == null){
            t.println("", undefined);
        } else {
            t.println(n + "", undefined);
        }

        if(callback) callback();
    }

    _mn$println$void$Object(t: Thread, callback: CallbackFunction, n: ObjectClass){
        if(n == null){
            t.println("null", undefined);
            if(callback) callback();
            return;
        } else {
            n._mj$toString$String$(t, () => {
                let str = t.s.pop() as StringClass;
                if(str == null){
                    t.println("null", undefined);
                } else {
                    t.println(str.value, undefined);
                }
                if(callback) callback();
                return;
            });
        }
    }

    _mn$print$void$Object(t: Thread, callback: CallbackFunction, n: ObjectClass){
        if(n == null){
            t.print("null", undefined);
            if(callback) callback();
            return;
        } else {
            n._mj$toString$String$(t, () => {
                let str = t.s.pop() as StringClass;
                if(str == null){
                    t.print("null", undefined);
                } else {
                    t.print(str.value, undefined);
                }
                if(callback) callback();
                return;
            });
        }
    }


}

export class SystemClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class System extends Object", comment: JRC.SystemClassComment },
        { type: "field", signature: "static PrintStream out", comment: JRC.SystemOutComment},
        { type: "method", signature: "static void exit(int status)", java: SystemClass._mj$exit$void$int, comment: JRC.SystemExitComment },
        { type: "method", signature: "static int currentTimeMillis()", native: SystemClass._currentTimeMillis, comment: JRC.SystemCurrentTimeMillisComment },
        { type: "method", signature: "static long nanoTime()", native: SystemClass._currentTimeNano, comment: JRC.SystemNanoTimeComment },
    ];

    static type: NonPrimitiveType;
    static deltaTimeMillis: number = 0;   // when using WebSocket then the Server sends time synchronization
    static out = new PrintStreamClass();

    static _mj$exit$void$int(t: Thread, status: number){
        t.state = ThreadState.terminated;
        t.scheduler.exit(status);
    }

    static _currentTimeMillis(){
        return Math.round(Date.now()) + SystemClass.deltaTimeMillis;
    }

    static _currentTimeNano(){
        return Math.round(performance.now() * 1e6) + SystemClass.deltaTimeMillis * 1e6;
    }

    static synchronizeToServerTimeMillis(serverTimeMillis: number){
        SystemClass.deltaTimeMillis = serverTimeMillis - performance.now();
    }



}


