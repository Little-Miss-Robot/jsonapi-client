import type { AuthInterface } from '../../src/index';

export function makeNullAuth(): AuthInterface {
    return {
        generateAuthToken(): Promise<string> {
            return Promise.resolve('');
        },
        getAuthToken(): Promise<string> {
            return Promise.resolve('');
        },
        getHttpHeaders(): Promise<Record<string, string>> {
            return Promise.resolve(undefined);
        },
    };
}
