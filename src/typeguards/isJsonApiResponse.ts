import type { TJsonApiResponse } from '../types/json-api-response';

export function isJsonApiResponse(value: unknown): value is TJsonApiResponse {
    return (
        typeof value === 'object'
        && value !== null
        && (
            ('data' in value && typeof value.data === 'object')
            || ('meta' in value && typeof value.meta === 'object')
            || ('errors' in value && Array.isArray(value.errors))
        )
    );
}
