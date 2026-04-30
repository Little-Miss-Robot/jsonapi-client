export interface TJsonApiResponse {
    json_api?: object
    links?: JsonApiLinks
    data?: Array<object>
    errors?: Array<object>
    meta?: JsonApiMeta
}

export type JsonApiMeta = Record<string, unknown>;

export interface JsonApiLinkObject {
    href: string
    rel?: string
    describedby?: string | JsonApiLinkObject
    title?: string
    type?: string
    hreflang?: string | string[]
    meta?: JsonApiMeta
}

export type JsonApiLink = string | JsonApiLinkObject | null;

export type JsonApiLinks = Record<string, JsonApiLink>;
