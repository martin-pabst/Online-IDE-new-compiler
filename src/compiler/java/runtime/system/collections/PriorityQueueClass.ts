import { BaseListType } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ConsumerInterface } from "../functional/ConsumerInterface.ts";
import { ClassCastExceptionClass } from "../javalang/ClassCastExceptionClass.ts";
import { IllegalArgumentExceptionClass } from "../javalang/IllegalArgumentException.ts";
import { NoSuchElementExceptionClass } from "../javalang/NoSuchElementException.ts";
import { NullPointerExceptionClass } from "../javalang/NullPointerExceptionClass.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../javalang/ObjectClassStringClass.ts";
import { BooleanClass } from "../primitiveTypes/wrappers/BooleanClass.ts";
import { CharacterClass } from "../primitiveTypes/wrappers/CharacterClass.ts";
import { NumberClass } from "../primitiveTypes/wrappers/NumberClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { ComparableInterface } from "./ComparableInterface.ts";
import { ComparatorInterface } from "./ComparatorInterface.ts";
import { SystemCollection } from "./SystemCollection.ts";
import { SystemStreamClass } from "./SystemStreamClass.ts";

/**
 * Elements whose natural ordering (and equality) can be evaluated synchronously, i.e.
 * without calling compareTo/equals methods which might be user-written java code.
 */
type SynchronousKind = "string" | "number" | "char" | "boolean";

/**
 * PriorityQueue backed by an array that is kept sorted by priority:
 *  - elements[0] is the head (least element),
 *  - elements of equal priority are kept in insertion order (FIFO),
 *  - iterator, toArray, toString and for-each loops deliver elements in priority order.
 *
 * Comparisons are done synchronously if no comparator is given and the elements are
 * Strings or wrapper objects (Integer, Double, Character, Boolean, ...). Otherwise
 * Comparator.compare respectively Comparable.compareTo is called with callbacks as it
 * may be user-written java code.
 */
