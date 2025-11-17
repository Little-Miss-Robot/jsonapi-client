import Container from "../Container";
import { TEventListener } from "../types/event-bus";

export function events() {
    return Container.make('EventBusInterface');
}

export function on(eventKey: string, listener: TEventListener) {
    return events().on(eventKey, listener);
}

export function off(eventId: number) {
    return events().off(eventId);
}