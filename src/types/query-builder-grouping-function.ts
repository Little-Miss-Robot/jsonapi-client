import {QueryBuilderInterface} from "../contracts/QueryBuilderInterface";

export type TQueryBuilderGroupingFunction<T> = (query: QueryBuilderInterface<T>) => void;