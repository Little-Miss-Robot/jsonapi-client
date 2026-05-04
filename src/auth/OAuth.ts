import type { AuthInterface } from '../contracts/AuthInterface';
import type { EventBusInterface } from '../contracts/EventBusInterface';
import type { TokenStorageInterface } from '../contracts/TokenStorageInterface';
import type { TEventMap } from '../types/event-bus';
import AuthTokenError from '../errors/AuthTokenError';
import config from '../facades/config';

export default class OAuth implements AuthInterface {
    /**
     * The base URL to the API
     * @private
     */
    private readonly baseUrl: string;

    /**
     * The OAuth client id
     * @private
     */
    private readonly clientId: string;

    /**
     * The OAuth client secret
     * @private
     */
    private readonly clientSecret: string;

    /**
     * The token storage
     * @private
     */
    private readonly tokenStorage: TokenStorageInterface;

    /**
     * The event bus to use to emit events
     * @private
     */
    private readonly events: EventBusInterface<TEventMap>;

    /**
     * @private
     */
    private fetchTokenInFlight: Promise<string> | null = null;

    /**
     * @param baseUrl
     * @param clientId
     * @param clientSecret
     * @param tokenStorage
     * @param events
     */
    constructor(
        baseUrl: string,
        clientId: string,
        clientSecret: string,
        tokenStorage: TokenStorageInterface,
        events: EventBusInterface<TEventMap>,
    ) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenStorage = tokenStorage;
        this.events = events;
    }

    /**
     * Gets the authentication token
     */
    public async getAuthToken(): Promise<string> {
        // The amount of milliseconds before expiration that we ask for a new token
        const tokenExpirySafetyWindow = config().get('tokenExpirySafetyWindow');

        // Retrieve the token payload...
        let tokenPayload = await this.tokenStorage.retrieve();

        if (
            !tokenPayload
            || new Date().getTime() >= Math.max(0, tokenPayload.expiresAt - tokenExpirySafetyWindow)
        ) {
            // ...none was found or expiry date was passed so generate a new one
            await this.generateAuthToken();

            // retrieve newly generated token
            tokenPayload = await this.tokenStorage.retrieve();
        }

        if (!tokenPayload.token) {
            throw new AuthTokenError(`No auth token was generated`);
        }

        return tokenPayload.token;
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
     * Generates a new auth token
     * Important note: it's not returned from this method, the token should be set on this.accessToken for later retrieval
     */
    public async generateAuthToken(): Promise<void> {
        // Check if a fetch token is in flight
        if (this.fetchTokenInFlight !== null) {
            // Await it further without starting a new fetch
            await this.fetchTokenInFlight;
            return;
        }

        // Nothing was in flight, so fetch a new token
        this.fetchTokenInFlight = this.fetchToken();
        try {
            await this.fetchTokenInFlight;
        }
        finally {
            this.fetchTokenInFlight = null;
        }
    }

    /**
     * Generates a new auth token, stores it as properties and returns it
     */
    private async fetchToken(): Promise<string> {
        this.events.emit('generatingAuthToken');

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

        const token = json.access_token as string;

        // Store the access token
        await this.tokenStorage.store({
            token,
            expiresAt: new Date().getTime() + json.expires_in * 1000,
        });

        this.events.emit('authTokenGenerated', {
            token: json.access_token as string,
            expiryTime: json.expires_in * 1000,
        });

        return token;
    }
}
