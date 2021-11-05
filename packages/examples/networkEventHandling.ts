import {
	Catamaran,
	InMemoryStrategy, LogProvider
} from '@chalupajs/service'
import {
	Service,
	ILogger,
	Inject,
	LoggerFactory,
	ServiceAppeared,
	ServiceDisappeared
} from '@chalupajs/interface'
import {PinoLogProvider} from "@chalupajs/logger-pino";

@Service()
class TestService {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@ServiceAppeared()
	serviceAppeared() {
		this._logger.info('ServiceAppeared')
	}

	@ServiceDisappeared()
	serviceDisappeared() {
		this._logger.info('ServiceDisappeared')
	}
}

async function start() {
	const service = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(TestService, InMemoryStrategy)
	await service.start()
}

start().catch(console.error)
