import {
	Catamaran,
	Service,
	DarconBuilderStrategy,
	ILogger,
	LoggerFactory,
	Inject,
	PostInit,
	ServiceMethod,
	Module,
	PreDestroy,
	PreServiceInit,
	PostServiceDestroy,
	Injectable,
} from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@Injectable()
class SubclassOne {}
@Injectable()
class SubclassTwo {}
@Injectable()
class ASD {}

@Module({
	inject: [SubclassOne, SubclassTwo, ASD],
})
class ExampleModule {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(ExampleModule)
	}

	@ServiceMethod()
	moduleServiceMethod(that: string) {
		console.log('ModuleService method called with:', that)
		return 'Hello from module service method'
	}

	@PreServiceInit()
	init() {
		this._logger.info('ExampleModule init called')
	}

	@PostServiceDestroy()
	destroy() {
		this._logger.info('ExampleModule destroy called')
	}
}

@Service({
	modules: [ExampleModule],
	logProvider: PinoLogProvider
})
class TestService {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@PostInit()
	async init() {
		this._logger.info('Service Init called')
	}

	@PreDestroy()
	async destroy() {
		this._logger.info('Service destroy called')
	}

	@ServiceMethod()
	async rootMethod() {
		console.log('Root method called')
		return 'Hello from rootMethod!'
	}
}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
