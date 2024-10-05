import Article from "./Article";
import Config from "../src/Config";
import MacroRegistry from "../src/MacroRegistry";

Config.set('baseUrl', '');
Config.set('clientId', '');
Config.set('clientSecret', '');
Config.set('username', '');
Config.set('password', '');

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
	console.log(article);
};

articles.forEach(article => {
	renderArticle(article);
});