import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type { TMapper } from './types/mapper';
import Client from './Client';
import Config from './Config';
import QueryBuilder from './QueryBuilder';
import Container from "./Container";

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
     *
     * @param response
     */
    public static async createFromResponse(response: ResponseModelInterface) {
        const instance = new (this as any)();
        Object.assign(instance, (await instance.map(response)));
        return instance;
    }

    /**
     * Create a QueryBuilder instance specifically for this model
     */
    public static query<T extends typeof Model>(this: T): QueryBuilder<InstanceType<T>> {
        if (!this.endpoint) {
            throw new Error(
                `The model "${this.name}" doesn't have an endpoint, so can't be queried.`,
            );
        }

        const mapper: TMapper<Promise<InstanceType<T>>> = async (response): Promise<InstanceType<T>> => {
            return await this.createFromResponse(response);
        };

        // Create a new QueryBuilder instance (and pass the type of the called class as a type)
        const query = new QueryBuilder<InstanceType<T>>(
            Container.make('ClientInterface'),
            this.endpoint,
            mapper,
        );

        // Pass the includes to the query builder
        query.include(this.include);

        // Check if the model has a default macro
        if (this.defaultMacro) {
            query.macro(this.defaultMacro);
        }

        return query;
    }

    /**
     * @param responseModel
     */
    map(responseModel: ResponseModelInterface): unknown {
        return responseModel;
    }
}
