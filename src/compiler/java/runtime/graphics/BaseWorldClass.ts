
import * as PIXI from 'pixi.js';
import { CallbackParameter } from '../../../common/interpreter/CallbackParameter.ts';
import { Interpreter } from '../../../common/interpreter/Interpreter.ts';
import { Thread } from "../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../common/interpreter/ThreadState.ts";
import { ColorHelper } from '../../lexer/ColorHelper.ts';
import { LibraryDeclarations } from "../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../types/NonPrimitiveType.ts";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass.ts";
import { GroupClass } from './GroupClass.ts';
import { IWorld } from './IWorld.ts';
import { MouseManager } from './MouseManager2D.ts';
import { ShapeClass } from './ShapeClass.ts';
import { GNGEventListenerType, IGNGEventListener } from './gng/IGNGEventListener.ts';
import { GNGEventlistenerManager } from './gng/GNGEventlistenerManager.ts';
import { JRC } from '../../language/JavaRuntimeLibraryComments.ts';
import { GraphicSystem } from '../../../common/interpreter/GraphicsManager.ts';
import { ColorClass } from './ColorClass.ts';
import { NullPointerExceptionClass } from '../system/javalang/NullPointerExceptionClass.ts';
import { RuntimeExceptionClass } from '../system/javalang/RuntimeException.ts';
import { DOM } from '../../../../tools/DOM.ts';
import { MouseListenerInterface } from './MouseListenerInterface.ts';


export class BaseWorldClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BaseWorld" },
        { type: "method", signature: "public BaseWorld()", native: BaseWorldClass.prototype._constructor },

        { type: "method", signature: "void addMouseListener(MouseListener mouseListener)", native: BaseWorldClass.prototype._addMouseListener, comment: JRC.world3dAddMouseListenerComment },

    ]

    static type: NonPrimitiveType;

    graphicsDiv?: HTMLDivElement;

    mouseManager!: MouseManager;


    _addMouseListener(mouseListener: MouseListenerInterface) {
        this.mouseManager?.addJavaMouseListener(mouseListener);
    }

}

