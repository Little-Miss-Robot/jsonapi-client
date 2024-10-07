import Model from "../src/Model";
import ResponseModel from "../src/ResponseModel";

export default class ArticleCategory extends Model
{
	public id: string;
	public title: string;

	protected async map(responseModel: ResponseModel) {
		return {
			id: responseModel.id(),
			title: responseModel.get('title', ''),
		};
	}
}