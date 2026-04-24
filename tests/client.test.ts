import type { AuthInterface } from '../src/index';
import type { ConfigAttributes } from '../src/types/config-attributes';
import Client from '../src/Client';
import HttpError from '../src/errors/HttpError';
import InvalidJsonResponseError from '../src/errors/InvalidJsonResponseError';
import config from '../src/facades/config';
import { client, container, events, JsonApi } from '../src/index';
import { mockFetchJson } from './mocks/mockFetchJson';

const defaultInit: Pick<ConfigAttributes, 'baseUrl' | 'clientId' | 'clientSecret'> = {
    baseUrl: 'https://baseurl.ext',
    clientId: 'test',
    clientSecret: 'test',
};

function makeMockAuth(): AuthInterface {
    return {
        generateAuthToken(): Promise<string> {
            return Promise.resolve('');
        },
        getAuthToken(): Promise<string> {
            return Promise.resolve('');
        },
        getHttpHeaders(): Promise<Record<string, string>> {
            return Promise.resolve({});
        },
    };
}

type MakeMockClientOptions = {
    auth?: AuthInterface
} & {
    /**
     * Extra or overridden JsonApi.init() attributes (e.g. retryDelay)
     */
    init?: Partial<ConfigAttributes>
};

function makeMockClient(options: MakeMockClientOptions = {}) {
    const { auth = makeMockAuth(), init: initOverrides = {} } = options;

    JsonApi.init({
        ...defaultInit,
        ...initOverrides,
    });

    container().singleton('client', () => {
        return new Client(
            auth,
            container().make('fetchPolicy'),
            events(),
            config().get('baseUrl'),
        );
    });

    return client();
}

it('successfully executes a get request and doesn\'t temper with response', async () => {
    const c = makeMockClient();
    mockFetchJson({
        success: true,
        data: {
            id: 1,
            title: 'JSON:API Client',
        },
    });

    const response = await c.get('api/endpoint');

    expect(response).toStrictEqual({
        success: true,
        data: {
            id: 1,
            title: 'JSON:API Client',
        },
    });
});

it('successfully executes a post request and doesn\'t temper with response', async () => {
    const c = makeMockClient();
    mockFetchJson({
        success: true,
        data: {
            id: 1,
            title: 'JSON:API Client',
        },
    });

    const response = await c.post('api/endpoint', { id: 1 });

    expect(response).toStrictEqual({
        success: true,
        data: {
            id: 1,
            title: 'JSON:API Client',
        },
    });
});

it('on 401 refreshes auth and retries the request, then returns the 200 body', async () => {
    const generateAuthToken = jest.fn().mockResolvedValue('');

    const c = makeMockClient({
        auth: {
            generateAuthToken,
            getAuthToken: () => Promise.resolve(''),
            getHttpHeaders: () => Promise.resolve({}),
        },
    });

    let call = 0;
    globalThis.fetch = jest.fn().mockImplementation(() => {
        call += 1;
        if (call === 1) {
            return Promise.resolve(
                new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
            );
        }
        return Promise.resolve(
            new Response(
                JSON.stringify({ success: true, data: 1 }),
                { status: 200, headers: { 'content-type': 'application/json' } },
            ),
        );
    });

    const response = await c.get('api/endpoint');

    expect(response).toStrictEqual({ success: true, data: 1 });
    expect(generateAuthToken).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    const firstPath = (globalThis.fetch as jest.Mock).mock.calls[0]![0];
    const secondPath = (globalThis.fetch as jest.Mock).mock.calls[1]![0];
    expect(String(firstPath)).toBe(String(secondPath));
});

it('on 401 twice throws HttpError after a single generateAuthToken', async () => {
    const generateAuthToken = jest.fn().mockResolvedValue('');

    const c = makeMockClient({
        auth: {
            generateAuthToken,
            getAuthToken: () => Promise.resolve(''),
            getHttpHeaders: () => Promise.resolve({}),
        },
    });

    let call = 0;
    globalThis.fetch = jest.fn().mockImplementation(() => {
        call += 1;
        return Promise.resolve(
            new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
        );
    });

    const err = await c.get('api/endpoint').catch(e => e);

    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(401);
    expect(generateAuthToken).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
});

