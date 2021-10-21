import { Constructor } from '../types'
import { Errors } from '../error'
import { Injectable } from '../Container/decorators'
import { Metadata } from '../metadata/Metadata'
import { IInjectContainer } from '../Container/IInjectContainer'

/**
 * Options for the `Module` decorator.
 */
export interface ModuleOptions {
	/**
	 * Optional injection specifications. If you want to perform class-based injection only,
	 * then this can be an array of classes. Otherwise, use the function form, which gives
	 * access to both the container being built and an instance of the configuration (if specified).
	 */
	inject?: Constructor[] | ((context: IInjectContainer, config?: any) => void)

	constants?: Array<[string, any]>

	modules?: Constructor[]
}

/**
 * Marks a class as a module entrypoint. Modules can be used to bundle together reusable
 * functionality or split up services into smaller pieces.
 * @param options Additional options to setup the module.
 */
export function Module<T = any>(options: ModuleOptions = {}) {
	return function (constructor: Constructor) {
		guardAlreadyDecorated(constructor)

		// Automatically make the decorated constructor injectable.
		const injectableConstructor = Injectable()(constructor) as Constructor<T>

		Reflect.defineMetadata(Metadata.METADATA_MODULE_OPTIONS, options, injectableConstructor)
		Reflect.defineMetadata(Metadata.METADATA_MODULE_INJECTED, true, constructor)

		return injectableConstructor
	}
}

/**
 * Marks a method as a **pre**-service init function, which will be executed **before** the
 * post-init function of the containing service.
 */
export function PreServiceInit() {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		// The target will never be primitive, so this argument is actually safe.
		Reflect.defineMetadata(Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_INIT, propertyKey, target)
	}
}

/**
 * Marks a method as a **post**-service init function, which will be executed **after** the
 * post-init function of the containing service.
 */
export function PostServiceInit() {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		Reflect.defineMetadata(Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_INIT, propertyKey, target)
	}
}

/**
 * Marks a method as a **pre**-service destroy function, which will be executed **before** the
 * pre-destroy function of the containing service.
 */
export function PreServiceDestroy() {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		Reflect.defineMetadata(Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_DESTROY, propertyKey, target)
	}
}

/**
 * Marks a method as a **post**-service destroy function, which will be executed **after** the
 * pre-destroy function of the containing service.
 */
export function PostServiceDestroy() {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		Reflect.defineMetadata(Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_DESTROY, propertyKey, target)
	}
}

function guardAlreadyDecorated(constructor: Constructor) {
	if (Reflect.hasOwnMetadata(Metadata.METADATA_MODULE_INJECTED, constructor)) {
		throw new Errors.AlreadyDecoratedError(constructor.name, Module.name)
	}
}
