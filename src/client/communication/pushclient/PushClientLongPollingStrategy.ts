import { csrfToken } from "../AjaxHelper";
import { BasePushClientManager } from "./BasePushClientManager.js";
import { PushClientStrategy } from "./PushClientStrategy";

export class PushClientLongPollingStrategy extends PushClientStrategy {

    isClosed: boolean;
    csrfToken: string;

    /**
     * Problem: If a router between browser and server has a client timeout,
     * then the browser is informed but the server does not which leads to resources
     * not being freed on server side. 
     * The solution for this problem is to make the server timeout after a certain amount
     * of time and free it's resources. To get a rough estimation for this timeout we 
     * let the client measure how long polling requests last and tell it to the server.
     */
    serverTimeoutMs: number = 180000;   // 3 min

    timeOpened: number = null;

    degregadeToPollingWithIntervalMs = 10000;

    abortController: AbortController;



    constructor(manager: BasePushClientManager) {
        super("long-polling strategy", manager);
        this.isClosed = false;
    }

    open(): void {

        this.isClosed = false;

        this.abortController = new AbortController();

        this.timeOpened = performance.now();

        let headers: [string, string][] = [["content-type", "text/json"]];

        headers.push(["x-token-pm", csrfToken]);
        this.csrfToken = csrfToken;
        headers.push(["x-timeout", this.serverTimeoutMs + ""]);

        try {
            fetch("/servlet/registerLongpollingListener", {
                signal: this.abortController.signal,
                method: "POST",
                headers: headers,
                body: JSON.stringify({})
            }).then((response) => {
                
                let timeSinceOpenedMs = Math.round(performance.now() - this.timeOpened);
                if (response.status != 200) {
                    console.log(`Long-polling listener got http-status: ${response.status} (${response.statusText})`);
                    if (timeSinceOpenedMs + 4000 < this.serverTimeoutMs) this.serverTimeoutMs = timeSinceOpenedMs + 4000;
                }

                let reopenInMs = Math.max(10, this.degregadeToPollingWithIntervalMs - timeSinceOpenedMs);

                switch (response.status) {
                    case 200:
                        this.reopen(10);        // reopen BEFORE processing message so that reopen is done even if exception occurs during message processing
                        response.json().then(data => {
                            this.manager.onMessage(data)
                        });
                        break;
                    case 502:   // timeout!
                    case 504:   // gateway timeout!
                        this.reopen(reopenInMs, false);
                        break;
                    case 401:
                        console.log("PushClientLongPollingStrategy: Got http status code 401, -> trying again in reopenInMs ms.");
                        this.reopen(reopenInMs, false);
                        break;
                    default:
                        this.reopen(reopenInMs, false);
                        break;
                }

            }).catch((reason) => {
                console.log(`Long-polling listener failed due to reason: ${reason}`);
                let timeSinceOpenedMs = Math.round(performance.now() - this.timeOpened);
                let reopenInMs = Math.max(10, this.degregadeToPollingWithIntervalMs - timeSinceOpenedMs);
                this.reopen(reopenInMs, false);
            }).finally(() => {
                this.abortController = null;
            })

        } catch (ex) {
                let timeSinceOpenedMs = Math.round(performance.now() - this.timeOpened);
                let reopenInMs = Math.max(10, this.degregadeToPollingWithIntervalMs - timeSinceOpenedMs);
            this.reopen(reopenInMs, false);
        }

    }

    reopen(timeout: number = 500, silently: boolean = true) {
        if (this.isClosed) return;
        if (timeout > 500) {
            console.log(`Reopen long-polling listener in ${timeout / 1000} seconds...`);
        }
        setTimeout(() => {
            if (this.isClosed) return;
            this.open();
        }, timeout);

    }


    async close() {
        this.isClosed = true;
        this.abortController?.abort();

        let headers: [string, string][] = [["content-type", "text/json"]];

        headers.push(["x-token-pm", this.csrfToken]);

        await fetch("/servlet/unregisterLongpollingListener", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({})
        })
    }

}