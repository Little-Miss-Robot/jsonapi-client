import {MacroRegistry, QueryBuilder, Client, Container, JsonApi} from '../src/index';
import UnknownMacroError from "../src/errors/UnknownMacroError";

function makeQueryBuilder() {

	JsonApi.init({
		baseUrl: "http://localhost:3000",
		clientId: "test",
		clientSecret: "test"
	});

	return Container.make('QueryBuilderInterface', 'api/endpoint');
}

it('correctly executes registered macros', () => {

	MacroRegistry.register('macroName', (queryBuilder) => {
		queryBuilder.limit(333);
	});

	const queryBuilder = makeQueryBuilder();
	queryBuilder.macro('macroName');

	expect(queryBuilder.toString()).toBe('api/endpoint/?page%5Blimit%5D=333');
});

it('throws an UnknownMacroError when executing non-existent macros', () => {

	// First register a macro
	MacroRegistry.register('macroName', (queryBuilder) => {
		queryBuilder.limit(5);
	});

	// Make the QueryBuilder and execute the registered macro (to ensure registering macros as a whole is still working)
	const queryBuilder = makeQueryBuilder();
	queryBuilder.macro('macroName');

	// Test executing non-existent macros
	const t = () => {
		queryBuilder.macro('nonExistentMacroName');
	};

	expect(t).toThrow(UnknownMacroError);
});