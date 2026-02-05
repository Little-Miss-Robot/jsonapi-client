import type { EventBusInterface } from './contracts/EventBusInterface';
import type { TEventKey, TEventListener, TEventMap } from './types/event-bus';

interface TListenerEntry<E, K extends TEventKey<E>> {
    id: number
    listener: TEventListener<E, K>
}

type TListenerMap<E> = {
    [K in TEventKey<E>]?: TListenerEntry<E, K>[];
};

export default class EventBus<E extends TEventMap> implements EventBusInterface<E> {
    /**
     * The current id
     * @private
     */
    private currentId: number = 0;

    /**
     *
     * @private
     */
    private eventIdMap: Record<number, TEventKey<E>> = {};

    /**
     * The registered event listeners
     */
    private listeners: TListenerMap<E> = {};

    /**
     * Adds an event listener
     * @param eventKey
     * @param listener
     */
    public on<K extends TEventKey<E>>(eventKey: K, listener: TEventListener<E, K>) {
        // Increment the id
        const id = ++this.currentId;

        // If no listeners were added for this event key, make sure the property exists
        if (!this.listeners[eventKey]) {
            this.listeners[eventKey] = [];
        }

        // Register the event listener
        this.eventIdMap[id] = eventKey;
        this.listeners[eventKey]!.push({ id, listener });

        return () => this.off(id);
    }

    /**
     * Removes an event listener
     * @param eventId
     */
    public off(eventId: number) {
        const eventKey = this.eventIdMap[eventId];

        if (!eventKey) {
            return;
        }

        const listeners = this.listeners[eventKey];

        if (!listeners || !listeners.length) {
            return;
        }

        // Filter out the current listener entry (remove it)
        this.listeners[eventKey] = listeners.filter((listenerEntry) => {
            return listenerEntry.id !== eventId;
        });

        // Remove the id from the map
        delete this.eventIdMap[eventId];
    }

    /**
     * Emits an event with the given event data
     * @param eventKey
     * @param args
     */
    public emit<K extends TEventKey<E>>(eventKey: K, ...args: E[K] extends void ? [] : [E[K]]) {
        const listeners = this.listeners[eventKey];
        if (!listeners)
            return;

        listeners.forEach(({ listener }) => {
            // @ts-expect-error TS can't narrow variadic tuple here perfectly
            listener(...args);
        });
    }
}
