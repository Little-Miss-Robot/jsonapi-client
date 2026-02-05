import type { TRawResponse } from '../types/raw-response';

export function isRawResponse(value: unknown): value is TRawResponse {
    return (
        typeof value === 'object'
        && value !== null
    );
}
