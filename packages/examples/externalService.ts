import {
	Catamaran, LogProvider,
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
	LoggerFactory, PostInit,
	Service,
	serviceEventPlaceholder,
	serviceMethodPlaceholder
} from "@catamaranjs/interface";
import { DarconBuilderStrategy } from "@catamaranjs/communication-darcon";

@ExternalService()
class TestIniterService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	lol: (what: string) => IExternalServiceCall<string> = serviceMethodPlaceholder

	@ExternalServiceEvent()
	amlTrigger: (what: string) => IExternalServiceEmit<string> = serviceEventPlaceholder
}

@Service({
	externalServices: [TestIniterService],
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
	const service = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
