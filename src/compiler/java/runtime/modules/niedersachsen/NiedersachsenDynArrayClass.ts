import { BaseListType } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { IndexOutOfBoundsExceptionClass } from "../../system/javalang/IndexOutOfBoundsExceptionClass.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";

export class NiedersachsenDynArrayClass extends ObjectClass implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class DynArray", comment: NiedersachsenLang.dynArrayClassComment },

        { type: "method", signature: "DynArray()", native: NiedersachsenDynArrayClass.prototype._constructor, comment: NiedersachsenLang.dynArrayConstructorComment },
        { type: "method", signature: "boolean isEmpty()", native: NiedersachsenDynArrayClass.prototype._isEmpty, comment: NiedersachsenLang.dynArrayIsEmptyComment },
        { type: "method", signature: "Object getItem(int index)", native: NiedersachsenDynArrayClass.prototype._getItem, comment: NiedersachsenLang.dynArrayGetItemComment },
        { type: "method", signature: "void append(Object x)", native: NiedersachsenDynArrayClass.prototype._append, comment: NiedersachsenLang.dynArrayAppendComment },
        { type: "method", signature: "void insertAt(int index, Object x)", native: NiedersachsenDynArrayClass.prototype._insertAt, comment: NiedersachsenLang.dynArrayInsertAtComment },
        { type: "method", signature: "void setItem(int index, Object x)", native: NiedersachsenDynArrayClass.prototype._setItem, comment: NiedersachsenLang.dynArraySetItemComment },
        { type: "method", signature: "void delete(int index)", native: NiedersachsenDynArrayClass.prototype._delete, comment: NiedersachsenLang.dynArrayDeleteComment },
        { type: "method", signature: "int getLength()", native: NiedersachsenDynArrayClass.prototype._getLength, comment: NiedersachsenLang.dynArrayGetLengthComment },
        { type: "method", signature: "String toString()", java: NiedersachsenDynArrayClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]        
    
    static type: NonPrimitiveType;
    
    protected elements: ObjectClassOrNull[] = [];
    
    constructor(elements?: ObjectClassOrNull[]) {
        super();
        this.elements = elements || [];
    }        
    
    _constructor() {
        return this;
    }        
    _isEmpty() {
        return this.elements.length == 0;
    }    
 
    _getItem(index: number) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    

        return this.elements[index];
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

    getElements(): any[] {
        return this.elements;    
    }    

    _append(element: ObjectClassOrNull) {
        this.elements.push(element);
    }    

    _insertAt(index: number, element: ObjectClassOrNull) {
        if (index < 0 || index > this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    

        this.elements.splice(index, 0, element);
        return true;
    }    

    _setItem(index: number, element: ObjectClassOrNull) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    

        let ret = this.elements[index];

        this.elements[index] = element;
        return ret;
    }    

    _delete(index: number) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    

        return this.elements.splice(index, 1)[0];
    }    

    _clear() {
        this.elements.length = 0;
    }    

    _getLength() {
        return this.elements.length;
    }

}