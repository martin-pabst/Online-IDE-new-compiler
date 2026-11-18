import * as PIXI from 'pixi.js';
import { ActorType, IActor } from "./IActor";
import { GroupClass } from './GroupClass';
import { ShapeClass } from './ShapeClass';
import { Interpreter } from '../../../common/interpreter/Interpreter';
import { MouseManager } from './MouseManager2D.ts';
import { GNGEventListenerType, IGNGEventListener } from './gng/IGNGEventListener.ts';
import { GNGEventlistenerManager } from './gng/GNGEventlistenerManager.ts';


export interface IWorld {
    app: PIXI.Application;
    interpreter: Interpreter;
    defaultGroup?: GroupClass;
    shapesWhichBelongToNoGroup: ShapeClass[];

    currentLeft: number;
    currentTop: number;
    currentWidth: number;
    currentHeight: number;
    shapesNotAffectedByWorldTransforms: ShapeClass[];

    hasGUIElementsWithUserDefinedListeners: boolean;

    mouseManager: MouseManager;

    width: number;
    height: number;

    gngEventlistenerManager: GNGEventlistenerManager;

    hasActors(): boolean;

    _setBackgroundColor(color: string | number): void;

    registerGNGEventListener(listener: IGNGEventListener, type: GNGEventListenerType): void;
    unRegisterGNGEventListener(listener: IGNGEventListener, type: GNGEventListenerType): void;

    _setCursor(cursor: string): void;

}