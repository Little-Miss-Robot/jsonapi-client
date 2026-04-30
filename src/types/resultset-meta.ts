import type { JsonApiLinks, JsonApiMeta } from './json-api-response';
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
    count?: number | null
    pages?: number | null
    perPage?: number | null
    excludedByGate?: number
    original?: JsonApiMeta
    links?: JsonApiLinks
}
