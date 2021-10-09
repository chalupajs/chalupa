import {
	ILogger,
	Inject,
	LoggerFactory,
	PostInit,
	Catamaran,
	Service,
	DarconBuilderStrategy,
	ServiceEvent,
} from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@Service({
	name: 'Proclaimer',
	dependsOn: ['Listener'],
	logProvider: PinoLogProvider
})
class ProclaimerService {
	private readonly darcon: any

	private readonly _logger: ILogger

	constructor(@Inject('darcon') darcon: any, loggerFactory: LoggerFactory) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.darcon = darcon
		this._logger = loggerFactory.getLogger(ProclaimerService)
	}

	@PostInit()
	async init() {
		this._logger.info('Proclaimer service inited successfully!')
		this._logger.info('Sending proclaim trough darcon')
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
		await this.darcon.proclaim('Proclaimer', 'KEK')
	}
}

@Service({
	name: 'Listener',
	logProvider: PinoLogProvider
})
class ListenerService {
	private readonly _logger: ILogger
	constructor(loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(ListenerService)
	}

	@ServiceEvent({
		name: 'KEK',
	})
	kekovics(...parameters: any[]) {
		this._logger.info('Kekovics')
		console.log(parameters)
	}
}

async function start() {
	const proclaimer = await Catamaran.createServiceWithStrategy(ProclaimerService, DarconBuilderStrategy)
	const listener = await Catamaran.createServiceWithStrategy(ListenerService, DarconBuilderStrategy)
	await listener.start()
	await proclaimer.start()
}

start().catch(console.error)
