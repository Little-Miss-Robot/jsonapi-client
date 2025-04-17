export default class ConfigValuesNotSetError extends Error {
    constructor() {
        super('Config values are not set');
        this.name = 'ConfigValuesNotSetError';
    }
}
