import type { TConfigAttributes } from './types/config-attributes';
import {TNullable} from "./types/generic/nullable";
import FalsyConfigValueError from "./errors/FalsyConfigValueError";
import ConfigValuesNotSetError from "./errors/ConfigValuesNotSetError";
import Container from "./Container";
import {Client} from "./index";

export default class Config {
    /**
     * @private
     */
    private static attributes: TNullable<TConfigAttributes> = null;

    /**
     * @param attributes
     */
    public static setAll(attributes: TConfigAttributes) {

        const keys = Object.keys(attributes);

        keys.forEach(key => {
            if (! attributes[key]) {
                throw new FalsyConfigValueError(key);
            }
        });

        this.attributes = attributes;
    }

    /**
     * @param attribute
     */
    public static get(attribute: keyof TConfigAttributes): TNullable<string> {
        if (this.attributes === null) {
            throw new ConfigValuesNotSetError();
        }
        return this.attributes[attribute] || null;
    }
}
