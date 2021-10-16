/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */

import { ILogger } from './ILogger'
import { LogFunction } from './LogFunction'

/**
 * Adapter class, making it easy to fit the interface of some logging API
 * to the Catamaran-specific `ILogger` interface. Makes use of the fact that most
 * logger APIs look very similar anyway, providing a separate function for each log level.
 */
export abstract class AbstractLoggerAdapter implements ILogger {
	readonly level: string

	readonly trace: LogFunction
	readonly debug: LogFunction
	readonly info: LogFunction
	readonly warn: LogFunction
	readonly error: LogFunction
	readonly fatal: LogFunction

	protected constructor(loggerInstance: ILoggerCompatibleInstance, level: string) {
		this.level = level
		this.trace = loggerInstance.trace.bind(loggerInstance)
		this.debug = loggerInstance.debug.bind(loggerInstance)
		this.info = loggerInstance.info.bind(loggerInstance)
		this.warn = loggerInstance.warn.bind(loggerInstance)
		this.error = loggerInstance.error.bind(loggerInstance)
		this.fatal = loggerInstance.fatal.bind(loggerInstance)
	}

	createChildLogger(_name: string): ILogger {
		throw new Error('Not implemented!')
	}
}

export interface ILoggerCompatibleInstance {
	trace: any
	debug: any
	info: any
	warn: any
	error: any
	fatal: any
}
