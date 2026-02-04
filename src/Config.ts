import ConfigValuesNotSetError from "./errors/ConfigValuesNotSetError";
import FalsyConfigValueError from "./errors/FalsyConfigValueError";
import UnknownConfigValueError from "./errors/UnknownConfigValueError";
import type { TConfigAttributes } from "./types/config-attributes";
import { TNullable } from "./types/generic/nullable";

export default class Config {
	/**
	 * @private
	 */
	private attributes: TNullable<TConfigAttributes> = null;

	/**
	 *
	 */
	constructor(attributes: TConfigAttributes) {
		this.setAll(attributes);
	}

	/**
	 * @param attributes
	 */
	public setAll(attributes: TConfigAttributes) {
		const keys = Object.keys(attributes) as (keyof TConfigAttributes)[];

		keys.forEach((key) => {
			if (!attributes[key]) {
				throw new FalsyConfigValueError(key);
			}
		});

		this.attributes = attributes;
	}

	/**
	 * @param attribute
	 */
	public get(attribute: keyof TConfigAttributes): string {
		if (this.attributes === null) {
			throw new ConfigValuesNotSetError();
		}
		if (!this.attributes[attribute]) {
			throw new UnknownConfigValueError(attribute);
		}
		return this.attributes[attribute];
	}
}
