import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";
import { IterableInterface } from "./IterableInterface.ts";

export class CollectionInterface extends IterableInterface {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface Collection<E> extends Iterable<E>" },
        { type: "method", signature: "boolean add(E e)", java: CollectionInterface.prototype._mj$add$boolean$E, comment: JRC.collectionAddElementComment },
        { type: "method", signature: "boolean addAll(Collection<? extends E> c)", java: CollectionInterface.prototype._mj$addAll$boolean$Collection, comment: JRC.collectionAddAllComment },
        { type: "method", signature: "void clear()", java: CollectionInterface.prototype._mj$clear$void$, comment: JRC.collectionClearComment },
        { type: "method", signature: "boolean contains(E element)", java: CollectionInterface.prototype._mj$contains$boolean$E, comment: JRC.collectionContainsComment },
        { type: "method", signature: "boolean containsAll(Collection<?> c)", java: CollectionInterface.prototype._mj$containsAll$boolean$Collection, comment: JRC.collectionContainsAllComment },
        { type: "method", signature: "boolean isEmpty()", java: CollectionInterface.prototype._mj$isEmpty$boolean$, comment: JRC.collectionIsEmptyComment },
        { type: "method", signature: "boolean remove(E element)", java: CollectionInterface.prototype._mj$remove$boolean$E, comment: JRC.collectionRemoveObjectComment },
        { type: "method", signature: "boolean removeAll(Collection<?> c)", java: CollectionInterface.prototype._mj$removeAll$boolean$Collection, comment: JRC.collectionRemoveAllComment },
        { type: "method", signature: "int size()", java: CollectionInterface.prototype._mj$size$int$, comment: JRC.collectionSizeComment },
        { type: "method", signature: "Object[] toArray()", java: CollectionInterface.prototype._mj$toArray$Object_I$, comment: JRC.collectionToArrayComment },
        { type: "method", signature: "<T> T[] toArray(T[] a)", java: CollectionInterface.prototype._mj$toArray$T_I$T_I, comment: JRC.collectionToArrayComment2 },

        // TODO: toArray, ...
    ]

    static type: NonPrimitiveType;

    _mj$add$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) { };

    _mj$addAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) { };

    _mj$clear$void$(t: Thread, callback: CallbackFunction) { };

    _mj$contains$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) { };

    _mj$containsAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) { };

    _mj$isEmpty$boolean$(t: Thread, callback: CallbackFunction) { };

    _mj$remove$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) { };

    _mj$removeAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) { };

    _mj$size$int$(t: Thread, callback: CallbackFunction) { };

    _mj$toArray$Object_I$(t: Thread, callback: CallbackFunction) { };

    _mj$toArray$T_I$T_I(t: Thread, callback: CallbackFunction, arrayTemplate: ObjectClassOrNull[]) { };
}