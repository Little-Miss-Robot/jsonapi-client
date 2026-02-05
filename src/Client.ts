import type { AuthInterface } from './contracts/AuthInterface';
import type { ClientInterface } from './contracts/ClientInterface';
import InvalidJsonResponseError from './errors/InvalidJsonResponseError';

export default class Client implements ClientInterface {
    /**
     * @private
     */
    private readonly auth: AuthInterface;

    /**
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
    public async get(path: string, options: RequestInit = {}): Promise<unknown> {
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

        try {
            return JSON.parse(text);
        }
        catch {
            throw new InvalidJsonResponseError(url, response, text);
        }
    }

    /**
     * Fetches the API with a POST request
     */
    public async post(path: string, body: object, options: RequestInit = {}): Promise<unknown> {
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

        try {
            return JSON.parse(text);
        }
        catch {
            throw new InvalidJsonResponseError(url, response, text);
        }
    }
}
