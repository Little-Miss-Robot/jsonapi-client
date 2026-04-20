import type { FetchPolicyInterface } from '../contracts/FetchPolicyInterface';
import type { HttpRequest, HttpRequestMethod } from '../types/request';
import config from '../facades/config';
import { events } from '../facades/events';

export default class DefaultFetchPolicy implements FetchPolicyInterface {
    private retries: Map<HttpRequestMethod, Map<string, number>> = new Map();

    public registerRetryAttempt(request: HttpRequest): void {
        const { method, path } = request;

        if (!this.retries.get(method)) {
            this.retries.set(method, new Map());
        }

        if (!this.retries.get(method).get(path)) {
            this.retries.get(method).set(path, 0);
        }

        const retries = this.retries.get(method).get(path);

        const attempt = retries + 1;
        events().emit('retry', {
            request,
            attempt,
        });

        this.retries.get(method).set(path, attempt);
    }

    public getRetryDelay(_request: HttpRequest): number {
        return config().get('retryDelay');
    }

    public shouldRetry(request: HttpRequest): boolean {
        const maxRetries = config().get('maxRetries');

        return maxRetries > 0 && maxRetries > this.getRetriesForRequest(request);
    }

    private getRetriesForRequest(request: HttpRequest): number {
        const { method, path } = request;

        if (!this.retries.get(method) || !this.retries.get(method).get(path)) {
            return 0;
        }

        return this.retries.get(method).get(path);
    }
}
