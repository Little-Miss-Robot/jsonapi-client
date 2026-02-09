import type { TEventListener, TEventMap } from '../types/event-bus';

export interface EventBusInterface<E extends TEventMap> {
    /**
     * Adds an event listener
     * @param eventKey
     * @param listener
     */
    on: <K extends keyof E>(eventKey: K, listener: TEventListener<E, K>) => () => void

    /**
     * Removes an event listener
     * @param eventId
     */
    off: (eventId: number) => void

    /**
     * Emits an event with the given event data
     * @param eventKey
     * @param args
     */
    emit: <K extends keyof E>(
        eventKey: K,
        ...args: E[K] extends void ? [] : [E[K]]
    ) => void
}
