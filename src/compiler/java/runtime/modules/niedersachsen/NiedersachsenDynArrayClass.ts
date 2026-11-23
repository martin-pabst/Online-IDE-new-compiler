import { BaseListType, FOR_EACH_VIA_GET_ELEMENTS } from "../../../../common/BaseType.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ConcurrentModificationExceptionClass } from "../../system/javalang/ConcurrentModificationException.ts";
import { IllegalArgumentExceptionClass } from "../../system/javalang/IllegalArgumentException.ts";
import { IndexOutOfBoundsExceptionClass } from "../../system/javalang/IndexOutOfBoundsExceptionClass.ts";
import { NoSuchElementExceptionClass } from "../../system/javalang/NoSuchElementException.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";

export class NiedersachsenDynArrayClass extends ObjectClass implements BaseListType {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: 'nds', signature: "class DynArray<ContentType> implements Iterable<ContentType>", comment: NiedersachsenLang.dynArrayClassComment },

        { type: "method", signature: "DynArray()", native: NiedersachsenDynArrayClass.prototype._constructor, comment: NiedersachsenLang.dynArrayConstructorComment },
        { type: "method", signature: "boolean isEmpty()", native: NiedersachsenDynArrayClass.prototype._isEmpty, comment: NiedersachsenLang.dynArrayIsEmptyComment },
        { type: "method", signature: "ContentType getItem(int index)", native: NiedersachsenDynArrayClass.prototype._getItem, comment: NiedersachsenLang.dynArrayGetItemComment },
        { type: "method", signature: "void append(ContentType content)", native: NiedersachsenDynArrayClass.prototype._append, comment: NiedersachsenLang.dynArrayAppendComment },
        { type: "method", signature: "void insertAt(int index, ContentType content)", native: NiedersachsenDynArrayClass.prototype._insertAt, comment: NiedersachsenLang.dynArrayInsertAtComment },
        { type: "method", signature: "void setItem(int index, ContentType content)", native: NiedersachsenDynArrayClass.prototype._setItem, comment: NiedersachsenLang.dynArraySetItemComment },
        { type: "method", signature: "void delete(int index)", native: NiedersachsenDynArrayClass.prototype._delete, comment: NiedersachsenLang.dynArrayDeleteComment },
        { type: "method", signature: "int getLength()", native: NiedersachsenDynArrayClass.prototype._getLength, comment: NiedersachsenLang.dynArrayGetLengthComment },
        { type: "method", signature: "Iterator<ContentType> iterator()", native: NiedersachsenDynArrayClass.prototype._iterator, comment: NiedersachsenLang.dynArrayIteratorComment },
        
        { type: "method", signature: "String toString()", java: NiedersachsenDynArrayClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]        
    
    static type: NonPrimitiveType;

    // for-each loops use iterator() instead of getElements() so that structural modifications
    // while iterating throw a ConcurrentModificationException (as in the reference implementation).
    static [FOR_EACH_VIA_GET_ELEMENTS] = false;

    protected elements: ObjectClassOrNull[] = [];

    /**
     * Counts structural modifications (append, insertAt, delete). Iterators use it to detect
     * modifications while iterating. setItem is no structural modification.
     */
    protected modificationCount: number = 0;

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
        if(element == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.contentMustNotBeNullExceptionMessage());
        }

        this.elements.push(element);
        this.modificationCount++;
    }

    _insertAt(index: number, element: ObjectClassOrNull) {
        if (index < 0 || index > this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    

        if(element == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.contentMustNotBeNullExceptionMessage());
        }

        this.elements.splice(index, 0, element);
        this.modificationCount++;
        return true;
    }
    
    _setItem(index: number, element: ObjectClassOrNull) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    
        
        if(element == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.contentMustNotBeNullExceptionMessage());
        }

        // replacing is no structural modification, so modificationCount stays unchanged
        let ret = this.elements[index];

        this.elements[index] = element;
        return ret;
    }    

    _delete(index: number) {
        if (index < 0 || index >= this.elements.length) {
            throw new IndexOutOfBoundsExceptionClass(JRC.indexOutOfBoundsException(index, this.elements.length - 1));
        }    

        this.modificationCount++;
        return this.elements.splice(index, 1)[0];
    }

    _clear() {
        this.elements.length = 0;
        this.modificationCount++;
    }

    _getLength() {
        return this.elements.length;
    }

    _iterator() {

        let iterator = new ObjectClass();

        let nextIndex = 0;
        let expectedModificationCount = this.modificationCount;

        // As in the reference implementation, structural modifications are checked in hasNext() and not
        // only in next(): otherwise a delete in the last but one or last pass would silently end the loop
        // and skip an element.
        let hasNext = (): boolean => {
            if (this.modificationCount != expectedModificationCount) {
                throw new ConcurrentModificationExceptionClass(NiedersachsenLang.dynArrayConcurrentModificationExceptionMessage());
            }
            return nextIndex < this.elements.length;
        }

        //@ts-ignore
        iterator["_mj$hasNext$boolean$"] = (t: Thread, callback: CallbackFunction) => {
            t.s.push(hasNext());
            if (callback) callback();
        }

        //@ts-ignore
        iterator["_mj$next$E$"] = (t: Thread, callback: CallbackFunction) => {
            if (!hasNext()) {
                throw new NoSuchElementExceptionClass(NiedersachsenLang.dynArrayIteratorNoMoreElementsExceptionMessage());
            }
            t.s.push(this.elements[nextIndex++]);
            if (callback) callback();
        }

        return iterator;
    }

}