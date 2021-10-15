import {Constructor, Metadata} from "@catamaranjs/interface";

export function ErrorHandler(errors: Constructor<Error> | Constructor<Error>[]) {
	return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const arrayErrors = Array.isArray(errors) ? errors : [errors]

		registerInMapOnTarget(target, Metadata.METADATA_ERROR_HANDLER_MAP, propertyKey, arrayErrors)
	}
}

export function registerInMapOnTarget(
	target: any,
	mapIdentifier: string,
	propertyKey: string,
	errors: Constructor<Error>[],
) {
	if (!Reflect.getMetadata(mapIdentifier, target)) {
		Reflect.defineMetadata(mapIdentifier, new Map<string, Constructor<Error>[]>(), target)
	}

	const translatorMap = Reflect.getMetadata(mapIdentifier, target) as Map<string, Constructor<Error>[]>
	translatorMap.set(propertyKey, errors)
}

