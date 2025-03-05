import { Matrix } from "pixi.js";
import { InterpreterMessages } from "../../../common/international/InterpreterMessages";
import { MethodOfDestroyedGOExceptionClass } from "../system/javalang/MethodOfDestroyedGOExceptionClass";

/**
 * Each destroyed graphical object (that is: child class of shape) gets its container-field
 * set to a ContainerProxy-object. This helps to print useful exception messages if a
 * method of container is called later without hurting performance.
 */
export class ContainerProxy {

    public static instance: any = this.getInstance();

    private constructor(){

    }

    private static getInstance(){
        const handler = {
            get(target, prop, receiver) {

                /**
                 * if Debugger displays destroyed object, then it tries to fetch
                 * centerX which leads to Shape._getCenterX() which breaks if
                 * getWorldTransfor() == null, so:
                 */
                if(prop == "getWorldTransform"){
                    return Matrix.IDENTITY;
                }

                throw new MethodOfDestroyedGOExceptionClass(InterpreterMessages.MethodOfDestroyedGraphicObjectCalled());

                // return function (...args) {
                //     // console.log(`Intercepted '${prop}' with arguments ${JSON.stringify(args)}`);
                //     // target.callMethod(prop);
                // };
            }
        };

        return new Proxy({}, handler);

    }
}