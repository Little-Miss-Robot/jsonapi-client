import type QueryBuilder from '../QueryBuilder';

export type TMacroCall = (query: QueryBuilder<unknown>, ...args: unknown[]) => void;
