import type { JsonApiLinkObject } from '../types/json-api-response';

export function isJsonApiLinkObject(value: unknown): value is JsonApiLinkObject {
    return (
        typeof value === 'object'
        && value !== null
        && 'href' in value
        && typeof value.href === 'string'
    );
}
