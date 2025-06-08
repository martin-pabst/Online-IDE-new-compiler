import { ajax } from "../../../../client/communication/AjaxHelper";
import { GetWebSocketTokenResponse, WebSocketRequestConnect, WebSocketRequestDisconnect, WebSocketRequestFindPairing, WebSocketRequestSendToAll, WebSocketRequestSendToClient, WebSocketResponse, WebSocketResponsePairingFound } from "../../../../client/communication/Data";
import { Main } from "../../../../client/main/Main";
import { CallbackParameter } from "../../../common/interpreter/CallbackParameter";
import { Interpreter } from "../../../common/interpreter/Interpreter";
import { Thread } from "../../../common/interpreter/Thread";
import { ThreadState } from "../../../common/interpreter/ThreadState";
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../module/libraries/DeclareType";
import { NonPrimitiveType } from "../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../system/javalang/ObjectClassStringClass";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException";
import { SystemClass } from "../system/javalang/SystemClass";
import { WebSocketClientClass } from "./WebSocketClientClass";

export class WebSocketClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class WebSocket extends Object", comment: JRC.WebSocketClassComment },
        { type: "method", signature: "WebSocket()", java: WebSocketClass.prototype._cj$_constructor_$WebSocket$, comment: JRC.WebSocketConstructorComment },
        { type: "method", signature: "void open(string sessionCode, string nickname)", java: WebSocketClass.prototype._mj$open$void$string$string, comment: JRC.WebSocketOpenComment },
        { type: "method", signature: "void sendToAll(string message, string messageType)", native: WebSocketClass.prototype._sendToAll, comment: JRC.WebSocketSendToAllComment },
        { type: "method", signature: "void findClients(int count)", native: WebSocketClass.prototype._findClientsFromCount, comment: JRC.WebSocketFindClientsComment },
        { type: "method", signature: "void findClients(string[] nicknames)", native: WebSocketClass.prototype._findClientsFromNicknames, comment: JRC.WebSocketFindClientsByNicknamesComment },
        { type: "method", signature: "void findClient(string nicknames)", native: WebSocketClass.prototype._findClientsFromNicknames, comment: JRC.WebSocketFindClientComment },
        { type: "method", signature: "void close()", native: WebSocketClass.prototype._close, comment: JRC.WebSocketCloseComment },
        { type: "method", signature: "WebSocketClient getOtherClients()", native: WebSocketClass.prototype._getOtherClients, comment: JRC.WebSocketGetOtherClientsComment },

        { type: "method", signature: "void onOpen()", java: WebSocketClass.prototype._mj$onOpen$void$, comment: JRC.WebSocketOnOpenComment },
        { type: "method", signature: "void onClose()", java: WebSocketClass.prototype._mj$onClose$void$, comment: JRC.WebSocketOnCloseComment },
        { type: "method", signature: "void onMessage(WebSocketClient sender, String message, String messageType)", java: WebSocketClass.prototype._mj$onMessage$void$WebSocketClient$String$String, comment: JRC.WebSocketOnMessageComment },
        { type: "method", signature: "void onOtherClientConnected(WebSocketClient otherClient)", java: WebSocketClass.prototype._mj$onOtherClientConnected$void$WebSocketClient, comment: JRC.WebSocketOnOtherClientConnectedComment },
        { type: "method", signature: "void onOtherClientDisconnected(WebSocketClient otherClient)", java: WebSocketClass.prototype._mj$onOtherClientDisconnected$void$WebSocketClient, comment: JRC.WebSocketOnOtherClientDisconnectedComment },
        { type: "method", signature: "void onClientsFound(WebSocketClient[] otherClients, int ownNumber)", java: WebSocketClass.prototype._mj$onClientsFound$void$WebSocketClient_I$int, comment: JRC.WebSocketOnClientsFoundComment },
    ];

    static type: NonPrimitiveType;


    clientList: WebSocketClientClass[] = [];
    idToClientMap: { [id: number]: WebSocketClientClass } = {};

    connection?: WebSocket;
    client_id: number = 0; // own client-id
    isOpen: boolean = false;

    interpreter!: Interpreter;
    main: Main;

    _cj$_constructor_$WebSocket$(t: Thread, callback: CallbackParameter) {
        this.interpreter = t.scheduler.interpreter;
        this.main = <Main>this.interpreter.getMain();
        t.s.push(this);
        if(callback) callback();
    }

    /*
     * Event handler to override:
     */

    _mj$onOpen$void$(t: Thread, callback: CallbackParameter){}

    _mj$onClose$void$(t: Thread, callback: CallbackParameter){}

    _mj$onMessage$void$WebSocketClient$String$String(t: Thread, callback: CallbackParameter, sender: WebSocketClientClass, message: StringClass, messageType: StringClass){}

    _mj$onOtherClientDisconnected$void$WebSocketClient(t: Thread, callback: CallbackParameter, otherClient: WebSocketClientClass){}

    _mj$onOtherClientConnected$void$WebSocketClient(t: Thread, callback: CallbackParameter, otherClient: WebSocketClientClass){}

    _mj$onClientsFound$void$WebSocketClient_I$int(t: Thread, callback: CallbackParameter, otherClients: WebSocketClientClass[], ownNumber: number){}

    /*
    * java-methods:
    */

   _mj$open$void$string$string(t: Thread, callback: CallbackParameter, sessionCode: string, nickName: string) {

        if (t.scheduler.interpreter.runsEmbedded()) {
            throw new RuntimeExceptionClass(JRC.WebSocketNotInEmbeddedException());
        }

        t.scheduler.interpreter.showProgramPointer(undefined, "WebSocketClass");
        this.main.getBottomDiv().showHideDBBusyIcon(true);
        t.state = ThreadState.waiting;


        ajax('getWebSocketToken', {}, (response: GetWebSocketTokenResponse) => {

            let url: string = (window.location.protocol.startsWith("https") ? "wss://" : "ws://") + window.location.host + "/servlet/websocket";
            this.connection = new WebSocket(url);

            this.connection.onerror = (error: Event) => { this.onError(error); }
            this.connection.onclose = (event: CloseEvent) => { this.onClose(event); }
            this.connection.onmessage = (event: MessageEvent) => { this.onMessage(event); }

            this.connection.onopen = (event: Event) => {
                let request: WebSocketRequestConnect = {
                    command: 1,
                    token: response.token,
                    nickname: nickName,
                    sessionCode: sessionCode
                }

                t.scheduler.interpreter.eventManager.once("stop", () => {
                    this._close();
                })

                this.isOpen = true;
                this.main.getBottomDiv().showHideDBBusyIcon(false);
                this.sendIntern(JSON.stringify(request));
                this.onOpen();
                t.state = ThreadState.running;

            }

        });

    }

    _close(){
        this.disconnect();
    }
    _getOtherClients(){
        return this.clientList.slice();
    }

    _findClientsFromCount(count: number) {
        let message: WebSocketRequestFindPairing = {
            command: 6,
            count: count,
            nicknames: []
        }

        this.sendIntern(JSON.stringify(message));
    }

    _findClientsFromNicknames(nicknames: string | string[]) {
        if(!Array.isArray(nicknames)) nicknames = [nicknames];

        let message: WebSocketRequestFindPairing = {
            command: 6,
            count: nicknames.length,
            nicknames: nicknames
        }

        this.sendIntern(JSON.stringify(message));
    }

    _sendToAll(data: string, dataType: string) {
        let message: WebSocketRequestSendToAll = {
            command: 2,
            data: data,
            dataType: dataType
        };
        this.sendIntern(JSON.stringify(message));
    }



    /*
    * internal methods:
    */


   unsentMessages: string[] = [];
   sendIntern(message: string) {

       if (!this.isOpen) {
           this.unsentMessages.push(message);
        } else {
            try {
                this.connection.send(message);
            } catch (exception) {
                console.log(exception);
            }
        }
    }

    onClose(event: CloseEvent) {
        this.isOpen = false;
        let thread = this.interpreter.scheduler.createThread("Websocket-onOpen");
        this._mj$onClose$void$(thread, undefined);
        thread.state = ThreadState.running;
    }

    sendToClient(clientId: number, data: string, dataType: string) {
        let message: WebSocketRequestSendToClient = {
            command: 3,
            data: data,
            dataType: dataType,
            recipient_id: clientId
        };
        this.sendIntern(JSON.stringify(message));
    }

    disconnect() {
        let message: WebSocketRequestDisconnect = {
            command: 4
        };
        this.sendIntern(JSON.stringify(message));
        this.connection.close();
    }

    onMessage(event: MessageEvent) {

        let response: WebSocketResponse = JSON.parse(event.data);
        if (response.command == undefined) return;

        switch (response.command) {
            case 1: // new Client
                let newClient = new WebSocketClientClass(this, response.user_id,
                    response.rufname, response.familienname, response.username, response.nickname);
                this.clientList.push(newClient);
                this.idToClientMap[response.user_id] = newClient;

                let thread = this.interpreter.scheduler.createThread("Websocket-onClientConnected");
                this._mj$onOtherClientConnected$void$WebSocketClient(thread, undefined, newClient);
                thread.state = ThreadState.running;

                break;
            case 2: // message
                let senderClient = this.idToClientMap[response.from_client_id];
                if (senderClient == null) return;

                let thread1 = this.interpreter.scheduler.createThread("Websocket-onMessage");
                this._mj$onMessage$void$WebSocketClient$String$String(thread1, undefined, senderClient, new StringClass(response.data), new StringClass(response.dataType));
                thread1.state = ThreadState.running;

                break;
            case 3: // other client disconnected
                let disconnectedClient = this.idToClientMap[response.disconnecting_client_id];
                if (disconnectedClient == null) return;
                this.clientList.splice(this.clientList.indexOf(disconnectedClient), 1);
                this.idToClientMap[response.disconnecting_client_id] = undefined;

                let thread2 = this.interpreter.scheduler.createThread("Websocket-onClientDisconnected");
                this._mj$onOtherClientDisconnected$void$WebSocketClient(thread2, undefined, disconnectedClient);
                thread2.state = ThreadState.running;

                break;
            case 4: // time synchronization
                SystemClass.synchronizeToServerTimeMillis(response.currentTimeMills);
                this.client_id = response.client_id
                break;
            case 5: // keep alive
                break;
            case 6: // Clients found
                this.onClientsFound(response);
                break;
        }
    }

    onClientsFound(response: WebSocketResponsePairingFound) {
        let own_index: number = 0;
        let otherClients: WebSocketClientClass[] = [];

        for (let client of response.clients) {
            if (client.id == this.client_id) {
                own_index = client.index;
            } else {
                let otherClient = this.idToClientMap[client.id];
                if (otherClient != null) {
                    otherClient.index = client.index;
                    otherClients.push(otherClient);
                }
            }
        }

        let thread1 = this.interpreter.scheduler.createThread("Websocket-onClientsFound");
        this._mj$onClientsFound$void$WebSocketClient_I$int(thread1, undefined, otherClients, own_index);
        thread1.state = ThreadState.running;

    }

    onError(error: Event) {
        this.interpreter.printManager?.print(JRC.WebSocketCommunicationError() + error?.toString(), true, 0x3030ff);
    }

    onOpen() {
        this.isOpen = true;
        if (this.unsentMessages.length > 0) {
            this.unsentMessages.forEach(m => this.sendIntern(m));
            this.unsentMessages = [];
        }

        let thread = this.interpreter.scheduler.createThread("Websocket-onOpen");
        this._mj$onOpen$void$(thread, undefined);
        thread.state = ThreadState.running;
    }



}