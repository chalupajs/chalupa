import { Constructor, IBuilderStrategy, ILogProvider, IPlugin } from '@chalupajs/interface'
import { ExternalServicePlugin } from '../Plugins/Internal/ExternalServicePlugin'
import { ErrorHandlingPlugin } from '../Plugins/Internal/ErrorHandlingPlugin'
import { ConsoleLoggerProvider } from '../Log/Console/ConsoleLoggerProvider'
import { buildIntermediateService } from './IntermediateService/IntermediateServiceBuilder'

type IChalupa = {
	_plugins: IPlugin[]
	_logProvider: Constructor<ILogProvider>
	globalUse(plugin: IPlugin | IPlugin[]): void
	globalLogProvider(_logProvider: Constructor<ILogProvider>): void
	builder(): IChalupaBuilder
}

/**
 * The entrypoint of the framework. Use this object to construct
 * some representation of your service.
 */
export const Chalupa: IChalupa = {
	_plugins: [],
	_logProvider: ConsoleLoggerProvider,
	globalUse(plugin: IPlugin | IPlugin[]): void {
		if (Array.isArray(plugin)) {
			this._plugins.push(...plugin)
		} else {
			this._plugins.push(plugin)
		}
	},
	globalLogProvider(_logProvider: Constructor<ILogProvider>): void {
		this._logProvider = _logProvider
	},
	builder(): IChalupaBuilder {
		return new ChalupaBuilder(this._logProvider).use(this._plugins)
	},
}

export interface IChalupaBuilder {
	use(plugin: IPlugin | IPlugin[]): IChalupaBuilder

	logProvider(_logProvider: Constructor<ILogProvider>): IChalupaBuilder

	/**
	 * Loads, wires up and creates some representation of specified
	 * service entrypoint (which is a classed, decorated with the `Service` decorator).
	 * The produced representation depends on the used builder strategy, giving flexibility
	 * to this function to create, for example, testing-focused output and alike.
	 * @param serviceEntrypoint A `Service` decorated class.
	 * @param builder A strategy that determines what is created from the passed structure.
	 */
	createServiceWithStrategy<T>(serviceEntrypoint: Constructor, builder: Constructor<IBuilderStrategy<T>>): Promise<T>
}

export class ChalupaBuilder implements IChalupaBuilder {
	private readonly plugins: IPlugin[]
	private _logProvider: Constructor<ILogProvider>

	constructor(_logProvider: Constructor<ILogProvider>) {
		this.plugins = [new ExternalServicePlugin(), new ErrorHandlingPlugin()]
		this._logProvider = _logProvider
	}

	logProvider(_logProvider: Constructor<ILogProvider>): IChalupaBuilder {
		this._logProvider = _logProvider
		return this
	}

	use(plugin: IPlugin | IPlugin[]): IChalupaBuilder {
		if (Array.isArray(plugin)) {
			this.plugins.push(...plugin)
		} else {
			this.plugins.push(plugin)
		}

		return this
	}

	async createServiceWithStrategy<T>(
		serviceEntrypoint: Constructor,
		builder: Constructor<IBuilderStrategy<T>>
	): Promise<T> {
		const intermediateService = await buildIntermediateService(serviceEntrypoint, this.plugins, this._logProvider)
		const builderInstance = new builder()
		return builderInstance.build(intermediateService)
	}
}
