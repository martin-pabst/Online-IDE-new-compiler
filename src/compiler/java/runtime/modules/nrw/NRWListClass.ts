import { BaseListType } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { SystemCollection } from "../../system/collections/SystemCollection.ts";
import { ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NRWLang } from "./NRWLang.ts";

class ListNode {
    next: ListNode | undefined;

    constructor(public contentObject: ObjectClassOrNull) {

    }
}


export class NRWListClass extends SystemCollection implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class List<ContentType>", comment: NRWLang.listClassComment },

        { type: "method", signature: "List()", native: NRWListClass.prototype._constructor, comment: NRWLang.listClassConstructorComment },

        { type: "method", signature: "boolean isEmpty()", native: NRWListClass.prototype._isEmpty, comment: NRWLang.listClassIsEmptyComment },
        { type: "method", signature: "boolean hasAccess()", native: NRWListClass.prototype._hasAccess, comment: NRWLang.listClassHasAccessComment },
        { type: "method", signature: "void next()", native: NRWListClass.prototype._next, comment: NRWLang.listClassNextComment },
        { type: "method", signature: "void toFirst()", native: NRWListClass.prototype._toFirst, comment: NRWLang.listClassToFirstComment },
        { type: "method", signature: "void toLast()", native: NRWListClass.prototype._toLast, comment: NRWLang.listClassToLastComment },
        { type: "method", signature: "ContentType getContent()", native: NRWListClass.prototype._getContent, comment: NRWLang.listClassGetContentComment },
        { type: "method", signature: "void setContent(ContentType pContent)", native: NRWListClass.prototype._setContent, comment: NRWLang.listClassSetContentComment },
        { type: "method", signature: "void insert(ContentType pContent)", native: NRWListClass.prototype._insert, comment: NRWLang.listClassInsertComment },
        { type: "method", signature: "void append(ContentType pContent)", native: NRWListClass.prototype._append, comment: NRWLang.listClassAppendComment },
        { type: "method", signature: "void concat(List<ContentType> pList)", native: NRWListClass.prototype._concat, comment: NRWLang.listClassConcatComment },
        { type: "method", signature: "void remove()", native: NRWListClass.prototype._remove, comment: NRWLang.listClassRemoveComment },
        // { type: "method", signature: "ContentType getPrevious()", native: NRWListClass.prototype._getPrevious, comment: NRWLang.listClassGetPreviousComment },

        { type: "method", signature: "String toString()", java: NRWListClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    first: ListNode = null;
    last: ListNode = null;
    current: ListNode = null;


    constructor() {
        super();
    }

    _constructor() {
        return this;
    }

    _isEmpty(): boolean {
        return this.first == null;
    }

    _hasAccess(): boolean {
        return this.current != null;
    }

    _next() {
        if (this._hasAccess()) {
            this.current = this.current.next;
        }
    }

    _toFirst() {
        if (!this._isEmpty()) {
            this.current = this.first;
        }
    }

    _toLast() {
        if (!this._isEmpty()) {
            this.current = this.last;
        }
    }

    _getContent(): ObjectClassOrNull | null {
        if (this._hasAccess()) {
            return this.current.contentObject;
        } else {
            return null;
        }
    }

    _setContent(pContent: ObjectClassOrNull) {
        if (pContent != null && this._hasAccess()) {
            this.current.contentObject = pContent;
        }
    }

    _insert(pContent: ObjectClassOrNull) {
        if (pContent != null) {
            if (this._hasAccess()) {
                const newNode = new ListNode(pContent);
                if (this.current != this.first) { // Fall: Nicht an erster Stelle einfuegen.
                    const previous = this._getPrevious(this.current);
                    newNode.next = previous.next;
                    previous.next = newNode;
                } else { // Fall: An erster Stelle einfuegen.
                    newNode.next = this.first;
                    this.first = newNode;
                }
            } else {
                if (this._isEmpty()) { // Fall: In leere Liste einfuegen.

                    // Neuen Knoten erstellen.
                    const newNode = new ListNode(pContent);

                    this.first = newNode;
                    this.last = newNode;
                }
            }
        }
    }


    _append(pContent: ObjectClassOrNull) {
        if (pContent != null) {
            if (this._isEmpty()) { // Fall: An leere Liste anfuegen.
                this._insert(pContent);
            } else { // Fall: An nicht-leere Liste anfuegen.

                // Neuen Knoten erstellen.
                const newNode = new ListNode(pContent);

                this.last.next = newNode;
                this.last = newNode; // Letzten Knoten aktualisieren.
            }
        }
    }

    _concat(pList: NRWListClass) {
        if (pList != this && pList != null && !pList._isEmpty()) { // Nichts tun,
            // wenn pList und this identisch, pList leer oder nicht existent.

            if (this._isEmpty()) { // Fall: An leere Liste anfuegen.
                this.first = pList.first;
                this.last = pList.last;
            } else { // Fall: An nicht-leere Liste anfuegen.
                this.last.next = pList.first;
                this.last = pList.last;
            }

            // Liste pList loeschen.
            pList.first = null;
            pList.last = null;
            pList.current = null;
        }
    }

    _remove() {
        // Nichts tun, wenn es kein aktuelle Element gibt oder die Liste leer ist.
        if (this._hasAccess() && !this._isEmpty()) {

            if (this.current == this.first) {
                this.first = this.first.next;
            } else {
                const previous = this._getPrevious(this.current);
                if (this.current == this.last) {
                    this.last = previous;
                }
                previous.next = this.current.next;
            }

            const temp = this.current.next;
            this.current.contentObject = null;
            this.current.next = null
            this.current = temp;

            //Beim Loeschen des letzten Elements last auf null setzen. 
            if (this._isEmpty()) {
                this.last = null;
            }
        }

    }

    _getPrevious(pNode: ListNode) {
        if (pNode != null && pNode != this.first && !this._isEmpty()) {
            let temp = this.first;
            while (temp != null && temp.next != pNode) {
                temp = temp.next;
            }
            return temp;
        } else {
            return null;
        }
    }


    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.first == null) {
            t.s.push("[]");
            if (callback) callback();
            return;
        }
        let element = this.first.contentObject;
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
        if(this.first == null) return [];
        const elements: ObjectClassOrNull[] = [];
        let node = this.first;
        while(node != null){
            elements.push(node.contentObject);
            node = node.next;
        }
        return elements;
    }



}