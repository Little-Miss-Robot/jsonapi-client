export function mockFetchJson(
    body: unknown,
    init: ResponseInit = {},
): jest.Mock {
    const mock = jest.fn().mockResolvedValue(
        new Response(JSON.stringify(body), {
            status: init.status ?? 200,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                ...(init.headers ?? {}),
            },
        }),
    );

    globalThis.fetch = mock as unknown as typeof fetch;

    return mock;
}
