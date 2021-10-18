import { Constructor, Metadata, ServiceOptions } from '@catamaranjs/interface'

export const extractServiceOptions = function (constructor: Constructor): ServiceOptions {
	return Reflect.getMetadata(Metadata.SERVICE_OPTIONS, constructor) as ServiceOptions
}
