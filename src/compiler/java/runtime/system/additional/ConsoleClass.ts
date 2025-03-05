import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../javalang/ObjectClassStringClass";

export class ConsoleClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Console extends Object", comment: JRC.ConsoleClassComment},
        {type: "method", signature: "static void log(int value)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment},
        {type: "method", signature: "static void log(long value)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment},
        {type: "method", signature: "static void log(float value)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment},
        {type: "method", signature: "static void log(double value)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment},
        {type: "method", signature: "static void log(char value)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment},
        {type: "method", signature: "static void log(boolean value)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment},
        {type: "method", signature: "static void log(Object object)", native: ConsoleClass.log, comment: JRC.ConsoleLogComment}
    ];

    static type: NonPrimitiveType;

    static log(object: any): void {
        if(object instanceof StringClass){
            console.log(object.value);
        } else {
            console.log(object);
        }
    }

}
