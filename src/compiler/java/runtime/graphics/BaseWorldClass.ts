
import { LibraryDeclarations } from "../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass.ts";
import { MouseManager } from './MouseManager2D.ts';
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';
import { MouseListenerInterface } from './MouseListenerInterface.ts';


export class BaseWorldClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BaseWorld" },
        { type: "method", signature: "public BaseWorld()", native: BaseWorldClass.prototype._constructor },

        { type: "method", signature: "void addMouseListener(MouseListener mouseListener)", native: BaseWorldClass.prototype._addMouseListener, comment: JRC.baseWorldAddMouseListenerComment },
        { type: "method", signature: "void lockPointer()", native: BaseWorldClass.prototype._lockPointer, comment: JRC.baseWorldLockPointerComment },
        { type: "method", signature: "void unlockPointer()", native: BaseWorldClass.prototype._unlockPointer, comment: JRC.baseWorldUnlockPointerComment },

    ]

    static type: NonPrimitiveType;

    graphicsDiv?: HTMLDivElement;

    mouseManager!: MouseManager;


    _addMouseListener(mouseListener: MouseListenerInterface) {
        this.mouseManager?.addJavaMouseListener(mouseListener);
    }

    _lockPointer() {
        this.mouseManager?.enablePointerLock();
    }

    _unlockPointer() {
        this.mouseManager?.disablePointerLock();
    }

}

