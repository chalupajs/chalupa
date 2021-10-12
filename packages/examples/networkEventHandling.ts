import {
	Catamaran,
	InMemoryStrategy
} from '@catamaranjs/service'
import {
	Service,
	ILogger,
	Inject,
	LoggerFactory,
	NetworkEvent,
} from '@catamaranjs/interface'

@Service()
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
	entityDisappeared() {
		this._logger.info('EntityDisappeared')
	}

	@NetworkEvent()
	entityUpdated() {
		this._logger.info('EntityUpdated')
	}
}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, InMemoryStrategy)
	await service.start()
}

start().catch(console.error)
