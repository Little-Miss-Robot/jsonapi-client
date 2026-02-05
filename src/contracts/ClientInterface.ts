export interface ClientInterface {
    get: (path: string, options: Record<string, unknown>) => Promise<unknown>
    post: (path: string, body: object, options: RequestInit) => Promise<unknown>
}
