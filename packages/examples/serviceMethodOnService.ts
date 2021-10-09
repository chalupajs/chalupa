import {
	ILogger,
	Inject,
	LoggerFactory,
	Catamaran,
	Service,
	DarconBuilderStrategy,
	ServiceEvent,
	ServiceMethod,
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
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
