import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";

export class HttpHeaderClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class HttpHeader extends Object", comment: JRC.HttpHeaderComment},

        {type: "field", signature: "string key", comment: JRC.HttpHeaderKeyComment},
        {type: "field", signature: "string value", comment: JRC.HttpHeaderValueComment},

    ]

    static type: NonPrimitiveType;

    key: string = "";
    value: string = "";

    constructor(key?: string, value?: string){
        super();
        if(key) this.key = key;
        if(value) this.value = value;
    }

}