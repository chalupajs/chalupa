import { LogConfig } from './Configuration'
import { ContainerConstant } from "../constants";
import { Inject, Injectable } from "../Container/decorators";
import { Constructor } from "../types";
import { ILogger } from "./ILogger";
import { ILogProvider } from "./ILogProvider";

/**
 * Factory class producing Loggers in a provider-agnostic way (which means, you can
 * plug and adapt any log implementation behind this factory abstraction).
 */
@Injectable()
export class LoggerFactory {
	private readonly loggers: Map<string, ILogger>
	private readonly _rootClass: string
	private readonly _config: LogConfig

	constructor(
		@Inject(ContainerConstant.ROOT_CLASS) rootClass: string,
		@Inject(ContainerConstant.LOG_PROVIDER_INTERFACE) logProvider: ILogProvider,
		@Inject(LogConfig) config: LogConfig
	) {
		this._rootClass = rootClass
		this._config = config
		const rootLogger = logProvider.createRootLogger(rootClass)
		this.loggers = new Map<string, ILogger>()
		this.loggers.set(rootClass, rootLogger)
	}

	/**
	 * Retrieve a scoped logger for the given key.
	 *
	 * Note that subsequent calls with the same key will return the same logger
	 * instance.
	 * @param key The scope of the returned logger, usually a class.
	 * @returns The Logger corresponding to the specified key.
	 */
	getLogger<T = any>(key: Constructor<T> | string): ILogger {
		const name = typeof key === 'string' ? key : key.name
		const logger = this.loggers.get(name)
		if (logger) {
			return logger
		}

		// The root logger is created in the constructor, thus
		// this null-assertion is always safe.
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const childLogger = this.loggers.get(this._rootClass)!.createChildLogger(name)
		this.loggers.set(name, childLogger)
		return childLogger
	}

	get rootClass(): string {
		return this._rootClass
	}

	get config(): LogConfig {
		return this._config
	}
}






