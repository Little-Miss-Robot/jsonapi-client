import type { ResponseModelInterface } from '../contracts/ResponseModelInterface';

export type TMapper<T> = (model: ResponseModelInterface) => T;
