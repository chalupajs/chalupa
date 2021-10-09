import yaml from 'js-yaml'
import { convict } from 'konvenient'

convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.load })

export {
	Configuration,
	ConfigurationOptions,
	Configurable,
	ConfigurableSchema,
	SchemaResult,
	Nested,
	PredefinedFormat,
} from 'konvenient'
