type CallbackFunction = (...args: any[]) => void;

type CallbackEntry = {
    f: CallbackFunction,
    thisArg?: object
}

export class EventManager<EventType extends string> {

    private eventTypeToCallbackMap: Map<EventType, CallbackEntry[]> = new Map();
    private callbackToEventTypeMap: Map<CallbackFunction, EventType> = new Map();

    private onceMap: Map<CallbackFunction, boolean> = new Map();

    public async waitFor(eventType: EventType): Promise<void>{
        let promise = new Promise<void>((resolve, reject) => {

            this.on(eventType, () => {
                resolve();
            })

        });
        return promise;
    }


    public on(eventType: EventType, callback: CallbackFunction, thisArg?: object) {
        let callbackList = this.eventTypeToCallbackMap.get(eventType);
        if (!callbackList) {
            callbackList = [];
            this.eventTypeToCallbackMap.set(eventType, callbackList);
        }
        callbackList.push({
            f: callback,
            thisArg: thisArg
        });
        this.callbackToEventTypeMap.set(callback, eventType);
    }

    public off(callback: CallbackFunction) {
        let evenType = this.callbackToEventTypeMap.get(callback);
        if (!evenType) return;

        this.callbackToEventTypeMap.delete(callback);
        this.onceMap.delete(callback);

        let callbackList = this.eventTypeToCallbackMap.get(evenType);
        if (!callbackList) return;
        let index = callbackList.findIndex(cbe => cbe.f == callback);
        if (index >= 0) callbackList.splice(index, 1);
        if (callbackList.length == 0) this.eventTypeToCallbackMap.delete(evenType);
    }

    public once(eventType: EventType, callback: CallbackFunction, thisArg?: object) {
        this.on(eventType, callback, thisArg);
        this.onceMap.set(callback, true);
    }

    public fire(eventType: EventType, ...args: any[]) {
        let callbackList = this.eventTypeToCallbackMap.get(eventType);
        if (!callbackList) return;

        let callbacksToDelete: CallbackEntry[] = [];

        for (let callback of callbackList.slice()) {
            callback.f.call(callback.thisArg, ...args);
            if (this.onceMap.get(callback.f)) {
                callbacksToDelete.push(callback);
                this.onceMap.delete(callback.f);
            }
        }

        callbacksToDelete.forEach(cb => this.off(cb.f));
    }

}