import type { ContainerFactoryMap } from './types/container-factory-map';

export class Container<B extends ContainerFactoryMap> {
    /**
     *
     * @private
     */
    private bindings: Partial<B> = {};

    /**
     *
     * @private
     */
    private singletonBindings: Partial<B> = {};

    /**
     *
     * @private
     */
    private instances: Partial<{ [K in keyof B]: ReturnType<B[K]> }> = {};

    /**
     * Binds a dependency to the container
     * NOTE: Re-registering a binding invalidates any cached singleton for that name
     * @param name
     * @param factory
     */
    bind<K extends keyof B>(name: K, factory: B[K]): void {
        this.bindings[name] = factory;

        // If a (singleton) instance was already being kept for this name, delete it
        // We're effectively rebinding it be non-singleton now
        delete this.instances[name];
    }

    /**
     * Binds a singleton dependency to the container
     * NOTE: Re-registering a binding invalidates any cached singleton for that name
     * @param name
     * @param factory
     */
    singleton<K extends keyof B>(name: K, factory: B[K]): void {
        this.singletonBindings[name] = factory;

        // If an instance was already being kept for this name, delete it
        delete this.instances[name];
    }

    /**
     * Makes a dependency
     * @param name
     * @param args
     */
    make<K extends keyof B>(name: K, ...args: Parameters<B[K]>): ReturnType<B[K]> {
        const singletonFactory = this.singletonBindings[name];
        if (singletonFactory) {
            if (!this.instances[name]) {
                this.instances[name] = singletonFactory(...args) as ReturnType<B[K]>;
            }
            return this.instances[name] as ReturnType<B[K]>;
        }

        const factory = this.bindings[name];
        if (!factory) {
            throw new Error(`No dependency was found for name "${String(name)}"`);
        }
        return (factory as B[K])(...args);
    }

    /**
     *
     * @param name
     * @param args
     */
    makeAs<R, K extends keyof B = keyof B>(name: K, ...args: Parameters<B[K]>): R {
        return this.make(name, ...args) as unknown as R;
    }
}
