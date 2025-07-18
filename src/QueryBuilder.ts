import type Client from "./Client";
import MacroRegistry from "./MacroRegistry";
import ResponseModel from "./ResponseModel";
import ResultSet from "./ResultSet";
import type { QueryBuilderInterface } from "./contracts/QueryBuilderInterface";
import InvalidResponseError from "./errors/InvalidResponseError";
import { isJsonApiResponse } from "./typeguards/isJsonApiResponse";
import { isRawResponse } from "./typeguards/isRawResponse";
import { isResponseWithErrors } from "./typeguards/isResponseWithErrors";
import type { TFilterOperator } from "./types/filter-operator";
import type { TNullable } from "./types/generic/nullable";
import { TJsonApiResponse } from "./types/json-api-response";
import type { TMapper } from "./types/mapper";
import { TQueryBuilderGroupingFunction } from "./types/query-builder-grouping-function";
import type { TQueryParams } from "./types/query-params";
import type { TResultSetMeta } from "./types/resultset-meta";
import { makeSearchParams } from "./utils/http";
import Model from "./Model";
import {TDataGateFunction} from "./types/data-gate-function";

/**
 * This class provides an easy-to-use interface to build queries
 * specifically for JSON:API
 */
export default class QueryBuilder<T extends Model> implements QueryBuilderInterface<T> {
	/**
	 * The locale in which we're going to query the entries
	 * @private
	 */
	private locale?: string;

	/**
	 * The mapping function to use when we received the response
	 * @private
	 */
	private readonly client: Client;

	/**
	 * The mapping function to use when we received the response
	 * @private
	 */
	private readonly mapper: TMapper<Promise<T>>;

	/**
	 * @private
	 */
	private readonly endpoint: string;

	/**
	 * The registered query params
	 * @private
	 */
	private readonly queryParams: TQueryParams;

	/**
	 * @private
	 */
	private pageLimit: TNullable<number>;

	/**
	 * @private
	 */
	private pageOffset: TNullable<number>;

	/**
	 * @private
	 */
	private dataGate: TNullable<TDataGateFunction>;

	/**
	 * The cache policy to pass to the Client once the query executes
	 * @private
	 */
	private cachePolicy: "force-cache" | "no-store" = "force-cache";

	/**
	 *
	 * @private
	 */
	private response!: TJsonApiResponse;

	/**
	 * The last used filter group id, increments with each use of a filter-method to generate a unique filter group name
	 * @private
	 */
	private lastFilterGroupId: number = 0;

	/**
	 *
	 * @private
	 */
	private currentFilterGroupName: TNullable<string> = null;

	/**
	 * @param client
	 * @param endpoint
	 * @param mapper
	 */
	constructor(client: Client, endpoint: string, mapper: TMapper<Promise<T>>) {
		this.client = client;
		this.endpoint = endpoint;
		this.mapper = mapper;
		this.queryParams = {};
	}

	/**
	 * Executes a macro registered on MacroRegistry
	 * @param name
	 * @param args
	 */
	public macro(name: string, ...args: unknown[]): this {
		MacroRegistry.execute(name, this, args);
		return this;
	}

	/**
	 * @param gateFunction
	 */
	public gate(gateFunction: TDataGateFunction): this {
		this.dataGate = gateFunction;
		return this;
	}

	/**
	 * Disabled caching on the request
	 */
	public noCache(): this {
		this.cachePolicy = "no-store";
		return this;
	}

	/**
	 * Forces caching on the request
	 */
	public cache(): this {
		this.cachePolicy = "force-cache";
		return this;
	}

	/**
	 * Sets the locale of the query
	 * @param locale
	 */
	public setLocale(locale: string): this {
		this.locale = locale;
		return this;
	}

	/**
	 * Registers one query param
	 * @param name
	 * @param value
	 */
	public param(name: string, value: string | number): this {
		this.queryParams[name] = value;
		return this;
	}

	/**
	 * Registers multiple query params
	 * @param params
	 */
	public params(params: TQueryParams): this {
		Object.keys(params).forEach((key) => {
			this.param(key, params[key]);
		});
		return this;
	}

	/**
	 * @param path
	 * @param operator
	 * @param value
	 */
	public where(path: string, operator: TFilterOperator, value: string): this {
		const groupName = this.createFilterGroupName();
		this.param(`filter[${groupName}][condition][path]`, path);
		this.param(`filter[${groupName}][condition][operator]`, operator);
		this.param(`filter[${groupName}][condition][value]`, value);
		this.assignFilterGroupToCurrentFilterGroup(groupName);
		return this;
	}

	/**
	 * Registers includes (as described by JSON:API)
	 * @param includes
	 */
	public include(includes: string[]): this {
		this.param("jsonapi_include", 1);
		this.param("include", includes.join(","));
		return this;
	}

	/**
	 * @param amount
	 */
	public limit(amount: number): this {
		this.pageLimit = amount;
		this.param("page[limit]", amount);
		return this;
	}

	/**
	 * @param page
	 * @param perPage
	 */
	paginate(page: number, perPage: number): this {
		const offset = Math.max(page - 1, 0) * perPage;
		this.pageOffset = offset;
		this.param("page[offset]", offset);
		this.limit(perPage);
		return this;
	}

