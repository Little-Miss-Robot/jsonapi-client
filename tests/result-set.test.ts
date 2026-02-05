import { ResultSet } from '../src/index';

it('has items retrievable by get()', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 2,
            title: 'Example 2',
        },
    ]);

    expect(resultSet.get(0)).toEqual({
        id: 1,
        title: 'Example 1',
    });

    expect(resultSet.get(1)).toEqual({
        id: 2,
        title: 'Example 2',
    });
});

it('is iterable', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 2,
            title: 'Example 2',
        },
        {
            id: 3,
            title: 'Example 3',
        },
    ]);

    // First test forEach
    resultSet.forEach((item, index) => {
        expect(item).toEqual({
            id: index + 1,
            title: `Example ${index + 1}`,
        });
    });

    // Then test for loop
    for (let index = 0; index < resultSet.length; index++) {
        expect(resultSet.get(index)).toEqual({
            id: index + 1,
            title: `Example ${index + 1}`,
        });
    }
});

it('is filterable', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 2,
            title: 'Example 2',
        },
        {
            id: 3,
            title: 'Example 3',
        },
    ]);

    const filteredItems = resultSet.filter(item => item.id !== 2);

    expect(filteredItems).toEqual([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 3,
            title: 'Example 3',
        },
    ]);
});

it('is findable', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 2,
            title: 'Example 2',
        },
        {
            id: 3,
            title: 'Example 3',
        },
    ]);

    const item = resultSet.find(item => item.id === 2);

    expect(item).toEqual({
        id: 2,
        title: 'Example 2',
    });
});

it('is mappable', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 2,
            title: 'Example 2',
        },
        {
            id: 3,
            title: 'Example 3',
        },
    ]);

    const mappedItems = resultSet.map((item) => {
        return {
            id: item.id,
            hid: `Item with id ${item.id}`,
            title: item.title,
        };
    });

    expect(mappedItems).toEqual([
        {
            id: 1,
            hid: 'Item with id 1',
            title: 'Example 1',
        },
        {
            id: 2,
            hid: 'Item with id 2',
            title: 'Example 2',
        },
        {
            id: 3,
            hid: 'Item with id 3',
            title: 'Example 3',
        },
    ]);
});

it('has a length property', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
    ]);

    expect(resultSet.length).toBe(1);

    resultSet.push({
        id: 1,
        title: 'Example 2',
    });
});

it('has items that can be popped', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
        {
            id: 1,
            title: 'Example 2',
        },
    ]);

    resultSet.pop();

    expect(resultSet.get(0)).toEqual({
        id: 1,
        title: 'Example 1',
    });

    resultSet.pop();

    expect(resultSet.get(0)).toBeUndefined();
    expect(resultSet.get(1)).toBeUndefined();
});

it('is pushable', () => {
    const resultSet = new ResultSet([
        {
            id: 1,
            title: 'Example 1',
        },
    ]);

    resultSet.push({
        id: 2,
        title: 'Example 2',
    });

    expect(resultSet.get(0)).toEqual({
        id: 1,
        title: 'Example 1',
    });

    expect(resultSet.get(1)).toEqual({
        id: 2,
        title: 'Example 2',
    });
});

it('has meta that is retrievable by using the meta property', () => {
    const resultSet = new ResultSet();

    const meta = {
        query: {
            url: 'url-test/',
            params: {
                testParam: 1,
            },
        },
        performance: {
            query: 50,
            mapping: 100,
        },
        count: 50,
        pages: 2,
        perPage: 25,
    };

    resultSet.setMeta(meta);

    expect(resultSet.meta).toBe(meta);
});

it('is reducable', () => {
    const resultSet = new ResultSet([
        1,
        2,
        3,
        4,
    ]);

    const result = resultSet.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
    }, 0);

    expect(result).toBe(10);
});
