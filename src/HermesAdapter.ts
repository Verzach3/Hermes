import EventEmitter from "events";

class HermesAdapter {
    protected isReady = false;
    protected eventEmitter: EventEmitter | undefined;
    constructor() {
        console.log("HermesAdapter constructor");
    }

    async start() {
        console.log("HermesAdapter start");
    }

    seteventEmitter(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    emit(event: string, ...args: any[]) {
        this.eventEmitter?.emit(event, ...args) ?? console.log("Event not emitted, eventEmitter not set");
    }
}

export default HermesAdapter;