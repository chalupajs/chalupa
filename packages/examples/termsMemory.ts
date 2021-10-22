import { Catamaran, InMemoryStrategy } from '@catamaranjs/service'
import {
	ExternalService,
	ExternalServiceEvent,
	ExternalServiceMethod,
	ExternalServiceTemplate,
	IExternalServiceCall,
	IExternalServiceEmit,
	ILogger, Inject,
	LoggerFactory, PostInit,
	Service, ServiceEvent,
	serviceEventPlaceholder, ServiceMethod,
	serviceMethodPlaceholder, TermsObject
} from '@catamaranjs/interface'

@ExternalService({
	name: 'TestIniterService'
})
class TestIniterExternalService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	lol: (what: string) => IExternalServiceCall<string> = serviceMethodPlaceholder

	@ExternalServiceEvent()
	amlTrigger: (what: string) => IExternalServiceEmit<string> = serviceEventPlaceholder
}

@Service({
	inject: [TestIniterExternalService],
})
class TestService {
	private readonly _logger: ILogger
	private readonly _test: TestIniterExternalService

	constructor(
		@Inject(LoggerFactory) loggerFactory: LoggerFactory,
		@Inject(TestIniterExternalService) test: TestIniterExternalService
	) {
		this._logger = loggerFactory.getLogger(TestService)
		this._test = test
	}

	@PostInit()
	async init() {
		this._logger.info('Init called')

		await this._test.request<string>('lol', ['World'], { asdkek: 1 })
		await this._test.lol('World').withTerms({ asdkek: 123 }).send()

		// EMIT
		this._test.emit('amlTrigger', ['Violation'], { user: 1 })
		await this._test.amlTrigger('Violation').withTerms({ user: 1 }).send()
	}
}


@Service()
class TestIniterService {
	private readonly _logger: ILogger

	constructor(
		@Inject(LoggerFactory) loggerFactory: LoggerFactory,
	) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@ServiceMethod()
	lol(what: string, @TermsObject() terms: Record<string, any>) {
		this._logger.info(what)
		console.log('.....')
		console.log(terms)
		console.log('.....')
		return `Hello ${what}`
	}

	@ServiceEvent()
	amlTrigger(reason: string) {
		this._logger.info(reason)
	}

}

async function start() {
	const service = await Catamaran
		.builder()
		.createServiceWithStrategy(TestService, InMemoryStrategy)
	const testService = await Catamaran
		.builder()
		.createServiceWithStrategy(TestIniterService, InMemoryStrategy)
	await Promise.all([service.start(), testService.start()])

}

start().catch(console.error)
