import {TEventListener, TEventMap} from "../types/event-bus";
import {container} from "./container";
import {EventBusInterface} from "../contracts/EventBusInterface";

type Bus = ReturnType<typeof events>;
type E = Bus extends EventBusInterface<infer M> ? M : never;

export function events() {
    return container().make('EventBusInterface');
}

export function on<K extends keyof E>(eventKey: K, listener: TEventListener<E, K>): () => void {
    return events().on(eventKey, listener);
}

export function off(eventId: number) {
    return events().off(eventId);
}