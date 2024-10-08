import Model from "../src/Model";
import ArticleCategory from "./ArticleCategory";
import {ResponseModelInterface} from "../src/contracts/ResponseModelInterface";

export default class Article extends Model
{
	protected static endpoint: string = 'api/index/articles';
	protected static include = ['category'];

	id: string;
	title: string;
	category: ArticleCategory;

	async map(responseModel: ResponseModelInterface) {
		return {
			id: responseModel.get('id', ''),
			title: responseModel.get('title', ''),
			langcode: responseModel.get('langcode', ''),
			category: await responseModel.map('category'),
		};
	}
}