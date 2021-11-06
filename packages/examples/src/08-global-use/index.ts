/*
 * 08. Global Use
 *
 * 
 * With the help of Chalupa.globalUse(), we create two services in the
 * same process, that read their configuration values from the same file,
 * config.json.
 * 
 * Topic: Plugins
 * Showcased features:
 *   * .globalUse(plugin) and .globalUse([plugins])
 *   * Creating multiple services in the same process.
 */
import 'reflect-metadata'

import path from 'path'

import { ILogger, LoggerFactory, Service, Configuration, Configurable } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy, ConfigSources } from '@chalupajs/service'

@Configuration()
class ServiceAConfig {
    @Configurable({
        doc: 'A greeting message.',
        format: String
    })
    message = 'Hello!'
}

@Service({
    inject: [ServiceAConfig]
})
class ServiceA {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory, exampleConfig: ServiceAConfig) {
		this.logger = loggerFactory.getLogger(ServiceA)
        this.logger.info(exampleConfig.message)
	}
}

@Configuration()
class ServiceBConfig {
    @Configurable({
        doc: 'A greeting message.',
        format: String
    })
    message = 'Hello!'
}

@Service({
    inject: [ServiceBConfig]
})
class ServiceB {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory, exampleConfig: ServiceBConfig) {
		this.logger = loggerFactory.getLogger(ServiceB)
        this.logger.info(exampleConfig.message)
	}
}

async function start() {
    // The globalUse() method allows you to specify plugins that will
    // be attached to all subsequently created services.
    // Be aware, however, that theese plugin instances will be shared among the
    // created services: thus, it's up to the plugins to isolate and manage
    // per-service state correctly.
    // 
    // The below call is equivalent to the following array form:
    //
    //   Chalupa.globalUse([
    //     ConfigSources.from([path.join(__dirname, 'config.json')])
    //   ])
    Chalupa.globalUse(ConfigSources.from([path.join(__dirname, 'config.json')]))

    // Both serviceA and serviceB will make use of the same
    // ConfigSources plugin instance.
	const serviceA = await Chalupa
		.builder()
		.createServiceWithStrategy(ServiceA, InMemoryStrategy)
    const serviceB = await Chalupa
		.builder()
		.createServiceWithStrategy(ServiceB, InMemoryStrategy)

    // We can start and wait for both services in the same process
    // using Promise.all().
	await Promise.all([serviceA.start(), serviceB.start()])
}

start().catch(console.error)
