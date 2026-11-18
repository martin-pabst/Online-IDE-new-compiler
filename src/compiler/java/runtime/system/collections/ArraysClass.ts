import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { ObjectClass } from "../javalang/ObjectClassStringClass";
import { ArrayListClass } from "./ArrayListClass";

export class ArraysClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Arrays extends Object", comment: JRC.ArraysClassComment},
        {type: "method", signature: "public static <T> List<T> asList(T... a)", native:ArraysClass.prototype._asList, comment: JRC.ArraysClassAsListComment},
        {type: "method", signature: "public static <T> List<T> asList(T[] a)", native:ArraysClass.prototype._asList, comment: JRC.ArraysClassAsListComment},
    ];


    _asList(a: any[]): any {
        return new ArrayListClass(a);
    }
}