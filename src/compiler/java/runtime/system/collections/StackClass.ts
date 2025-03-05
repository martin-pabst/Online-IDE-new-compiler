import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClassOrNull } from "../javalang/ObjectClassStringClass";
import { EmptyStackExceptionClass } from "./EmptyStackException";
import { VectorClass } from "./VectorClass";

export class StackClass extends VectorClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class Stack<E> extends Vector<E>", comment: JRC.stackClassComment},
        {type: "method", signature: "Stack()", native: StackClass.prototype._constructor, comment: JRC.stackConstructorComment},
        {type: "method", signature: "E push(E element)", native: StackClass.prototype._push, comment: JRC.stackPushComment},
        {type: "method", signature: "E pop()", native: StackClass.prototype._pop, comment: JRC.stackPopComment},
        {type: "method", signature: "E peek()", native: StackClass.prototype._peek, comment: JRC.stackPeekComment},
        {type: "method", signature: "boolean empty()", native: StackClass.prototype._empty, comment: JRC.stackEmptyComment},
        {type: "method", signature: "int search(E element)", java: StackClass.prototype._mj$indexOf$int$E, comment: JRC.stackSearchComment},
    ];

    static type: NonPrimitiveType;

    _push(element: ObjectClassOrNull): ObjectClassOrNull {
        this.elements.push(element);
        return element;
    }

    _pop(): ObjectClassOrNull {
        if(this.elements.length == 0){
            throw new EmptyStackExceptionClass();
        }
        return this.elements.pop()!;
    }

    _peek(): ObjectClassOrNull {
        if(this.elements.length == 0){
            throw new EmptyStackExceptionClass();
        }
        return this.elements[this.elements.length - 1];
    }

    _empty(): boolean {
        return this.elements.length == 0;
    }

}