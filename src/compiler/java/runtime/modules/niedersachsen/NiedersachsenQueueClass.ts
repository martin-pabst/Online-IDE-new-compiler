import { FOR_EACH_VIA_GET_ELEMENTS } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { SystemCollection } from "../../system/collections/SystemCollection.ts";
import { IllegalArgumentExceptionClass } from "../../system/javalang/IllegalArgumentException.ts";
import { NoSuchElementExceptionClass } from "../../system/javalang/NoSuchElementException.ts";
import { ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NiedersachsenElementClass } from "./NiedersachsenElementClass.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";

/**
 * @see https://github.com/karlgerd/mk-nds-adt
 */
export class NiedersachsenQueueClass extends SystemCollection {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: 'nds', signature: "class Queue<ContentType>", comment: NiedersachsenLang.queueClassComment },

        { type: "method", signature: "Queue()", native: NiedersachsenQueueClass.prototype._constructor, comment: NiedersachsenLang.queueClassConstructorComment },

        { type: "method", signature: "boolean isEmpty()", native: NiedersachsenQueueClass.prototype._isEmpty, comment: NiedersachsenLang.queueClassIsEmptyComment },
        { type: "method", signature: "ContentType head()", native: NiedersachsenQueueClass.prototype._head, comment: NiedersachsenLang.queueClassHeadComment },
        { type: "method", signature: "void enqueue(ContentType content)", native: NiedersachsenQueueClass.prototype._enqueue, comment: NiedersachsenLang.queueClassEnqueueComment },
        { type: "method", signature: "ContentType dequeue()", native: NiedersachsenQueueClass.prototype._dequeue, comment: NiedersachsenLang.queueClassDequeueComment },

        { type: "method", signature: "String toString()", java: NiedersachsenQueueClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    // Queue is not Iterable (as in the reference implementation), so a for-each loop over it is a compile error.
    // getElements() is only used by the debugger.
    static [FOR_EACH_VIA_GET_ELEMENTS] = false;

    head: NiedersachsenElementClass | null = null;
    tail: NiedersachsenElementClass | null = null;

    constructor() {
        super();
    }

    _constructor() {
        return this;
    }

    _isEmpty(): boolean {
        return this.head == null;
    }

    _enqueue(neu: ObjectClassOrNull) {
        if(neu == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.contentMustNotBeNullExceptionMessage());
        }

        let element = new NiedersachsenElementClass()._constructorFull(neu, null);

        if(this.head == null) {
            this.head = element;
        } else {
            this.tail.next = element;
        }
        this.tail = element;
    }

    _dequeue() {
        if (this._isEmpty()) {
            throw new NoSuchElementExceptionClass(NiedersachsenLang.queueClassEmptyExceptionMessage());
        }

        let tmp: ObjectClassOrNull = this.head.inhalt;

        if(this.head == this.tail) {
            this.tail = null;
            this.head = null;
        } else {
            this.head = this.head.next;
        }

        return tmp;

    }

    _head(): ObjectClassOrNull {
        if (this._isEmpty()) {
            throw new NoSuchElementExceptionClass(NiedersachsenLang.queueClassEmptyExceptionMessageHead());
        }

        return this.head.inhalt;
    }




    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.head == null) {
            t.s.push("[]");
            if (callback) callback();
            return;
        }
        let inhalt = this.head.inhalt;
        if (typeof inhalt == "object" || Array.isArray(inhalt) || inhalt == null) {
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
            elements.push(node.inhalt);
            node = node.next;
        }
        return elements;
    }

}