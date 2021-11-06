/*
 * 03. Env Prefix Configuration
 *
 * 
 * We attach a service-specific prefix to the environment variable names
 * of the configuration properties.
 * 
 * Showcased features:
 *   * @Configuration and @Configurable.
 *   * Using the EnvPrefix plugin.
 */
import 'reflect-metadata'

import {Configurable, Configuration, LoggerFactory, Service} from '@chalupajs/interface'
import {Chalupa, EnvPrefix, InMemoryStrategy} from '@chalupajs/service'

@Configuration()
class PizzaConfig {
	// By default, the environment variable corresponding
	// to this property is named
	//
	//   PIZZA_DATA_DIRECTORY
	@Configurable({
		doc: 'The data directory to save files into.',
		format: String,
	})
	dataDirectory = '/data/pizza'
}

@Service({
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
		// We can attach plugins to services prior to their
		// creation via the use() method.
		//
		// Here we use the EnvPrefix plugin, which prepends
		// the specified prefix to the every configuration
		// environment variable.
		// Thus, PIZZA_DATA_DIRECTORY becomes
		// 
		//   PEPPERONI_PIZZA_DATA_DIRECTORY
		//
		// Observe, that you only need to specifiy PEPPERONI
		// and not PEPPERONI_.
		.use(EnvPrefix.from('PEPPERONI'))
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
