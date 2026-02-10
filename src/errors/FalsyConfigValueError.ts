export default class FalsyConfigValueError extends Error {
    constructor(attributeName: string | number) {
        super(`Falsy config value: ${attributeName}`);
        this.name = 'FalsyConfigValueError';
    }
}
