import type { TQueryBuilderMacroFunction } from './types/query-builder-macro-function';
import UnknownMacroError from "./errors/UnknownMacroError";
import {QueryBuilderInterface} from "./contracts/QueryBuilderInterface";

export default class MacroRegistry {
    /**
     * @private
     */
    private static macros: Record<string, TQueryBuilderMacroFunction> = {};

    /**
     * @param name
     * @param call
     */
    public static register(name: string, call: TQueryBuilderMacroFunction) {
        this.macros[name] = call;
    }

    /**
     * @param name
     * @param query
     * @param args
     */
    public static execute(name: string, query: QueryBuilderInterface<unknown>, args: unknown[] = []) {
        if (!this.macros[name]) {
            throw new UnknownMacroError(name);
        }

        this.macros[name].call(this, query, ...(args as []));
    }
}
