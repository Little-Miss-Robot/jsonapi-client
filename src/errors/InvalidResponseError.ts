export default class InvalidResponseError extends Error {
	constructor(additionalMessage: string = 'Unknown reason') {
		super(`Invalid response: ${additionalMessage}`);
		this.name = "InvalidResponseError";
	}
}
