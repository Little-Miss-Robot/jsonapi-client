import Container from "./Container";
import QueryBuilder from "./QueryBuilder";
import type { ResponseModelInterface } from "./contracts/ResponseModelInterface";
import type { TMapper } from "./types/mapper";
import {DataProperties} from "./types/generic/data-properties";

export default abstract class Model {
	/**
	 * @protected
	 */
	protected static primaryKey: string = "id";

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
	 * @param response
	 */
	public static async createFromResponse(response: ResponseModelInterface) {

		if (! this.gate(response)) {
			return null;
		}

		const instance = new (this as any)();
		Object.assign(instance, await instance.map(response));
		return instance;
	}

	/**
	 * Create a QueryBuilder instance specifically for this model
	 */
	public static query<T extends typeof Model>(this: T): QueryBuilder<InstanceType<T>> {
		if (!this.endpoint) {
			throw new Error(`The model "${this.name}" doesn't have an endpoint, so can't be queried.`);
		}

		const mapper: TMapper<Promise<InstanceType<T>>> = async (response: ResponseModelInterface): Promise<InstanceType<T>> => {
			return await this.createFromResponse(response);
		};

		// Create a new QueryBuilder instance with the gate and includes
		const query = Container.make('QueryBuilderInterface', this.endpoint, mapper)
			.gate(this.gate)
			.include(this.include);

		// Check if the model has a default macro
		if (this.defaultMacro) {
			query.macro(this.defaultMacro);
		}

		return query;
	}

	/**
	 * @param responseModel
	 */
	protected map(responseModel: ResponseModelInterface): unknown {
		return responseModel;
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
			} else if (Array.isArray(value)) {
				// Support arrays of models
				data[key] = value.map(v =>
					v instanceof Model ? v.serialize() : v
				);
			} else {
				data[key] = value;
			}
		}

		return data as DataProperties<T>;
	}
}
