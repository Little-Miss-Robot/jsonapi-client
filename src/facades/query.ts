import type { QueryBuilderInterface } from '../contracts/QueryBuilderInterface';
import type ResponseModel from '../ResponseModel';
import type { TMapper } from '../types/mapper';
import { container } from './container';

function defaultMapper(response: ResponseModel) {
    return response;
}

/**
 * Makes a new query for the given endpoint
 * @param endpoint
 * @param mapper
 */
export default function query<T>(endpoint: string, mapper: TMapper<any> = defaultMapper) {
    return container().makeAs<QueryBuilderInterface<T>>('query', endpoint, mapper);
}
