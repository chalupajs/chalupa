import { Constructor, IBuilderStrategy, IPlugin } from '@chalupajs/interface'
import { ExternalServicePlugin } from '../Plugins/Internal/ExternalServicePlugin'
import { ErrorHandlingPlugin } from '../Plugins/Internal/ErrorHandlingPlugin'
import { buildIntermediateService } from './IntermediateService/IntermediateServiceBuilder'

type IChalupa = {
	_plugins: IPlugin[]
	globalUse(plugin: IPlugin | IPlugin[]): void
	builder(): IChalupaBuilder
}

/**
 * The entrypoint of the framework. Use this object to construct
 * some representation of your service.
 */
export const Chalupa: IChalupa = {
	_plugins: [],
	globalUse(plugin: IPlugin | IPlugin[]): void {
		if (Array.isArray(plugin)) {
			this._plugins.push(...plugin)
		} else {
			this._plugins.push(plugin)
		}
	},
	builder(): IChalupaBuilder {
		return new ChalupaBuilder().use(this._plugins)
	},
}

export interface IChalupaBuilder {
	use(plugin: IPlugin | IPlugin[]): IChalupaBuilder

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

	constructor() {
		this.plugins = [new ExternalServicePlugin(), new ErrorHandlingPlugin()]
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
		const intermediateService = await buildIntermediateService(serviceEntrypoint, this.plugins)
		const builderInstance = new builder()
		return builderInstance.build(intermediateService)
	}
}
