import * as konvenient from 'konvenient'

import { Constructor } from './types'
import { Injectable } from './Container/decorators'
import { Metadata } from './metadata/Metadata'

const LEGACY_PARAM_TYPES_METADATA_KEY = 'inversify:paramtypes'
const CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY = '@inversifyjs/core/classIsInjectableFlagReflectKey'

export const isConfiguration = function (constructor: Constructor): boolean {
	return Reflect.hasMetadata(konvenient.KONVENIENT_CONFIGURATION_CLASS, constructor)
}

export const isExternalService = function (constructor: Constructor): boolean {
	return Reflect.hasMetadata(Metadata.METADATA_EXTERNAL_SERVICE, constructor)
}

// eslint-disable-next-line prettier/prettier
export const reconfigureToEnvPrefix = function <T> (envPrefix: string | undefined, configClass: any): Constructor<T> {
	if (typeof envPrefix !== 'undefined') {
		konvenient.reconfigure(options => {
			options.envPrefix = options.envPrefix ? `${envPrefix}_${options.envPrefix}` : envPrefix
		}, configClass)
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return configClass
}

// eslint-disable-next-line prettier/prettier
export const ensureInjectable = function <T> (constructor: Constructor<T>) {
	const isConstructorDecorated =
		Reflect.hasOwnMetadata(CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY, constructor) ||
		Reflect.hasOwnMetadata(LEGACY_PARAM_TYPES_METADATA_KEY, constructor)
	if (!isConstructorDecorated) {
		Injectable()(constructor)
	}
	return constructor
}
