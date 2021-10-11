import { Constructor } from '../types'
import { Errors } from '../error'
import { Injectable } from '../Container/decorators'
import { Metadata } from '../metadata/Metadata'
import { ExternalServiceCall, ExternalServiceEmit } from './ExternalServiceTemplate'

const externalServiceMethodMetadataKey = Symbol('esm')
const externalServiceEventMetadataKey = Symbol('ese')

/**
 * Options for the `ExternalService` decorator.
 */
export interface ExternalServiceOptions {
	/**
	 * The actual name of the external service. If undefined,
	 * then the name of class will be used.
	 */
	name?: string
}

/**
 * Marks a class as an external service.
 * @param options Additional settings, specifying how to wrap the class.
 */
export function ExternalService<T = any>(options: Partial<ExternalServiceOptions> = {}) {
	return function (constructor: Constructor) {
		guardAlreadyDecorated(constructor)

		// Automatically make the decorated constructor injectable.
		const injectableConstructor = Injectable()(constructor) as Constructor<T>

		options.name = options.name ?? constructor.name

		storeMetadata(options, injectableConstructor, constructor)

		retargetExternalCommunication(injectableConstructor, options.name)

		return injectableConstructor
	}
}

/**
 * Options for the `ExternalServiceMethod` decorator.
 */
export interface ExternalServiceMethodOptions {
	/**
	 * The name of the method on the target service. If not present
	 * then the name of the decorated function is used.
	 */
	name: string
}

/**
 * Marks a function as an external service method. Such functions
 * will be automatically implemented by Catamaran.
 * @param options Additional settings for the implementation.
 */
export function ExternalServiceMethod(options: Partial<ExternalServiceMethodOptions> = {}) {
	return Reflect.metadata(externalServiceMethodMetadataKey, options)
}

/**
 * Options for the `ExternalServiceEvent` decorator.
 */
export interface ExternalServiceEventOptions {
	/**
	 * The name of the event on the target service. If not present
	 * then the name of the decorated function is used.
	 */
	name: string
}

/**
 * Marks a function as an external service event. Such functions
 * will be automatically implemented by Catamaran.
 * @param options Additional settings for the implementation.
 */
export function ExternalServiceEvent(options: Partial<ExternalServiceEventOptions> = {}) {
	return Reflect.metadata(externalServiceEventMetadataKey, options)
}

function guardAlreadyDecorated(constructor: Constructor) {
	if (Reflect.hasOwnMetadata(Metadata.METADATA_EXTERNAL_SERVICE_INJECTED, constructor)) {
		throw new Errors.AlreadyDecoratedError(constructor.name, ExternalService.name)
	}
}

function storeMetadata(
	options: Partial<ExternalServiceOptions>,
	injectableConstructor: Constructor,
	constructor: Constructor
) {
	// Mark the constructor as already decorated.
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAL_SERVICE_INJECTED, true, constructor)
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS, options, injectableConstructor)
	;(injectableConstructor.prototype as Record<string, unknown>).serviceName = options.name
}

function retargetExternalCommunication(constructor: Constructor, serviceName: string) {
	// We need to create an instance to retrieve the method
	// decorators.
	const exampleInstance = new constructor({}) as Record<string, unknown>

	// Each annotated property key represents an external call/emit.
	// Therefore, we overwrite the placeholder value of the property key
	// with a function that will actually make the communication via the CommunicationChannel to the
	// appropriate service method (for calls) or event (for emits).
	// The latter is determined by the name of the external service class
	// (or its name option) and the key or the name option of the function property.
	for (const key of Object.keys(exampleInstance)) {
		const methodOptions = Reflect.getMetadata(
			externalServiceMethodMetadataKey,
			exampleInstance,
			key
		) as ExternalServiceMethodOptions | undefined
		if (methodOptions) {
			retargetExternalMethod(methodOptions, key, constructor, serviceName)
		}

		const eventOptions = Reflect.getMetadata(
			externalServiceEventMetadataKey,
			exampleInstance,
			key
		) as ExternalServiceEventOptions | undefined
		if (eventOptions) {
			retargetExternalEmit(eventOptions, key, constructor, serviceName)
		}
	}
}

function retargetExternalMethod(
	options: ExternalServiceMethodOptions,
	key: string,
	constructor: Constructor,
	serviceName: string
) {
	const methodName = options.name ?? key

	Object.defineProperty(constructor.prototype, key, {
		get() {
			return function (...parameters: any[]) {
				return new ExternalServiceCall<any>(
					// Objects annotated with @ExternalService will always
					// have communicationChannel injected into them, thus this is safe.
					// @ts-expect-error
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					this.communicationChannel,
					serviceName,
					methodName,
					parameters
				)
			}
		},
		set() {
			// Cannot set.
		},
	})
}

function retargetExternalEmit(
	options: ExternalServiceEventOptions,
	key: string,
	constructor: Constructor,
	serviceName: string
) {
	const methodName = options.name ?? key

	Object.defineProperty(constructor.prototype, key, {
		get() {
			return function (...parameters: any[]) {
				return new ExternalServiceEmit<any>(
					// Objects annotated with @ExternalService will always
					// have communicationChannel injected into them, thus this is safe.
					// @ts-expect-error
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					this.communicationChannel,
					serviceName,
					methodName,
					parameters
				)
			}
		},
		set() {
			// Cannot set.
		},
	})
}
