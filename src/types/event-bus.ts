import QueryBuilder from "../QueryBuilder";
import {TQueryParamValue} from "./query-params";

export type TEventMap = {
    paramAdded: { queryBuilder: QueryBuilder<any>, name: string, value: TQueryParamValue },
    preFetch: { queryBuilder: QueryBuilder<any>, url: string },
    postFetch: { queryBuilder: QueryBuilder<any>, url: string },
    preFind: { queryBuilder: QueryBuilder<any>, uuid: string | number },
    postFind: { queryBuilder: QueryBuilder<any>, uuid: string | number, result: unknown },
    authTokenGenerated: { token: string, expiryTime: number },
};

export type TEventKey<E> = keyof E;

export type TEventListener<E, K extends TEventKey<E>> =
    E[K] extends void
        ? () => void
        : (event: E[K]) => void;