import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { BiConsumerInterface } from "../functional/BiConsumerInterface.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";

export class MapInterface extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface Map<K, V>", comment: JRC.mapInterfaceComment },
        { type: "method", signature: "int size()", java: MapInterface.prototype._mj$size$int$, comment: JRC.mapSizeComment },
        { type: "method", signature: "boolean isEmpty()", java: MapInterface.prototype._mj$isEmpty$boolean$, comment: JRC.mapIsEmptyComment },
        { type: "method", signature: "boolean containsKey(K key)", java: MapInterface.prototype._mj$containsKey$boolean$K, comment: JRC.mapContainsKeyComment },
        { type: "method", signature: "boolean containsValue(V value)", java: MapInterface.prototype._mj$containsValue$boolean$V, comment: JRC.mapContainsValueComment },
        { type: "method", signature: "V get(K key)", java: MapInterface.prototype._mj$get$V$K, comment: JRC.mapGetComment },
        { type: "method", signature: "V put(K key, V value)", java: MapInterface.prototype._mj$put$V$K$V, comment: JRC.mapPutComment },
        { type: "method", signature: "void clear()", java: MapInterface.prototype._mj$clear$void$, comment: JRC.mapClearComment },
        { type: "method", signature: "void forEach(BiConsumer<? super K, ? super V> action)", java: MapInterface.prototype._mj$forEach$void$BiConsumer, comment: JRC.mapForeachComment },
        { type: "method", signature: "Collection<V> values()", java: MapInterface.prototype._mj$values$Collection$, comment: JRC.mapValuesComment },
        { type: "method", signature: "Set<K> keySet()", java: MapInterface.prototype._mj$keySet$Set$, comment: JRC.mapKeySetComment },

        { type: "method", signature: "V remove(K key)", java: MapInterface.prototype._mj$remove$V$K, comment: JRC.mapRemoveComment1 },
        { type: "method", signature: "boolean remove(K key, V value)", java: MapInterface.prototype._mj$remove$boolean$K$V, comment: JRC.mapRemoveComment1 },

    ]

    static type: NonPrimitiveType;

    _mj$size$int$(t: Thread, callback: CallbackFunction) { }
    _mj$isEmpty$boolean$(t: Thread, callback: CallbackFunction) { }
    _mj$containsKey$boolean$K(t: Thread, callback: CallbackFunction, key: ObjectClassOrNull) { }
    _mj$containsValue$boolean$V(t: Thread, callback: CallbackFunction, value: ObjectClassOrNull) { }
    _mj$get$V$K(t: Thread, callback: CallbackFunction, key: ObjectClassOrNull) { }
    _mj$put$V$K$V(t: Thread, callback: CallbackFunction, key: ObjectClassOrNull, value: ObjectClassOrNull) { }
    _mj$clear$void$(t: Thread, callback: CallbackFunction) { }
    _mj$forEach$void$BiConsumer(t: Thread, callback: CallbackFunction, biConsumer: BiConsumerInterface) { }
    _mj$values$Collection$(t: Thread, callback: CallbackFunction) { }
    _mj$keySet$Set$(t: Thread, callback: CallbackFunction) { }

    _mj$remove$V$K(t: Thread, callback: CallbackFunction, key: ObjectClass) {}
    _mj$remove$boolean$K$V(t: Thread, callback: CallbackFunction, key: ObjectClass, value: ObjectClass) {}

}