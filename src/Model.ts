import type { QueryBuilderInterface } from './contracts/QueryBuilderInterface';
import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type { DataProperties } from './types/generic/data-properties';
import type { TMapper } from './types/mapper';
import query from './facades/query';

export default abstract class Model {
    /**
     * @protected
     */
    protected static primaryKey: string = 'id';

    /**
     * @protected
     */
    protected static defaultMacro: string;

    /**
     * @protected
     */
    protected static endpoint: string;

    /**
     * @protected
     */
    protected static include: string[] = [];

    /**
     * Creates an instance of this model by ResponseModel
     * @param response
     */
    public static async createFromResponse(response: ResponseModelInterface) {
        if (!this.gate(response)) {
            return null;
        }

        const instance = new (this as any)();
        Object.assign(instance, await instance.map(response));
        return instance;
    }

    /**
     * Create a QueryBuilder instance specifically for this model
     */
    public static query<T extends typeof Model>(this: T): QueryBuilderInterface<InstanceType<T>> {
        if (!this.endpoint) {
            throw new Error(`The model "${this.name}" doesn't have an endpoint, so can't be queried.`);
        }

        const mapper: TMapper<Promise<InstanceType<T>>> = async (response: ResponseModelInterface): Promise<InstanceType<T>> => {
            return await this.createFromResponse(response);
        };

        // Create a new QueryBuilder instance with the gate and includes
        const qb = query<InstanceType<T>>(this.endpoint, mapper)
            .gate(this.gate)
            .include(this.include);

        // Check if the model has a default macro
        if (this.defaultMacro) {
            qb.macro(this.defaultMacro);
        }

        return qb;
    }

    /**
     * @param responseModel
     */
    protected map(responseModel: ResponseModelInterface): unknown {
        return responseModel;
    }

    public static validate(responseModel: ResponseModelInterface) {
        return true;
    }

    /**
     * @param responseModel
     * @protected
     */
    public static gate(responseModel: ResponseModelInterface): boolean {
        return true;
    }

    /**
     *
     */
    public serialize<T extends Model>(this: T): DataProperties<T> {
        const data: Record<string, any> = {};

        for (const key of Object.keys(this)) {
            const value = (this as any)[key];

            if (value instanceof Model) {
                data[key] = value.serialize();
            }
            else if (Array.isArray(value)) {
                // Support arrays of models
                data[key] = value.map(v =>
                    v instanceof Model ? v.serialize() : v,
                );
            }
            else {
                data[key] = value;
            }
        }

        return data as DataProperties<T>;
    }
}
