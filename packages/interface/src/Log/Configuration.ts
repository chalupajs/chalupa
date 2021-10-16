import { Configurable, Configuration } from 'konvenient'
import { Injectable } from '../Container/decorators'

/**
 * Configuration settings for the Catamaran Log API.
 */
@Configuration()
@Injectable()
export class LogConfig {
	@Configurable({
		doc: 'The minimum log level which will be displayed.',
		format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
	})
	level = 'info'

	@Configurable({
		doc: 'Whether to optimize the output for human consumption.',
		format: Boolean,
	})
	pretty = false
}
