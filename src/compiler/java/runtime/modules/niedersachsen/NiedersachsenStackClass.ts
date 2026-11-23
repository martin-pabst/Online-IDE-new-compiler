import { BaseListType, FOR_EACH_VIA_GET_ELEMENTS } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { IllegalArgumentExceptionClass } from "../../system/javalang/IllegalArgumentException.ts";
import { NoSuchElementExceptionClass } from "../../system/javalang/NoSuchElementException.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NiedersachsenElementClass } from "./NiedersachsenElementClass.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";


export class NiedersachsenStackClass extends ObjectClass implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: 'nds', signature: "class Stack<ContentType>", comment: NiedersachsenLang.StackClassComment },

        { type: "method", signature: "Stack()", native: NiedersachsenStackClass.prototype._constructor, comment: NiedersachsenLang.stackClassConstructorComment },

        { type: "method", signature: "boolean isEmpty()", native: NiedersachsenStackClass.prototype._isEmpty, comment: NiedersachsenLang.stackClassIsEmptyComment },
        { type: "method", signature: "void push(ContentType content)", native: NiedersachsenStackClass.prototype._push, comment: NiedersachsenLang.stackClassPushComment },
        { type: "method", signature: "ContentType pop()", native: NiedersachsenStackClass.prototype._pop, comment: NiedersachsenLang.stackClassPopComment },
        { type: "method", signature: "ContentType top()", native: NiedersachsenStackClass.prototype._top, comment: NiedersachsenLang.stackClassTopComment },

        { type: "method", signature: "String toString()", java: NiedersachsenStackClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },
        //
    ]

    static type: NonPrimitiveType;

    // Stack is not Iterable (as in the reference implementation), so a for-each loop over it is a compile error.
    // getElements() is only used by the debugger.
    static [FOR_EACH_VIA_GET_ELEMENTS] = false;

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
        if(neu == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.contentMustNotBeNullExceptionMessage());
        }
        let element = new NiedersachsenElementClass()._constructorFull(neu, this.top);
        this.top = element;
    }

    _pop() {
        if (this._isEmpty()) {
            throw new NoSuchElementExceptionClass(NiedersachsenLang.stackClassEmptyExceptionMessagePop());
        }
        let tmp: ObjectClassOrNull = this.top.inhalt;
        this.top = this.top.next;
        return tmp;

    }

    _top(): ObjectClassOrNull {
        if (this._isEmpty()) {
            throw new NoSuchElementExceptionClass(NiedersachsenLang.stackClassEmptyExceptionMessageTop());
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