export class PriorityQueueClass extends SystemCollection implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class PriorityQueue<E> implements Queue<E>", comment: JRC.priorityQueueClassComment },

        { type: "method", signature: "PriorityQueue()", native: PriorityQueueClass.prototype._constructor, comment: JRC.priorityQueueConstructorComment },
        // Comparator-constructor has to be declared before Collection-constructor: Overload resolution doesn't
        // consider lambda arguments, so new PriorityQueue<>((a, b) -> ...) takes the first constructor with one parameter.
        { type: "method", signature: "PriorityQueue(Comparator<? super E> comparator)", native: PriorityQueueClass.prototype._constructorWithComparator, comment: JRC.priorityQueueConstructorComparatorComment },
        { type: "method", signature: "PriorityQueue(Collection<? extends E> c)", java: PriorityQueueClass.prototype._constructorWithCollection, comment: JRC.priorityQueueConstructorCollectionComment },

        // from Iterable
        { type: "method", signature: "Iterator<E> iterator()", native: PriorityQueueClass.prototype._iterator, comment: JRC.priorityQueueIteratorComment },
        { type: "method", signature: "void forEach(Consumer<? super E> action)", java: PriorityQueueClass.prototype._mj$forEach$void$Consumer, comment: JRC.iterableForEachComment },

        // from Collection
        { type: "method", signature: "boolean add(E e)", java: PriorityQueueClass.prototype._mj$add$boolean$E, comment: JRC.priorityQueueAddComment },
        { type: "method", signature: "boolean addAll(Collection<? extends E> c)", java: PriorityQueueClass.prototype._mj$addAll$boolean$Collection, comment: JRC.collectionAddAllComment },
        { type: "method", signature: "void clear()", native: PriorityQueueClass.prototype._clear, comment: JRC.collectionClearComment },
        { type: "method", signature: "boolean contains(Object o)", java: PriorityQueueClass.prototype._mj$contains$boolean$E, comment: JRC.collectionContainsComment },
        { type: "method", signature: "boolean containsAll(Collection<?> c)", java: PriorityQueueClass.prototype._mj$containsAll$boolean$Collection, comment: JRC.collectionContainsAllComment },
        { type: "method", signature: "boolean isEmpty()", native: PriorityQueueClass.prototype._isEmpty, comment: JRC.collectionIsEmptyComment },
        { type: "method", signature: "boolean remove(Object o)", java: PriorityQueueClass.prototype._mj$remove$boolean$E, comment: JRC.collectionRemoveObjectComment },
        { type: "method", signature: "boolean removeAll(Collection<?> c)", java: PriorityQueueClass.prototype._mj$removeAll$boolean$Collection, comment: JRC.collectionRemoveAllComment },
        { type: "method", signature: "int size()", native: PriorityQueueClass.prototype._size, comment: JRC.collectionSizeComment },
        { type: "method", signature: "Object[] toArray()", native: PriorityQueueClass.prototype._toArray, comment: JRC.priorityQueueToArrayComment },
        { type: "method", signature: "<T> T[] toArray(T[] a)", native: PriorityQueueClass.prototype._toArray, comment: JRC.priorityQueueToArrayComment },
        { type: "method", signature: "Stream<E> stream()", java: PriorityQueueClass.prototype._mj$stream$Stream$, comment: JRC.collectionStreamComment },

        // from Queue
        { type: "method", signature: "boolean offer(E e)", java: PriorityQueueClass.prototype._mj$add$boolean$E, comment: JRC.priorityQueueAddComment },
        { type: "method", signature: "E peek()", native: PriorityQueueClass.prototype._peek, comment: JRC.priorityQueuePeekComment },
        { type: "method", signature: "E poll()", native: PriorityQueueClass.prototype._poll, comment: JRC.priorityQueuePollComment },
        { type: "method", signature: "E remove()", native: PriorityQueueClass.prototype._removeHead, comment: JRC.priorityQueueRemoveHeadComment },
        { type: "method", signature: "E element()", native: PriorityQueueClass.prototype._element, comment: JRC.priorityQueueElementComment },

        // override toString-method
        { type: "method", signature: "String toString()", java: PriorityQueueClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
    ]

    static type: NonPrimitiveType;

    /**
     * sorted by priority, elements[0] is the head of the queue
     */
    protected elements: ObjectClassOrNull[] = [];

    /**
     * null => natural ordering
     */
    protected comparator: ComparatorInterface | null = null;

    _constructor() {
        return this;
    }

    _constructorWithComparator(comparator: ComparatorInterface | null) {
        this.comparator = comparator;
        return this;
    }

    _constructorWithCollection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {
        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.arrayListConstructorNullPointerException());
        }

        if (collection instanceof PriorityQueueClass) {
            // elements are already sorted with respect to the same comparator
            this.comparator = collection.comparator;
            this.elements = collection.elements.slice();
            t.s.push(this);
            if (callback) callback();
            return;
        }

        this.getElementsOfCollection(t, collection, (newElements) => {
            this.insertAll(t, newElements, () => {
                t.s.push(this);
                if (callback) callback();
            })
        })
    }

    getElements(): ObjectClassOrNull[] {
        return this.elements;
    }

    /*
     * Methods from Queue
     */

    _peek(): ObjectClassOrNull {
        return this.elements.length == 0 ? null : this.elements[0];
    }

    _poll(): ObjectClassOrNull {
        return this.elements.length == 0 ? null : this.elements.shift()!;
    }

    _removeHead(): ObjectClassOrNull {
        if (this.elements.length == 0) {
            throw new NoSuchElementExceptionClass(JRC.priorityQueueIsEmptyException());
        }
        return this.elements.shift()!;
    }

    _element(): ObjectClassOrNull {
        if (this.elements.length == 0) {
            throw new NoSuchElementExceptionClass(JRC.priorityQueueIsEmptyException());
        }
        return this.elements[0];
    }

    /*
     * Methods from Collection
     */

    /**
     * add and offer
     */
    _mj$add$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClassOrNull) {
        this.insert(t, element, () => {
            t.s.push(true);
            if (callback) callback();
        });
    }

    _mj$addAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {
        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionAddAllNullPointerException());
        }

        if (collection == <any>this) {
            throw new IllegalArgumentExceptionClass(JRC.priorityQueueAddAllToItselfException());
        }

        this.getElementsOfCollection(t, collection, (newElements) => {
            this.insertAll(t, newElements, () => {
                t.s.push(newElements.length > 0);
                if (callback) callback();
            })
        })
    }

    _clear() {
        this.elements.length = 0;
    }

    _isEmpty(): boolean {
        return this.elements.length == 0;
    }

    _size(): number {
        return this.elements.length;
    }

    _toArray(): ObjectClassOrNull[] {
        return this.elements.slice();
    }

    /**
     * Named like Collection.contains(E) so that calls via interface Collection find it, too.
     * Is declared as contains(Object o) for java programs.
     */
    _mj$contains$boolean$E(t: Thread, callback: CallbackFunction, o: ObjectClassOrNull) {
        this.indexOf(t, this.elements, o, (index) => {
            t.s.push(index >= 0);
            if (callback) callback();
        })
    }

    _mj$containsAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {
        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionContainsAllNullPointerException());
        }

        this.getElementsOfCollection(t, collection, (elementsToCheck) => {
            PriorityQueueClass.loop(elementsToCheck.length, (index, next) => {
                this.indexOf(t, this.elements, elementsToCheck[index], (foundAt) => { next(foundAt >= 0) });
            }, (stopIndex) => {
                t.s.push(stopIndex == elementsToCheck.length);
                if (callback) callback();
            })
        })
    }

    /**
     * Named like Collection.remove(E) so that calls via interface Collection find it, too.
     * Is declared as remove(Object o) for java programs.
     */
    _mj$remove$boolean$E(t: Thread, callback: CallbackFunction, o: ObjectClassOrNull) {
        this.indexOf(t, this.elements, o, (index) => {
            if (index >= 0) this.elements.splice(index, 1);
            t.s.push(index >= 0);
            if (callback) callback();
        })
    }

    /**
     * Removes every element e of this queue for which collection contains an element r with e.equals(r) (like java).
     */
    _mj$removeAll$boolean$Collection(t: Thread, callback: CallbackFunction, collection: CollectionInterface) {
        if (collection == null) {
            throw new NullPointerExceptionClass(JRC.collectionRemoveAllNullPointerException());
        }

        this.getElementsOfCollection(t, collection, (elementsToRemove) => {
            let oldElements = this.elements.slice();
            let elementsToKeep: ObjectClassOrNull[] = [];

            PriorityQueueClass.loop(oldElements.length, (index, next) => {
                this.indexOf(t, elementsToRemove, oldElements[index], (foundAt) => {
                    if (foundAt < 0) elementsToKeep.push(oldElements[index]);
                    next(true);
                })
            }, () => {
                let changed = elementsToKeep.length != this.elements.length;
                this.elements.length = 0;
                for (let e of elementsToKeep) this.elements.push(e);
                t.s.push(changed);
                if (callback) callback();
            })
        })
    }

    _mj$stream$Stream$(t: Thread, callback: CallbackFunction) {
        t.s.push(new SystemStreamClass(this.elements.slice()));
        if (callback) callback();
    }

    /*
     * Methods from Iterable
     */

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
            if (nextIndex >= this.elements.length) {
                throw new NoSuchElementExceptionClass(JRC.priorityQueueIteratorNoMoreElementsException());
            }
            t.s.push(this.elements[nextIndex++]);
            if (callback) callback();
        }

        return iterator;
    }

    _mj$forEach$void$Consumer(t: Thread, callback: CallbackFunction, consumer: ConsumerInterface) {
        let elements = this.elements.slice();

        PriorityQueueClass.loop(elements.length, (index, next) => {
            consumer._mj$accept$void$T(t, () => { next(true) }, elements[index]);
        }, () => {
            if (callback) callback();
        })
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.elements.length == 0) {
            t.s.push(new StringClass("[]"));
            if (callback) callback();
            return;
        }

        t._arrayOfObjectsToString(this.elements, () => {
            t.s.push(new StringClass(t.s.pop()));
            if (callback) callback();
        })
    }

    /*
     * Internal helpers
     */

    /**
     * Inserts element behind all elements with lower or equal priority (binary search),
     * then calls then(). then() may be called synchronously or - if user code had to be
     * called for comparisons - later.
     */
    private insert(t: Thread, element: ObjectClassOrNull, then: () => void) {
        if (element == null) {
            throw new NullPointerExceptionClass(JRC.priorityQueueNullElementException());
        }

        let lo = 0;
        let hi = this.elements.length;

        if (!this.comparator) {
            let kind = PriorityQueueClass.getSynchronousKind(element);
            if (kind) {
                // fast path: String or wrapper objects => synchronous binary search
                while (lo < hi) {
                    let mid = (lo + hi) >>> 1;
                    if (PriorityQueueClass.compareSynchronously(kind, element, this.elements[mid]) < 0) {
                        hi = mid;
                    } else {
                        lo = mid + 1;
                    }
                }
                this.elements.splice(lo, 0, element);
                then();
                return;
            }

            // like java: check even if queue is empty
            if (typeof (<any>element)._mj$compareTo$int$T != "function") {
                throw new ClassCastExceptionClass(JRC.priorityQueueNotComparableException(PriorityQueueClass.getClassName(element)));
            }
        }

        // binary search whose comparisons may call user code
        let search = () => {
            if (lo >= hi) {
                this.elements.splice(lo, 0, element);
                then();
                return;
            }
            let mid = (lo + hi) >>> 1;
            this.compare(t, element, this.elements[mid], (result) => {
                if (result < 0) {
                    hi = mid;
                } else {
                    lo = mid + 1;
                }
                search();
            });
        }

        search();
    }

    private insertAll(t: Thread, newElements: ObjectClassOrNull[], then: () => void) {
        PriorityQueueClass.loop(newElements.length, (index, next) => {
            this.insert(t, newElements[index], () => { next(true) });
        }, () => { then() });
    }

    /**
     * Compares a with b by comparator or - if no comparator is given - by natural ordering
     * and calls then(result).
     */
    private compare(t: Thread, a: ObjectClassOrNull, b: ObjectClassOrNull, then: (result: number) => void) {
        if (this.comparator) {
            this.comparator._mj$compare$int$T$T(t, () => { then(t.s.pop()) }, a, b);
            return;
        }

        let kind = PriorityQueueClass.getSynchronousKind(a);
        if (kind) {
            then(PriorityQueueClass.compareSynchronously(kind, a, b));
            return;
        }

        if (PriorityQueueClass.getSynchronousKind(b)) {
            throw new ClassCastExceptionClass(JRC.priorityQueueIncomparableTypesException(PriorityQueueClass.getClassName(a), PriorityQueueClass.getClassName(b)));
        }

        (<ComparableInterface><any>a)._mj$compareTo$int$T(t, () => { then(t.s.pop()) }, b!);
    }

    private static getSynchronousKind(o: any): SynchronousKind | undefined {
        if (o instanceof StringClass) return "string";
        if (o instanceof NumberClass) return "number";
        if (o instanceof CharacterClass) return "char";
        if (o instanceof BooleanClass) return "boolean";
        return undefined;
    }

    /**
     * Natural ordering of Strings and wrapper objects. Strings are compared like String.compareTo
     * does in this IDE (localeCompare).
     */
    private static compareSynchronously(kind: SynchronousKind, a: any, b: any): number {
        if (PriorityQueueClass.getSynchronousKind(b) !== kind) {
            throw new ClassCastExceptionClass(JRC.priorityQueueIncomparableTypesException(PriorityQueueClass.getClassName(a), PriorityQueueClass.getClassName(b)));
        }

        switch (kind) {
            case "string": return (<string>a.value).localeCompare(b.value);
            case "number": return a.value < b.value ? -1 : (a.value > b.value ? 1 : 0);
            case "char": return (<string>a.value).charCodeAt(0) - (<string>b.value).charCodeAt(0);
            case "boolean": return (a.value ? 1 : 0) - (b.value ? 1 : 0);
        }
    }

    private static getClassName(o: any): string {
        if (o instanceof ObjectClass) return o.getClassName();
        return o == null ? "null" : typeof o;
    }

    /**
     * Searches element in array using element.equals (like java) and calls then(index)
     * with index == -1 if not found.
     */
    private indexOf(t: Thread, array: ObjectClassOrNull[], element: ObjectClassOrNull, then: (index: number) => void) {
        if (element == null) {
            then(array.indexOf(null));
            return;
        }

        let kind = PriorityQueueClass.getSynchronousKind(element);
        if (kind) {
            // fast path: equals of String and wrapper objects compares values
            let value = (<any>element).value;
            then(array.findIndex(e => e != null && (<any>e).value == value && PriorityQueueClass.getSynchronousKind(e) == kind));
            return;
        }

        if (element._mj$equals$boolean$Object == ObjectClass.prototype._mj$equals$boolean$Object) {
            // equals is not overridden => identity
            then(array.indexOf(element));
            return;
        }

        PriorityQueueClass.loop(array.length, (index, next) => {
            element._mj$equals$boolean$Object(t, () => { next(!t.s.pop()) }, array[index]);
        }, (stopIndex) => {
            then(stopIndex < array.length ? stopIndex : -1);
        })
    }

    /**
     * Gets a copy of all elements of collection and calls then(elements).
     */
    private getElementsOfCollection(t: Thread, collection: CollectionInterface, then: (elements: ObjectClassOrNull[]) => void) {
        if (collection instanceof SystemCollection) {
            then(collection.getElements().slice());
            return;
        }

        collection._mj$toArray$Object_I$(t, () => {
            let elements = t.s.pop();
            then(Array.isArray(elements) ? elements.slice() : []);
        })
    }

    /**
     * Calls body(index, next) for index = 0, 1, ..., count - 1 one after another. body has to call
     * next(true) to continue with the next index or next(false) to stop. It may call next
     * synchronously or later (after user code like equals or compareTo returned). Synchronous calls
     * are handled iteratively, so long loops don't overflow the javascript call stack.
     * Finally done(stopIndex) is called with the index at which the loop stopped (count if it ran through).
     */
    private static loop(count: number, body: (index: number, next: (goOn: boolean) => void) => void,
        done: (stopIndex: number) => void) {

        const pending = 0, goOn = 1, stop = 2;
        let index = 0;

        let run = () => {
            while (index < count) {
                let isInsideBody = true;
                let state: number = pending;

                body(index, (continueLoop: boolean) => {
                    if (isInsideBody) {
                        // synchronous call: while-loop continues
                        state = continueLoop ? goOn : stop;
                    } else if (continueLoop) {
                        // asynchronous call: restart loop
                        index++;
                        run();
                    } else {
                        done(index);
                    }
                });

                isInsideBody = false;

                if (state == pending) return;   // loop is continued asynchronously
                if (state == stop) {
                    done(index);
                    return;
                }
                index++;
            }
            done(index);
        }

        run();
    }

}
