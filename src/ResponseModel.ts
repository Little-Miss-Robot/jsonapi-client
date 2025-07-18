import AutoMapper from "./AutoMapper";
import type { ResponseModelInterface } from "./contracts/ResponseModelInterface";
import { isResponseWithData } from "./typeguards/isResponseWithData";
import { TNullable } from "./types/generic/nullable";
import Model from "./Model";
import {TModelClass} from "./types/model-class";

export default class ResponseModel implements ResponseModelInterface {
	/**
	 * The raw, unprocessed response from the JSON:API
	 * @private
	 */
	private readonly rawResponse: unknown;

	/**
	 * @param rawResponse
	 */
	constructor(rawResponse: unknown) {
		this.rawResponse = rawResponse;
	}

	/**
	 * Gets a field from the node
	 * @param path
	 * @param defaultValue
	 */
	get<T>(path: string | string[], defaultValue: T): T {
		if (!Array.isArray(path)) {
			path = path.replace(/\[(\d+)\]/g, ".$1").split(".");
		}

		let result = this.rawResponse as Record<string, any>;

		for (const key of path) {
			result = Object.prototype.hasOwnProperty.call(result, key) ? result[key] : undefined;
			if (result === undefined || result === null) {
				return defaultValue;
			}
		}

		return result as T;
	}

	/**
	 * Gets a relationship from the node and optionally map it
	 * @param path
	 * @param modelClass
	 */
	async hasOne<T extends Model>(path: string | string[], modelClass?: TModelClass<T>): Promise<TNullable<T>> {

		let contentData: unknown = this.get(path, null);

		if (isResponseWithData(contentData)) {
			contentData = contentData.data;
		}

		if (!contentData) {
			return null;
		}

		const responseModel = new ResponseModel(contentData);

		// A class was explicitly given
		if (modelClass) {
			return await modelClass.createFromResponse(responseModel);
		}

		// Resort to automapping
		return await AutoMapper.map(responseModel);
	}

	/**
	 * @param path
	 * @param modelClass
	 */
	async hasMany<T extends Model>(path: string | string[], modelClass?: TModelClass<T>): Promise<TNullable<T[]>> {

		let contentData: unknown = this.get(path, null);

		if (!contentData) {
			return null;
		}

		if (isResponseWithData(contentData)) {
			contentData = contentData.data;
		}

		if (Array.isArray(contentData)) {
			const result: T[] = [];

			for (const item of contentData) {
				const modelInstance = modelClass ?
					await modelClass.createFromResponse(new ResponseModel(item)) :
					await AutoMapper.map(new ResponseModel(item));

				if (modelInstance) {
					result.push(modelInstance);
				}
			}

			return result as T[];
		}

		return null;
	}
}
