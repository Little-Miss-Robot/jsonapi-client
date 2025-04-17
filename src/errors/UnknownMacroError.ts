export default class UnknownMacroError extends Error {
    constructor(macroName: string) {
        super(`Unknown macro: ${macroName}`);
        this.name = 'UnknownMacroError';
    }
}
