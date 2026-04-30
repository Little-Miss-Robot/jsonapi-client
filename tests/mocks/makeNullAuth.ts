import type { AuthInterface } from '../../src/index';

export function makeNullAuth(): AuthInterface {
    return {
        async generateAuthToken(): Promise<void> {

        },
        getAuthToken(): Promise<string> {
            return Promise.resolve('');
        },
        getHttpHeaders(): Promise<Record<string, string>> {
            return Promise.resolve(undefined);
        },
    };
}
