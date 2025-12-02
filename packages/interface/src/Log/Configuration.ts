import { Configurable, Configuration } from 'konvenient'
import { Injectable } from '../Container/decorators'

export enum LogLevel {
	TRACE = 'trace',
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	FATAL = 'fatal'
}

/**
 * Configuration settings for the Catamaran Log API.
 */
@Configuration()
@Injectable()
export class LogConfig {
	@Configurable({
		doc: 'The minimum log level which will be displayed.',
		format: [LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL],
	})
	level: LogLevel = LogLevel.INFO

	@Configurable({
		doc: 'Whether to optimize the output for human consumption.',
		format: Boolean,
	})
	pretty = false
}
