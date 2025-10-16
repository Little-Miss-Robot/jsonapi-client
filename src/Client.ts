import type { ClientInterface } from './contracts/ClientInterface';
import { AuthInterface } from "./contracts/AuthInterface";

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
    public async get(path: string, options = {}): Promise<unknown> {
        const authHeaders = await this.auth.getHttpHeaders();

        const response = await fetch(`${this.baseUrl}/${path}`, {
            ...options,
            method: 'GET',
            headers: new Headers({
                ...authHeaders,
                Accept: 'application/vnd.api+json',
            }),
        });

        try {
            return await response.json();
        } catch (e: unknown) {
            throw new Error('Response was not valid JSON.');
        }
    }

    /**
     * Fetches the API with a POST request
     */
    public async post(path: string, body: any, options = {}): Promise<unknown> {
        const authHeaders = await this.auth.getHttpHeaders();

        const response = await fetch(`${this.baseUrl}/${path}`, {
            ...options,
            method: 'POST',
            headers: new Headers({
                ...authHeaders,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(body)
        });

        try {
            return await response.json();
        } catch (e: unknown) {
            throw new Error('Response was not valid JSON.');
        }
    }
}
