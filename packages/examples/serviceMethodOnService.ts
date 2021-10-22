import {
	Catamaran, LogProvider,
} from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'
import {ILogger, Inject, LoggerFactory, Service, ServiceEvent, ServiceMethod} from "@catamaranjs/interface";
import {DarconBuilderStrategy} from "@catamaranjs/communication-darcon";

@Service()
class TestService {
	private readonly _logger: ILogger

	constructor(@Inject(LoggerFactory) loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(TestService)
	}

	@ServiceMethod({
		name: 'meow',
	})
	asd(what: string) {
		this._logger.info(what)
		return 'OK'
	}

	@ServiceEvent()
	randomShitHappens(what: string) {
		this._logger.info(`RandomShit: ${what}`)
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
