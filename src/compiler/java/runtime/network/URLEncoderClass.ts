import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";

export class URLEncoder extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class URLEncoder extends Object", comment: JRC.URLEncoderClassComment()},
        {type: "method", signature: "static string encode(string url)", template: `encodeURI(§1)`, comment: JRC.URLEncoderEncodeComment}
    ];

    static type: NonPrimitiveType;
}