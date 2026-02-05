export default class InvalidJsonResponseError extends Error {
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
     *
     * @param url
     * @param response
     * @param body
     */
    constructor(url: string, response: Response, body?: string) {
        super(`Response was not valid JSON when fetching ${url}, got HTTP status code ${response.status} ${response.statusText}`);
        this.name = 'InvalidJsonResponseError';
        this.url = url;
        this.status = response.status;
        this.statusText = response.statusText;
        this.body = body;
    }
}
