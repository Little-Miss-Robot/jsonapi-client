export default class InvalidResponseError extends Error {
	constructor() {
		super(`Invalid response`);
		this.name = "InvalidResponseError";
	}
}
