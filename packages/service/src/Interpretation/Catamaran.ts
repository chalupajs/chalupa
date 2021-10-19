import { Constructor, IBuilderStrategy } from '@catamaranjs/interface'
import { IPlugin } from '../Plugin/IPlugin'
import { buildIntermediateService } from './IntermediateService/IntermediateServiceBuilder'

type ICatamaran = {
	_plugins: IPlugin[],
	globalUse(plugin: IPlugin | IPlugin[]): void,
	builder(): ICatamaranBuilder
}

/**
 * The entrypoint of the framework. Use this object to construct
 * some representation of your service.
 */
export const Catamaran: ICatamaran = {
	_plugins: [],
	globalUse(plugin: IPlugin | IPlugin[]): void {
		if(Array.isArray(plugin)) {
			this._plugins.push(...plugin)
		} else {
			this._plugins.push(plugin)
		}
	},
	builder(): ICatamaranBuilder {
		return (new CatamaranBuilder()).use(this._plugins)
	},
}

export interface ICatamaranBuilder {
	use(plugin: IPlugin | IPlugin[]): ICatamaranBuilder

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

export class CatamaranBuilder implements ICatamaranBuilder {
	private readonly plugins: IPlugin[]

	constructor() {
		this.plugins = []
	}

	use(plugin: IPlugin | IPlugin[]): ICatamaranBuilder {
		if(Array.isArray(plugin)) {
			this.plugins.push(...plugin)
		} else {
			this.plugins.push(plugin)
		}

		return this
	}

	createServiceWithStrategy<T>(
		serviceEntrypoint: Constructor,
		builder: Constructor<IBuilderStrategy<T>>
	): Promise<T> {
		const intermediateService = buildIntermediateService(serviceEntrypoint, this.plugins)
		const builderInstance = new builder()
		return builderInstance.build(intermediateService)
	}
}
