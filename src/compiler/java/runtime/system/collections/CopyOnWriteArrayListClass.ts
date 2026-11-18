import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";
import { ArrayListClass } from "./ArrayListClass.ts";
import { SystemStreamClass } from "./SystemStreamClass.ts";

export class CopyOnWriteArrayListClass extends ArrayListClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class CopyOnWriteArrayList<E> implements List<E>", comment: JRC.arrayListClassComment },

        { type: "method", signature: "CopyOnWriteArrayList()", native: ArrayListClass.prototype._constructor, comment: JRC.arrayListConstructorComment },

        // from IterableInterface
        { type: "method", signature: "Iterator<E> iterator()", native: ArrayListClass.prototype._iterator, comment: JRC.arrayListIteratorComment },
        { type: "method", signature: "void forEach(Consumer<? super E> action)", java: ArrayListClass.prototype._mj$forEach$void$Consumer, comment: JRC.arrayListForeachComment },

        // from CollectionInterface
        { type: "method", signature: "Object[] toArray()", native: ArrayListClass.prototype._toArray, template: "§1.elements.slice()", comment: JRC.collectionToArrayComment },
        { type: "method", signature: "<T> T[] toArray(T[] a)", native: ArrayListClass.prototype._toArray, template: "§1.elements.slice()", comment: JRC.collectionToArrayComment2 },
        { type: "method", signature: "boolean add(E e)", native: ArrayListClass.prototype._add, template: "(§1.elements.push(§2) >= 0)", comment: JRC.collectionAddElementComment },
        { type: "method", signature: "boolean addAll(Collection<? extends E> c)", java: ArrayListClass.prototype._addAll, comment: JRC.collectionAddAllComment },
        { type: "method", signature: "void clear()", native: ArrayListClass.prototype._clear, template: "§1.elements.length = 0", comment: JRC.collectionClearComment },
        { type: "method", signature: "boolean contains(E Element)", java: ArrayListClass.prototype._mj$contains$boolean$E, comment: JRC.collectionContainsComment },
        { type: "method", signature: "boolean containsAll(Collection<?> c)", java: ArrayListClass.prototype._mj$containsAll$boolean$Collection, comment: JRC.collectionContainsAllComment },
        { type: "method", signature: "boolean isEmpty()", native: ArrayListClass.prototype._isEmpty, template: "(§1.elements.length == 0)", comment: JRC.collectionIsEmptyComment },
        { type: "method", signature: "boolean remove(E element)", java: ArrayListClass.prototype._mj$remove$boolean$E, comment: JRC.collectionRemoveObjectComment },
        { type: "method", signature: "boolean removeAll(Collection<?> c)", java: ArrayListClass.prototype._removeAll, comment: JRC.collectionRemoveAllComment },
        { type: "method", signature: "int size()", native: ArrayListClass.prototype._size, template: "§1.elements.length", comment: JRC.collectionSizeComment },
        { type: "method", signature: "Stream<E> stream()", java: CopyOnWriteArrayListClass.prototype._mj$stream$Stream$, comment: JRC.collectionStreamComment },

        // from ListInterface
        { type: "method", signature: "boolean add(int index, E element)", native: ArrayListClass.prototype._addWithIndex, comment: JRC.listAddElementComment },
        { type: "method", signature: "boolean addAll(int index, Collection<? extends E> c)", java: ArrayListClass.prototype._addAllWithIndex, comment: JRC.listAddAllElementsComment },
        { type: "method", signature: "E get (int index)", native: ArrayListClass.prototype._getWithIndex, comment: JRC.listGetComment },
        { type: "method", signature: "int indexOf (E Element)", java: ArrayListClass.prototype._mj$indexOf$int$E, comment: JRC.listIndexOfComment },
        { type: "method", signature: "E remove (int index)", native: ArrayListClass.prototype._removeWithIndex, comment: JRC.listRemoveComment },
        { type: "method", signature: "E set (int index, E Element)", native: ArrayListClass.prototype._setWithIndex, comment: JRC.listSetComment },
        { type: "method", signature: "void sort(Comparator<? super E> comparator)", java: ArrayListClass.prototype._mj$sort$void$Comparator, comment: JRC.listSortComment },

        // override toString-method
        { type: "method", signature: "String toString()", java: ArrayListClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    constructor(elements?: ObjectClassOrNull[]) {
        super(elements);
    }

    // Unlike ArrayList, the stream of a CopyOnWriteArrayList is a snapshot of the list at the time stream() is called.
    _mj$stream$Stream$(t: Thread, callback: CallbackFunction) {
        t.s.push(new SystemStreamClass(this.elements.slice()));
        if (callback) callback();
    }



}