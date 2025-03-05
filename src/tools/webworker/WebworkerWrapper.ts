import { WebworkerMessage, WebworkerMethodCallMessage, WebworkerMethodReturnMessage } from "./BaseWebWorker";

/*
How to use:

import type { ExampleWebworker } from './webworker/ExampleWebworker';
import { WebworkerWrapper } from './webworker/WebworkerWrapper';
import myWorkerUrl from './webworker/ExampleWebworker?worker&url';



export class Example {

    exampleWebworker: ExampleWebworker;

    constructor(){
        const worker = new Worker(myWorkerUrl, {type: 'module'});
        this.exampleWebworker = new WebworkerWrapper<ExampleWebworker>(worker, this).getWrapper();
        this.run();
    }
    
    async run(){
        console.log(await this.exampleWebworker.test("World"));
    }

    log(message: string){
        console.log(message);
        return "Done!";
    }

}


*/


export class WebworkerWrapper<WebworkerType> implements ProxyHandler<any> {

    lastId: number = 0;

    methodCalls: Map<number, (value: any) => any> = new Map();


    constructor(protected worker: Worker, private caller: any) {
        worker.onmessage = (event) => {
            this.onMessage(event.data);
        }
    }

    getWrapper(): WebworkerType {
        return new Proxy({}, this);
    }

    get(_target: any, methodIdentifier: any, _receiver: any){
        return async (...args: any[]): Promise<any> => {
            const message: WebworkerMethodCallMessage = {
                type: "call",
                messageId: this.lastId++,
                methodIdentifier: methodIdentifier,
                parameters: args
            }

            let promise: Promise<any> = new Promise((resolve, _reject) => {
                this.methodCalls.set(message.messageId, resolve);
                this.worker.postMessage(message);
            });

            return promise;

        }
    }

    public onMessage(data: WebworkerMessage) {

        switch (data.type) {
            case "return":
                let message: WebworkerMethodReturnMessage = data;
                let methodCall: ((value: any) => any) | undefined = this.methodCalls.get(message.messageId);
                if(methodCall){
                    this.methodCalls.delete(message.messageId);
                    methodCall(message.returnValue)
                }
                break;
            case "call":
                const returnValue = (<Function>this.caller[data.methodIdentifier]).call(this.caller, ...data.parameters);
                const returnMessage: WebworkerMethodReturnMessage = {
                    type: "return",
                    methodIdentifier: data.methodIdentifier,
                    messageId: data.messageId,
                    returnValue: returnValue
                }
                this.worker.postMessage(returnMessage);
                break;
        }


    }



}