it('on 429 does not policy-retry and throws HttpError', async () => {
    const c = makeMockClient();
    globalThis.fetch = jest.fn().mockResolvedValue(
        new Response('Too Many', { status: 429, statusText: 'Too Many Requests' }),
    );

    const err = await c.get('api/endpoint').catch(e => e);

    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(429);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

it('on 200 with a non-JSON body throws InvalidJsonResponseError', async () => {
    const c = makeMockClient();
    globalThis.fetch = jest.fn().mockResolvedValue(
        new Response('not-json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );

    const err = await c.get('api/endpoint').catch(e => e);

    expect(err).toBeInstanceOf(InvalidJsonResponseError);
    expect((err as InvalidJsonResponseError).name).toBe('InvalidJsonResponseError');
});

it('retries once after 5xx when the policy allows, then returns JSON', async () => {
    const c = makeMockClient({ init: { retryDelay: 10 } });
    const onRetry = jest.fn();
    const offRetry = events().on('retry', onRetry);

    let call = 0;
    globalThis.fetch = jest.fn().mockImplementation(() => {
        call += 1;
        if (call === 1) {
            return Promise.resolve(
                new Response('Server error', { status: 500, statusText: 'Internal Server Error' }),
            );
        }
        return Promise.resolve(
            new Response(
                JSON.stringify({ recovered: true }),
                { status: 200, headers: { 'content-type': 'application/json' } },
            ),
        );
    });

    try {
        jest.useFakeTimers();
        const p = c.get('api/endpoint');
        await jest.advanceTimersByTimeAsync(10);
        const response = await p;
        expect(response).toStrictEqual({ recovered: true });
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenCalledWith({
            request: expect.objectContaining({ method: 'GET', path: 'api/endpoint' }),
            attempt: 1,
        });
    }
    finally {
        offRetry();
        jest.useRealTimers();
    }
});

it('emits preFetch and postFetch with the request url and method', async () => {
    const c = makeMockClient();
    mockFetchJson({ ok: true });
    const onPre = jest.fn();
    const onPost = jest.fn();
    const offPre = events().on('preFetch', onPre);
    const offPost = events().on('postFetch', onPost);
    try {
        await c.get('api/endpoint');
        const expected = expect.objectContaining({
            method: 'GET',
            path: 'api/endpoint',
            url: 'https://baseurl.ext/api/endpoint',
        });
        expect(onPre).toHaveBeenCalledWith(expected);
        expect(onPost).toHaveBeenCalledWith(expected);
    }
    finally {
        offPre();
        offPost();
    }
});

it('sends a GET to the right url with Accept: application/vnd.api+json', async () => {
    const c = makeMockClient();
    const mock = mockFetchJson({ r: 1 });
    await c.get('api/endpoint');

    const [url, init] = mock.mock.calls[0]!;
    expect(String(url)).toBe('https://baseurl.ext/api/endpoint');
    expect(init?.method).toBe('GET');
    const h = init?.headers;
    if (h instanceof Headers) {
        expect(h.get('Accept')).toBe('application/vnd.api+json');
    }
    else {
        expect(h).toMatchObject({ Accept: 'application/vnd.api+json' });
    }
});

it('sends a POST with JSON body and application/json content type', async () => {
    const c = makeMockClient();
    const body = { id: 1 };
    const mock = mockFetchJson({ ok: true });
    await c.post('api/endpoint', body);

    const [url, init] = mock.mock.calls[0]!;
    expect(String(url)).toBe('https://baseurl.ext/api/endpoint');
    expect(init?.method).toBe('POST');
    expect((init as { body?: string }).body).toBe(JSON.stringify(body));
    const h = init?.headers;
    if (h instanceof Headers) {
        expect(h.get('Content-Type')).toBe('application/json');
    }
    else {
        expect(h).toMatchObject({ 'Content-Type': 'application/json' });
    }
});
