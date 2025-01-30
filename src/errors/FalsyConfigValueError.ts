export default class FalsyConfigValueError extends Error {
	constructor(attributeName: string) {
		super(`Falsy config value: ${attributeName}`);
		this.name = "FalsyConfigValueError";
	}
}
