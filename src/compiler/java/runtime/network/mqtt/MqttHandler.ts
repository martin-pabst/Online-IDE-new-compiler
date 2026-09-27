import type { CallbackFunction } from "../../../../common/interpreter/StepFunction";
import type { Thread } from "../../../../common/interpreter/Thread";
import type { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import type { NonPrimitiveType } from "../../../types/NonPrimitiveType";
import { InterfaceClass } from "../../system/javalang/InterfaceClass";
import type { StringClass } from "../../system/javalang/ObjectClassStringClass";
import { MqttClientLanguage } from "./MqttClientLanguage";

export class MqttHandlerInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", package: "mqtt", signature: "interface MqttHandler", comment: MqttClientLanguage.HandlerInterfaceComment },

        { type: "method", signature: "void onMessage(String topic, String message)", java: MqttHandlerInterface.prototype._mj$onMessage$void$String$String, comment: MqttClientLanguage.HandlerOnMessageComment }
    ]

    static type: NonPrimitiveType;

    _mj$onMessage$void$String$String(t: Thread, callback: CallbackFunction, topic: StringClass, message: StringClass) {
        
    }

}