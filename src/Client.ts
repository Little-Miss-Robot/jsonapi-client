import type { ClientInterface } from './contracts/ClientInterface';
import AuthTokenError from './errors/AuthTokenError';

export default class Client implements ClientInterface {
    /**
     * @private
     */
    private accessToken?: string;

    /**
     * @private
     */
    private accessTokenExpiryDate?: number;

    /**
     * @private
     */
    private readonly baseUrl: string;

    /**
     * @private
     */
    private readonly clientId: string;

    /**
     * @private
     */
    private readonly clientSecret: string;

    /**
     * @param baseUrl
     * @param clientId
     * @param clientSecret
     */
    constructor(
        baseUrl: string,
        clientId: string,
        clientSecret: string,
    ) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Gets the authentication token
     */
    private async getAuthToken(): Promise<string> {
        if (
            !this.accessToken
            || !this.accessTokenExpiryDate
            || new Date().getTime() >= this.accessTokenExpiryDate
        ) {
            return await this.generateAuthToken();
        }

        return this.accessToken;
    }

    /**
     * Generates a new auth token, stores it as properties and returns it
     */
    private async generateAuthToken(): Promise<string> {
        const url = `${this.baseUrl}/oauth/token`;

        const requestBody = new FormData();
        requestBody.append('grant_type', 'client_credentials');
        requestBody.append('client_id', this.clientId);
        requestBody.append('client_secret', this.clientSecret);

        let json;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    Accept: 'application/json',
                },
            });

            json = await response.json();
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                throw new AuthTokenError(e.message, url);
            }
            throw new AuthTokenError(`Couldn\'t generate auth token: Unknown error.`, url);
        }

        if (!json.access_token) {
            throw new AuthTokenError(`${json.error}: ${json.error_description}`, url);
        }

        // Store the access token and expiry date in memory
        this.accessToken = json.access_token as string;
        this.accessTokenExpiryDate = new Date().getTime() + json.expires_in;

        return this.accessToken;
    }

    /**
     * Fetches the API with a GET request
     */
    public async get(path: string, options = {}): Promise<unknown> {
        const token = await this.getAuthToken();

        const response = await fetch(`${this.baseUrl}/${path}`, {
            ...options,
            method: 'GET',
            headers: new Headers({
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.api+json',
            }),
        });

        try {
            return await response.json();
        }
        catch (e: unknown) {
            throw new Error(`Response was not valid JSON: ${e}`);
        }
    }
}
