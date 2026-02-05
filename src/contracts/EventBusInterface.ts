import type { TEventListener, TEventMap } from '../types/event-bus';

export interface EventBusInterface<E extends TEventMap> {
    on: <K extends keyof E>(eventKey: K, listener: TEventListener<E, K>) => () => void
    off: (eventId: number) => void

    emit: <K extends keyof E>(
        eventKey: K,
        ...args: E[K] extends void ? [] : [E[K]]
    ) => void
}
