import {
	Catamaran,
	InMemoryStrategy, LogProvider
} from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'
import {
	ExternalService,
	ExternalServiceEvent,
	ExternalServiceMethod,
	ExternalServiceTemplate,
	IExternalServiceCall,
	IExternalServiceEmit,
	ILogger, Inject,
	LoggerFactory, PostInit, PreDestroy,
	Service, ServiceEvent,
	serviceEventPlaceholder, ServiceMethod,
	serviceMethodPlaceholder
} from "@catamaranjs/interface";

@ExternalService()
class TestIniterService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	lol: (what: string) => IExternalServiceCall<string> = serviceMethodPlaceholder

	@ExternalServiceEvent()
	amlTrigger: (what: string) => IExternalServiceEmit<string> = serviceEventPlaceholder
}

@Service({
	inject: [TestIniterService]
})
class TestService {
	private readonly _logger: ILogger
	private readonly _test: TestIniterService

	constructor(
		@Inject(LoggerFactory) loggerFactory: LoggerFactory,
		@Inject(TestIniterService) test: TestIniterService
	) {
		this._logger = loggerFactory.getLogger(TestService)
		this._test = test
	}

	@PostInit()
	async init() {
		this._logger.info('Init called')
		// Const services = await this._test.request<string>('lol', ['World'], { asdkek: 1 })
		const services = await this._test.lol('World').send()
		console.log(services)

		// EMIT
		await this._test.amlTrigger('Violation').withTerms({ user: 1 }).send()
	}

	@PreDestroy()
	destroy() {
		this._logger.info('Destorying TestService')
	}
}

@Service({
	name: 'TestIniterService'
})
class AnotherService {
	private readonly _logger: ILogger

	constructor(
		@Inject(LoggerFactory) loggerFactory: LoggerFactory
	) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@ServiceEvent()
	amlTrigger(what: string) {
		this._logger.error(what)
		console.log(what)
	}

	@ServiceMethod()
	lol(text: string) {
		return `Heelo ${text}`
	}

	@PreDestroy()
	destroy() {
		this._logger.info('Destorying initerService')
	}

}

async function start() {
	const anotherService = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(AnotherService, InMemoryStrategy)

	const service = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(TestService, InMemoryStrategy)

	await Promise.all([
		service.start(),
		anotherService.start()
	])
}

start().catch(console.error)
