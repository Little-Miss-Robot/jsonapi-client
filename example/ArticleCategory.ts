import Model from "../src/Model";
import {ResponseModelInterface} from "../src/contracts/ResponseModelInterface";

export default class ArticleCategory extends Model
{
	id: string;
	title: string;

	async map(responseModel: ResponseModelInterface) {
		return {
			id: responseModel.get('id', ''),
			title: responseModel.get('name', ''),
		};
	}
}