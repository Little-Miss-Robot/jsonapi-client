import {TEvent, TEventListener} from "../types/event-bus";

export interface EventBusInterface {
    on: (eventKey: string, listener: TEventListener) => void;
    emit: (eventKey: string, event: TEvent) => void;
}
