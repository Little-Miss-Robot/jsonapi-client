import Model from "../Model";

export type TModelClass<T extends Model = Model> = {
    new (...args: any[]): T;
} & typeof Model;