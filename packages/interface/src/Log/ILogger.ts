/**
 * Logger abstraction, wrapping the differences between various logging APIs.
 * This is the central interface of the Catamaran Log API, providing the ability
 * to actually output log statements and create child loggers.
 */
import { LogFunction } from './LogFunction'

export interface ILogger {
	/**
	 * The level at which this logger operates. Statements under
	 * this level will not be displayed.
	 */
	readonly level: string

	readonly trace: LogFunction
	readonly debug: LogFunction
	readonly info: LogFunction
	readonly warn: LogFunction
	readonly error: LogFunction
	readonly fatal: LogFunction

	/**
	 * Creates a new logger, inheriting all settings of the this logger.
	 * @param name The scope name of the new Logger. Usually the name of some class.
	 * @returns A new Logger instance.
	 */
	createChildLogger(name: string): ILogger
}
