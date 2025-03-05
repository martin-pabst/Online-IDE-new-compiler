import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { QueueInterface } from "./QueueInterface.ts";

export class DequeInterface extends QueueInterface {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface Deque<E> extends Queue<E>", comment: JRC.dequeInterfaceComment },

        { type: "method", signature: "boolean removeFirstOccurrence(E element)", java: DequeInterface.prototype._mj$removeFirstOccurrence$boolean$E, comment: JRC.dequeRemoveFirstOccurrenceComment },
        { type: "method", signature: "boolean removeLastOccurrence(E element)", java: DequeInterface.prototype._mj$removeLastOccurrence$boolean$E, comment: JRC.dequeRemoveLastOccurrenceComment },
        { type: "method", signature: "void addFirst(E element)", java: DequeInterface.prototype._mj$addFirst$void$E, comment: JRC.dequeAddFirstComment },
        { type: "method", signature: "void addLast(E element)", java: DequeInterface.prototype._mj$addLast$void$E, comment: JRC.dequeAddLastComment },
        { type: "method", signature: "E removeFirst()", java: DequeInterface.prototype._mj$removeFirst$E$, comment: JRC.dequeRemoveFirstComment },
        { type: "method", signature: "E removeLast()", java: DequeInterface.prototype._mj$removeLast$E$, comment: JRC.dequeRemoveLastComment },
        { type: "method", signature: "E peekFirst()", java: DequeInterface.prototype._mj$peekFirst$E$, comment: JRC.dequePeekFirstComment },
        { type: "method", signature: "E peekLast()", java: DequeInterface.prototype._mj$peekLast$E$, comment: JRC.dequePeekLastComment },
        { type: "method", signature: "E pop()", java: DequeInterface.prototype._mj$pop$E$, comment: JRC.dequePopComment },
        { type: "method", signature: "void push(E element)", java: DequeInterface.prototype._mj$push$void$E, comment: JRC.dequePushComment },
        { type: "method", signature: "Iterator<E> descendingIterator()", java: DequeInterface.prototype._mj$descendingIterator$Iterator$, comment: JRC.dequeDescendingIteratorComment },

    ]

    static type: NonPrimitiveType;

    _mj$removeFirstOccurrence$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClass) { }

    _mj$removeLastOccurrence$boolean$E(t: Thread, callback: CallbackFunction, element: ObjectClass) { }

    _mj$addFirst$void$E(t: Thread, callback: CallbackFunction, element: ObjectClass) { }

    _mj$addLast$void$E(t: Thread, callback: CallbackFunction, element: ObjectClass) { }

    _mj$removeFirst$E$(t: Thread, callback: CallbackFunction) { }

    _mj$removeLast$E$(t: Thread, callback: CallbackFunction) { }

    _mj$peekFirst$E$(t: Thread, callback: CallbackFunction) { }

    _mj$peekLast$E$(t: Thread, callback: CallbackFunction) { }

    _mj$pop$E$(t: Thread, callback: CallbackFunction) { }

    _mj$push$void$E(t: Thread, callback: CallbackFunction, element: ObjectClass) { }

    _mj$descendingIterator$Iterator$(t: Thread, callback: CallbackFunction) { }


}