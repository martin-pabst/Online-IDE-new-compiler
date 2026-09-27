import type { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import type { Thread } from "../../../../common/interpreter/Thread";
import type { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import type { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { ObjectClass, StringClass } from "../../system/javalang/ObjectClassStringClass";
import { MqttClientLanguage } from "./MqttClientLanguage";
import { RuntimeExceptionClass } from "../../system/javalang/RuntimeException";
import type { MqttHandlerInterface } from "./MqttHandler";
import { SchedulerState } from "../../../../common/interpreter/SchedulerState";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import mqtt from "mqtt";
import { MqttExceptionClass } from "./MqttException";

export class MqttClientClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: "mqtt", signature: "class MqttClient extends Object", comment: MqttClientLanguage.MqttClientClassComment },

        { type: "method", signature: "MqttClient(string serverURL)", java: MqttClientClass.prototype._mqttClientConstructor, comment: MqttClientLanguage.MqttClientConstructorComment },
        { type: "method", signature: "void subscribe(string topic)", native: MqttClientClass.prototype._subscribe, comment: MqttClientLanguage.subscribeComment },
        { type: "method", signature: "void subscribe(string topic, mqtt.MqttHandler handler)", native: MqttClientClass.prototype._subscribe, comment: MqttClientLanguage.subscribeHandlerComment },
        { type: "method", signature: "void publish(string topic, string message)", native: MqttClientClass.prototype._publish, comment: MqttClientLanguage.publishComment },

        { type: "method", signature: "void onMessage(String topic, String message)", java: MqttClientClass.prototype._mj$onMessage$void$String$String, comment: MqttClientLanguage.HandlerOnMessageComment },
        { type: "method", signature: "void close()", native: MqttClientClass.prototype._close, comment: MqttClientLanguage.CloseComment },

    ]

    static type: NonPrimitiveType;

    mqttClient: mqtt.MqttClient;

    handlers: Map<string, (MqttClientClass | MqttHandlerInterface)[]> = new Map();

    _mqttClientConstructor(t: Thread, callback: CallbackFunction, serverURL: string) {
        t.state = ThreadState.waiting;
        t.scheduler.interpreter.showProgramPointer(undefined, "HttpRequestClass");

        try {
            this.mqttClient = mqtt.connect(serverURL);
            this.mqttClient.on("connect", () => {

                this.mqttClient.on("message", (topic, message) => {
                    let messageString = message.toString();

                    let handlers: (MqttClientClass | MqttHandlerInterface)[] = [];

                    let handlerPrefixes: string[] = [];
                    let topicParts = topic.split("/");
                    let path = "";
                    for (let i = 0; i < topicParts.length; i++) {
                        path += topicParts[i];
                        if (i < topicParts.length - 1) {
                            path += "/";
                            handlerPrefixes.push(path + "#");
                        } else {
                            handlerPrefixes.push(path);
                        }
                    }

                    for (let handlerPrefix of handlerPrefixes) {
                        let handlers1 = this.handlers.get(handlerPrefix);
                        if (handlers1) {
                            handlers.push(...handlers1);
                        }
                    }

                    let topic1 = new StringClass(topic);
                    let message1 = new StringClass(messageString);

                    if (t.scheduler.interpreter.isRunningOrPaused()) {
                        handlers.forEach((handler) => {
                            let thread = t.scheduler.createThread("MqttClient.onMessage");
                            handler._mj$onMessage$void$String$String(thread, undefined, topic1, message1);
                            thread.state = ThreadState.running;
                        });

                        let thread1 = t.scheduler.createThread("MqttClient.onMessage");
                        this._mj$onMessage$void$String$String(thread1, undefined, topic1, message1);
                        thread1.state = ThreadState.running;
                    }


                });

                this.mqttClient.on("close", () => {
                    this.mqttClient = null;
                });


                t.scheduler.interpreter.eventManager.once("stop", () => {
                    this.mqttClient.end(true);
                });

                t.s.push(this);
                t.scheduler.interpreter.hideProgrampointerPosition("HttpRequestClass");
                if (t.state == ThreadState.waiting) {
                    t.state = ThreadState.running;
                    if (callback) callback();
                }
            });
        } catch (error) {
            this.mqttClient = null;
            t.s.push(null);

            t.throwRuntimeExceptionOnLastExecutedStep(new MqttExceptionClass("MQTT connection error: " + error));

            t.scheduler.interpreter.hideProgrampointerPosition("HttpRequestClass");
            if (t.state == ThreadState.waiting) {
                t.state = ThreadState.running;
                if (callback) callback();
            }
        }

    }

    _subscribe(topic: string, handler?: MqttClientClass | MqttHandlerInterface) {
        if (!this.mqttClient) {
            throw new RuntimeExceptionClass("MQTT client is not initialized.");
        }

        if (handler) {
            let handlers = this.handlers.get(topic);
            if (!handlers) {
                handlers = [];
                this.handlers.set(topic, handlers);
            }
            handlers.push(handler);
        }

        this.mqttClient.subscribe(topic);

    }

    _mj$onMessage$void$String$String(t: Thread, callback: CallbackFunction, topic: StringClass, message: StringClass) {

    }

    _publish(topic: string, message: string) {
        if (!this.mqttClient) {
            throw new RuntimeExceptionClass("MQTT client is not initialized.");
        }

        this.mqttClient.publish(topic, message);
    }

    _close() {
        if (this.mqttClient) {
            this.mqttClient.end(true);
            this.mqttClient = null;
        }
    }

}