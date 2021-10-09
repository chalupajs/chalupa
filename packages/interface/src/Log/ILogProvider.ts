/**
 * Interface for external Logging APIs, abstracting away the creation
 * of an API-specific root logger.
 */
import { ILogger } from "./ILogger";

export interface ILogProvider {
	/**
	 * Creates a root logger with the specified name, able to create API-specific
	 * child loggers.
	 * @param name The name of the root logger (in Catamaran, the name of the service).
	 */
	createRootLogger(name: string): ILogger
}
