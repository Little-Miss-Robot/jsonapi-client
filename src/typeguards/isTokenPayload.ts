import type { TokenPayload } from '../contracts/TokenStorageInterface';

export function isTokenPayload(value: unknown): value is TokenPayload {
    return (
        typeof value === 'object'
        && 'token' in value
        && 'expiresAt' in value
        && typeof value.token === 'string'
        && typeof value.expiresAt === 'number'
    );
}
