import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type { TMapper } from './types/mapper';
import Client from './Client';
import Config from './Config';
import QueryBuilder from './QueryBuilder';

export default class Model {
    /**
     *
     */
    [key: string]: any;

    /**
     * @protected
     */
    protected static endpoint: string;

    /**
     * @protected
     */
    protected static include: string[] = [];

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

        const query = new QueryBuilder<InstanceType<T>>(
            new Client(
                Config.get('baseUrl'),
                Config.get('clientId'),
                Config.get('clientSecret'),
                Config.get('username'),
                Config.get('password'),
            ),
            this.endpoint,
            mapper,
        );

        query.include(this.include);

        return query;
    }

    /**
     * @param responseModel
     */
    public async map(responseModel: ResponseModelInterface): Promise<any> {
        return responseModel;
    }
}
