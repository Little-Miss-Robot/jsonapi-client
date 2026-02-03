import {TEventListener, TEventMap} from "../types/event-bus";
import {container} from "./container";

export function events() {
    return container().make('EventBusInterface');
}

export function on<E, K extends keyof TEventMap>(eventKey: keyof TEventMap, listener: TEventListener<E, K>) {
    return events().on(eventKey, listener);
}

export function off(eventId: number) {
    return events().off(eventId);
}