import { ResultSet } from '../src/index';

it('items in ResultSet are retrievable by get()', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 2,
			title: 'Example 2'
		}
	]);

	expect(resultSet.get(0)).toEqual({
		id: 1,
		title: 'Example 1'
	});

	expect(resultSet.get(1)).toEqual({
		id: 2,
		title: 'Example 2'
	});
});

it('ResultSet is iterable', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 2,
			title: 'Example 2'
		},
		{
			id: 3,
			title: 'Example 3'
		}
	]);

	// First test forEach
	resultSet.forEach(((item, index) => {
		expect(item).toEqual({
			id: index + 1,
			title: `Example ${index + 1}`
		});
	}));

	// Then test for loop
	for (let index = 0; index < resultSet.length; index++) {
		expect(resultSet.get(index)).toEqual({
			id: index + 1,
			title: `Example ${index + 1}`
		});
	}
});

it('ResultSet is filterable', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 2,
			title: 'Example 2'
		},
		{
			id: 3,
			title: 'Example 3'
		}
	]);

	const filteredItems = resultSet.filter(item => item.id !== 2);

	expect(filteredItems).toEqual([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 3,
			title: 'Example 3'
		}
	]);
});

it('ResultSet is findable', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 2,
			title: 'Example 2'
		},
		{
			id: 3,
			title: 'Example 3'
		}
	]);

	const item = resultSet.find(item => item.id === 2);

	expect(item).toEqual({
		id: 2,
		title: 'Example 2'
	});
});

it('ResultSet is mappable', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 2,
			title: 'Example 2'
		},
		{
			id: 3,
			title: 'Example 3'
		}
	]);

	const mappedItems = resultSet.map(item => {
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
			title: 'Example 1'
		},
		{
			id: 2,
			hid: 'Item with id 2',
			title: 'Example 2'
		},
		{
			id: 3,
			hid: 'Item with id 3',
			title: 'Example 3'
		}
	]);
});

it('has a length property', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
	]);

	expect(resultSet.length).toBe(1);

	resultSet.push({
		id: 1,
		title: 'Example 2'
	});
});

it('items can be popped from the ResultSet', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
		{
			id: 1,
			title: 'Example 2'
		},
	]);

	resultSet.pop();

	expect(resultSet.get(0)).toEqual({
		id: 1,
		title: 'Example 1'
	});

	resultSet.pop();

	expect(resultSet.get(0)).toBeUndefined();
	expect(resultSet.get(1)).toBeUndefined();
});

it('items can be pushed to ResultSet', () => {

	const resultSet = new ResultSet([
		{
			id: 1,
			title: 'Example 1'
		},
	]);

	resultSet.push({
		id: 2,
		title: 'Example 2'
	});

	expect(resultSet.get(0)).toEqual({
		id: 1,
		title: 'Example 1'
	});

	expect(resultSet.get(1)).toEqual({
		id: 2,
		title: 'Example 2'
	});
});

it('meta of ResultSet is retrievable by using the meta property', () => {

	const resultSet = new ResultSet();

	const meta = {
		query: {
			url: 'url-test/',
			params: {
				testParam: 1
			}
		},
		performance: {
			query: 50,
			mapping: 100
		},
		count: 50,
		pages: 2,
		perPage: 25
	};

	resultSet.setMeta(meta);

	expect(resultSet.meta).toBe(meta);
});