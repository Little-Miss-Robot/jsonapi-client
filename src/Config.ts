import type { ConfigValue } from './types/config-attributes';
import type { TNullable } from './types/generic/nullable';
import ConfigValuesNotSetError from './errors/ConfigValuesNotSetError';
import FalsyConfigValueError from './errors/FalsyConfigValueError';
import UnknownConfigValueError from './errors/UnknownConfigValueError';

export default class Config<T extends Record<string, ConfigValue>> {
    private attributes: TNullable<T> = null;

    constructor(attributes: T) {
        this.setAll(attributes);
    }

    public setAll(attributes: T) {
        const keys = Object.keys(attributes) as Array<keyof T & string>;

        keys.forEach((key) => {
            if (attributes[key] === undefined) {
                throw new FalsyConfigValueError(key); // key is string now
            }
        });

        this.attributes = attributes;
    }

    public get<K extends keyof T & string>(attribute: K): T[K] {
        if (this.attributes === null) {
            throw new ConfigValuesNotSetError();
        }

        if (this.attributes[attribute] === undefined) {
            throw new UnknownConfigValueError(attribute);
        }

        return this.attributes[attribute];
    }
}
