export interface AuthInterface {
    getAuthToken: () => Promise<string>;
    getHttpHeaders: () => Promise<Record<string, string>>;
}
