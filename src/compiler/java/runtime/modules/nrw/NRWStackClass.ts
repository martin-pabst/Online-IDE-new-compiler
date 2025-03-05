import { BaseListType } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { SystemCollection } from "../../system/collections/SystemCollection.ts";
import { ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NRWLang } from "./NRWLang.ts";

class StackNode {
    next: StackNode | null = null;

    constructor(public content: ObjectClassOrNull) {

    }
}


export class NRWStackClass extends SystemCollection implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Stack<ContentType>", comment: NRWLang.stackClassComment },

        { type: "method", signature: "Stack()", native: NRWStackClass.prototype._constructor, comment: NRWLang.stackClassConstructorComment },

        { type: "method", signature: "boolean isEmpty()", native: NRWStackClass.prototype._isEmpty, comment: NRWLang.stackClassIsEmptyComment },
        { type: "method", signature: "void push(ContentType pContent)", native: NRWStackClass.prototype._push, comment: NRWLang.stackClassPushComment },
        { type: "method", signature: "void pop()", native: NRWStackClass.prototype._pop, comment: NRWLang.stackClassPopComment },
        { type: "method", signature: "ContentType top()", native: NRWStackClass.prototype._top, comment: NRWLang.stackClassTopComment },

        { type: "method", signature: "String toString()", java: NRWStackClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    head: StackNode = null;


    constructor() {
        super();
    }

    _constructor() {
        return this;
    }

    _isEmpty(): boolean {
        return this.head == null;
    }

    _push(pContent: ObjectClassOrNull) {
        if (pContent != null) {
            const newNode: StackNode = new StackNode(pContent);
            newNode.next = this.head;
            this.head = newNode;
        }
    }

    _pop() {
        if (!this._isEmpty()) {
            this.head = this.head.next;
        }
    }

    _top(): ObjectClassOrNull {
        if (this._isEmpty()) {
            return null;
        } else {
            return this.head.content;
        }

    }




    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.head == null) {
            t.s.push("[]");
            if (callback) callback();
            return;
        }
        let element = this.head.content;
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
            elements.push(node.content);
            node = node.next;
        }
        return elements;
    }

}