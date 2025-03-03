
// See here for vite options: https://vite.dev/config/worker-options.html

/*

How to use:
import type { Example } from "../Example";
import { BaseWebworker } from "./BaseWebWorker";

const ctx: DedicatedWorkerGlobalScope = self as any;
// Beware: additional code at end of this file!


export class ExampleWebworker extends BaseWebworker<Example> {

    constructor(ctx: DedicatedWorkerGlobalScope){
        super(ctx);
        this.run();
    }
    
    async run(){
        console.log(await this.caller.log("Hello from webworker!"));
    }

    test(name: string): string {
        return "Hello " + name;
    }



}

new ExampleWebworker(ctx);


*/



export type WebworkerMessage = WebworkerMethodCallMessage | WebworkerMethodReturnMessage;

export type WebworkerMethodCallMessage = {
    type: "call";
    methodIdentifier: string;
    parameters: any[];
    messageId: number;
}

export type WebworkerMethodReturnMessage = {
    type: "return";
    methodIdentifier: string;
    returnValue: any;
    messageId: number;
}


export class BaseWebworker<CallerType> implements ProxyHandler<any> {

    caller: CallerType;

    methodCalls: Map<number, (value: any) => any> = new Map();

    [index: string]: any;

    constructor(protected ctx: DedicatedWorkerGlobalScope) {
        ctx.addEventListener("message", (event) => {
            this.onMessage(event.data);
        });
        this.caller = new Proxy({}, this);
    }

    private async onMessage(data: WebworkerMessage) {

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
                const returnValue = await (<Function>this[data.methodIdentifier]).call(this, ...data.parameters);
                const returnMessage: WebworkerMethodReturnMessage = {
                    type: "return",
                    methodIdentifier: data.methodIdentifier,
                    messageId: data.messageId,
                    returnValue: returnValue
                }
                this.ctx.postMessage(returnMessage);
                break;
        }

    }

    get(_target: any, methodIdentifier: any, _receiver: any) {
        return async (...args: any[]): Promise<any> => {
            const message: WebworkerMethodCallMessage = {
                type: "call",
                messageId: this.lastId++,
                methodIdentifier: methodIdentifier,
                parameters: args
            }

            let promise: Promise<any> = new Promise((resolve, _reject) => {
                this.methodCalls.set(message.messageId, resolve);
                this.ctx.postMessage(message);
            });

            return promise;

        }
    }

}

