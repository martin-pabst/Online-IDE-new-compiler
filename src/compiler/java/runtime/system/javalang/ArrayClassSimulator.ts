import { Thread } from "../../../../common/interpreter/Thread";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import { JavaArrayType } from "../../../types/JavaArrayType";

/**
 * An array is an object in Java. This class simulates the array class behavior,
 * e.g., adding methods to the array prototype.
 * 
 * See <a href="https://docs.oracle.com/javase/specs/jls/se7/html/jls-10.html#:~:text=In%20the%20Java%20programming%20language,2)">Java Language Specification - Arrays</a>.
 */


export class ArrayClassSimulator {

    static prepareArrayPrototype() {
        let testArray = new Array(0);
        // Define a toString method on the array prototype
        Object.defineProperty(Array.prototype, '_mj$toString$String$', {
            value: function(t: Thread, callback: CallbackFunction) {
                t.ToString(t, callback, this);
            },
            writable: false,
            configurable: true
        });


    }




} 