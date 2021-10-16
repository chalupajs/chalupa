/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Metadata } from '../metadata/Metadata'

/**
 * Options for the `ServiceMethod` decorator.
 */
export interface ServiceMethodOptions {
	/**
	 * The actual name of the callable method on the service.
	 * If omitted, the name of the decorated function will be used.
	 */
	name?: string
}

/**
 * Marks a method as an externally callable service method.
 * @param options Additional options to customize the method.
 */
export function ServiceMethod(options: ServiceMethodOptions = {}) {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		options.name = options.name ?? propertyKey

		registerInMapOnTarget(target, Metadata.METADATA_SERVICE_MAP, options.name, propertyKey)
	}
}

/**
 * Options for the `ServiceEvent` decorator.
 */
export interface ServiceEventOptions {
	/**
	 * The actual name of the event on the service. If omitted,
	 * the name of the decorated function will be used.
	 */
	name?: string
}

/**
 * Marks a method as an externally available service event, others can emit to.
 * @param options Additional settings to customize the event.
 */
export function ServiceEvent(options: ServiceEventOptions = {}) {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		options.name = options.name ?? propertyKey

		registerInMapOnTarget(target, Metadata.METADATA_EVENT_MAP, options.name, propertyKey)
	}
}

function registerInMapOnTarget(target: any, mapIdentifier: string, externalName: string, internalName: string) {
	if (!Reflect.getMetadata(mapIdentifier, target)) {
		Reflect.defineMetadata(mapIdentifier, new Map<string, string>(), target)
	}

	const translatorMap = Reflect.getMetadata(mapIdentifier, target) as Map<string, string>
	translatorMap.set(externalName, internalName)
}
