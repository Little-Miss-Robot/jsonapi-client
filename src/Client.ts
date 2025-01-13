import type { ClientInterface } from './contracts/ClientInterface';

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
     * @private
     */
    private readonly username: string;

    /**
     * @private
     */
    private readonly password: string;

    /**
     * @param baseUrl
     * @param clientId
     * @param clientSecret
     * @param username
     * @param password
     */
    constructor(
        baseUrl: string,
        clientId: string,
        clientSecret: string,
        username: string,
        password: string,
    ) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.username = username;
        this.password = password;
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
        const requestBody = new FormData();
        requestBody.append('grant_type', 'client_credentials');
        requestBody.append('client_id', this.clientId);
        requestBody.append('client_secret', this.clientSecret);
        requestBody.append('username', this.username);
        requestBody.append('password', this.password);

        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            body: requestBody,
            headers: {
                Accept: 'application/json',
            },
        });

        let json;

        try {
            json = await response.json();
        }
        catch (e) {
            throw new Error(`Couldn\'t generate auth token: ${e.message}`);
        }

        this.accessToken = json.access_token as string;
        this.accessTokenExpiryDate = new Date().getTime() + json.expires_in;

        return this.accessToken;
    }

    /**
     * Fetches the API with a GET request
     */
    public async get(path: string, options = {}) {
        const token = await this.getAuthToken();

        const response = await fetch(`${this.baseUrl}/${path}`, {
            ...options,
            method: 'GET',
            headers: new Headers({
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.api+json',
            }),
        });

        return await response.json();
    }

    /**
     * Fetches the API with a POST request
     */
    public async post(path: string, data: any, options = {}) {
    // @TODO test this method

        const token = await this.getAuthToken();

        const response = await fetch(`${this.baseUrl}/${path}`, {
            ...options,
            method: 'POST',
            headers: new Headers({
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.api+json',
                'content-type': 'application/json',
            }),
            body: JSON.stringify(data),
        });

        return await response.json();
    }
}
