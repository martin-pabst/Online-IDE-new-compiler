import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { ComparatorInterface } from "./ComparatorInterface.ts";

export class SetInterface extends CollectionInterface {
    static __javaDeclarations: LibraryDeclarations = [

        { type: "declaration", signature: "interface Set<E> extends Collection<E>", comment: JRC.setInterfaceComment },
        { type: "method", signature: "boolean contains(E element)", java: SetInterface.prototype._mj$contains$boolean$E, comment: JRC.setContainsComment },
        { type: "method", signature: "boolean containsAll(Collection c)", java: SetInterface.prototype._mj$containsAll$boolean$Collection, comment: JRC.setContainsAllComment },

    ]

    static type: NonPrimitiveType;

    _mj$Contains$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) { }
    _mj$ContainsAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) { }

}