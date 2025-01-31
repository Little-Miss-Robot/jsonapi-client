export interface ClientInterface {
    get: (path: string, options: Record<string, unknown>) => Promise<unknown>
}
