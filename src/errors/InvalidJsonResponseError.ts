export default class InvalidJsonResponseError extends Error {
    /**
     * The fetched URL
     */
    public url: string;

    /**
     * The HTTP status of the response
     */
    public status: number;

    /**
     * The status text of the response
     */
    public statusText: string;

    /**
     * The received body
     */
    public body: string;

    /**
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
