import Config from '../src/Config';
import {TConfigAttributes} from "../src/types/config-attributes";

it('can setAll Config values and ', () => {

	Config.setAll({
		baseUrl: 'a',
		clientId: 'b',
		clientSecret: 'c',
		password: 'd',
		username: 'e'
	});

	expect(Config.get('baseUrl')).toBe('a');
	expect(Config.get('clientId')).toBe('b');
	expect(Config.get('clientSecret')).toBe('c');
});

it('returns null when getting a non-existent value', () => {
	expect(Config.get('nonExistentConfigValue' as keyof TConfigAttributes)).toBe(null);
});

test('Empty string Config values throw an Error', () => {

	const t = () => {
		Config.setAll({
			baseUrl: 'a',
			clientId: 'b',
			clientSecret: '',
			password: 'd',
			username: 'e'
		});
	};

	expect(t).toThrow(Error);
});