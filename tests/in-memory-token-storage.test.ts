import InMemoryTokenStorage from '../src/auth/InMemoryTokenStorage';
import { makeMockToken } from './mocks/makeMockToken';

it('returns null before any token is stored', () => {
    const storage = new InMemoryTokenStorage();

    expect(storage.retrieve()).toBeNull();
});

it('returns the stored token payload', () => {
    const storage = new InMemoryTokenStorage();
    const payload = {
        token: makeMockToken(),
        expiresAt: 1_700_000_000_000,
    };

    storage.store(payload);

    expect(storage.retrieve()).toStrictEqual(payload);
});

it('overwrites a previously stored token', () => {
    const storage = new InMemoryTokenStorage();
    const first = {
        token: makeMockToken(),
        expiresAt: 1_000,
    };
    const second = {
        token: makeMockToken(),
        expiresAt: 2_000,
    };

    storage.store(first);
    storage.store(second);

    expect(storage.retrieve()).toStrictEqual(second);
});
