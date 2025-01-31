import {QueryBuilderInterface} from "../contracts/QueryBuilderInterface";

export type TQueryBuilderMacroFunction = (query: QueryBuilderInterface<unknown>, ...args: unknown[]) => void;
