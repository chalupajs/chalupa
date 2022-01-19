import { Constructor } from '@chalupajs/interface'

/**
 * Produced by the `IntegrationTestBuilderStrategy`, allows for
 * altering the service container and the environment prior to
 * executing the service itself.
 */
export interface IntegrationTestArrangement {
	/**
	 * Starts the underlying system, which consists of the following steps:
	 *   1. actually instantiating the service and everything related in the container
	 *   1. executing the init lifecycle methods.
	 * @returns The complete system under test to perform acts and assertations against.
	 */
	start(): Promise<SystemUnderTest>

	isBound(accessor: string | Constructor): boolean

	bindClass<T>(constructor: Constructor<T>): this
	rebindClass<T>(constructor: Constructor<T>): this

	bindConstant<T>(accessor: string | Constructor<T>, constant: Partial<T>): this
	rebindConstant<T>(accessor: string | Constructor<T>, constant: Partial<T>): this

	bindInterface<T>(accessor: string, constructor: Constructor<T>): this
	rebindInterface<T>(accessor: string, constructor: Constructor<T>): this

	unbind(accessor: string | Constructor): this
}

/**
 * The service being tested with all of its modules and alike
 * instantiated and ready.
 */
export interface SystemUnderTest {
	/**
	 * Retrieve any component (injected value) from the system
	 * by its key or constructor.
	 * @param key The class constructor to retrieve by.
	 * @returns The instance of the class.
	 */
	getComponent<T>(key: Constructor<T> | string): T

	/**
	 * Retrieve any Service or Module-decorated instance from
	 * the system by its constructor.
	 * @param key The class constructor to retrieve by.
	 * @returns The instance of the class.
	 */
	getServiceOrModule<T>(key: Constructor<T>): T

	/**
	 * Close the service, calling the appropriate lifecycle methods
	 * and resetting the reconfigured environment variables.
	 */
	close(): Promise<void>
}
