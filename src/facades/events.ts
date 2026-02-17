import type { EventBusInterface } from '../contracts/EventBusInterface';
import type { TEventListener } from '../types/event-bus';
import { container } from './container';

type Bus = ReturnType<typeof events>;
type E = Bus extends EventBusInterface<infer M> ? M : never;

/**
 * Access the event bus
 */
export function events() {
    return container().make('events');
}

/**
 * Registers an event listener to the event bus
 * @param eventKey
 * @param listener
 */
export function on<K extends keyof E>(eventKey: K, listener: TEventListener<E, K>): () => void {
    return events().on(eventKey, listener);
}

/**
 * Removes an event listener from the event bus
 * @param eventId
 */
export function off(eventId: number) {
    return events().off(eventId);
}
