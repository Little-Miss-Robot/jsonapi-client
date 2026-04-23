export interface AuthInterface {
    /**
     * Gets the auth token
     */
    getAuthToken: () => Promise<string>

    /**
     * Generates an auth token
     */
    generateAuthToken: () => Promise<void>

    /**
     * Gets the HTTP headers
     */
    getHttpHeaders: () => Promise<Record<string, string>>
}
