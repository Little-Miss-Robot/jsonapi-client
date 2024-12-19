import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type { TMapper } from './types/mapper';
import Client from './Client';
import Config from './Config';
import QueryBuilder from './QueryBuilder';

export default class Model {

    [key: string]: any;

    /**
     * @protected
     */
    protected static endpoint: string;

    /**
     * @protected
     */
    protected static include: string[] = [];

    /**
     * @param attributes
     * @private
     */
    public setAttributes(attributes: any) {
        for (const key in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                this[key] = attributes[key];
            }
        }
    }

    /**
     * Create a QueryBuilder instance specifically for this model
     */
    public static query<T>(): QueryBuilder<T> {
        if (!this.endpoint) {
            throw new Error(
                `The model "${this.name}" doesn't have an endpoint, so can't be queried.`,
            );
        }

        const mapper: TMapper<Promise<T>> = async (response): Promise<T> => {
            const instance = new (this as any)();
            const attributes = await instance.map(response);
            instance.setAttributes(attributes);
            return instance;
        };

        const query = new QueryBuilder<T>(
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
