import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass.ts";
import { CollectionInterface } from "./CollectionInterface.ts";
import { ComparatorInterface } from "./ComparatorInterface.ts";

export class QueueInterface extends CollectionInterface {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface Queue<E> extends Collection<E>", comment: JRC.queueInterfaceComment },
        { type: "method", signature: "E remove()", java: QueueInterface.prototype._mj$remove$E$, comment: JRC.queueRemoveComment },
        { type: "method", signature: "E poll()", java: QueueInterface.prototype._mj$poll$E$, comment: JRC.queuePollComment },
        { type: "method", signature: "E peek()", java: QueueInterface.prototype._mj$peek$E$, comment: JRC.queuePeekComment },
        { type: "method", signature: "boolean offer(E element)", java: QueueInterface.prototype._mj$offer$boolean$E, comment: JRC.queueOfferComment },

    ]

    static type: NonPrimitiveType;

    _mj$remove$E$(t: Thread, callback: CallbackFunction) { }

    _mj$poll$E$(t: Thread, callback: CallbackFunction) { }

    _mj$peek$E$(t: Thread, callback: CallbackFunction) { }

    _mj$offer$boolean$E(t: Thread, callback: CallbackFunction) { }

}