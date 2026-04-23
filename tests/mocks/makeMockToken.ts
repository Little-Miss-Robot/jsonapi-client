import { randomBytes } from 'node:crypto';

export function makeMockToken(length = 32): string {
    return randomBytes(length).toString('hex');
}
