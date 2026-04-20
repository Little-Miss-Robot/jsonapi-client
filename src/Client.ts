import type { AuthInterface } from './contracts/AuthInterface';
import type { ClientInterface } from './contracts/ClientInterface';
import type { EventBusInterface } from './contracts/EventBusInterface';
import type { FetchPolicyInterface } from './contracts/FetchPolicyInterface';
import type { TEventMap } from './types/event-bus';
import type { HttpRequest, HttpRequestOptions, HttpRequestPath } from './types/request';
import HttpError from './errors/HttpError';
import InvalidJsonResponseError from './errors/InvalidJsonResponseError';
import { sleep } from './utils/time';

interface ExecuteOptions {
    authRetryAttempted?: boolean
}

export default class Client implements ClientInterface {
    private readonly auth: AuthInterface;
    private readonly fetchPolicy: FetchPolicyInterface;
    private readonly events: EventBusInterface<TEventMap>;
    private readonly baseUrl: string;

    constructor(
        auth: AuthInterface,
        fetchPolicy: FetchPolicyInterface,
        events: EventBusInterface<TEventMap>,
        baseUrl: string,
    ) {
        this.auth = auth;
        this.fetchPolicy = fetchPolicy;
        this.events = events;
        this.baseUrl = baseUrl;
    }

    /**
     * Executes a GET request
     * @param path
     * @param options
     */
    public async get<T>(
        path: HttpRequestPath,
        options: HttpRequestOptions = {},
    ): Promise<T> {
        return await this.execute<T>({
            method: 'GET',
            path,
            options,
        });
    }

    /**
     * Executes a POST request
     * @param path
     * @param body
     * @param options
     */
    public async post<T>(
        path: HttpRequestPath,
        body: object,
        options: HttpRequestOptions = {},
    ): Promise<T> {
        return await this.execute<T>({
            method: 'POST',
            path,
            options: {
                ...options,
                body: JSON.stringify(body),
            },
        });
    }

    /**
     * Executes a request and handles the response (incl. errors, token refresh, retries)
     * @param request
     * @param executeOptions
     * @private
     */
    private async execute<T>(
        request: HttpRequest,
        executeOptions: ExecuteOptions = {},
    ): Promise<T> {
        const response = await this.request(request);
        const url = `${this.baseUrl}/${request.path}`;
        const text = await response.text();

        if (response.ok) {
            try {
                return JSON.parse(text) as T;
            }
            catch {
                throw new InvalidJsonResponseError(url, response, text);
            }
        }

        if (response.status === 429) {
            // We got a 429 ("Too Many Requests"), be gentle with the API and don't retry ;)
            throw new HttpError(url, response, text);
        }

        if (response.status === 401) {
            // We got a 401 ("Unauthorized"), generate a new token and retry the request once
            if (!executeOptions.authRetryAttempted) {
                await this.auth.generateAuthToken();

                return await this.execute<T>(request, {
                    ...executeOptions,
                    authRetryAttempted: true,
                });
            }
        }

        // Ask fetchPolicy if we should retry
        else if (this.fetchPolicy.shouldRetry(request)) {
            // Ask fetchPolicy how long to wait
            await sleep(this.fetchPolicy.getRetryDelay(request));

            // Register the retry attempt
            this.fetchPolicy.registerRetryAttempt(request);

            // Execute the same request again
            return await this.execute<T>(request, executeOptions);
        }

        throw new HttpError(url, response, text);
    }

    /**
     * Fetches the API based on the given HttpRequest object
     * @param request
     * @private
     */
    private async request(request: HttpRequest): Promise<Response> {
        const url = `${this.baseUrl}/${request.path}`;
        const authHeaders = await this.auth.getHttpHeaders();

        this.events.emit('preFetch', {
            ...request,
            url,
        });

        let headers: Record<string, string> = {
            Accept: 'application/vnd.api+json',
        };

        if (request.method === 'POST') {
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
        }

        const response = await fetch(url, {
            ...request.options,
            method: request.method,
            headers: new Headers({
                ...authHeaders,
                ...headers,
            }),
        });

        this.events.emit('postFetch', {
            ...request,
            url,
        });

        return response;
    }
}
