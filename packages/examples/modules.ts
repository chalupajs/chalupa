import {
	Catamaran, LogProvider,
} from '@catamaranjs/service'
import {
	ILogger,
	Inject,
	Injectable,
	LoggerFactory,
	Module, PostInit, PostServiceDestroy, PreDestroy,
	PreServiceInit, Service
} from "@catamaranjs/interface";
import { DarconBuilderStrategy } from "@catamaranjs/communication-darcon";
import {PinoLogProvider} from "@catamaranjs/logger-pino";

@Injectable()
class SubclassOne {}
@Injectable()
class SubclassTwo {}
@Injectable()
class ASD {}

@Module()
class GrandChildModule {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		console.log('asd')
		this._logger = loggerFactory.getLogger(ExampleModule)
	}

	@PreServiceInit()
	init() {
		this._logger.info('GrandChild init')
	}

	@PostServiceDestroy()
	destroy() {
		this._logger.info('GrandChild destroy')
	}
}

@Module({
	inject(container) {
		container.bindModule(GrandChildModule)
	}
})
class ChildOfDynamicModule {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		console.log('asd')
		this._logger = loggerFactory.getLogger(ExampleModule)
	}

	@PreServiceInit()
	init() {
		this._logger.info('ChildOfDynamic init')
	}

	@PostServiceDestroy()
	destroy() {
		this._logger.info('ChildOfDynamic destroy')
	}
}

@Module({
	modules: [ChildOfDynamicModule]
})
class DynamicModule {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(ExampleModule)
	}

	@PreServiceInit()
	init() {
		this._logger.info('Dynamic init')
	}

	@PostServiceDestroy()
	destroy() {
		this._logger.info('Dynamic destroy')
	}
}

@Module({
	inject: [SubclassOne, SubclassTwo, ASD],
})
class ExampleModule {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(ExampleModule)
	}

	@PreServiceInit()
	init() {
		this._logger.info('Example init')
	}

	@PostServiceDestroy()
	destroy() {
		this._logger.info('Example destroy')
	}
}

@Service({
	modules: [ExampleModule],
	inject(container) {
		container.bindModule(DynamicModule)
	}
})
class TestService {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@PostInit()
	async init() {
		this._logger.info('Service init')
	}

	@PreDestroy()
	async destroy() {
		this._logger.info('Service destroy')
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
