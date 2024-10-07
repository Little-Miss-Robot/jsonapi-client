import ResponseModel from "./ResponseModel";
import {TNullable} from "./types/nullable";
import Model from "./Model";

type TAutoMapperSelector = (responseModel: ResponseModel, selectValue: string) => boolean;

export default class AutoMapper {

	private static models: Record<string, typeof Model> = {};

	private static selector: TNullable<TAutoMapperSelector>;

	public static setSelector(selector: TAutoMapperSelector) {
		this.selector = selector;
	}

	public static register(modelDefinitions: Record<string, typeof Model>) {
		this.models = modelDefinitions;
	}

	private static select(responseModel: ResponseModel): TNullable<typeof Model> {
		for (let value in this.models) {
			if (this.selector && this.selector(responseModel, value)) {
				return this.models[value];
			}
		}

		return null;
	}

	public static map(responseModel: ResponseModel) {
		const modelClass = this.select(responseModel);
		console.log(new modelClass());
	}
}