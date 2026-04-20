import type { HttpRequestOptions, HttpRequestPath } from '../types/request';

export interface ClientInterface {
    /**
     * Fetches the given path with a GET request
     * @param path
     * @param options
     */
    get: <T>(path: HttpRequestPath, options?: HttpRequestOptions) => Promise<T>

    /**
     * Fetches the given path with a POST request
     * @param path
     * @param body
     * @param options
     */
    post: <T>(path: HttpRequestPath, body: object, options?: HttpRequestOptions) => Promise<T>
}
