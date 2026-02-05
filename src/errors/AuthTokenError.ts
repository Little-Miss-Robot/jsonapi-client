export default class AuthTokenError extends Error {
    constructor(message: string, url: string = '') {
        super(`Couldn\'t generate auth token: ${message}. Using URL ${url}. Are you sure your credentials are correct and the API responds with a JSON:API response?`);
        this.name = 'AuthTokenError';
    }
}
