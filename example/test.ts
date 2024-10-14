import Article from "./Article";
import Config from "../src/Config";
import MacroRegistry from "../src/MacroRegistry";
import AutoMapper from "../src/AutoMapper";
import ArticleCategory from "./ArticleCategory";

Config.setAll({
	baseUrl: "",
	clientId: "",
	clientSecret: "",
	password: "",
	username: ""
});

AutoMapper.setSelector((responseModel, selectValue) => {
	return (responseModel.get('type', '') === selectValue);
});

AutoMapper.register({
	'node--article': Article,
	'taxonomy_term--article_categories': ArticleCategory,
});

MacroRegistry.register('filterByTitle', (query, titles) => {
	query.group('or', (query) => {
		titles.forEach(title => {
			query.where('title', '=', title);
		});
	});
});

MacroRegistry.register('sortByTitle', (query, titles) => {
	query.sort('title', 'desc');
});

const articles = await Article.query<Article>().macro('sortByTitle').limit(2).get();

console.log(articles);