export interface ClientInterface {
    get: <T>(path: string, options?: Record<string, unknown>) => Promise<T>
    post: <T>(path: string, body: object, options?: RequestInit) => Promise<T>
}
