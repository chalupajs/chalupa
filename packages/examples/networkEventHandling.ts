import {
	ILogger,
	Inject,
	LoggerFactory,
	NetworkEvent,
	Catamaran,
	Service,
	DarconBuilderStrategy,
} from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@Service({
	logProvider: PinoLogProvider
})
class TestService {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@NetworkEvent()
	entityAppeared() {
		this._logger.info('EntityAppeared')
	}

	@NetworkEvent()
	entityLinked() {
		this._logger.info('EntityLinked')
	}

	@NetworkEvent()
	entityDisappeared() {
		this._logger.info('EntityDisappeared')
	}

	@NetworkEvent()
	entityUpdated() {
		this._logger.info('EntityUpdated')
	}
}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
