import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { InputManagerValidator } from "../../../../common/interpreter/IInputManager.ts";
import { Interpreter } from "../../../../common/interpreter/Interpreter.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../../common/interpreter/ThreadState.ts";
import { LibraryDeclarations } from "../../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ObjectClass, StringClass } from "../javalang/ObjectClassStringClass.ts";

type InputTaskType = "waitForInput" | "waitForKeys";

type InputTask = InputTaskWaitForInput | InputTaskWaitForKeys;

type InputTaskWaitForKeys = {
    type: "waitForKeys",
    thread: Thread,
    keys: string[] | undefined
}

type InputTaskWaitForInput = {
    type: "waitForInput",
    thread: Thread,
    message: string,
    defaultValue: string | undefined,
    validator: InputManagerValidator,
}

export class InputClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Input extends Object", comment: JRC.InputClassComment },
        { type: "method", signature: "static string readString(string message, string defaultValue)", java: InputClass._mj$readString$string$string$string, comment: JRC.InputClassReadStringComment },
        { type: "method", signature: "static string readString(string message)", java: InputClass._mj$readString$string$string, comment: JRC.InputClassReadStringComment },

        { type: "method", signature: "static boolean readBoolean(string message, boolean defaultValue)", java: InputClass._mj$readBoolean$boolean$string$boolean, comment: JRC.InputClassReadBooleanComment },
        { type: "method", signature: "static boolean readBoolean(string message)", java: InputClass._mj$readBoolean$boolean$string, comment: JRC.InputClassReadBooleanComment },

        { type: "method", signature: "static int readInt(string message, int defaultValue)", java: InputClass._mj$readInt$int$string$int, comment: JRC.InputClassReadIntComment },
        { type: "method", signature: "static int readInt(string message)", java: InputClass._mj$readInt$int$string, comment: JRC.InputClassReadIntComment },

        { type: "method", signature: "static float readFloat(string message, float defaultValue)", java: InputClass._mj$readFloat$float$string$float, comment: JRC.InputClassReadFloatComment },
        { type: "method", signature: "static float readFloat(string message)", java: InputClass._mj$readFloat$float$string, comment: JRC.InputClassReadFloatComment },

        { type: "method", signature: "static int readDouble(string message, double defaultValue)", java: InputClass._mj$readDouble$double$string$double, comment: JRC.InputClassReadDoubleComment },
        { type: "method", signature: "static double readDouble(string message)", java: InputClass._mj$readDouble$double$string, comment: JRC.InputClassReadDoubleComment },

        { type: "method", signature: "static char readChar(string message, char defaultValue)", java: InputClass._mj$readChar$char$string$char, comment: JRC.InputClassReadCharComment },
        { type: "method", signature: "static char readChar(string message)", java: InputClass._mj$readChar$char$string, comment: JRC.InputClassReadCharComment },

        { type: "method", signature: "static string waitForKey(string... possibleKeys)", java: InputClass._mj$waitForKey$string$stringII, comment: JRC.InputWaitForKeyComment },
        { type: "method", signature: "static string waitForKey()", java: InputClass._mj$waitForKey$string$, comment: JRC.InputWaitForAnyKeyComment },
        
        { type: "method", signature: "static boolean isKeyDown(string key)", java: InputClass._mj$isKeyDown$boolean$string, comment: JRC.InputIsKeyDownComment },

    ];

    static type: NonPrimitiveType;

    static taskMap: Map<Interpreter, InputTask[]> = new Map();


    static addTask(t: Thread, inputTask: InputTask) {
        t.state = ThreadState.waiting;

        let interpreter = t.scheduler.interpreter;

        let list = this.taskMap.get(interpreter)!;
        if (!list) {
            list = [];
            this.taskMap.set(interpreter, list);
            interpreter.eventManager.once("stop", () => {
                this.taskMap.delete(interpreter);
                interpreter.storeObject("inputTaskRunning", false);
            })
        }
        list.push(inputTask)

        if (!interpreter.retrieveObject("inputTaskRunning")) {
            let f = () => {
                if (list.length > 0) {
                    interpreter.storeObject("inputTaskRunning", true);
                    let task = list.shift()!;
                    InputClass.readInput(task, f)
                } else {
                    interpreter.storeObject("inputTaskRunning", false);
                }
            }
            f();
        }


    }

    static readInput(task: InputTask, callback: () => void) {
        task.thread.scheduler.interpreter.showProgramPointer(undefined, "InputClass");
        switch(task.type){
            case "waitForInput": 
            task.thread.scheduler.interpreter.inputManager?.readInput(task.message, task.defaultValue, task.validator, (value: string) => {
                task.thread.s.push(value);
                task.thread.state = ThreadState.running;
                task.thread.scheduler.interpreter.hideProgrampointerPosition("InputClass");
                callback();
                return;
            })
            break;
            case "waitForKeys": 
            task.thread.scheduler.interpreter.inputManager?.waitForKey(task.keys, (value: string) => {
                task.thread.s.push(value);
                task.thread.state = ThreadState.running;
                task.thread.scheduler.interpreter.hideProgrampointerPosition("InputClass");
                callback();
                return;
            })
            break;
        }

    }

    static _mj$readString$string$string$string(t: Thread, message: string, defaultValue?: string) {
        InputClass.addTask(t, {
            type: "waitForInput", thread: t, message: message, defaultValue: defaultValue, validator: (value: string) => {
                return {
                    convertedValue: value,
                    errorMessage: undefined
                }
            }
        })
    }

    static _mj$readString$string$string(t: Thread, message: string) {
        InputClass._mj$readString$string$string$string(t, message, undefined);
    }

    static _mj$readBoolean$boolean$string$boolean(t: Thread, message: string, defaultValue?: string) {
        InputClass.addTask(t, {
            type: "waitForInput", thread: t, message: message, defaultValue: defaultValue + "", validator: (value: string) => {
                return {
                    convertedValue: value == 'true',
                    errorMessage: ['true', 'false'].indexOf(value) < 0 ? JRC.InputClassBooleanError() : undefined
                }
            }
        })
    }

    static _mj$readBoolean$boolean$string(t: Thread, message: string) {
        InputClass._mj$readBoolean$boolean$string$boolean(t, message, undefined);
    }

    static _mj$readInt$int$string$int(t: Thread, message: string, defaultValue?: string) {
        InputClass.addTask(t, {
            type: "waitForInput", thread: t, message: message, defaultValue: defaultValue, validator: (value: string) => {
                let error: string | undefined;
                let n: number = Number.parseInt(value);
                if (Number.isNaN(n)) {
                    error = JRC.InputClassIntError();
                }

                return {
                    convertedValue: n,
                    errorMessage: error
                }
            }
        })
    }

    static _mj$readInt$int$string(t: Thread, message: string) {
        InputClass._mj$readInt$int$string$int(t, message, undefined);
    }

    static _mj$readFloat$float$string$float(t: Thread, message: string, defaultValue?: string) {
        InputClass.addTask(t, {
            type: "waitForInput", thread: t, message: message, defaultValue: defaultValue, validator: (value: string) => {
                let error: string | undefined;
                let n: number = Number.parseFloat(value);
                if (Number.isNaN(n)) {
                    error = JRC.InputClassFloatError();
                }

                return {
                    convertedValue: n,
                    errorMessage: error
                }
            }
        })
    }

    static _mj$readFloat$float$string(t: Thread, message: string) {
        InputClass._mj$readFloat$float$string$float(t, message, undefined);
    }

    static _mj$readDouble$double$string$double(t: Thread, message: string, defaultValue?: string) {
        InputClass.addTask(t, {
            type: "waitForInput", thread: t, message: message, defaultValue: defaultValue, validator: (value: string) => {
                let error: string | undefined;
                let n: number = Number.parseFloat(value);
                if (Number.isNaN(n)) {
                    error = JRC.InputClassFloatError();
                }

                return {
                    convertedValue: n,
                    errorMessage: error
                }
            }
        })
    }

    static _mj$readDouble$double$string(t: Thread, message: string) {
        InputClass._mj$readDouble$double$string$double(t, message, undefined);
    }


    static _mj$readChar$char$string$char(t: Thread, message: string, defaultValue?: string) {
        InputClass.addTask(t, {
            type: "waitForInput", thread: t, message: message, defaultValue: defaultValue, validator: (value: string) => {
                let error: string | undefined;
                if (value.length != 1) {
                    error = JRC.InputClassCharError();
                }

                return {
                    convertedValue: value,
                    errorMessage: error
                }
            }
        })
    }

    static _mj$readChar$char$string(t: Thread, message: string) {
        InputClass._mj$readChar$char$string$char(t, message, undefined);
    }

    static _mj$waitForKey$string$stringII(t: Thread, keys: string[]) {
        InputClass.addTask(t, {type: "waitForKeys", thread: t, keys: keys})
    }
    
    static _mj$waitForKey$string$(t: Thread) { 
        InputClass.addTask(t, {type: "waitForKeys", thread: t, keys: undefined})
    }

    static _mj$isKeyDown$boolean$string(t: Thread, key: string){
        let keyboardManager = t.scheduler.interpreter.keyboardManager;
        if(!keyboardManager){
            t.s.push(false);
            return;
        }
        t.s.push(keyboardManager.isPressed(key) ?? false);
    }

}