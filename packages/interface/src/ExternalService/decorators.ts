import { Constructor } from '../types'
import { Errors } from '../error'
import { Injectable } from '../Container/decorators'
import { Metadata } from '../metadata/Metadata'
import { ExternalServiceCall, ExternalServiceEmit, ExternalServiceTemplate } from './ExternalServiceTemplate'
import { injectFromBase } from 'inversify'

export const externalServiceMethodMetadataKey = 'Catamaran_Metadata_ExternalServiceMethod'
export const externalServiceEventMetadataKey = 'Catamaran_Metadata_ExternalServiceEvent'

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
	return function (constructor: Constructor<T>) {
		guardAlreadyDecorated(constructor)

		options.name = options.name ?? constructor.name

		storeMetadata(options, constructor)

		retargetExternalCommunication(constructor, options.name)
		console.log('prototype rewritten')
		console.log(constructor.prototype)

		// Automatically make the decorated constructor injectable.
		Injectable()(constructor)
		injectFromBase({
		  extendConstructorArguments: true,
				extendProperties: true
		})(constructor)

		return constructor
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
	return function (target: any, propertyKey: string) {
		Object.defineProperty(target, propertyKey, {
	      get() {
	        const self = this as ExternalServiceTemplate;
	        const methodName = options.name ?? propertyKey;
	        return (...parameters: any[]) =>
	          new ExternalServiceCall(
	          	// @ts-ignore
	          	self.communicationChannel,
	          	// @ts-ignore
	          	self.serviceName,
	            methodName,
	            parameters,
	          );
	      },
	      set() {
	        // Cannot set.
	      },
	      configurable: true,
	    });
		Reflect.defineMetadata(externalServiceMethodMetadataKey, options, target, propertyKey)
	}

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
	return function (target: any, propertyKey: string) {
		Object.defineProperty(target, propertyKey, {
			get() {
				const self = this as ExternalServiceTemplate;
    			const methodName = options.name ?? propertyKey;
				return function (...parameters: any[]) {
					return new ExternalServiceEmit<any>(
						// Objects annotated with @ExternalService will always
						// have communicationChannel injected into them, thus this is safe.
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						// @ts-ignore
						self.communicationChannel,
						// @ts-ignore
						self.serviceName,
						methodName,
						parameters
					)
				}
			},
			set() {
				// Cannot set.
			},
		})
		Reflect.defineMetadata(externalServiceEventMetadataKey, options, target, propertyKey)
	}
}

function guardAlreadyDecorated(constructor: Constructor) {
	if (Reflect.hasOwnMetadata(Metadata.METADATA_EXTERNAL_SERVICE_INJECTED, constructor)) {
		throw new Errors.AlreadyDecoratedError(constructor.name, ExternalService.name)
	}
}

function storeMetadata(
	options: Partial<ExternalServiceOptions>,
	constructor: Constructor
) {
	// Mark the constructor as already decorated.
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAL_SERVICE_INJECTED, true, constructor)
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS, options, constructor)
	;(constructor.prototype as Record<string, unknown>).serviceName = options.name
}

function retargetExternalCommunication(constructor: Constructor, _serviceName: string) {
	// We need to create an instance to retrieve the method
	// decorators.
	const exampleInstance = new constructor({}) as Record<string, unknown>

	// Each annotated property key represents an external call/emit.
	// Therefore, we overwrite the placeholder value of the property key
	// with a function that will actually make the communication via the CommunicationChannel to the
	// appropriate service method (for calls) or event (for emits).
	// The latter is determined by the name of the external service class
	// (or its name option) and the key or the name option of the function property.

	const methods: { key: string, options: ExternalServiceMethodOptions }[] = []
	const events: { key: string, options: ExternalServiceEventOptions }[] = []
	for (const key of Object.keys(exampleInstance)) {
		const methodOptions = Reflect.getMetadata(externalServiceMethodMetadataKey, exampleInstance, key) as
			| ExternalServiceMethodOptions
			| undefined
		if (methodOptions) {
			methods.push({ key, options: methodOptions })
			// retargetExternalMethod(methodOptions, key, constructor, serviceName)
		}

		const eventOptions = Reflect.getMetadata(externalServiceEventMetadataKey, exampleInstance, key) as
			| ExternalServiceEventOptions
			| undefined
		if (eventOptions) {
			events.push({ key, options: eventOptions })
			// retargetExternalEmit(eventOptions, key, constructor, serviceName)
		}
	}
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAP_SERVICE_METHODS, methods, constructor)
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAP_SERVICE_EVENTS, events, constructor)
}

export function retargetExternalMethod(
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

export function retargetExternalEmit(
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
