import * as konvenient from 'konvenient'
import { Constructor } from './types'
import {Injectable, InversifyMetadata, Metadata} from './index'

export const isConfiguration = function (constructor: Constructor): boolean {
	return Reflect.hasMetadata(konvenient.KONVENIENT_CONFIGURATION_CLASS, constructor)
}

export const isExternalService = function (constructor: Constructor): boolean {
	return Reflect.hasMetadata(Metadata.METADATA_EXTERNAL_SERVICE, constructor)
}

export const reconfigureToEnvPrefix = function (envPrefix: string | undefined, configClass: any) {
	if (typeof envPrefix !== 'undefined') {
		konvenient.reconfigure(options => {
			options.envPrefix = options.envPrefix ? `${envPrefix}_${options.envPrefix}` : envPrefix
		}, configClass)
	}

	return configClass
}

export const ensureInjectable = function <T>(constructor: Constructor<T>) {
	const isConstructorDecorated = Reflect.hasOwnMetadata(InversifyMetadata.PARAM_TYPES, constructor)
	return (isConstructorDecorated ? constructor : Injectable()(constructor)) as Constructor<T>
}
