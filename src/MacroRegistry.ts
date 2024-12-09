import type QueryBuilder from './QueryBuilder';
import type { TMacroCall } from './types/macro-call';

export default class MacroRegistry {
    /**
     * @private
     */
    private static macros: Record<string, TMacroCall> = {};

    /**
     *
     */
    public static register(name: string, call: TMacroCall) {
        this.macros[name] = call;
    }

    /**
     * @param name
     * @param query
     * @param args
     */
    public static execute(name: string, query: QueryBuilder<any>, args: any[] = []) {
        if (!this.macros[name]) {
            throw new Error(`Unknown macro "${name}".`);
        }

        this.macros[name].call(this, query, ...args);
    }
}
