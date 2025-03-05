import type { JavaField } from "../../java/types/JavaField.ts";
import type { RuntimeObject } from "./DebuggerSymbolEntry.ts";

type ArrayOutputData = {
    text: string
}

export class ValueRenderer {

    static quickArrayOutput(a: any[], maxLength: number, oldArray?: any[], pulseClass?: string): string {

        let data: ArrayOutputData = {
            text: ""
        }

        this.quickArrayOutputHelper(a, data, maxLength, oldArray, pulseClass);

        return data.text;
    }

    private static quickArrayOutputHelper(a: any[], data: ArrayOutputData, maxLength: number,
        oldArray?: any[], pulseClass?: string) {
        let index: number = 0;
        data.text += "[";
        while (index < a.length && data.text.length < maxLength) {
            let element = a[index];
            let oldElement = oldArray && oldArray[index]? oldArray[index] : undefined;
            if (Array.isArray(element)) {
                ValueRenderer.quickArrayOutputHelper(element, data, maxLength);
            } else {
                let text = ValueRenderer.renderValue(element, maxLength - data.text.length - 3);
                if(oldElement){
                    let oldText = ValueRenderer.renderValue(oldElement, maxLength - data.text.length - 3);
                    let textChanged = text != oldText;
                    text = text.replaceAll("<", "&lt;")
                    text = text.replaceAll(">", "&gt;")

                    if(textChanged){
                        text = `<span class="${pulseClass}">${text}</span>`;
                    }
                }
                data.text += text;
            }
            if (index < a.length - 1) data.text += ", ";
            index++;
        }

        if (index < a.length) data.text += "...";

        data.text += "]";
    }


    static renderValue(value: any, maxLength: number): string {
        if (Array.isArray(value)) {
            return ValueRenderer.quickArrayOutput(value, maxLength);
        } else {
            switch (typeof value) {
                case "object":
                    if (value == null) {
                        return "null";
                    } else {
                        return ValueRenderer.renderObject(value, maxLength);
                    }
                case "string":
                    return '"' + value.substring(0, maxLength) + '"';
                case "undefined":
                    return "";
                default:
                    return ("" + value).substring(0, maxLength);
            }
        }


    }

    private static renderObject(value: RuntimeObject | null, maxLength: number): string {
        if(value == null) return "null";

        if(value["value"]) return ValueRenderer.renderValue(value["value"], maxLength);

        let s: string = "{ ";
            let type = value.getType();
            if(type){
                let fields = type.getOwnAndInheritedFields().filter(f => !f.hiddenWhenDebugging);

                let i: number = 0;
                while(i < fields.length && s.length < maxLength){
                    let field = fields[i] as JavaField;
                    if(field.internalName){
                        s += field.identifier + " = ";
                        s += ValueRenderer.renderValue(value[field.internalName], maxLength - s.length);
                    }
                    i++;
                    if(i < fields.length) s += ", ";
                }

                if(i < fields.length) s += "..."

            }

        return s + " }";
    }

}