	/**
	 * @param path
	 * @param direction
	 */
	public sort(path: string, direction: "asc" | "desc" = "asc"): this {
		const groupName = this.createFilterGroupName();
		this.param(`sort[${groupName}][path]`, path);
		this.param(`sort[${groupName}][direction]`, direction);

		return this;
	}

	/**
	 *
	 * @param operator
	 * @param groupingFunction
	 */
	public group(operator: "or" | "and", groupingFunction: TQueryBuilderGroupingFunction<T>): this {
		const currentFilterGroupName = this.currentFilterGroupName;
		const newGroupName = this.createFilterGroupName();
		this.assignFilterGroupToCurrentFilterGroup(newGroupName);
		this.currentFilterGroupName = newGroupName;
		this.param(`filter[${this.currentFilterGroupName}][group][conjunction]`, operator.toUpperCase());
		groupingFunction(this);
		this.currentFilterGroupName = currentFilterGroupName;
		return this;
	}

	/**
	 * @private
	 */
	private createFilterGroupName(): string {
		this.lastFilterGroupId = this.lastFilterGroupId + 1;
		return `g${this.lastFilterGroupId}`;
	}

	/**
	 * @param groupName
	 * @private
	 */
	private assignFilterGroupToCurrentFilterGroup(groupName: string) {
		if (this.currentFilterGroupName) {
			this.param(`filter[${groupName}][condition][memberOf]`, this.currentFilterGroupName);
		}
	}

	/**
	 * @param path
	 * @private
	 */
	private buildUrl(path: string): string {
		return `${this.locale ? `${this.locale}/` : ""}${path}/?${makeSearchParams(this.queryParams)}`;
	}

	/**
	 * Executes the query (GET)
	 */
	private async performGetRequest(path: string) {
		return await this.client.get(path, {
			cache: this.cachePolicy,
		});
	}

	/**
	 * Fetches the endpoint and uses the raw response to pass to the mapper
	 */
	async getRaw(): Promise<T> {
		const response = await this.performGetRequest(this.buildUrl(this.endpoint));

		if (!isRawResponse(response)) {
			throw new InvalidResponseError();
		}

		if (!this.mapper) {
			throw new Error("No mapper");
		}

		return await this.mapper(new ResponseModel(response));
	}

	/**
	 * Maps and returns all entries in the response
	 */
	async get(): Promise<ResultSet<T>> {
		let start = Date.now();
		const url = this.buildUrl(this.endpoint);
		const response = await this.performGetRequest(url);

		if (isResponseWithErrors(response)) {
			const firstError = response.errors[0];
			throw new InvalidResponseError(`${firstError.title} (status: ${firstError.status}): ${firstError.detail}`);
		}

		if (!isJsonApiResponse(response)) {
			throw new InvalidResponseError(
				"Couldn't verify the response as a valid JSON:API response. Potentially this is not a JSON:API resource or the JSON:API has a version mismatch (expected 1.0)"
			);
		}

		this.response = response;

		const queryDuration = Date.now() - start;
		start = Date.now();

		const responseModels = this.response.data.map((entry: unknown) => new ResponseModel(entry));

		if (!this.mapper) {
			throw new Error("No mapper");
		}

		const resultSet = new ResultSet<T>();

		let itemCountExcludedByGate = 0;
		for await (const item of responseModels) {
			if (this.dataGate && ! this.dataGate(item)) {
				itemCountExcludedByGate++;
				continue;
			}
			const mapped = await this.mapper(item);
			resultSet.push(mapped);
		}

		const mappingDuration = Date.now() - start;

		let meta: TResultSetMeta = {
			query: {
				url,
				params: this.queryParams,
			},
			performance: {
				query: queryDuration,
				mapping: mappingDuration,
			},
			excludedByGate: itemCountExcludedByGate
		};

		if (this.response.meta) {
			meta = {
				count: this.response.meta.count || 0,
				pages: this.pageLimit ? Math.ceil(this.response.meta.count / this.pageLimit) : 1,
				perPage: this.pageLimit ? this.pageLimit : this.response.meta.count,
				...meta,
			};
		}

		resultSet.setMeta(meta);

		return resultSet;
	}

	/**
	 *
	 */
	async first(): Promise<T | ResponseModel> {
		return (await this.get()).get(0);
	}

	/**
	 * Gets a single entry by UUID
	 * @param uuid
	 */
	async find(uuid: string | number): Promise<T> {
		if (!this.mapper) {
			throw new Error("No mapper");
		}

		const response = await this.performGetRequest(this.buildUrl(`${this.endpoint}/${uuid}`));

		if (isResponseWithErrors(response)) {
			const firstError = response.errors[0];
			throw new InvalidResponseError(`${firstError.title} (status: ${firstError.status}): ${firstError.detail}`);
		}

		if (!isJsonApiResponse(response)) {
			throw new InvalidResponseError(
				"Couldn't verify the response as a valid JSON:API response. Potentially this is not a JSON:API resource or the JSON:API has a version mismatch (expected 1.0)"
			);
		}

		this.response = response;

		return this.mapper(new ResponseModel(this.response.data));
	}

	/**
	 * Turns the QueryBuilder into a string
	 */
	public toString(): string {
		return this.buildUrl(this.endpoint);
	}
}
