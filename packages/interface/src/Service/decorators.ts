import { Constructor } from '../types'
import { Errors } from '../error'
import { Injectable } from '../Container/decorators'
import { Metadata } from '../metadata/Metadata'
import { IInjectContainer } from '../Container/IInjectContainer'

/**
 * Options for the `Service` decorator.
 */
export interface ServiceOptions {
	/**
	 * The external name of the service. By default the name of the decorated class is used.
	 */
	name: string

	/**
	 * Injection specifications. If you want to perform class-based injection only,
	 * then this can be an array of classes. Otherwise, use the function form, which gives
	 * access to both the container being built and an instance of the configuration.
	 */
	inject: Constructor[] | ((context: IInjectContainer, config?: any) => void)

	constants?: Array<[string, any]>

	modules?: Constructor[]

	/**
	 * An array of external service names. This service will wait for these services
	 * to show up before starting.
	 */
	dependsOn: string[]

	/**
	 * Starting delay in milliseconds.
	 */
	delayStart: number

	/**
	 * The directory where the service class is located.
	 */
	serviceDirectory: string
}

/**
 * Marks a class as a service entrypoint.
 * @param options Additional service settings.
 */
export function Service<T = any>(options: Partial<ServiceOptions> = {}) {
	return function (constructor: Constructor<T>) {
		guardAlreadyDecorated(constructor)

		// Automatically make the decorated constructor injectable.
		const injectableConstructor = Injectable()(constructor) as Constructor<T>
		options.name = options.name ?? constructor.name
		options.serviceDirectory = options.serviceDirectory ?? process.cwd()

		Reflect.defineMetadata(Metadata.SERVICE_OPTIONS, options, injectableConstructor)
		Reflect.defineMetadata(Metadata.SERVICE_INJECTED, true, constructor)

		return injectableConstructor
	}
}

/**
 * Marks a method as a post-init lifecycle method, executed right before the service is published.
 * Otherwise, it's executed between the referenced modules' pre-service-init and
 * post-service-init methods.
 */
export function PostInit() {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		// The target will never be primitive, so this argument is actually safe.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		Reflect.defineMetadata(Metadata.ServiceLifecycle.PostInit, propertyKey, target)
	}
}

/**
 * Marks a method as a pre-destroy lifecycle method, executed right before the service is terminated.
 * Otherwise, it's executed between the referenced modules' pre-service-destroy and
 * post-service-destroy methods.
 */
export function PreDestroy() {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		// The target will never be primitive, so this argument is actually safe.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		Reflect.defineMetadata(Metadata.ServiceLifecycle.PreDestroy, propertyKey, target)
	}
}

function guardAlreadyDecorated<T>(constructor: Constructor<T>) {
	if (Reflect.hasOwnMetadata(Metadata.SERVICE_INJECTED, constructor)) {
		throw new Errors.AlreadyDecoratedError(constructor.name, Service.name)
	}
}
