import { CallbackFunction } from "../../../common/interpreter/RuntimeConstants";
import { Thread } from "../../../common/interpreter/Thread";
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { HttpHeaderClass } from "./HttpHeaderClass";

export class HttpRequestClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class HttpRequest extends Object", comment: JRC.HttpRequestClassComment},

        {type: "method", signature: "HttpRequest()", java: HttpRequestClass.prototype._cj$HttpRequest$, comment: JRC.HttpRequestConstructorComment},
        {type: "method", signature: "HttpRequest uri(string uri)", native: HttpRequestClass.prototype._uri, comment: JRC.HttpRequestUriComment},
        {type: "method", signature: "HttpRequest header(string key, string value)", native: HttpRequestClass.prototype._header, comment: JRC.HttpRequestHeaderComment},
        {type: "method", signature: "HttpRequest POST(string data)", native: HttpRequestClass.prototype._post, comment: JRC.HttpRequestPOSTComment},
        {type: "method", signature: "HttpRequest GET(string data)", native: HttpRequestClass.prototype._get, comment: JRC.HttpRequestGETComment},



    ]

    static type: NonPrimitiveType;

    headers: HttpHeaderClass[] = [];
    uri!: string;
    postData?: string;
    method: "GET" | "POST" = "GET";

    _uri(uri: string){
        this.uri = uri;
        return this;
    }


    _cj$HttpRequest$(t: Thread, callback: CallbackFunction){
        t.s.push(this);
        if(callback) callback();
    }

    _get(){
        this.method = "GET";
        return this;
    }


    _post(data: string){
        this.method = "POST";
        this.postData = data;
        return this;
    }

    _header(key: string, value: string){
        this.headers.push(new HttpHeaderClass(key, value));
        return this;
    }


}