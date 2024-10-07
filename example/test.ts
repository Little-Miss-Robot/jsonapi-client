import Article from "./Article";
import Config from "../src/Config";
import MacroRegistry from "../src/MacroRegistry";
import AutoMapper from "../src/AutoMapper";
import ArticleCategory from "./ArticleCategory";

AutoMapper.setSelector((responseModel, selectValue) => {
	return (responseModel.type() === selectValue);
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

const articles = await Article.query<Article>().macro('sortByTitle').get();

const renderArticle = (article: Article) => {
	//console.log(article);
};

articles.forEach(article => {
	renderArticle(article);
});