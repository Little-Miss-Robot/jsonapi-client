import type { TEventMap } from '../src/types/event-bus';
import OAuth from '../src/auth/OAuth';
import Client from '../src/Client';
import EventBus from '../src/EventBus';
import MacroRegistry from '../src/MacroRegistry';
import DefaultFetchPolicy from '../src/policies/DefaultFetchPolicy';
import QueryBuilder from '../src/QueryBuilder';

function makeMockClient() {
    const eventBus = new EventBus<TEventMap>();

    return new Client(
        new OAuth(
            'https://baseurl.ext',
            'test',
            'test',
            eventBus,
        ),
        new DefaultFetchPolicy(),
        eventBus,
        'https://baseurl.ext',
    );
}

function makeQueryBuilder() {
    return new QueryBuilder<any>(
        makeMockClient(),
        new EventBus(),
        new MacroRegistry(),
        'api/endpoint',
        async () => {},
    );
}

it('result of query builder starts with the endpoint', () => {
    const queryBuilder = makeQueryBuilder();
    expect(queryBuilder.toString()).toMatch(/^(api\/endpoint)/);

    expect(queryBuilder.toString()).toBe('api/endpoint');
});

it('a new query has pagination params by default', () => {
    const queryBuilder = makeQueryBuilder();
    expect(queryBuilder.toString()).toBe('api/endpoint');
});

it('adds param', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.param('testParam', 'testValue');
    expect(queryBuilder.toString()).toBe('api/endpoint?testParam=testValue');
});

it('adds multiple params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.params({
        test1: 'test1Value',
        test2: 'test2Value',
    });
    expect(queryBuilder.toString()).toBe('api/endpoint?test1=test1Value&test2=test2Value');
});

it('params with the same name get overwritten', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.params({
        test1: 'test1Value',
        test2: 'test2Value',
    });
    queryBuilder.param('test2', 'anotherTestValue');
    expect(queryBuilder.toString()).toBe('api/endpoint?test1=test1Value&test2=anotherTestValue');
});

it('setting locale prepends the locale', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.setLocale('nl');
    expect(queryBuilder.toString()).toBe('nl/api/endpoint');
});

it('where adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.where('name', '=', 'Rein');
    expect(queryBuilder.toString()).toBe('api/endpoint?filter%5Bg1%5D%5Bcondition%5D%5Bpath%5D=name&filter%5Bg1%5D%5Bcondition%5D%5Boperator%5D=%3D&filter%5Bg1%5D%5Bcondition%5D%5Bvalue%5D=Rein');
});

it('includes adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.include(['testInclude1', 'testInclude2', 'testInclude3']);
    expect(queryBuilder.toString()).toBe('api/endpoint?jsonapi_include=1&include=testInclude1%2CtestInclude2%2CtestInclude3');
});

it('paginate adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.paginate(1, 10);
    expect(queryBuilder.toString()).toBe('api/endpoint?page%5Boffset%5D=0&page%5Blimit%5D=10');
    queryBuilder.paginate(2, 10);
    expect(queryBuilder.toString()).toBe('api/endpoint?page%5Boffset%5D=10&page%5Blimit%5D=10');
});

it('sort adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.sort('name', 'asc');
    expect(queryBuilder.toString()).toBe('api/endpoint?sort%5Bg1%5D%5Bpath%5D=name&sort%5Bg1%5D%5Bdirection%5D=asc');
});

it('group adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.group('or', (qb) => {
        qb.where('name', '=', 'Rein');
        qb.where('name', '=', 'Gilke');
        qb.group('and', () => {
            qb.where('age', '>', '34');
        });
    });
    expect(queryBuilder.toString()).toBe('api/endpoint?filter%5Bg1%5D%5Bgroup%5D%5Bconjunction%5D=OR&filter%5Bg2%5D%5Bcondition%5D%5BmemberOf%5D=g1&filter%5Bg2%5D%5Bcondition%5D%5Bpath%5D=name&filter%5Bg2%5D%5Bcondition%5D%5Boperator%5D=%3D&filter%5Bg2%5D%5Bcondition%5D%5Bvalue%5D=Rein&filter%5Bg3%5D%5Bcondition%5D%5BmemberOf%5D=g1&filter%5Bg3%5D%5Bcondition%5D%5Bpath%5D=name&filter%5Bg3%5D%5Bcondition%5D%5Boperator%5D=%3D&filter%5Bg3%5D%5Bcondition%5D%5Bvalue%5D=Gilke&filter%5Bg4%5D%5Bcondition%5D%5BmemberOf%5D=g1&filter%5Bg4%5D%5Bgroup%5D%5Bconjunction%5D=AND&filter%5Bg5%5D%5Bcondition%5D%5BmemberOf%5D=g4&filter%5Bg5%5D%5Bcondition%5D%5Bpath%5D=age&filter%5Bg5%5D%5Bcondition%5D%5Boperator%5D=%3E&filter%5Bg5%5D%5Bcondition%5D%5Bvalue%5D=34');
});

it('clone copies full query state (toString matches)', () => {
    const a = makeQueryBuilder();
    a.setLocale('en');
    a.param('x', 1);
    a.whereIn('id', [1, 2, 3]);
    a.include(['rel']);
    a.paginate(1, 25);
    a.sort('name', 'desc');
    a.noCache();
    a.gate(() => true);

    const b = a.clone();
    expect(b.toString()).toBe(a.toString());
});

it('clone is independent: mutating clone does not change original', () => {
    const a = makeQueryBuilder();
    a.where('title', '=', 'A');
    const original = a.toString();

    const b = a.clone();
    b.where('title', '=', 'B');
    b.param('extra', 'q');

    expect(a.toString()).toBe(original);
    expect(b.toString()).not.toBe(original);
});

it('fromUrl with a string URL copies search params onto the builder endpoint', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.fromUrl('https://example.com/unrelated/path?page%5Boffset%5D=20&page%5Blimit%5D=10');

    expect(queryBuilder.toString()).toBe('api/endpoint?page%5Boffset%5D=20&page%5Blimit%5D=10');
});

it('fromUrl accepts a URL object', () => {
    const queryBuilder = makeQueryBuilder();
    const href = 'https://example.com/items?sort%5Bg1%5D%5Bpath%5D=created&sort%5Bg1%5D%5Bdirection%5D=desc';
    queryBuilder.fromUrl(new URL(href));

    expect(queryBuilder.toString()).toBe('api/endpoint?sort%5Bg1%5D%5Bpath%5D=created&sort%5Bg1%5D%5Bdirection%5D=desc');
});

it('fromUrl with no search string does not add query params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.fromUrl('https://example.com/api/endpoint');
    expect(queryBuilder.toString()).toBe('api/endpoint');
});

it('fromUrl merged with existing params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.param('existing', 'yes');
    queryBuilder.fromUrl('https://x.test/?other=1');

    expect(queryBuilder.toString()).toBe('api/endpoint?existing=yes&other=1');
});
