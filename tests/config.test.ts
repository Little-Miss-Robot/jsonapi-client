import type { TConfigAttributes } from '../src/types/config-attributes';
import ConfigValuesNotSetError from '../src/errors/ConfigValuesNotSetError';
import FalsyConfigValueError from '../src/errors/FalsyConfigValueError';
import UnknownConfigValueError from '../src/errors/UnknownConfigValueError';
import { Config } from '../src/index';

it('access of config value without config values being set throws ConfigValuesNotSetError', () => {
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

it('access of non-existent config value throws a UnknownConfigValueError', () => {
    const t = () => {
        Config.get('nonExistentConfigValue' as keyof TConfigAttributes);
    };

    expect(t).toThrow(UnknownConfigValueError);
});

it('empty string Config values throws a FalsyConfigValueError', () => {
    const t = () => {
        Config.setAll({
            baseUrl: 'a',
            clientId: 'b',
            clientSecret: '',
        });
    };

    expect(t).toThrow(FalsyConfigValueError);
});
