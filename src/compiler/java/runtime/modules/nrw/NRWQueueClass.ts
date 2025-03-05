import { BaseListType } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { SystemCollection } from "../../system/collections/SystemCollection.ts";
import { ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NRWLang } from "./NRWLang.ts";

class QueueNode {
    next: QueueNode | null = null;

    constructor(public contentObject: ObjectClassOrNull) {

    }
}


export class NRWQueueClass extends SystemCollection implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Queue<ContentType>", comment: NRWLang.queueClassComment },

        { type: "method", signature: "Queue()", native: NRWQueueClass.prototype._constructor, comment: NRWLang.queueClassConstructorComment },

        { type: "method", signature: "boolean isEmpty()", native: NRWQueueClass.prototype._isEmpty, comment: NRWLang.queueClassIsEmptyComment },
        { type: "method", signature: "void enqueue(ContentType pContent)", native: NRWQueueClass.prototype._enqueue, comment: NRWLang.queueClassEnqueueComment },
        { type: "method", signature: "void dequeue()", native: NRWQueueClass.prototype._dequeue, comment: NRWLang.queueClassDequeueComment },
        { type: "method", signature: "ContentType front()", native: NRWQueueClass.prototype._front, comment: NRWLang.queueClassFrontComment },

        { type: "method", signature: "String toString()", java: NRWQueueClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    head: QueueNode = null;
    tail: QueueNode = null;


    constructor() {
        super();
    }

    _constructor() {
        return this;
    }

    _isEmpty(): boolean {
        return this.head == null;
    }

    _enqueue(pContent: ObjectClassOrNull) {
        if (pContent != null) {
            const newNode: QueueNode = new QueueNode(pContent);
            if (this._isEmpty()) {
                this.head = newNode;
                this.tail = newNode;
            } else {
                this.tail.next = newNode;
                this.tail = newNode;
            }
        }
    }

    _dequeue() {
        if (!this._isEmpty()) {
            this.head = this.head.next;
            if (this._isEmpty()) {
                this.head = null;
                this.tail = null;
            }
        }
    }

    _front(): ObjectClassOrNull {
        if (this._isEmpty()) {
			return null;
		} else {
			return this.head.contentObject;
		}

    }




    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.head == null) {
            t.s.push("[]");
            if (callback) callback();
            return;
        }
        let element = this.head.contentObject;
        if (typeof element == "object" || Array.isArray(element) || element == null) {
            t._arrayOfObjectsToString(this.getElements(), () => {
                t.s.push(new StringClass(t.s.pop()));
                if (callback) callback();
            })
            return;
        } else {
            t.s.push(new StringClass(t._primitiveElementOrArrayToString(this.getElements())));
            if (callback) callback();
            return;
        }
    }

    getElements(): ObjectClassOrNull[] {
        if (this.head == null) return [];
        const elements: ObjectClassOrNull[] = [];
        let node = this.head;
        while (node != null) {
            elements.push(node.contentObject);
            node = node.next;
        }
        return elements;
    }




}