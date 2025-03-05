import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ConsumerInterface } from "../functional/ConsumerInterface.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { IteratorInterface } from "./IteratorInterface.ts";

export class IterableInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Iterable<T>" , comment: JRC.iterableInterfaceComment},

        {type: "method", signature: "Iterator<T> iterator()", java: IterableInterface.prototype._mj$iterator$Iterator$ , comment: JRC.iterableIteratorComment},
        {type: "method", signature: "default void forEach(Consumer<? super T> action)", java: IterableInterface.prototype._mj$forEach$void$Consumer , comment: JRC.iterableForEachComment},
    ]

    static type: NonPrimitiveType;

    _mj$iterator$Iterator$(t: Thread, callback: CallbackFunction){}

    _mj$forEach$void$Consumer(t: Thread, callback: CallbackFunction, action: ConsumerInterface){

        this._mj$iterator$Iterator$(t, () => {
            let iterator: IteratorInterface = t.s.pop();

            let f = () => {

                iterator._mj$hasNext$boolean$(t, () => {
                    if(t.s.pop()){

                        iterator._mj$next$E$(t, () => {
                            let element = t.s.pop();
                            action._mj$accept$void$T(t, f, element);
                        })

                    } else {
                        if(callback) callback();
                    }
                })

            }

            f();

        })


    }

}