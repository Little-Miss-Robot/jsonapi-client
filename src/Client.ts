import type { AuthInterface } from './contracts/AuthInterface';
import type { ClientInterface } from './contracts/ClientInterface';
import HttpError from './errors/HttpError';
import InvalidJsonResponseError from './errors/InvalidJsonResponseError';

export default class Client implements ClientInterface {
    /**
     * The AuthInterface for this client
     * @private
     */
    private readonly auth: AuthInterface;

    /**
     * The base URL of the API
     * @private
     */
    private readonly baseUrl: string;

    /**
     * @param auth
     * @param baseUrl
     */
    constructor(auth: AuthInterface, baseUrl: string) {
        this.auth = auth;
        this.baseUrl = baseUrl;
    }

    /**
     * Fetches the API with a GET request
     */
    public async get<T>(path: string, options: RequestInit = {}): Promise<T> {
        const authHeaders = await this.auth.getHttpHeaders();
        const url = `${this.baseUrl}/${path}`;
        const response = await fetch(url, {
            ...options,
            method: 'GET',
            headers: new Headers({
                ...authHeaders,
                Accept: 'application/vnd.api+json',
            }),
        });

        const text = await response.text();

        if (!response.ok) {
            throw new HttpError(url, response, text);
        }

        try {
            return JSON.parse(text) as T;
        }
        catch {
            throw new InvalidJsonResponseError(url, response, text);
        }
    }

    /**
     * Fetches the API with a POST request
     */
    public async post<T>(path: string, body: object, options: RequestInit = {}): Promise<T> {
        const authHeaders = await this.auth.getHttpHeaders();
        const url = `${this.baseUrl}/${path}`;
        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: new Headers({
                ...authHeaders,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(body),
        });

        const text = await response.text();

        if (!response.ok) {
            throw new HttpError(url, response, text);
        }

        try {
            return JSON.parse(text) as T;
        }
        catch {
            throw new InvalidJsonResponseError(url, response, text);
        }
    }
}
