import { JavaBaseModule } from "../../../module/JavaBaseModule";
import { PrimitiveType } from "./PrimitiveType";

export class CharPrimitiveType extends PrimitiveType {

    constructor(module: JavaBaseModule){
        super('char', module);
        this.defaultValueAsString = `"\\u0000"`;
        // char values are represented as strings at runtime
        this.defaultValue = '\u0000';
    }

    isUsableAsIndex(): boolean {
        return true;
    }

    getDefaultValue() {
        return '\u0000';
    }

}