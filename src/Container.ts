import type { TContainerBindingFunction } from './types/container-binding-function';

export default class Container {
    /**
     * @private
     */
    private static bindings: Record<string, TContainerBindingFunction> = {};

    /**
     * @private
     */
    private static singletonBindings: Record<string, TContainerBindingFunction> = {};

    /**
     *
     * @private
     */
    private static instances: Record<string, any> = {};

    /**
     *
     * @param name
     * @param bindingCall
     */
    public static bind(name: string, bindingCall: TContainerBindingFunction): void {
        this.bindings[name] = bindingCall;
    }

    /**
     *
     * @param name
     * @param bindingCall
     */
    public static singleton(name: string, bindingCall: TContainerBindingFunction): void {
        this.singletonBindings[name] = bindingCall;
    }

    /**
     *
     * @param name
     * @private
     */
    private static getBinding(name: string): TContainerBindingFunction {
        if (!this.bindings[name]) {
            throw new Error(`No dependency was found for name "${name}"`);
        }

        return this.bindings[name];
    }

    /**
     * Makes and retrieves a new instance
     * @param name
     * @param args
     */
    public static make(name: string, ...args: any[]): any {
        // First check if it's a singleton instance we have to make
        if (this.singletonBindings[name]) {
            // Does it already exist?
            if (!this.instances[name]) {
                // If not, make it and store it in instances
                this.instances[name] = this.singletonBindings[name](...args);
            }

            return this.instances[name];
        }

        return this.getBinding(name)(...args);
    }
}
