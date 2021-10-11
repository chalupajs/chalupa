import { Catamaran } from '@catamaranjs/service'
import { DarconBuilderStrategy } from '@catamaranjs/communication-darcon'
import { ILogger, LoggerFactory, PostInit, Service } from '@catamaranjs/interface'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@Service({
	logProvider: PinoLogProvider
})
class TestIniterService {}

@Service({
	dependsOn: ['TestIniterService'],
	logProvider: PinoLogProvider
})
class TestService {
	logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(TestService.name);
	}

	@PostInit()
	Init() {
		this.logger.info('test service init jeee')
	}
}

async function start() {
	const initer = await Catamaran.createServiceWithStrategy(TestIniterService, DarconBuilderStrategy)
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await Promise.all([
		initer.start(),
		service.start()
	])
}

start().catch(console.error)
