export interface ClientInterface {
    get: (path: string, options: Record<string, any>) => Promise<any>
    post: (path: string, data: any, options: Record<string, any>) => Promise<any>
}
