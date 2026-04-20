import type { HttpRequest } from '../types/request';

export interface FetchPolicyInterface {
    /**
     * Should retry on failure?
     * @param name
     * @param call
     */
    shouldRetry: (request: HttpRequest) => boolean

    /**
     * Get the amount of milliseconds to wait between retries
     * @param request
     */
    getRetryDelay: (request: HttpRequest) => number

    /**
     * Method that will be called when the client attempts to retry a request
     */
    registerRetryAttempt: (request: HttpRequest) => void
}
