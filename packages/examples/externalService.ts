import {
	Catamaran,
	Service,
	DarconBuilderStrategy,
	ExternalServiceTemplate,
	serviceMethodPlaceholder,
	ExternalService,
	ExternalServiceMethod,
	ILogger,
	LoggerFactory,
	Inject,
	PostInit,
	IExternalServiceCall,
	IExternalServiceEmit,
	serviceEventPlaceholder,
	ExternalServiceEvent,
} from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@ExternalService()
class TestIniterService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	lol: (what: string) => IExternalServiceCall<string> = serviceMethodPlaceholder

	@ExternalServiceEvent()
	amlTrigger: (what: string) => IExternalServiceEmit<string> = serviceEventPlaceholder
}

@Service({
	externalServices: [TestIniterService],
	logProvider: PinoLogProvider
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
		const services = await this._test.lol('World').withTerms({ asdkek: 123 }).send()
		console.log(services)

		// EMIT
		await this._test.amlTrigger('Violation').withTerms({ user: 1 }).send()
	}
}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
