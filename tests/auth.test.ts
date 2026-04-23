import AuthTokenError from '../src/errors/AuthTokenError';
import { container, events, JsonApi } from '../src/index';
import { makeMockToken } from './mocks/makeMockToken';
import { mockFetchJson } from './mocks/mockFetchJson';

const baseConfig = {
    baseUrl: 'https://baseurl.ext',
    clientId: 'test',
    clientSecret: 'test',
} as const;

function makeMockAuth(
    overrides: Partial<{
        tokenExpirySafetyWindow: number
    }> = {},
) {
    JsonApi.init({
        ...baseConfig,
        ...overrides,
    });

    return container().make('auth');
}

it('successfully generates an auth token', async () => {
    const auth = makeMockAuth();
    const token = makeMockToken();

    mockFetchJson({
        access_token: token,
        expires_in: 60,
    });

    const authToken = await auth.getAuthToken();

    expect(authToken).toStrictEqual(token);
});

it('successfully gets an auth token', async () => {
    const auth = makeMockAuth();
    const token = makeMockToken();
    const fetchMock = mockFetchJson({
        access_token: token,
        expires_in: 3600,
    });

    const first = await auth.getAuthToken();
    const second = await auth.getAuthToken();

    expect(first).toStrictEqual(token);
    expect(second).toStrictEqual(token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('returns Bearer headers from getHttpHeaders', async () => {
    const auth = makeMockAuth();
    const token = makeMockToken();
    mockFetchJson({
        access_token: token,
        expires_in: 3600,
    });

    const headers = await auth.getHttpHeaders();

    expect(headers).toStrictEqual({
        Authorization: `Bearer ${token}`,
    });
});

it('successfully emits a generatingAuthToken event', async () => {
    const auth = makeMockAuth();
    const token = makeMockToken();
    mockFetchJson({
        access_token: token,
        expires_in: 60,
    });

    const onGenerating = jest.fn();
    const unsubscribe = events().on('generatingAuthToken', onGenerating);

    try {
        await auth.getAuthToken();
        expect(onGenerating).toHaveBeenCalled();
    }
    finally {
        unsubscribe();
    }
});

it('successfully emits an authTokenGenerated event', async () => {
    const auth = makeMockAuth();
    const token = makeMockToken();
    const expiresIn = 90;
    mockFetchJson({
        access_token: token,
        expires_in: expiresIn,
    });

    const onGenerated = jest.fn();
    const unsubscribe = events().on('authTokenGenerated', onGenerated);

    try {
        await auth.getAuthToken();
        expect(onGenerated).toHaveBeenCalledWith({
            token,
            expiryTime: expiresIn,
        });
    }
    finally {
        unsubscribe();
    }
});

it('throws AuthTokenError when the response has no access_token', async () => {
    const auth = makeMockAuth();
    mockFetchJson(
        {
            error: 'invalid_client',
            error_description: 'x',
        },
        { status: 400 },
    );

    await expect(auth.getAuthToken()).rejects.toBeInstanceOf(AuthTokenError);
});

it('throws AuthTokenError when fetch fails', async () => {
    const auth = makeMockAuth();
    globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error('network')) as unknown as typeof fetch;

    await expect(auth.getAuthToken()).rejects.toBeInstanceOf(AuthTokenError);
});

it('throws AuthTokenError when response json() fails', async () => {
    const auth = makeMockAuth();
    globalThis.fetch = jest
        .fn()
        .mockResolvedValue(
            { json: () => Promise.reject(new Error('json failed')) } as Response,
        ) as unknown as typeof fetch;

    const err = await auth.getAuthToken().catch(e => e);
    expect(err).toBeInstanceOf(AuthTokenError);
    expect((err as Error).message).toMatch(/json failed/);
});

it('posts to oauth/token with form body, Accept, and method', async () => {
    const auth = makeMockAuth();
    const token = makeMockToken();
    const fetchMock = mockFetchJson({
        access_token: token,
        expires_in: 60,
    });

    await auth.getAuthToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;

    expect(String(url)).toBe(`${baseConfig.baseUrl}/oauth/token`);
    expect(init?.method).toBe('POST');
    const headers = init?.headers;
    if (headers instanceof Headers) {
        expect(headers.get('Accept')).toBe('application/json');
    }
    else {
        expect(headers).toMatchObject({ Accept: 'application/json' });
    }
    const body = init?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('grant_type')).toBe('client_credentials');
    expect((body as FormData).get('client_id')).toBe('test');
    expect((body as FormData).get('client_secret')).toBe('test');
});

it('refetches the token when past the expiry window', async () => {
    const tokenA = makeMockToken();
    const tokenB = makeMockToken();
    let call = 0;

    const fetchImpl = () => {
        call += 1;
        return Promise.resolve(
            new Response(
                JSON.stringify({ access_token: call === 1 ? tokenA : tokenB, expires_in: 2 }),
                { status: 200, headers: { 'content-type': 'application/json' } },
            ),
        );
    };
    globalThis.fetch = jest.fn().mockImplementation(fetchImpl) as unknown as typeof fetch;

    jest.useFakeTimers();
    try {
        const auth = makeMockAuth({ tokenExpirySafetyWindow: 0 });
        const t0 = 1_000_000_000_000;
        jest.setSystemTime(t0);

        const first = await auth.getAuthToken();
        expect(first).toBe(tokenA);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        jest.setSystemTime(t0 + 1_999);
        const second = await auth.getAuthToken();
        expect(second).toBe(tokenA);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        jest.setSystemTime(t0 + 2_000);
        const third = await auth.getAuthToken();
        expect(third).toBe(tokenB);
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    }
    finally {
        jest.useRealTimers();
    }
});
