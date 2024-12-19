import type { TConfigAttributes } from './types/config-attributes';

export default class Config {
    /**
     * @private
     */
    private static attributes: TConfigAttributes = {
        baseUrl: null,
        clientId: null,
        clientSecret: null,
        username: null,
        password: null,
    };

    /**
     * @param attribute
     * @param value
     */
    public static set(attribute: keyof TConfigAttributes, value: string | null) {
        this.attributes[attribute] = value;
    }

    /**
     * @param attributes
     */
    public static setAll(attributes: TConfigAttributes) {
        this.attributes = attributes;
    }

    /**
     * @param attribute
     */
    public static get(attribute: keyof TConfigAttributes) {
        return this.attributes[attribute] || '';
    }
}
