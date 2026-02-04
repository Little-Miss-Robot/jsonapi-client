import AuthTokenError from "../errors/AuthTokenError";
import { AuthInterface } from "../contracts/AuthInterface";
import EventBus from "../EventBus";
import {TEventMap} from "../types/event-bus";
import {EventBusInterface} from "../contracts/EventBusInterface";

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
     * @private
     */
    private readonly events: EventBusInterface<TEventMap>

    /**
     * @param baseUrl
     * @param clientId
     * @param clientSecret
     * @param events
     */
    constructor(baseUrl: string, clientId: string, clientSecret: string, events: EventBusInterface<TEventMap>) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.events = events;
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
     * Gets the authentication token
     */
    public async getAuthToken(): Promise<string> {

        // The amount of milliseconds before expiration that we ask for a new token
        const expiryOffsetTime = 60000;
        const expiryTime = Math.max(0, this.accessTokenExpiryDate - expiryOffsetTime);

        if (
            !this.accessToken
            || !this.accessTokenExpiryDate
            || new Date().getTime() >= expiryTime
        ) {
            return await this.generateAuthToken();
        }

        return this.accessToken;
    }

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
        this.accessTokenExpiryDate = new Date().getTime() + json.expires_in * 1000;

        this.events.emit('authTokenGenerated', {
            token: json.access_token as string,
            expiryTime: json.expires_in
        })

        return this.accessToken;
    }
}
