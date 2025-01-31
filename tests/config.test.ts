import {Config} from '../src/index';
import {TConfigAttributes} from "../src/types/config-attributes";
import FalsyConfigValueError from "../src/errors/FalsyConfigValueError";
import ConfigValuesNotSetError from "../src/errors/ConfigValuesNotSetError";

test('Empty string Config values throws a FalsyConfigValueError', () => {

	const t = () => {
		Config.get('baseUrl');
	};

	expect(t).toThrow(ConfigValuesNotSetError);
});

it('can setAll Config values and ', () => {

	Config.setAll({
		baseUrl: 'a',
		clientId: 'b',
		clientSecret: 'c',
	});

	expect(Config.get('baseUrl')).toBe('a');
	expect(Config.get('clientId')).toBe('b');
	expect(Config.get('clientSecret')).toBe('c');
});

it('returns null when getting a non-existent value', () => {
	expect(Config.get('nonExistentConfigValue' as keyof TConfigAttributes)).toBe(null);
});

test('Empty string Config values throws a FalsyConfigValueError', () => {

	const t = () => {
		Config.setAll({
			baseUrl: 'a',
			clientId: 'b',
			clientSecret: '',
		});
	};

	expect(t).toThrow(FalsyConfigValueError);
});