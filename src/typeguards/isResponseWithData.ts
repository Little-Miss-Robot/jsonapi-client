import type { TResponseWithData } from '../types/response-with-data';

export function isResponseWithData(value: unknown): value is TResponseWithData {
    return typeof value === 'object' && value !== null && 'data' in value;
}
