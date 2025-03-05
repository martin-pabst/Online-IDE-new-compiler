import { Thread } from "../../../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../javalang/ObjectClassStringClass";
import { IPrimitiveTypeWrapper } from "./IPrimitiveTypeWrapper";
import { NumberClass } from "./NumberClass";

/**
 * @link https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Boolean.html
 */
export class BooleanClass extends ObjectClass implements IPrimitiveTypeWrapper {

    static FALSE: BooleanClass = new BooleanClass(false);
    static TRUE: BooleanClass = new BooleanClass(true);

    static isPrimitiveTypeWrapper: boolean = true;

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Boolean extends Object implements Comparable<Boolean>" },
        { type: "field", signature: "static final boolean FALSE", constantValue: BooleanClass.FALSE },
        { type: "field", signature: "static final boolean TRUE", constantValue: BooleanClass.TRUE },
        { type: "method", signature: "public final boolean booleanValue()", template: "§1.value" },
        { type: "method", signature: "public int compareTo(Boolean otherBoolean)", native: BooleanClass.prototype._compareTo },
        { type: "method", signature: "public static boolean getBoolean(String name)", template: '§1 == "true"' },
        { type: "method", signature: "public static boolean parseBoolean(String name)", template: '§1 == "true"' },
    ]

    static type: NonPrimitiveType;


    constructor(public value: boolean) {
        super();
    }

    debugOutput(): string {
        return this.value ? "true" : "false";
    }

    __internalHashCode(): any {
        return this.value;
    }

    _compareTo(otherValue: BooleanClass) {
        return this == otherValue ? 0 : 1;
    }


}