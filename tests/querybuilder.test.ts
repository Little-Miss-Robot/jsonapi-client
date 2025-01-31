import Client from '../src/Client';
import QueryBuilder from '../src/QueryBuilder';

function makeMockClient() {
    return new Client('https://baseurl.ext', '', '');
}

function makeQueryBuilder() {
    return new QueryBuilder<any>(
        makeMockClient(),
        'api/endpoint',
        async () => {},
    );
}

it('result of query builder starts with the endpoint', () => {
    const queryBuilder = makeQueryBuilder();
    expect(queryBuilder.toString()).toMatch(/^(api\/endpoint)/);

    expect(queryBuilder.toString()).toBe('api/endpoint/?page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('a new query has pagination params by default', () => {
    const queryBuilder = makeQueryBuilder();
    expect(queryBuilder.toString()).toBe('api/endpoint/?page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('adds param', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.param('testParam', 'testValue');
    expect(queryBuilder.toString()).toBe('api/endpoint/?testParam=testValue&page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('adds multiple params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.params({
        test1: 'test1Value',
        test2: 'test2Value',
    });
    expect(queryBuilder.toString()).toBe('api/endpoint/?test1=test1Value&test2=test2Value&page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('params with the same name get overwritten', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.params({
        test1: 'test1Value',
        test2: 'test2Value',
    });
    queryBuilder.param('test2', 'anotherTestValue');
    expect(queryBuilder.toString()).toBe('api/endpoint/?test1=test1Value&test2=anotherTestValue&page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('setting locale prepends the locale', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.setLocale('nl');
    expect(queryBuilder.toString()).toBe('nl/api/endpoint/?page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('where adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.where('name', '=', 'Rein');
    expect(queryBuilder.toString()).toBe('api/endpoint/?filter%5Bg1%5D%5Bcondition%5D%5Bpath%5D=name&filter%5Bg1%5D%5Bcondition%5D%5Boperator%5D=%3D&filter%5Bg1%5D%5Bcondition%5D%5Bvalue%5D=Rein&page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('includes adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.include(['testInclude1', 'testInclude2', 'testInclude3']);
    expect(queryBuilder.toString()).toBe('api/endpoint/?jsonapi_include=1&include=testInclude1%2CtestInclude2%2CtestInclude3&page%5Blimit%5D=50&page%5Boffset%5D=0');
});

it('paginate adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.paginate(1, 10);
    expect(queryBuilder.toString()).toBe('api/endpoint/?page%5Blimit%5D=10&page%5Boffset%5D=0');
    queryBuilder.paginate(2, 10);
    expect(queryBuilder.toString()).toBe('api/endpoint/?page%5Blimit%5D=10&page%5Boffset%5D=10');
});

it('sort adds the appropriate params', () => {
    const queryBuilder = makeQueryBuilder();
    queryBuilder.sort('name', 'asc');
    expect(queryBuilder.toString()).toBe('api/endpoint/?sort%5Bg1%5D%5Bpath%5D=name&sort%5Bg1%5D%5Bdirection%5D=asc&page%5Blimit%5D=50&page%5Boffset%5D=0');
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
    expect(queryBuilder.toString()).toBe('api/endpoint/?filter%5Bg1%5D%5Bgroup%5D%5Bconjunction%5D=OR&filter%5Bg2%5D%5Bcondition%5D%5Bpath%5D=name&filter%5Bg2%5D%5Bcondition%5D%5Boperator%5D=%3D&filter%5Bg2%5D%5Bcondition%5D%5Bvalue%5D=Rein&filter%5Bg2%5D%5Bcondition%5D%5BmemberOf%5D=g1&filter%5Bg3%5D%5Bcondition%5D%5Bpath%5D=name&filter%5Bg3%5D%5Bcondition%5D%5Boperator%5D=%3D&filter%5Bg3%5D%5Bcondition%5D%5Bvalue%5D=Gilke&filter%5Bg3%5D%5Bcondition%5D%5BmemberOf%5D=g1&filter%5Bg4%5D%5Bcondition%5D%5BmemberOf%5D=g1&filter%5Bg4%5D%5Bgroup%5D%5Bconjunction%5D=AND&filter%5Bg5%5D%5Bcondition%5D%5Bpath%5D=age&filter%5Bg5%5D%5Bcondition%5D%5Boperator%5D=%3E&filter%5Bg5%5D%5Bcondition%5D%5Bvalue%5D=34&filter%5Bg5%5D%5Bcondition%5D%5BmemberOf%5D=g4&page%5Blimit%5D=50&page%5Boffset%5D=0');
});
