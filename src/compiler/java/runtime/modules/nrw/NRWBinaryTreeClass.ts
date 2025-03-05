import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, ObjectClassOrNull } from "../../system/javalang/ObjectClassStringClass.ts";
import { NRWLang } from "./NRWLang.ts";

class BTNode {
    left: NRWBinaryTreeClass;
    right: NRWBinaryTreeClass;

    constructor(public content: ObjectClassOrNull) {
        this.left = new NRWBinaryTreeClass();
        this.right = new NRWBinaryTreeClass();
    }
}


export class NRWBinaryTreeClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BinaryTree<ContentType>", comment: NRWLang.binaryTreeClassComment },

        { type: "method", signature: "BinaryTree()", native: NRWBinaryTreeClass.prototype._constructor, comment: NRWLang.binaryTreeConstructorComment1 },
        { type: "method", signature: "BinaryTree(ContentType pContent)", native: NRWBinaryTreeClass.prototype._constructor, comment: NRWLang.binaryTreeConstructorComment2 },
        { type: "method", signature: "BinaryTree(ContentType pContent, BinaryTree<ContentType> pLeftTree, BinaryTree<ContentType> pRightTree)", native: NRWBinaryTreeClass.prototype._constructor, comment: NRWLang.binaryTreeConstructorComment3 },

        { type: "method", signature: "void setContent(ContentType pContent)", native: NRWBinaryTreeClass.prototype._setContent, comment: NRWLang.binaryTreeSetContentComment },
        { type: "method", signature: "ContentType getContent()", native: NRWBinaryTreeClass.prototype._getContent, comment: NRWLang.binaryTreeGetContentComment },

        { type: "method", signature: "void setLeftTree(BinaryTree<ContentType> pTree)", native: NRWBinaryTreeClass.prototype._setLeftTree, comment: NRWLang.binaryTreeSetLeftTreeComment },
        { type: "method", signature: "void setRightTree(BinaryTree<ContentType> pTree)", native: NRWBinaryTreeClass.prototype._setRightTree, comment: NRWLang.binaryTreeSetRightTreeComment },

        { type: "method", signature: "BinaryTree<ContentType> getLeftTree()", native: NRWBinaryTreeClass.prototype._getLeftTree, comment: NRWLang.binaryTreeGetLeftTreeComment },
        { type: "method", signature: "BinaryTree<ContentType> getRightTree()", native: NRWBinaryTreeClass.prototype._getRightTree, comment: NRWLang.binaryTreeGetRightTreeComment },

        { type: "method", signature: "boolean isEmpty()", native: NRWBinaryTreeClass.prototype._isEmpty, comment: NRWLang.binaryTreeIsEmptyComment },
        //
    ]

    static type: NonPrimitiveType;

    node: BTNode = null;


    constructor() {
        super();
    }

    _constructor(pContent?: ObjectClassOrNull, pLeftTree?: NRWBinaryTreeClass, pRightTree?: NRWBinaryTreeClass) {
        if (pContent != null) {
            this.node = new BTNode(pContent);
            if (pLeftTree != null) {
                this.node.left = pLeftTree;
            } else {
                this.node.left = new NRWBinaryTreeClass();
            }
            if (pRightTree != null) {
                this.node.right = pRightTree;
            } else {
                this.node.right = new NRWBinaryTreeClass();
            }

        } else {
            this.node = null;
        }
        return this;
    }

    _setContent(pContent: ObjectClassOrNull) {
        if (pContent != null) {
            if (this._isEmpty()) {
                this.node = new BTNode(pContent);
                this.node.left = new NRWBinaryTreeClass();
                this.node.right = new NRWBinaryTreeClass();
            }
            this.node.content = pContent;
        }

    }

    _getContent(): ObjectClassOrNull {
        if (this._isEmpty()) {
            return null;
        } else {
            return this.node.content;
        }
    }

    _setLeftTree(pTree: NRWBinaryTreeClass) {
        if (!this._isEmpty() && pTree != null) {
            this.node.left = pTree;
        }
    }

    _setRightTree(pTree: NRWBinaryTreeClass) {
        if (!this._isEmpty() && pTree != null) {
            this.node.right = pTree;
        }
    }

    _getLeftTree(): NRWBinaryTreeClass {
        if (!this._isEmpty()) {
            return this.node.left;
        } else {
            return null;
        }
    }

    _getRightTree(): NRWBinaryTreeClass {
        if (!this._isEmpty()) {
            return this.node.right;
        } else {
            return null;
        }
    }

    _isEmpty(): boolean {
        return this.node == null;
    }



}