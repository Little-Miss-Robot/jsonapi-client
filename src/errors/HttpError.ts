export default class HttpError extends Error {
    /**
     *
     */
    public url: string;

    /**
     *
     */
    public status: number;

    /**
     *
     */
    public statusText: string;

    /**
     *
     */
    public body: string;

    /**
     * @param url
     * @param response
     * @param body
     */
    constructor(url: string = '', response: Response, body?: string) {
        super(`Request failed when fetching ${url}, got HTTP status code ${response.status} ${response.statusText}`);
        this.name = 'HttpError';
        this.status = response.status;
        this.statusText = response.statusText;
        this.url = url;
        this.body = body;
    }
}
