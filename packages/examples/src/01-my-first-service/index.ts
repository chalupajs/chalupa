/*
 * 01. My First Service
 *
 * 
 * In this example, we create a new service (that can execute on its own)
 * and attach it to an in-memory event bus.
 * 
 * Once the service is ready to operate, it logs a message to the console.
 * 
 * Showcased features:
 *   * Chalupa logging.
 *   * Injecting dependencies.
 *   * @PostInit.
 *   * Instantiating and starting services.
 */
import 'reflect-metadata'

import { ILogger, LoggerFactory, PostInit, Service } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

@Service()
class MyFirstService {
	private readonly logger: ILogger

	// This is equivalent to
	//
	//   @Inject(LoggerFactory) loggerFactory: LoggerFactory
	//
	// However, since LoggerFactory is a concrete class, you
	// can omit the @Inject decorator.
	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(MyFirstService)
	}

	@PostInit()
	async postInit() {
		this.logger.info('My First Service Post Init!')
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(MyFirstService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
