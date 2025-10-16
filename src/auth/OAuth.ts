import AuthTokenError from "../errors/AuthTokenError";
import { AuthInterface } from "../contracts/AuthInterface";

export default class OAuth implements AuthInterface {
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
    constructor(baseUrl: string, clientId: string, clientSecret: string) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * @private
     */
    private accessToken?: string;

    /**
     * @private
     */
    private accessTokenExpiryDate?: number;

    /**
     * Gets the HTTP Headers
     */
    public async getHttpHeaders(): Promise<Record<string, string>> {
        const token = await this.getAuthToken();

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    /**
     * Gets the authentication token
     */
    public async getAuthToken(): Promise<string> {
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

        if (! json.access_token) {
            throw new AuthTokenError(`${json.error}: ${json.error_description}`, url);
        }

        // Store the access token and expiry date in memory
        this.accessToken = json.access_token as string;
        this.accessTokenExpiryDate = new Date().getTime() + json.expires_in;

        return this.accessToken;
    }
}
