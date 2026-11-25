import { CallbackParameter } from "./CallbackParameter";
import { Thread } from "./Thread";

export type TextContainer = {text: string};

export class ArrayToStringCaster {

    public static arrayOfObjectsToString(textContainer: TextContainer, t: Thread,
        array: any[], callback?: CallbackParameter, maximumLength: number = 200) {

        if (array == null) {
            textContainer.text += "null";
            if (callback) callback();
            return;
        }

        if (array.length == 0) {
            textContainer.text += "[ ]";
            if (callback) callback();
            return;
        }

        textContainer.text += "[";
        let array1 = array.slice();

        t.s.push(array1);

        let f = (callback1: CallbackParameter) => {
            let array: any[] = t.s.pop();
            if(textContainer.text.length > maximumLength){
                if(callback1) callback1();
                return;
            }
            if (array.length > 0) {
                let element = array.shift();
                if (element == null) {
                    textContainer.text += "null";
                    if (array.length > 0) {
                        textContainer.text += ", ";
                        t.s.push(array);
                        f(callback1);
                        return;
                    } else {
                        textContainer.text += "]";
                        if (callback1) callback1();
                        return;
                    }
                } else if (Array.isArray(element)) {
                    this.arrayOfObjectsToString(textContainer, t, element, () => {
                        if (array.length > 0) {
                            textContainer.text += ", ";
                            t.s.push(array);
                            f(callback1);
                            return;
                        } else {
                            textContainer.text += "]";
                            if (callback1) callback1();
                            return;
                        }
                    }, maximumLength)
                    return;
                } else if(typeof element == 'object') {
                    // element is object => call it's toString()-method!
                    element._mj$toString$String$(t, () => {
                        let text: string = t.s.pop().value;
                        if(element.constructor?.type?.identifier == 'String') text = '"' + text + '"';
                        textContainer.text += text;
                        if (array.length > 0) {
                            textContainer.text += ", ";
                            t.s.push(array);
                            f(callback1);
                            return;
                        } else {
                            textContainer.text += "]";
                            if (callback1) callback1();
                            return;
                        }
                    })
                } else {
                    if(typeof element == "string"){
                        textContainer.text += '"' + element + '"';
                    } else {
                        textContainer.text += "" + element;
                    }
                    if (array.length > 0) {
                        textContainer.text += ", ";
                        t.s.push(array);
                        f(callback1);
                        return;
                    } else {
                        textContainer.text += "]";
                        if (callback1) callback1();
                        return;
                    }
                }

            }
        }

        f(() => {
            if (callback) callback();
        });

    }



}