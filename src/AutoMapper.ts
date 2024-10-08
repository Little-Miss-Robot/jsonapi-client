import {TNullable} from "./types/nullable";
import {ResponseModelInterface} from "./contracts/ResponseModelInterface";
import {TAutoMapperSelector} from "./types/automapper-selector";
import Model from "./Model";

export default class AutoMapper {

	/**
	 *
	 * @private
	 */
	private static models: Record<string, typeof Model> = {};

	/**
	 *
	 * @private
	 */
	private static selector: TNullable<TAutoMapperSelector>;

	/**
	 *
	 * @param selector
	 */
	public static setSelector(selector: TAutoMapperSelector) {
		this.selector = selector;
	}

	/**
	 *
	 * @param modelDefinitions
	 */
	public static register(modelDefinitions: Record<string, typeof Model>) {
		this.models = modelDefinitions;
	}

	/**
	 *
	 * @param responseModel
	 * @private
	 */
	private static select(responseModel: ResponseModelInterface): TNullable<typeof Model> {
		for (let value in this.models) {
			if (this.selector && this.selector(responseModel, value)) {
				return this.models[value];
			}
		}

		return null;
	}

	/**
	 *
	 * @param responseModel
	 */
	public static async map(responseModel: ResponseModelInterface) {
		const modelClass = this.select(responseModel);
		if (modelClass) {
			const instance = new modelClass();
			const attributes = await instance.map(responseModel);
			instance.setAttributes(attributes);

			return instance;
		}

		return responseModel;
	}
}