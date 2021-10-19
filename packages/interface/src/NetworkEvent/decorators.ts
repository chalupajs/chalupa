import { Metadata } from '../metadata/Metadata'

export function ServiceAppeared() {
	return function (target: any, propertyKey: any, _descriptor: PropertyDescriptor) {
		// The target will never be primitive, so this argument is actually safe.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		Reflect.defineMetadata(Metadata.METADATA_SERVICE_APPEARED, propertyKey, target)
	}
}

export function ServiceDisappeared() {
	return function (target: any, propertyKey: any, _descriptor: PropertyDescriptor) {
		// The target will never be primitive, so this argument is actually safe.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		Reflect.defineMetadata(Metadata.METADATA_SERVICE_DISAPPEARED, propertyKey, target)
	}
}
