import { CallbackParameter } from "../../../common/interpreter/CallbackParameter";
import { Interpreter } from "../../../common/interpreter/Interpreter";
import { Step } from "../../../common/interpreter/Step";
import { CallbackFunction, Helpers, StepParams } from "../../../common/interpreter/StepFunction";
import { Thread } from "../../../common/interpreter/Thread";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { DummyAssertionObserver } from "./IAssertionObserver";

/**
 * Java wrapper class to call methods from {@link AssertionHandler}-object inside {@link Interpreter.assertionObserverList}
 */
export class AssertionsClass extends ObjectClass {

    /**
     * BEWARE: §1, §2 and §3 can be 'pop()', therefore they must NOT be inside for-loops in templates below!
     */

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Assertions extends Object" },

        // {type: "method", signature: "private Assertions()", native: AssertionsClass.prototype._emptyConstructor},
        {
            type: "method", signature: "public static void assertCodeReached(string message)",
            template: `${Helpers.registerCodeReached}(§1)`  // §1 gets inserted by compiler magic
        },
        {
            type: "method", signature: "public static void assertTrue(boolean condition, string message)",
            template: `let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertTrue.name}(${StepParams.thread}, this, _x_, _y_);}`
        },
        {
            type: "method", signature: "public static void assertFalse(boolean condition, string message)",
            template: `let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertFalse.name}(${StepParams.thread}, this, _x_, _y_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(boolean expected, boolean actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsBoolean.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(byte expected, byte actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsNumber.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(int expected, int actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsNumber.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(long expected, long actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsNumber.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(double expected, double actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsNumber.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(float expected, float actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsNumber.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(char expected, char actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsString.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(string expected, string actual, string message)",
            template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnAssertEqualsString.name}(${StepParams.thread}, this, _x_, _y_, _z_);}`
        },
        {
            type: "method", signature: "public static void assertEquals(Object expected, Object actual, string message)",
             template: `let _z_ = §3; let _y_ = §2; let _x_ = §1; ${Helpers.classes}["Assertions"].${AssertionsClass._assertEqualsObject.name}(${StepParams.thread}, this, _x_, _y_, _z_);`
        },
        {
            type: "method", signature: "public static void fail(string message)",
            template: `let _x_ = §1; for(__ao of ${Helpers.assertionObservers}){__ao.${DummyAssertionObserver.prototype.notifyOnFail.name}(${StepParams.thread}, this, _x_);}`
        },
    ]

    static type: NonPrimitiveType;

    constructor() {
        super();
    }

    // _emptyConstructor(){
    //     return this;
    // }

    static _assertEqualsObject(t: Thread, step: Step, actual: ObjectClass, expected: ObjectClass, message: string){
        let actualString = "null";
        let expectedString = "null";

        let callObservers = () => {
            for(let ao of t.assertionObservers){
                ao.notifyOnAssertEqualsObject(t, step, actualString, expectedString, message)
            }
        }

        let convertActual = (callback: CallbackParameter) => {
            if(actual != null){
                actual._mj$toString$String$(t, () => {
                    actualString = (t.s.pop() || {value: "null"}).value;
                    callback!();
                })
            } else {
                callback!();
            }
        }

        let convertExpected = (callback: CallbackParameter) => {
            if(expected != null){
                expected._mj$toString$String$(t, () => {
                    expectedString = (t.s.pop() || {value: "null"}).value;
                    callback!();
                })
            } else {
                callback!();
            }
        }

        let f = (equals: boolean) => {
            if(!equals){
                convertActual(()=>{
                    convertExpected(()=>{
                        callObservers();
                    })
                })
            }
        }

        if(actual == null || expected == null){
            f(actual == expected);
        } else {
            actual._mj$equals$boolean$Object(t, () => {
                f(t.s.pop());
            }, expected);
        }
    }

}