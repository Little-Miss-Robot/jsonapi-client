import QueryBuilder from "./QueryBuilder";
import Client from "./Client";
import ResponseModel from "./ResponseModel";
import Config from "./Config";
import {TMapper} from "./types/mapper";

export default abstract class Model {

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
	private setAttributes(attributes: any) {
		for (let key in attributes) {
			if (attributes.hasOwnProperty(key)) {
				this[key] = attributes[key];
			}
		}
	}

	/**
	 * Create a QueryBuilder instance specifically for this model
	 */
	public static query<T>(): QueryBuilder<T> {
		if (!this.endpoint) {
			throw new Error(`The model "${this.name}" doesn't have an endpoint, so can't be queried.`);
		}

		const mapper: TMapper<Promise<T>> = async (response): Promise<T> => {
			const instance = new (this as any)();
			const attributes = await instance.map(response);
			instance.setAttributes(attributes);
			return instance;
		};

		const query = new QueryBuilder<T>(new Client(
			Config.get('baseUrl'),
			Config.get('clientId'),
			Config.get('clientSecret'),
			Config.get('username'),
			Config.get('password')
		), this.endpoint, mapper);

		query.include(this.include);

		return query;
	}

	/**
	 * @param response
	 * @protected
	 */
	protected abstract map(response: ResponseModel);
}