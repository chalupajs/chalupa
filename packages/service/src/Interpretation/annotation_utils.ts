import { Constructor, Metadata, ServiceOptions } from '@chalupajs/interface'

export const extractServiceOptions = function (constructor: Constructor): ServiceOptions {
	return Reflect.getMetadata(Metadata.SERVICE_OPTIONS, constructor) as ServiceOptions
}

export const extractServiceMethodMap = function (prototype: any): Map<string, string> | undefined {
	return Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, prototype) as Map<string, string> | undefined
}

export const extractServiceEventMap = function (prototype: any): Map<string, string> | undefined {
	return Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, prototype) as Map<string, string> | undefined
}
