import type { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { BigIntegerClass } from "../javalang/BigIntegerClass";
import { StringClass } from "../javalang/ObjectClassStringClass";
import type { ObjectClass } from "../javalang/ObjectClassStringClass";
import { BooleanClass } from "../primitiveTypes/wrappers/BooleanClass";
import { DoubleClass } from "../primitiveTypes/wrappers/DoubleClass";


export class JavaScriptClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "final class JavaScript" },
        { type: "method", signature: "static Object exec(string functionBody, Object... args)", native: JavaScriptClass.prototype.exec }
    ];

    exec(functionBody: string, args: ObjectClass[]): ObjectClass {
        const unwrappedArgs = args.map(JavaScriptClass.#unwrapValue)

        const jsFunction = new Function('args', functionBody)

        const result = jsFunction(unwrappedArgs)

        return JavaScriptClass.#wrapValue(result)
    }

    static #unwrapValue(o: ObjectClass): any {
        // let's hope we have a number, boolean, bigint or string, which have a value property
        // and can be converted to JavaScript primitive types:
        return (o as any).value
            // otherwise: directly pass object
            ?? o
    }

    static #wrapValue(o: any) {
        switch (typeof o) {
            case 'boolean':
                return new BooleanClass(o)
            case 'number':
                return new DoubleClass(o)
            case 'bigint':
                return new BigIntegerClass(o)
            case 'string':
                return new StringClass(o)
            case 'object':
                if (['Boolean', 'Number', 'BigInt', 'String'].includes(o.constructor.name)) {
                    // JavaScript wrapper type: convert to JavaScript primitive type.
                    return JavaScriptClass.#wrapValue(o.valueOf())
                } else {
                    return o
                }
        }
    }
}
