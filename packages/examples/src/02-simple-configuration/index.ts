/*
 * 02. Simple Configuration
 *
 * 
 * We create a new configuration class, PizzaConfig, and then inject it
 * into a newly created service.
 * 
 * Once the service is instantiated, it logs a configuration property to
 * the console.
 * 
 * Showcased features:
 *   * @Configuration and @Configurable.
 *   * The inject array of @Service.
 *   * Injecting dependencies.
 *   * Instantiating and starting services.
 */
import 'reflect-metadata'

import {Configurable, Configuration, LoggerFactory, Service} from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

@Configuration()
class PizzaConfig {
	// The default value of this configuration property is
	// `/data/pizza`. You can override this value by setting the
	//
	//   PIZZA_DATA_DIRECTORY
	//
	// environment variable. The name of this variable is computed
	// from the class name and the property name.
	@Configurable({
		doc: 'The data directory to save files into.',
		format: String,
	})
	dataDirectory = '/data/pizza'
}

@Service({
	// Telling Chalupa to manage and instantiate
	// the PizzaConfig class in its dependency injection context.
	// The array notation below is equivalent to
	//
	//   inject(context) {
	//	   context.bindClass(PizzaConfig)
	//   }
	inject: [PizzaConfig]
})
class PizzaService {
	constructor(loggerFactory: LoggerFactory, config: PizzaConfig) {
		const logger = loggerFactory.getLogger(PizzaService)

		logger.info(config.dataDirectory)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
