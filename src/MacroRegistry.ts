import type QueryBuilder from './QueryBuilder';
import type { TMacroCall } from './types/macro-call';
import UnknownMacroError from "./errors/UnknownMacroError";

export default class MacroRegistry {
    /**
     * @private
     */
    private static macros: Record<string, TMacroCall> = {};

    /**
     * @param name
     * @param call
     */
    public static register(name: string, call: TMacroCall) {
        this.macros[name] = call;
    }

    /**
     * @param name
     * @param query
     * @param args
     */
    public static execute(name: string, query: QueryBuilder<unknown>, args: unknown[] = []) {
        if (!this.macros[name]) {
            throw new UnknownMacroError(name);
        }

        this.macros[name].call(this, query, ...(args as []));
    }
}
