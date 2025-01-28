import type { TConfigAttributes } from './types/config-attributes';
import {TNullable} from "./types/nullable";

export default class Config {
    /**
     * @private
     */
    private static attributes: TNullable<TConfigAttributes> = null;

    /**
     * @param attributes
     */
    public static setAll(attributes: TConfigAttributes) {
        const hasFalsyStringValue = Object.values(attributes).some(value => ! value);

        if (hasFalsyStringValue) {
            throw new Error('Some (or one) of your config values are empty strings');
        }

        this.attributes = attributes;
    }

    /**
     * @param attribute
     */
    public static get(attribute: keyof TConfigAttributes): TNullable<string> {
        if (this.attributes === null) {
            throw new Error('Config values are not set');
        }
        return this.attributes[attribute] || null;
    }
}
