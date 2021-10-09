import { Configurable, Configuration } from 'konvenient'

/**
 * Configuration settings for the Catamaran Log API.
 */
@Configuration()
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
