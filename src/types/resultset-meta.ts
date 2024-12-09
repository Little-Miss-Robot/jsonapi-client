import type { TQueryParams } from './query-params';

export interface TResultSetMeta {
    query: {
        url: string
        params: TQueryParams
    }
    performance: {
        query: number
        mapping: number
    }
    count: number
    pages: number
    perPage: number
}
