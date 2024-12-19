import type QueryBuilder from '../QueryBuilder';

export type TMacroCall = (query: QueryBuilder<any>, ...args: unknown[]) => void;
