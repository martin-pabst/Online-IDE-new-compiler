import { CallbackFunction } from "../../../common/interpreter/RuntimeConstants.ts";
import { Thread } from "../../../common/interpreter/Thread.ts";
import { ThreadState } from "../../../common/interpreter/ThreadState.ts";
import { JRC } from "../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../module/libraries/LibraryTypeDeclaration.ts";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException.ts";
import { HttpRequestClass } from "./HttpRequestClass.ts";
import { HttpResponseClass } from "./HttpResponseClass.ts";

export class HttpClientClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class HttpClient extends Object", comment: JRC.HttpClientComment },

        {type: "method", signature: "HttpClient()", native: HttpClientClass.prototype._httpClientConstructor, comment: JRC.HttpClientConstructorComment},
        {type: "method", signature: "HttpResponse send(HttpRequest request)", java: HttpClientClass.prototype._mj$send$HttpResponse$HttpRequest, comment: JRC.HttpClientSendComment},

    ]

    static type: NonPrimitiveType;

    _httpClientConstructor(){
        return this;
    }

    _mj$send$HttpResponse$HttpRequest(t: Thread, callback: CallbackFunction, request: HttpRequestClass) {

        t.state = ThreadState.waiting;
        t.scheduler.interpreter.showProgramPointer(undefined, "HttpRequestClass");

        let headerObject: { [key: string]: string } = {};
        for (let header of request.headers) {
            headerObject[header.key] = header.value;
        }

        try {
            fetch(request.uri, {
                method: request.method,
                body: request.method == "GET" ? undefined : request.postData,
                headers: headerObject,
                redirect: "follow",
                cache: "no-cache"
            })
                .then((response) => {

                    response.text().then((body: string) => {
                        let responseObject = new HttpResponseClass(response, body);

                        t.s.push(responseObject);
                        t.scheduler.interpreter.hideProgrampointerPosition("HttpRequestClass");
                        if (t.state == ThreadState.waiting) {
                            t.state = ThreadState.running;
                            if (callback) callback();
                        }

                    })

                }).catch((reason) => {
                    throw new RuntimeExceptionClass("" + reason);
                })
        } catch (error) {
            throw new RuntimeExceptionClass("" + error);
        }
    }


}