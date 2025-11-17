import { EventBusInterface } from "./contracts/EventBusInterface";
import { TEvent, TEventListener } from "./types/event-bus";

type TListenerEntry = {
    id: number;
    listener: TEventListener;
};

type TListenerMap = Record<string, TListenerEntry[]>;

export default class EventBus implements EventBusInterface {
    /**
     * The current id
     * @private
     */
    private currentId: number = 0;

    /**
     *
     * @private
     */
    private eventIdMap: Record<number, string> = {};

    /**
     * The registered event listeners
     */
    private listeners: TListenerMap = {};

    /**
     * Adds an event listener
     * @param eventKey
     * @param listener
     */
    public on(eventKey: string, listener: TEventListener) {
        // Increment the id
        const id = ++this.currentId;

        // If no listeners were added for this event key, make sure the property exists
        if (! this.listeners[eventKey]) {
            this.listeners[eventKey] = [];
        }

        // Register the event listener
        this.eventIdMap[id] = eventKey;
        this.listeners[eventKey].push({ id, listener });

        return () => this.off(id);
    }

    /**
     * Removes an event listener
     * @param eventId
     */
    public off(eventId: number) {
        const eventKey = this.eventIdMap[eventId];

        if (! eventKey) {
            return;
        }

        const listeners = this.listeners[eventKey];

        if (! listeners || ! listeners.length) {
            return;
        }

        // Filter out the current listener entry (remove it)
        this.listeners[eventKey] = listeners.filter(listenerEntry => {
            return listenerEntry.id !== eventId;
        });

        // Remove the id from the map
        delete this.eventIdMap[eventId];
    }

    /**
     * Emits an event with the given event data
     * @param eventKey
     * @param event
     */
    public emit(eventKey: string, event: TEvent = {}) {
        if (! this.listeners[eventKey]) {
            return;
        }

        // Fire the registered listeners
        this.listeners[eventKey].forEach(listenerEntry => {
            listenerEntry.listener(event);
        });
    }
}