import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type Model from './Model';
import type { TAutoMapperSelector } from './types/automapper-selector';
import type { TNullable } from './types/nullable';

export default class AutoMapper {
    /**
     *
     * @private
     */
    private static models: Record<string, typeof Model> = {};

    /**
     *
     * @private
     */
    private static selector: TNullable<TAutoMapperSelector>;

    /**
     *
     * @param selector
     */
    public static setSelector(selector: TAutoMapperSelector) {
        this.selector = selector;
    }

    /**
     *
     * @param modelDefinitions
     */
    public static register(modelDefinitions: Record<string, typeof Model>) {
        this.models = modelDefinitions;
    }

    /**
     *
     * @param responseModel
     * @private
     */
    private static select(responseModel: ResponseModelInterface): TNullable<typeof Model> {
        for (const value in this.models) {
            if (this.selector && this.selector(responseModel, value)) {
                return this.models[value];
            }
        }

        return null;
    }

    /**
     *
     * @param responseModel
     */
    public static async map(responseModel: ResponseModelInterface) {
        const ModelClass = this.select(responseModel);
        if (ModelClass) {
            const instance = new ModelClass();
            const attributes = await instance.map(responseModel);
            instance.setAttributes(attributes);

            return instance;
        }

        return responseModel;
    }
}
