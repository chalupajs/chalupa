/*
 * 07. Using Multiple Plugins
 *
 *
 * In the previous example, we used one plugin at a time. In this example,
 * we attach LogProvider and ConfigSources to the same service by multiple
 * use() calls.
 *
 * Topic: Plugins
 * Showcased features:
 *   * .use(plugin) and .use([plugins])
 */
import 'reflect-metadata'

import path from 'path'

import { ILogger, LoggerFactory, Service, Configuration, Configurable } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy, ConfigSources } from '@chalupajs/service'
import { TSLogProvider } from '@chalupajs/logger-tslog'

@Configuration()
class ExampleConfig {
    @Configurable({
        doc: 'A greeting message.',
        format: String
    })
    message = 'Hello!'
}

@Service({
    inject: [ExampleConfig]
})
class UsingMultiplePluginsService {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory, exampleConfig: ExampleConfig) {
		this.logger = loggerFactory.getLogger(UsingMultiplePluginsService)
        this.logger.info(exampleConfig.message)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
        // You can chain multiple use() calls to attach multiple
        // plugins to the same service.
        //
        // This is equivalent to the following array notation:
        //
        //   .use([
        //     ConfigSources.from([path.join(__dirname, 'config.json')]),
        //     LogProvider.provider(TSLogProvider)
        //   ])
        .logProvider(TSLogProvider)
        .use(ConfigSources.from([path.join(__dirname, 'config.json')]))
		.createServiceWithStrategy(UsingMultiplePluginsService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
