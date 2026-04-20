export interface HttpRequest {
    path: string
    method: HttpRequestMethod
    options?: Partial<RequestInit>
}

export type HttpRequestOptions = HttpRequest['options'];
export type HttpRequestPath = HttpRequest['path'];

export type HttpRequestMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' |
    'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
