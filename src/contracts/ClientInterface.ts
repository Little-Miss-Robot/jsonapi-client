export interface ClientInterface {
    /**
     * Fetches the given path with a GET request
     * @param path
     * @param options
     */
    get: <T>(path: string, options?: Record<string, unknown>) => Promise<T>

    /**
     * Fetches the given path with a POST request
     * @param path
     * @param body
     * @param options
     */
    post: <T>(path: string, body: object, options?: RequestInit) => Promise<T>
}
