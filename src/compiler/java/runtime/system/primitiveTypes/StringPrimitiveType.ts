import { JavaBaseModule } from "../../../module/JavaBaseModule";
import { PrimitiveType } from "./PrimitiveType";

export class StringPrimitiveType extends PrimitiveType {

    constructor(module: JavaBaseModule){
        super('string', module);
        this.defaultValueAsString = `null`;
        this.defaultValue = null;
    }

    isUsableAsIndex(): boolean {
        return false;
    }

    getDefaultValue() {
        return 0;
    }

    toString(): string {
        return "String";
    }


}