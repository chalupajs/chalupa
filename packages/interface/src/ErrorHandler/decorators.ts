import { Constructor } from '../types'
import { Metadata } from '../metadata/Metadata'

export function ErrorHandler(errors: Constructor<Error> | Constructor<Error>[]) {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const errorsAsArray = Array.isArray(errors) ? errors : [errors]

		registerErrorHandlerOnTarget(target, propertyKey, errorsAsArray)
	}
}

export function registerErrorHandlerOnTarget(target: any, handlerName: string, errors: Constructor<Error>[]) {
	if (!Reflect.getMetadata(Metadata.METADATA_ERROR_HANDLER_MAP, target)) {
		Reflect.defineMetadata(Metadata.METADATA_ERROR_HANDLER_MAP, new Map<string, Constructor<Error>[]>(), target)
	}

	const handlerMap = Reflect.getMetadata(Metadata.METADATA_ERROR_HANDLER_MAP, target) as Map<
		string,
		Constructor<Error>[]
	>
	handlerMap.set(handlerName, errors)
}
