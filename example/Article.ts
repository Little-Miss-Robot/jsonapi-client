import Model from "../src/Model";
import ResponseModel from "../src/ResponseModel";
import ArticleCategory from "./ArticleCategory";

export default class Article extends Model
{
	protected static endpoint: string = 'api/index/articles';
	protected static include = ['category'];

	public id: string;
	public title: string;
	public category: ArticleCategory;

	protected async map(responseModel: ResponseModel) {
		return {
			id: responseModel.id(),
			title: responseModel.get('title', ''),
			langcode: responseModel.get('langcode', ''),
			category: await responseModel.map('category'),
			//category: responseModel.get('category.name'),
		};
	}
}