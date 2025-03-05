import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, ObjectClassOrNull } from "../../system/javalang/ObjectClassStringClass.ts";
import { NRWComparableContentInterface } from "./NRWComparableContentInterface.ts";
import { NRWLang } from "./NRWLang.ts";

class BSTNode {
    left: NRWBinarySearchTreeClass;
    right: NRWBinarySearchTreeClass;

    constructor(public content: NRWComparableContentInterface) {
        this.left = new NRWBinarySearchTreeClass();
        this.right = new NRWBinarySearchTreeClass();
    }
}


export class NRWBinarySearchTreeClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BinarySearchTree<ContentType extends ComparableContent<ContentType>>", comment: NRWLang.binarySearchTreeClassComment },

        { type: "method", signature: "BinarySearchTree()", native: NRWBinarySearchTreeClass.prototype._constructor, comment: NRWLang.binarySearchTreeConstructorComment1 },

        { type: "method", signature: "ContentType getContent()", native: NRWBinarySearchTreeClass.prototype._getContent, comment: NRWLang.binarySearchTreeGetContentComment },

        { type: "method", signature: "void insert(ContentType pContent)", java: NRWBinarySearchTreeClass.prototype._mj$insert$void$ContentType, comment: NRWLang.binarySearchTreeInsertComment },
        { type: "method", signature: "void remove(ContentType pContent)", java: NRWBinarySearchTreeClass.prototype._mj$remove$void$ContentType, comment: NRWLang.binarySearchTreeRemoveComment },
        { type: "method", signature: "ContentType search(ContentType pContent)", java: NRWBinarySearchTreeClass.prototype._mj$search$ContentType$ContentType, comment: NRWLang.binarySearchTreeSearchComment },

        { type: "method", signature: "BinarySearchTree<ContentType> getLeftTree()", native: NRWBinarySearchTreeClass.prototype._getLeftTree, comment: NRWLang.binarySearchTreeGetLeftTreeComment },
        { type: "method", signature: "BinarySearchTree<ContentType> getRightTree()", native: NRWBinarySearchTreeClass.prototype._getRightTree, comment: NRWLang.binarySearchTreeGetRightTreeComment },

        { type: "method", signature: "boolean isEmpty()", native: NRWBinarySearchTreeClass.prototype._isEmpty, comment: NRWLang.binarySearchTreeIsEmptyComment },
        //
    ]

    static type: NonPrimitiveType;

    node: BSTNode = null;


    constructor() {
        super();
    }

    _constructor() {
        this.node = null;
        return this;
    }


    _getContent(): NRWComparableContentInterface {
        if (this._isEmpty()) {
            return null;
        } else {
            return this.node.content;
        }
    }

    _getLeftTree(): NRWBinarySearchTreeClass {
        if (!this._isEmpty()) {
            return this.node.left;
        } else {
            return null;
        }
    }

    _getRightTree(): NRWBinarySearchTreeClass {
        if (!this._isEmpty()) {
            return this.node.right;
        } else {
            return null;
        }
    }

    _isEmpty(): boolean {
        return this.node == null;
    }

    _mj$insert$void$ContentType(t: Thread, callback: CallbackParameter, pContent: NRWComparableContentInterface) {
        if (pContent != null) {
            if (this._isEmpty()) {
                this.node = new BSTNode(pContent);
            } else {
                pContent._mj$isLess$boolean$ContentType(t, () => {

                    if (t.s.pop()) {
                        this.node.left._mj$insert$void$ContentType(t, callback, pContent);
                    } else {
                        pContent._mj$isGreater$boolean$ContentType(t, () => {

                            if (t.s.pop()) {
                                this.node.right._mj$insert$void$ContentType(t, callback, pContent);
                            }

                        }, this.node.content)

                    }

                }, this.node.content)
            }

        }

    }

    _mj$remove$void$ContentType(t: Thread, callback: CallbackParameter, pContent: NRWComparableContentInterface) {
        if (this._isEmpty() || pContent == null) return;

        pContent._mj$isLess$boolean$ContentType(t, () => {

            if (t.s.pop()) {
                this.node.left._mj$remove$void$ContentType(t, callback, pContent);
            } else {
                pContent._mj$isGreater$boolean$ContentType(t, () => {

                    if (t.s.pop()) {
                        this.node.right._mj$remove$void$ContentType(t, callback, pContent);
                    } else {

                        // Element ist gefunden.
                        if (this.node.left._isEmpty()) {
                            if (this.node.right._isEmpty()) {
                                // Es gibt keinen Nachfolger.
                                this.node = null;
                            } else {
                                // Es gibt nur rechts einen Nachfolger.
                                this.node = this.getNodeOfRightSuccessor();
                            }
                        } else if (this.node.right._isEmpty()) {
                            // Es gibt nur links einen Nachfolger.
                            this.node = this.getNodeOfLeftSuccessor();
                        } else {
                            // Es gibt links und rechts einen Nachfolger.
                            if (this.getNodeOfRightSuccessor().left._isEmpty()) {
                                // Der rechte Nachfolger hat keinen linken Nachfolger.
                                this.node.content = this.getNodeOfRightSuccessor().content;
                                this.node.right = this.getNodeOfRightSuccessor().right;
                            } else {
                                const previous: NRWBinarySearchTreeClass = this.node.right
                                    .ancestorOfSmallRight();
                                const smallest: NRWBinarySearchTreeClass = previous.node.left;
                                this.node.content = smallest.node.content;
                                previous._mj$remove$void$ContentType(t, callback, smallest.node.content);
                            }
                        }

                    }

                }, this.node.content)

            }

        }, this.node.content)


    }


    _mj$search$ContentType$ContentType(t: Thread, callback: CallbackParameter, pContent: NRWComparableContentInterface) {

        if (this._isEmpty() || pContent == null) {
            // Abbrechen, da es kein Element zu suchen gibt.
            return null;
        } else {
            pContent._mj$isLess$boolean$ContentType(t, () => {

                if (t.s.pop()) {
                    this._getLeftTree()._mj$search$ContentType$ContentType(t, callback, pContent);
                } else {
                    pContent._mj$isGreater$boolean$ContentType(t, () => {
                        if (t.s.pop()) {
                            this._getRightTree()._mj$search$ContentType$ContentType(t, callback, pContent);
                        } else {
                            pContent._mj$isEqual$boolean$ContentType(t, () => {
                                if (t.s.pop()) {
                                    t.s.push(this.node.content);
                                } else {
                                    // Dieser Fall sollte nicht auftreten.
                                    t.s.push(null);
                                }
                                if (callback) callback();
                            }, this.node.content);
                        }
                    }, this.node.content);
                }


            }, this.node.content);

        }


    }


    private ancestorOfSmallRight(): NRWBinarySearchTreeClass{
        if (this.getNodeOfLeftSuccessor().left._isEmpty()) {
			return this;
		} else {
			return this.node.left.ancestorOfSmallRight();
		}
    }


    private getNodeOfLeftSuccessor(){
        return this.node.left.node;
    }

    private getNodeOfRightSuccessor(){
        return this.node.right.node;
    }

}