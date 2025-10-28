import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { IllegalArgumentExceptionClass } from "../../system/javalang/IllegalArgumentException.ts";
import { IllegalStateExceptionClass } from "../../system/javalang/IllegalStateException.ts";
import { ObjectClass, ObjectClassOrNull, StringClass } from "../../system/javalang/ObjectClassStringClass.ts";
import { RuntimeExceptionClass } from "../../system/javalang/RuntimeException.ts";
import { NiedersachsenLang } from "./NiedersachsenLang.ts";

export class NiedersachsenBinTreeClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BinTree", comment: NiedersachsenLang.binTreeClassComment },

        { type: "method", signature: "BinTree()", native: NiedersachsenBinTreeClass.prototype._constructor, comment: NiedersachsenLang.binTreeConstructorComment },
        { type: "method", signature: "BinTree(Object o)", native: NiedersachsenBinTreeClass.prototype._constructor1, comment: NiedersachsenLang.binTreeConstructorWithContentComment },
        // { type: "method", signature: "boolean hasItem()", native: NiedersachsenBinTreeClass.prototype._hasItem, comment: NiedersachsenLang.binTreeHasItemComment },
        { type: "method", signature: "Object getItem()", native: NiedersachsenBinTreeClass.prototype._getItem, comment: NiedersachsenLang.binTreeGetItemComment },
        { type: "method", signature: "void setItem(Object o)", native: NiedersachsenBinTreeClass.prototype._setItem, comment: NiedersachsenLang.binTreeSetItemComment },
        // { type: "method", signature: "void deleteItem()", native: NiedersachsenBinTreeClass.prototype._deleteItem, comment: NiedersachsenLang.binTreeDeleteItemComment },
        { type: "method", signature: "boolean isLeaf()", native: NiedersachsenBinTreeClass.prototype._isLeaf, comment: NiedersachsenLang.binTreeIsLeafComment },
        // { type: "method", signature: "boolean hasLeft()", native: NiedersachsenBinTreeClass.prototype._hasLeft, comment: NiedersachsenLang.binTreeHasLeftComment },
        // { type: "method", signature: "boolean hasRight()", native: NiedersachsenBinTreeClass.prototype._hasRight, comment: NiedersachsenLang.binTreeHasLeftComment },
        { type: "method", signature: "BinTree getLeft()", native: NiedersachsenBinTreeClass.prototype._getLeft, comment: NiedersachsenLang.binTreeGetLeftComment },
        { type: "method", signature: "BinTree getRight()", native: NiedersachsenBinTreeClass.prototype._getRight, comment: NiedersachsenLang.binTreeGetRightComment },
        { type: "method", signature: "void setLeft(BinTree b)", native: NiedersachsenBinTreeClass.prototype._setLeft, comment: NiedersachsenLang.binTreeSetLeftComment },
        { type: "method", signature: "void setRight(BinTree b)", native: NiedersachsenBinTreeClass.prototype._setRight, comment: NiedersachsenLang.binTreeSetRightComment },
        // { type: "method", signature: "void deleteLeft()", native: NiedersachsenBinTreeClass.prototype._deleteLeft, comment: NiedersachsenLang.binTreeDeleteLeftComment },
        // { type: "method", signature: "void deleteRight()", native: NiedersachsenBinTreeClass.prototype._deleteRight, comment: NiedersachsenLang.binTreeDeleteRightComment },
        { type: "method", signature: "boolean isEmpty()", native: NiedersachsenBinTreeClass.prototype._isEmpty, comment: NiedersachsenLang.binTreeIsEmptyComment },
        { type: "method", signature: "void setEmpty()", native: NiedersachsenBinTreeClass.prototype._setEmpty, comment: NiedersachsenLang.binTreeSetEmptyComment },
        { type: "method", signature: "String toString()", java: NiedersachsenBinTreeClass.prototype._mj$toString$String$, comment: JRC.objectToStringComment },

    ]

    static type: NonPrimitiveType;

    private inhalt: ObjectClassOrNull = null;
    private left: NiedersachsenBinTreeClass = null;
    private right: NiedersachsenBinTreeClass = null;

    constructor(inhalt?: ObjectClassOrNull) {
        super();
        this.inhalt = inhalt || null;
    }

    _constructor() {
        return this;
    }

    _constructor1(o: ObjectClassOrNull = null) {
        if(o == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.noContentForBinTreeExceptionMessage());
        }
        this.inhalt = o;
        this.left = new NiedersachsenBinTreeClass()._constructor();
        this.right = new NiedersachsenBinTreeClass()._constructor();
        return this;
    }

    _mj$toString$String$(t: Thread, callback: CallbackFunction) {

        let f1: () => void = () => {
            let inhaltString: string = t.s.pop().value;
            
            let f2: () => void = () => {
                let leftString: string = t.s.pop().value;
                
                let f3: () => void = () => {
                    let rightString: string = t.s.pop().value;
                    let resultString = new StringClass("BinTree[inhalt=" + inhaltString + ", left=" + leftString + ", right=" + rightString + "]");
                    t.s.push(resultString);
                    if (callback) callback();
                };

                if(this.right){
                    this.right._mj$toString$String$(t, f3);
                } else {
                    t.s.push(new StringClass("null"));
                    f3();
                }
            }


            if(this.left){
                this.left._mj$toString$String$(t, f2);
            } else {
                t.s.push(new StringClass("null"));
                f2();
            }
        }

        if (this.inhalt) {
            this.inhalt._mj$toString$String$(t, f1);
        } else {
            t.s.push(new StringClass("null"));
            f1();
        }
    }

    _hasItem() {
        return this.inhalt != null;
    }

    _getItem() {
        if(this._isEmpty()){
            throw new IllegalStateExceptionClass(NiedersachsenLang.noContentInBinTreeExceptionMessage());
        }
        return this.inhalt;
    }

    _setItem(o: ObjectClassOrNull) {
        if(o == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.binTreeSetItemNullExceptionMessage());
        }
        if(this._isEmpty()){
            this.left = new NiedersachsenBinTreeClass()._constructor();
            this.right = new NiedersachsenBinTreeClass()._constructor();
        }

        this.inhalt = o;
    }

    _deleteItem() {
        this.inhalt = null;
    }

    _isLeaf() {

        if(this._isEmpty()){
            throw new IllegalStateExceptionClass(NiedersachsenLang.binTreeEmptyIsLeafExceptionMessage());
        }

        return this.left?._isEmpty() && this.right?._isEmpty();
    }

    _hasLeft() {
        return this.left != null;
    }

    _hasRight() {
        return this.right != null;
    }

    _getLeft() {
        if(this._isEmpty()){
            throw new IllegalStateExceptionClass(NiedersachsenLang.getLeftOnEmptyTreeExceptionMessage());
        }
        return this.left;
    }

    _getRight() {
        if(this._isEmpty()){
            throw new IllegalStateExceptionClass(NiedersachsenLang.getRightOnEmptyTreeExceptionMessage());
        }
        return this.right;
    }    
    
    _setLeft(b: NiedersachsenBinTreeClass) {
        if(this._isEmpty()){
            throw new IllegalStateExceptionClass(NiedersachsenLang.setLeftOnEmptyTreeExceptionMessage());
        }

        if(b == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.setEmptyTreeAsChildExceptionMessage());
        }

        this.left = b;
    }
    
    _setRight(b: NiedersachsenBinTreeClass) {
        if(this._isEmpty()){
            throw new IllegalStateExceptionClass(NiedersachsenLang.setRightOnEmptyTreeExceptionMessage());
        }

        if(b == null){
            throw new IllegalArgumentExceptionClass(NiedersachsenLang.setEmptyTreeAsChildExceptionMessage());
        }

        this.right = b;
    }

    _deleteLeft() {
        if(!this.left){
            throw new RuntimeExceptionClass(NiedersachsenLang.noLeftSubtreeToDeleteExceptionMessage());   
        }
        this.left = null;
    }
    _deleteRight() {
        if(!this.right){
            throw new RuntimeExceptionClass(NiedersachsenLang.noRightSubtreeToDeleteExceptionMessage());
        }
        this.right = null;
    }
    _setEmpty() {
        this.inhalt = null;
        this.left = null;
        this.right = null;
    }
    _isEmpty() {
        return this.inhalt == null && this.left == null && this.right == null;
    }
}