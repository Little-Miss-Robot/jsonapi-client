import AutoMapper from "./AutoMapper";
import type { ResponseModelInterface } from "./contracts/ResponseModelInterface";
import { isResponseWithData } from "./typeguards/isResponseWithData";
import { TNullable } from "./types/generic/nullable";

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
			result = result !== null && Object.prototype.hasOwnProperty.call(result, key) ? result[key] : undefined;
			if (result === undefined) {
				return defaultValue;
			}
		}

		return result as T;
	}

	/**
	 * Gets a relationship from the node and optionally map it
	 * @param path
	 */
	async hasOne<T>(path: string | string[]): Promise<TNullable<T>> {
		let contentData: unknown = this.get(path, null);

		if (!contentData) {
			return null;
		}

		if (isResponseWithData(contentData)) {
			contentData = contentData.data;
		}

		return AutoMapper.map(new ResponseModel(contentData));
	}

	/**
	 * @param path
	 */
	async hasMany<T>(path: string | string[]): Promise<TNullable<T[]>> {
		let contentData: unknown = this.get(path, null);

		if (!contentData) {
			return null;
		}

		if (isResponseWithData(contentData)) {
			contentData = contentData.data;
		}

		if (Array.isArray(contentData)) {
			const result = [];

			for await (const item of contentData) {
				result.push(AutoMapper.map(new ResponseModel(item)));
			}

			return result as T[];
		}

		return null;
	}
}
