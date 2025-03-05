import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException";
import { JsonElementClass } from "./JsonElementClass";

export class JsonParserClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class JsonParser extends Object", comment: JRC.JsonParserClassComment},
        {type: "method", signature: "static JsonElement parse(string jsonString)", native: JsonParserClass.prototype._mn$parse$JsonElement$string, comment: JRC.JsonParserParseComment},

    ]

    static type: NonPrimitiveType;


    _mn$parse$JsonElement$string(jsonString: string): JsonElementClass {
        try {
            let jsonTree = JSON.parse(jsonString);
            let tree = new JsonElementClass(jsonTree);

            return tree;

        } catch (error){
            throw new RuntimeExceptionClass(JRC.JsonParserParseException("" + error));
        }
    }

}