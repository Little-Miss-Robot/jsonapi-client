import ResponseModel from '../ResponseModel';

export type TMapper<T> = (model: ResponseModel) => T;