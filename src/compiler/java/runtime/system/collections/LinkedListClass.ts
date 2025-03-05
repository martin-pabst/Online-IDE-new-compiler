import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { NullPointerExceptionClass } from "../javalang/NullPointerExceptionClass.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../javalang/ObjectClassStringClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { SystemCollection } from "./SystemCollection.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { ConsumerInterface } from "../functional/ConsumerInterface.ts";
import { BaseListType } from "../../../../common/BaseType.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { RuntimeExceptionClass } from "../javalang/RuntimeException.ts";
import { IndexOutOfBoundsExceptionClass } from "../javalang/IndexOutOfBoundsExceptionClass.ts";
import { ComparatorInterface } from "./ComparatorInterface.ts";

export class LinkedListClass extends ObjectClass implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class LinkedList<E> implements Deque<E>" },

        { type: "method", signature: "LinkedList()", native: LinkedListClass.prototype._constructor, comment: JRC.linkedListConstructorComment },

        // from IterableInterface
        { type: "method", signature: "Iterator<E> iterator()", native: LinkedListClass.prototype._iterator, comment: JRC.iterableIteratorComment },
        { type: "method", signature: "void forEach(Consumer<? super E> action)", java: LinkedListClass.prototype._mj$forEach$void$Consumer, comment: JRC.iterableForEachComment },

        // from CollectionInterface
        { type: "method", signature: "Object[] toArray()", native: LinkedListClass.prototype._toArray, template: "§1.elements.slice()", comment: JRC.collectionToArrayComment },
        { type: "method", signature: "<T> T[] toArray(T[] a)", native: LinkedListClass.prototype._toArray, template: "§1.elements.slice()", comment: JRC.collectionToArrayComment2 },
        { type: "method", signature: "boolean add(E e)", native: LinkedListClass.prototype._add, template: "(§1.elements.push(§2) >= 0)", comment: JRC.collectionAddElementComment },
        { type: "method", signature: "boolean addAll(Collection<? extends E> c)", java: LinkedListClass.prototype._addAll, comment: JRC.collectionAddAllComment },
        { type: "method", signature: "void clear()", native: LinkedListClass.prototype._clear, template: "§1.elements.length = 0", comment: JRC.collectionClearComment },
        { type: "method", signature: "boolean contains(E Element)", java: LinkedListClass.prototype._mj$contains$boolean$Object, comment: JRC.collectionContainsComment },
        { type: "method", signature: "boolean containsAll(Collection<?> c)", java: LinkedListClass.prototype._mj$containsAll$boolean$Collection, comment: JRC.collectionContainsAllComment },
        { type: "method", signature: "boolean isEmpty()", native: LinkedListClass.prototype._isEmpty, template: "(§1.elements.length == 0)", comment: JRC.collectionIsEmptyComment },
        { type: "method", signature: "boolean remove(E element)", java: LinkedListClass.prototype._mj$remove$boolean$E, comment: JRC.collectionRemoveObjectComment },
        { type: "method", signature: "boolean removeAll(Collection<?> c)", java: LinkedListClass.prototype._removeAll, comment: JRC.collectionRemoveAllComment },
        { type: "method", signature: "int size()", native: LinkedListClass.prototype._size, template: "§1.elements.length", comment: JRC.collectionSizeComment },

        // from Queue
        { type: "method", signature: "E remove()", java: LinkedListClass.prototype._mj$remove$E$, comment: JRC.queueRemoveComment },
        { type: "method", signature: "E poll()", java: LinkedListClass.prototype._mj$poll$E$, comment: JRC.queuePollComment },
        { type: "method", signature: "E peek()", java: LinkedListClass.prototype._mj$peek$E$, comment: JRC.queuePeekComment },
        { type: "method", signature: "boolean offer(E element)", native: LinkedListClass.prototype._add, template: "(§1.elements.push(§2) >= 0)", comment: JRC.queueOfferComment },


        // from Deque
        { type: "method", signature: "boolean removeFirstOccurrence(E element)", java: LinkedListClass.prototype._mj$removeFirstOccurrence$boolean$E, comment: JRC.dequeRemoveFirstOccurrenceComment },
        { type: "method", signature: "boolean removeLastOccurrence(E element)", java: LinkedListClass.prototype._mj$removeLastOccurrence$boolean$E, comment: JRC.dequeRemoveLastOccurrenceComment },
        { type: "method", signature: "void addFirst(E element)", java: LinkedListClass.prototype._mj$addFirst$void$E, comment: JRC.dequeAddFirstComment },
        { type: "method", signature: "void addLast(E element)", java: LinkedListClass.prototype._mj$addLast$void$E, comment: JRC.dequeAddLastComment },
        { type: "method", signature: "E removeFirst()", java: LinkedListClass.prototype._mj$removeFirst$E$, comment: JRC.dequeRemoveFirstComment },
        { type: "method", signature: "E removeLast()", java: LinkedListClass.prototype._mj$removeLast$E$, comment: JRC.dequeRemoveLastComment },
        { type: "method", signature: "E peekFirst()", java: LinkedListClass.prototype._mj$peekFirst$E$, comment: JRC.dequePeekFirstComment },
        { type: "method", signature: "E peekLast()", java: LinkedListClass.prototype._mj$peekLast$E$, comment: JRC.dequePeekLastComment },
        { type: "method", signature: "E pop()", java: LinkedListClass.prototype._mj$pop$E$, comment: JRC.dequePopComment },
        { type: "method", signature: "void push(E element)", java: LinkedListClass.prototype._mj$push$void$E, comment: JRC.dequePushComment },
        { type: "method", signature: "Iterator<E> descendingIterator()", java: LinkedListClass.prototype._mj$descendingIterator$Iterator$, comment: JRC.dequeDescendingIteratorComment },

        // from ListInterface
        { type: "method", signature: "boolean add(int index, E element)", native: LinkedListClass.prototype._addWithIndex, comment: JRC.listAddElementComment },
        { type: "method", signature: "E get (int index)", native: LinkedListClass.prototype._getWithIndex, comment: JRC.listGetComment },
        { type: "method", signature: "int indexOf (E Element)", java: LinkedListClass.prototype._mj$indexOf$int$E, comment: JRC.listIndexOfComment },
        { type: "method", signature: "E remove (int index)", native: LinkedListClass.prototype._removeWithIndex, comment: JRC.listRemoveComment },
        { type: "method", signature: "E set (int index, E Element)", native: LinkedListClass.prototype._setWithIndex, comment: JRC.listSetComment },
        { type: "method", signature: "void sort(Comparator<? super E> comparator)", java: LinkedListClass.prototype._mj$sort$void$Comparator, comment: JRC.listSortComment },

        // override toString-method
        { type: "method", signature: "String toString()", java: LinkedListClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    protected elements: ObjectClassOrNull[] = [];

    _constructor() {
        return this;
    }


    // from Queue:
    _mj$remove$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) throw new RuntimeExceptionClass(JRC.linkedListIsEmptyError());
        t.s.push(this.elements.shift());
        if (callback) callback();
        return;
    }

    _mj$poll$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) {
            t.s.push(null);
        } else {
            t.s.push(this.elements.shift());
        }
        if (callback) callback();
        return;
    }

    _mj$peek$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) {
            t.s.push(null);
        } else {
            t.s.push(this.elements[0]);
        }
        if (callback) callback();
        return;
    }


    // from Deque:
    _mj$removeFirstOccurrence$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        let firstIndex: number = -1;
        if (element == null || element._mj$equals$boolean$Object == ObjectClass.prototype._mj$equals$boolean$Object) {
            firstIndex = this.elements.indexOf(element);
            if (firstIndex < 0) {
                t.s.push(false);
            } else {
                this.elements.splice(firstIndex, 1);
                t.s.push(true);
            }
            if (callback) callback();
        } else {
            let index = 0;
            let f = () => {
                if (index >= this.elements.length) {
                    t.s.push(false);
                    if (callback) callback();
                    return;
                } else {
                    element._mj$equals$boolean$Object(t, () => {
                        if (t.s.pop()) {
                            this.elements.splice(index, 1);
                            t.s.push(true);
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

    _mj$removeLastOccurrence$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        let lastIndex: number = -1;
        if (element == null || element._mj$equals$boolean$Object == ObjectClass.prototype._mj$equals$boolean$Object) {
            lastIndex = this.elements.lastIndexOf(element);
            if (lastIndex < 0) {
                t.s.push(false);
            } else {
                this.elements.splice(lastIndex, 1);
                t.s.push(true);
            }
            if (callback) callback();
        } else {
            let index = this.elements.length - 1;
            let f = () => {
                if (index < 0) {
                    t.s.push(false);
                    if (callback) callback();
                    return;
                } else {
                    element._mj$equals$boolean$Object(t, () => {
                        if (t.s.pop()) {
                            this.elements.splice(index, 1);
                            t.s.push(true);
                            if (callback) callback();
                            return;
                        } else {
                            index--;
                            f();
                        }
                    }, this.elements[index])
                }
            }
            f();
        }
    }

    _mj$addFirst$void$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        this.elements.unshift(element);
        if (callback) callback();
        return;
    }

    _mj$addLast$void$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        this.elements.push(element);
        if (callback) callback();
        return;
    }

    _mj$removeFirst$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) throw new RuntimeExceptionClass(JRC.linkedListIsEmptyError());
        t.s.push(this.elements.shift());
        if (callback) callback();
        return;
    }

    _mj$removeLast$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) throw new RuntimeExceptionClass(JRC.linkedListIsEmptyError());
        t.s.push(this.elements.pop());
        if (callback) callback();
        return;
    }

    _mj$peekFirst$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) {
            t.s.push(null);
        } else {
            t.s.push(this.elements[0]);
        }
        if (callback) callback();
        return;
    }

    _mj$peekLast$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) {
            t.s.push(null);
        } else {
            t.s.push(this.elements[this.elements.length - 1]);
        }
        if (callback) callback();
        return;

    }

    _mj$pop$E$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) throw new RuntimeExceptionClass(JRC.linkedListIsEmptyError());
        t.s.push(this.elements.pop());
        if (callback) callback();
        return;
    }

    _mj$push$void$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        this.elements.push(element);
        if (callback) callback();
        return;
    }

    _mj$descendingIterator$Iterator$(t: Thread, callback: CallbackFunction) {
        let iterator = new ObjectClass();

        let nextIndex = this.elements.length - 1;

        //@ts-ignore
        iterator["_mj$hasNext$boolean$"] = (t: Thread, callback: CallbackFunction) => {
            t.s.push(nextIndex >= 0);
            if (callback) callback();
        }

        //@ts-ignore
        iterator["_mj$next$E$"] = (t: Thread, callback: CallbackFunction) => {
            if (nextIndex >= 0) nextIndex--;
            t.s.push(this.elements[nextIndex + 1]);
            if (callback) callback();
        }

        t.s.push(iterator);
        if (callback) callback();
        return;

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

    getAllElements(): ObjectClassOrNull[] {
        return this.elements;
    }

    _add(element: ObjectClassOrNull) {
        this.elements.push(element);
        return true;
    }

    _addAll(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {

        if (collection == null) {
            throw new NullPointerExceptionClass("LinkedList.addAll wurde mit null als Argument aufgerufen.");
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


    _clear() {
        this.elements.length = 0;
    }

    _mj$contains$boolean$Object(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        this._mj$indexOf$int$E(t, () => {
            let index = t.s.pop();
            t.s.push(index >= 0);
            if (callback) callback();
        }, element);
    }

    _mj$containsAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {

        if (collection == null) {
            throw new NullPointerExceptionClass("ArrayList.containsAll wurde mit null als Argument aufgerufen.");
            return;
        }


        let f = (t: Thread, callback: CallbackFunction, elementsToCheck: any[]) => {

            if (elementsToCheck.length > 0) {
                this._mj$contains$boolean$Object(t, () => {
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


    _size() {
        return this.elements.length;
    }

    _toArray() {
        return this.elements.slice();
    }

    _removeAll(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {

        if (collection == null) {
            throw new NullPointerExceptionClass("LinkedList.removeAll wurde mit null als Argument aufgerufen.");
            return;
        }

        if (collection instanceof SystemCollection) {
            let oldLength = this.elements.length;
            let elementsToRemove = collection.getElements();
            this.elements = this.elements.filter(element => elementsToRemove.indexOf(element) < 0);
            t.s.push(this.elements.length != oldLength);
            if (callback) callback();
            return;
        }

        collection._mj$toArray$Object_I$(t, () => {
            let elementsToRemove = t.s.pop();
            let oldLength = this.elements.length;
            if (elementsToRemove != null && Array.isArray(elementsToRemove)) {
                this.elements = this.elements.filter(element => elementsToRemove.indexOf(element) < 0);
                t.s.push(this.elements.length != oldLength);
                if (callback) callback();
            }
        })

    }

    getElements(): any[] {
        return this.elements;
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


    _mj$sort$void$Comparator(t: Thread, callback: CallbackFunction, comparator: ComparatorInterface) {
        SystemCollection.sortWithComparator(t, callback, comparator, this);
    }
}