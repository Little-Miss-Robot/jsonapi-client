export interface AuthInterface {
    /**
     * Gets the auth token
     */
    getAuthToken: () => Promise<string>

    /**
     * Gets the HTTP headers
     */
    getHttpHeaders: () => Promise<Record<string, string>>
}
