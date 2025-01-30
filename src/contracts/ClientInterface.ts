export interface ClientInterface {
    get: (path: string, options: Record<string, unknown>) => Promise<unknown>
    //post: (path: string, data: Object, options: Record<string, unknown>) => Promise<unknown>
}
