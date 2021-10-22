import yaml from 'js-yaml'
import { convict, Configuration as KonvinientConfiguration, ConfigurationOptions } from 'konvenient'
import { Injectable } from '../Container/decorators'

convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.load })

export const Configuration = function (
	config?: Partial<ConfigurationOptions>
): <T>(constructor: new () => T) => new () => T {
	return function (target: any) {
		return KonvinientConfiguration(config)(Injectable()(target))
	}
}

export {
	ConfigurationOptions,
	Configurable,
	ConfigurableSchema,
	SchemaResult,
	Nested,
	PredefinedFormat,
	configurator,
	KONVENIENT_CONFIGURATION_CLASS as CONFIGURATION_CLASS,
} from 'konvenient'
