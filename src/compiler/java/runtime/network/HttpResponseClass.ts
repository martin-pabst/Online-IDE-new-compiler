import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { HttpHeaderClass } from "./HttpHeaderClass";
import { HttpRequestClass } from "./HttpRequestClass";

export class HttpResponseClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "class HttpResponse extends Object", comment: JRC.HttpResponseClassComment},

        {type: "method", signature: "string uri()", native: HttpResponseClass.prototype._getUri, comment: JRC.HttpResponseUriComment},
        {type: "method", signature: "string body()", native: HttpResponseClass.prototype._getBody, comment: JRC.HttpResponseBodyComment},
        {type: "method", signature: "int statusCode()", native: HttpResponseClass.prototype._getStatusCode, comment: JRC.HttpResponseStatusCodeComment},
        {type: "method", signature: "string statusText()", native: HttpResponseClass.prototype._getStatusText, comment: JRC.HttpResponseStatusTextComment},
        {type: "method", signature: "HttpRequest request()", native: HttpResponseClass.prototype._getRequest, comment: JRC.HttpResponseRequestComment},
        {type: "method", signature: "HttpHeader[] headers()", native: HttpResponseClass.prototype._getHeaders, comment: JRC.HttpResponseHeadersComment},

    ]

    static type: NonPrimitiveType;

    request!: HttpRequestClass;
    headers: HttpHeaderClass[] = [];

    constructor(private response: Response, private body: string){
        super();
        if(!response) return;
        response.headers.forEach((value, key) => this.headers.push(new HttpHeaderClass(key, value)));
    }


    _getUri(): string {
        return this.response.url;
    }

    _getBody(): string {
        return this.body;
    }

    _getStatusCode(): number {
        return this.response.status;
    }

    _getStatusText(): string {
        return this.response.statusText;
    }

    _getRequest(): HttpRequestClass {
        return this.request;
    }

    _getHeaders(): HttpHeaderClass[] {
        return this.headers.slice();
    }
}