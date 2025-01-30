export default class AuthTokenError extends Error {
	constructor(message: string) {
		super(`Couldn\'t generate auth token: ${message}`);
		this.name = "AuthTokenError";
	}
}
