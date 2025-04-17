export default class UnknownConfigValueError extends Error {
    constructor(attributeName: string) {
        super(`Unknown or undefined config value: ${attributeName}`);
        this.name = 'UnknownConfigValueError';
    }
}
