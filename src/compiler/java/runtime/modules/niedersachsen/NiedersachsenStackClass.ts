import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { SystemCollection } from "../../system/collections/SystemCollection.ts";
import { ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { RuntimeExceptionClass } from "../../system/javalang/RuntimeException.ts";
import { NiedersachsenElementClass } from "./NiedersachsenElementClass.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";


export class NiedersachsenStackClass extends SystemCollection {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Stack", comment: NiedersachsenLang.StackClassComment },

        { type: "method", signature: "Stack()", native: NiedersachsenStackClass.prototype._constructor, comment: NiedersachsenLang.stackClassConstructorComment },

        { type: "method", signature: "boolean isEmpty()", native: NiedersachsenStackClass.prototype._isEmpty, comment: NiedersachsenLang.stackClassIsEmptyComment },
        { type: "method", signature: "void push(Object pContent)", native: NiedersachsenStackClass.prototype._push, comment: NiedersachsenLang.stackClassPushComment },
        { type: "method", signature: "Object pop()", native: NiedersachsenStackClass.prototype._pop, comment: NiedersachsenLang.stackClassPopComment },
        { type: "method", signature: "Object top()", native: NiedersachsenStackClass.prototype._top, comment: NiedersachsenLang.stackClassTopComment },

        { type: "method", signature: "String toString()", java: NiedersachsenStackClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    top: NiedersachsenElementClass | null = null;


    constructor() {
        super();
    }

    _constructor() {
        return this;
    }

    _isEmpty(): boolean {
        return this.top == null;
    }

    _push(neu: ObjectClassOrNull) {
        let element = new NiedersachsenElementClass()._constructorFull(neu, this.top);
        this.top = element;
    }

    _pop() {
        if (this._isEmpty()) {
            throw new RuntimeExceptionClass("Stack is empty. Cannot pop element.");
        }
        let tmp: ObjectClassOrNull = this.top.inhalt;
        this.top = this.top.next;
        return tmp;

    }

    _top(): ObjectClassOrNull {
        if (this._isEmpty()) {
            throw new RuntimeExceptionClass("Stack is empty. Cannot get top element.");
        }

        return this.top.inhalt;
    }




    _mj$toString$String$(t: Thread, callback: CallbackFunction) {
        if (this.top == null) {
            t.s.push("[]");
            if (callback) callback();
            return;
        }
        let inhalt = this.top.inhalt;
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
        if (this.top == null) return [];
        const elements: ObjectClassOrNull[] = [];
        let node = this.top;
        while (node != null) {
            elements.push(node.inhalt);
            node = node.next;
        }
        return elements;
    }

}