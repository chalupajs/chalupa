/*
 * 05. Environment-dependent Configuration File
 *
 * 
 * We have two configuration files, prod.json and staging.json. Our application will
 * load the appropriate one based on the value of the NODE_ENV environment variable.
 * 
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

		logger.info(`Baking time is ${config.bakingTime}`)
	}
}

async function start() {
    // If NODE_ENV is set, then we use its value to load the appropriate
	// configuration file. If it's unset, though, then we default to
	// the production configuration.
	const configurationFilename = `${process.env['NODE_ENV'] || 'prod'}.yml`
	const configurationFiles = [path.join(__dirname, configurationFilename)]

	const service = await Chalupa
		.builder()
		.use(ConfigSources.from(configurationFiles))
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
