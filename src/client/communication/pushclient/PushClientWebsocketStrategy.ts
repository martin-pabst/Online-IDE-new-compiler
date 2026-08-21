import { csrfToken } from "../AjaxHelper";
import { BasePushClientManager, ServerSentMessage } from "./BasePushClientManager.js";
import { PushClientStrategy } from "./PushClientStrategy";

export class PushClientWebsocketStrategy extends PushClientStrategy {

    csrfToken: string;

    websocket: WebSocket;

    state: "closed" | "connecting" | "open" = "closed";

    openedTimestamp: number;

    currentTimer: any;

    constructor(manager: BasePushClientManager) {
        super("websocket strategy", manager);
    }

    open(): void {

        this.state = "connecting";

        try {

            let url: string = (window.location.protocol.startsWith("https") ? "wss://" : "ws://") + window.location.host + "/servlet/pushWebsocket?csrfToken=" + csrfToken;

            this.websocket = new WebSocket(url);
    
            this.websocket.onopen = (event) => {
                this.state = "open";
                this.openedTimestamp = performance.now();
            }
    
            this.websocket.onclose = (event) => {
                console.log("Websocket has been closed, code: " + event.code + ", reason: " + event.reason);

                this.state = "closed";
                
                if(event.code == 1001 && performance.now() - this.openedTimestamp > 1e4){
                    // timeout? => reopen
                    console.log("Reason was timeout, dt > 10s => Reopen!");
                    this.open();
                } else {
                    this.manager.onStrategyFailed(this);
                    this.state = "closed";
                }
                
            }
    
            this.websocket.onerror = (event) => { 
                console.log("Error on websocket, type: " + event.type);
                this.websocket.close();
                this.manager.onStrategyFailed(this);
                this.state = "closed";
            }
    
            this.websocket.onmessage = (event) => {
                if(event.data == "pong") return;
                const msg: ServerSentMessage[] = JSON.parse(event.data);
                this.manager.onMessage(msg);
            }

            if(this.currentTimer != null){
                clearTimeout(this.currentTimer);
            }

            this.doPing();

        } catch (ex){
            this.manager.onStrategyFailed(this);
            this.state = "closed";
        }

    }

    doPing(){
        this.currentTimer = setTimeout(() => {
            switch(this.state){
                case "closed":
                    this.currentTimer = null;
                    return;
                case "connecting":
                    this.doPing();
                    break;
                case "open":
                    this.websocket.send("ping");
                    this.doPing();
                    break;
            }
        }, 25000);
    }


    async close() {
        this.state = "closed";
        this.websocket.close();
    }

}