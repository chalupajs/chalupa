import { Constructor } from '@catamaranjs/interface'

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

	/**
	 * Rebinds the specified injection key to a new bound value. Perfect
	 * to inject test doubles into the container.
	 * @param key A string or constructor function to bind to.
	 * @param boundValue An actual instance to be bound.
	 * @returns This instance for easy chaining of calls.
	 */
	rebind(key: string | Constructor, boundValue: any): this
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
	 * Fire a service appeared network event.
	 * @param name The name of the appeared service.
	 */
	serviceAppeared(name: string): Promise<void>

	/**
	 * Fire a service disappeared network event.
	 * @param name The name of the disappeared service.
	 */
	serviceDisappeared(name: string): Promise<void>

	/**
	 * Close the service, calling the appropriate lifecycle methods
	 * and resetting the reconfigured environment variables.
	 */
	close(): Promise<void>
}
