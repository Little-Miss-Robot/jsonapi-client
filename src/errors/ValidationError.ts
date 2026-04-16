export default class ValidationError extends Error {
    /**
     *
     */
    public modelName: string;

    /**
     *
     */
    public validationErrors: string[];

    constructor(modelName: string, validationErrors: string[]) {
        super(`Validation failed for model ${modelName}: ${validationErrors.join(', ')}`);
        this.name = 'ValidationError';
        this.modelName = modelName;
        this.validationErrors = validationErrors;
    }
}
