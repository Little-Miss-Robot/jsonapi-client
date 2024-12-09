import type { TConfigAttributes } from './types/config-attributes';

export default class Config {
    /**
     * @private
     */
    private static attributes: TConfigAttributes = {};

    /**
     * @param attribute
     * @param value
     */
    public static set(attribute: keyof typeof Config['attributes'], value: any) {
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
    public static get(attribute: keyof typeof Config['attributes']) {
        return this.attributes[attribute];
    }
}
