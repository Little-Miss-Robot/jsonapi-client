import type ResultSet from '../ResultSet';
import ResponseModel from "../ResponseModel";
import {TRawResponse} from "../types/raw-response";

export interface QueryBuilderInterface<T> {
    get: () => Promise<ResultSet<T | ResponseModel>>
    getRaw: () => Promise<T | TRawResponse>
    find: (id: string) => Promise<T | ResponseModel>
    first(): Promise<T | ResponseModel>
}
