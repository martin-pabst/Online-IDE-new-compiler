import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../javalang/RuntimeException.ts";

export class FilesClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Files extends Object", comment: JRC.FilesClassComment},
        {type: "method", signature: "static string read(string filename)", java: FilesClass._mj$read$string$string, comment: JRC.FilesReadComment},
        {type: "method", signature: "static void write(string filename, string text)", java: FilesClass._mj$write$void$string$string, comment: JRC.FilesWriteComment},
        {type: "method", signature: "static void append(string filename, string text)", java: FilesClass._mj$append$void$string$string, comment: JRC.FilesAppendComment},
    ]

    static _mj$read$string$string(t: Thread, filename: string){
        let fileManager = t.scheduler.interpreter.fileManager;
        if(!fileManager) throw new RuntimeExceptionClass("System error: Filemanager is not defined.")
        t.s.push(fileManager.read(filename));
    }

    static _mj$write$void$string$string(t: Thread, filename: string, text: string){
        let fileManager = t.scheduler.interpreter.fileManager;
        if(!fileManager) throw new RuntimeExceptionClass("System error: Filemanager is not defined.")
        fileManager.write(filename, text);
    }

    static _mj$append$void$string$string(t: Thread, filename: string, text: string){
        let fileManager = t.scheduler.interpreter.fileManager;
        if(!fileManager) throw new RuntimeExceptionClass("System error: Filemanager is not defined.")
        fileManager.append(filename, text);
    }


}