import { Constructor, IBuilderStrategy } from '@catamaranjs/interface'
import { IPlugin } from '../Plugin/IPlugin'
import { buildIntermediateService } from './IntermediateService/IntermediateServiceBuilder'

/**
 * The entrypoint of the framework. Use this object to construct
 * some representation of your service.
 */
export class Catamaran {
	static plugins: IPlugin[] = []

	static use(plugin: IPlugin): Catamaran {
		this.plugins.push(plugin)
		
		return Catamaran
	}

	/**
	 * Loads, wires up and creates some representation of specified
	 * service entrypoint (which is a classed, decorated with the `Service` decorator).
	 * The produced representation depends on the used builder strategy, giving flexibility
	 * to this function to create, for example, testing-focused output and alike.
	 * @param serviceEntrypoint A `Service` decorated class.
	 * @param builder A strategy that determines what is created from the passed structure.
	 */
	static async createServiceWithStrategy<T>(
		serviceEntrypoint: Constructor,
		builder: Constructor<IBuilderStrategy<T>>
	): Promise<T> {
		const intermediateService = buildIntermediateService(serviceEntrypoint, this.plugins)
		const builderInstance = new builder()
		return builderInstance.build(intermediateService)
	}
}
