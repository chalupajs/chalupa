import "reflect-metadata"

import { ILogger, LoggerFactory, PostInit, Service } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

@Service()
class MyFirstService {
	private readonly logger: ILogger

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
