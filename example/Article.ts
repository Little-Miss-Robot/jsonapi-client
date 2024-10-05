import Model from "../src/Model";
import ResponseModel from "../src/ResponseModel";

export default class Article extends Model
{
	protected static endpoint: string = 'api/index/articles';
	protected static include = ['category'];

	public id: string;
	public title: string;

	protected async map(responseModel: ResponseModel) {
		return {
			id: responseModel.id(),
			title: responseModel.get('title', ''),
			langcode: responseModel.get('langcode', ''),
			category: responseModel.get('category.name'),
		};
	}
}