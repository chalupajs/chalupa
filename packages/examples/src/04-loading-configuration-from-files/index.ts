/*
 * 04. Loading Configuration from Files
 *
 * 
 * We have two configuration files, config.json and config.yml. By using the
 * ConfigSources plugin, we populate the properties of the PizzaConfig class with
 * the values stored in those files.  
 * 
 * Topic: Configuration
 * Showcased features:
 *   * @Configuration and @Configurable.
 *   * Using the ConfigSources plugin.
 */
import 'reflect-metadata'

import path from 'path';

import {Configurable, Configuration, LoggerFactory, Service} from '@chalupajs/interface'
import {Chalupa, ConfigSources, InMemoryStrategy} from '@chalupajs/service'

@Configuration()
class PizzaConfig {
	// In JSON, you can set this property like this:
	//
	//   {
	//     "pizza": {
	//       "dataDirectory": "/data/pizza"	
	//     }
	//   }
	//
	// In YAML, you can use the following snippet:
	//
	//   pizza:
	//     dataDirectory: /data/pizza
	//
	// In both cases, the path is computed from
	// the class name and the property name.
	@Configurable({
		doc: 'The data directory to save files into.',
		format: String,
	})
	dataDirectory = '/data/pizza'

	@Configurable({
		doc: 'The time it takes to bake a pizza.',
		format: 'nat'
	})
	bakingTime = 180
}

@Service({
	inject: [PizzaConfig]
})
class PizzaService {
	constructor(loggerFactory: LoggerFactory, config: PizzaConfig) {
		const logger = loggerFactory.getLogger(PizzaService)

		logger.info(config.dataDirectory)
		logger.info(`Baking time is ${config.bakingTime}`)
	}
}

async function start() {
	// Configuration files are loaded in the order they appear in
	// the array passed to the ConfigSources.from() call.
	// Therefore, if the same property, for example pizza.bakingTime is
	// specified in both config.json and config.yml, then the value in
	// config.yml "wins".
	const configurationFiles = [
		path.join(__dirname, 'config.json'),
		path.join(__dirname, 'config.yml')
	]

	const service = await Chalupa
		.builder()
		.use(ConfigSources.from(configurationFiles))
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
