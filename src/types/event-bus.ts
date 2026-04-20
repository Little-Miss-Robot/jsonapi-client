import type QueryBuilder from '../QueryBuilder';
import type { TQueryParamValue } from './query-params';
import type { HttpRequest } from './request';

interface RequestEvent extends HttpRequest {
    url: string
}

export interface TEventMap {
    paramAdded: { queryBuilder: QueryBuilder<any>, name: string, value: TQueryParamValue }

    preFetch: RequestEvent
    postFetch: RequestEvent
    retry: {
        request: HttpRequest
        attempt: number
    }

    preFind: { queryBuilder: QueryBuilder<any>, uuid: string | number }
    postFind: { queryBuilder: QueryBuilder<any>, uuid: string | number, result: unknown }

    generatingAuthToken: null
    authTokenGenerated: { token: string, expiryTime: number }
}

export type TEventKey<E> = keyof E;

export type TEventListener<E, K extends TEventKey<E>> =
    E[K] extends void
        ? () => void
        : (event: E[K]) => void;
