import { ResultSet } from '../src/index';

it('items in ResultSet are instances of the correct class', () => {

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

	// expect(resultSet.get(0)).toMatch(/^(api\/endpoint)/);
	// @TODO perform tests
});
