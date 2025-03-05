import { BaseListType } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ConsumerInterface } from "../functional/ConsumerInterface.ts";
import { IndexOutOfBoundsExceptionClass } from "../javalang/IndexOutOfBoundsExceptionClass.ts";
import { NullPointerExceptionClass } from "../javalang/NullPointerExceptionClass.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../javalang/ObjectClassStringClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { ComparatorInterface } from "./ComparatorInterface.ts";
import { SystemCollection } from "./SystemCollection.ts";

export class ArrayListClass extends SystemCollection implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class ArrayList<E> implements List<E>", comment: JRC.arrayListClassComment },

        { type: "method", signature: "ArrayList()", native: ArrayListClass.prototype._constructor, comment: JRC.arrayListConstructorComment },

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

    protected elements: ObjectClassOrNull[] = [];

    constructor(elements?: ObjectClassOrNull[]) {
        super();
        this.elements = elements || [];
    }

    _constructor() {
        return this;
    }

    _mj$forEach$void$Consumer(t: Thread, callback: CallbackFunction, consumer: ConsumerInterface) {
        let index: number = -1;

        let f = () => {
            index++;
            if (index < this.elements.length) {
                consumer._mj$accept$void$T(t, f, this.elements[index]);
            } else {
                if (callback) callback();
            }
        }

        f();

    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) {
            t.s.push("[]");
            if (callback) callback();
            return;
        }
        let element = this.elements[0];
        if (typeof element == "object" || Array.isArray(element) || element == null) {
            t._arrayOfObjectsToString(this.elements, () => {
                t.s.push(new StringClass(t.s.pop()));
                if (callback) callback();
            })
            return;
        } else {
            t.s.push(new StringClass(t._primitiveElementOrArrayToString(this.elements)));
            if (callback) callback();
            return;
        }
    }

    _iterator() {

        let iterator = new ObjectClass();

        let nextIndex = 0;

        //@ts-ignore
        iterator["_mj$hasNext$boolean$"] = (t: Thread, callback: CallbackFunction) => {
            t.s.push(nextIndex < this.elements.length);
            if (callback) callback();
        }

        //@ts-ignore
        iterator["_mj$next$E$"] = (t: Thread, callback: CallbackFunction) => {
            if (nextIndex < this.elements.length) nextIndex++;
            t.s.push(this.elements[nextIndex - 1]);
            if (callback) callback();
        }

        return iterator;
    }

    getElements(): any[] {
        return this.elements;
    }

    _add(element: ObjectClassOrNull) {
        this.elements.push(element);
    }

    _addWithIndex(index: number, element: ObjectClassOrNull) {
        if (index < 0 || index > this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }

        this.elements.splice(index, 0, element);
        return true;
    }

    _removeWithIndex(index: number) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }

        return this.elements.splice(index, 1)[0];
    }

    _setWithIndex(index: number, element: ObjectClassOrNull) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }

        let ret = this.elements[index];

        this.elements[index] = element;
        return ret;
    }

    _getWithIndex(index: number) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }

        return this.elements[index];
    }

    _addAll(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {

        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionAddAllNullPointerException());
            return;
        }

        if (collection instanceof SystemCollection) {
            this.elements = this.elements.concat(collection.getElements());
            t.s.push(true);
            if (callback) callback();
            return;
        }

        collection._mj$toArray$Object_I$(t, () => {
            let newElements = t.s.pop();
            if (newElements != null && Array.isArray(newElements)) {
                this.elements = this.elements.concat(newElements);
                t.s.push(true);
                if (callback) callback();
            }
        })

    }

    _addAllWithIndex(t: Thread, callback: CallbackFunction, index: number, collection: CollectionInterface) {

        if (index < 0 || index > this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }

        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionAddAllNullPointerException());
        }

        if (collection instanceof SystemCollection) {
            this.elements.splice(index, 0, ...collection.getElements())
            t.s.push(true);
            if (callback) callback();
            return;
        }

        collection._mj$toArray$Object_I$(t, () => {
            let newElements = t.s.pop();
            if (newElements != null && Array.isArray(newElements)) {
                this.elements.splice(index, 0, ...newElements)
                t.s.push(true);
                if (callback) callback();
            }
        })

    }

    _clear() {
        this.elements.length = 0;
    }

    _mj$contains$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        this._mj$indexOf$int$E(t, () => {
            let index = t.s.pop();
            t.s.push(index >= 0);
            if (callback) callback();
        }, element);
    }

    _mj$containsAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {

        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionContainsAllNullPointerException());
            return;
        }


        let f = (t: Thread, callback: CallbackFunction, elementsToCheck: any[]) => {

            if (elementsToCheck.length > 0) {
                this._mj$contains$boolean$E(t, () => {
                    if (t.s.pop()) {
                        f(t, callback, elementsToCheck);
                    } else {
                        t.s.push(false);
                        if (callback) callback();
                    }
                }, elementsToCheck.pop());
            } else {
                t.s.push(true);
                if (callback) callback();
            }

        }

        if (collection instanceof SystemCollection) {
            let elementsToCheck = collection.getElements().slice();
            f(t, callback, elementsToCheck);
            return;
        } else {
            collection._mj$toArray$Object_I$(t, () => {
                let elementsToCheck = <any[]>t.s.pop();
                f(t, callback, elementsToCheck.slice());
                return;
            })
        }
    }

    _isEmpty() {
        return this.elements.length == 0;
    }

    _size() {
        return this.elements.length;
    }

    _toArray() {
        return this.elements.slice();
    }

    _mj$remove$boolean$E(t: Thread, callback: CallbackFunction, o: ObjectClassOrNull) {

        this._mj$indexOf$int$E(t, () => {
            let index = t.s.pop();
            if (index >= 0) {
                this.elements.splice(index, 1)
                t.s.push(true);
            } else {
                t.s.push(false);
            }
            if (callback) callback();
            return;
        }, o)
    }

    _removeAll(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {

        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionRemoveAllNullPointerException());
            return;
        }

        let oldLength = this.elements.length;

        let f = (t: Thread, callback: CallbackFunction, elementsToRemove: any[]) => {

            if (elementsToRemove.length > 0) {
                this._mj$remove$boolean$E(t, () => { f(t, callback, elementsToRemove); }, elementsToRemove.pop());
            } else {
                t.s.push(this.elements.length != oldLength);
                if (callback) callback();
            }

        }

        if (collection instanceof SystemCollection) {
            let elementsToRemove = collection.getElements().slice();
            f(t, callback, elementsToRemove);
            return;
        } else {
            collection._mj$toArray$Object_I$(t, () => {
                let elementsToRemove = <any[]>t.s.pop();
                f(t, callback, elementsToRemove.slice());
                return;
            })
        }

    }

    _mj$indexOf$int$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        let firstIndex: number = -1;
        if (element == null || element._mj$equals$boolean$Object == ObjectClass.prototype._mj$equals$boolean$Object) {
            firstIndex = this.elements.indexOf(element);
            t.s.push(firstIndex);
            if (callback) callback();
        } else {
            let index = 0;
            let f = () => {
                if (index >= this.elements.length) {
                    t.s.push(-1);
                    if (callback) callback();
                    return;
                } else {
                    element._mj$equals$boolean$Object(t, () => {
                        if (t.s.pop()) {
                            t.s.push(index);
                            if (callback) callback();
                            return;
                        } else {
                            index++;
                            f();
                        }
                    }, this.elements[index])
                }
            }
            f();
        }


    }

    _mj$sort$void$Comparator(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface) {
        SystemCollection.sortWithComparator(t, callback, comparator, this);
    }
    // _mj$sort$void$Comparator(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface) {

    //     let that = this;

    //     if (this.elements.length <= 1) {
    //         if (callback) callback(); // nothing to do
    //     } else {
    //         ArrayListClass.prototype.quicksort.call(that, t, callback, comparator, 0, this.elements.length - 1);
    //     }
    // }

    // quicksort(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface, fromIndex: number, toIndex: number) {
    //     let that = this;

    //     if (toIndex - fromIndex <= 1) {
    //         if (callback) callback(); // nothing to do
    //         return;
    //     }

    //     ArrayListClass.prototype.partition.call(that, t, () => {

    //         let partitionIndex: number = t.s.pop();
    //         ArrayListClass.prototype.quicksort.call(that, t, () => {
    //             ArrayListClass.prototype.quicksort.call(that, t, () => {
    //                 if (callback) callback();
    //                 return;
    //             }, comparator, partitionIndex + 1, toIndex);
    //         }, comparator, fromIndex, partitionIndex - 1);


    //     }, comparator, fromIndex, toIndex);

    // }

    // private partition(t: Thread, callback: () => void, comparator: ComparatorInterface, begin: number, end: number) {

    //     let that = this;

    //     let pivot: ObjectClass = that.elements[end];
    //     let i: number = begin - 1;

    //     let j = begin;
    //     let loop = () => {
    //         if (j < end) {
    //             comparator._mj$compare$int$T$T(t, () => {
    //                 if (t.s.pop() <= 0) {
    //                     i++;

    //                     let z = that.elements[i];
    //                     that.elements[i] = that.elements[j];
    //                     that.elements[j] = z;
    //                     j++;
    //                     loop();
    //                 } else {
    //                     j++;
    //                     loop();
    //                 }
    //             }, that.elements[j], pivot);
    //         } else {
    //             // after for-loop
    //             let z = that.elements[i + 1];
    //             that.elements[i + 1] = that.elements[end];
    //             that.elements[end] = z;
    //             t.s.push(i + 1);
    //             callback();
    //             return;
    //         }
    //     }

    //     loop();


    // }



}