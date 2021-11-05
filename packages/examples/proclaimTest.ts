import {
	Catamaran, LogProvider,
} from '@chalupajs/service'
import {PinoLogProvider} from '@chalupajs/logger-pino'
import {ILogger, Inject, LoggerFactory, PostInit, Service, ServiceEvent} from "@chalupajs/interface";
import {DarconBuilderStrategy} from "@chalupajs/communication-darcon";

@Service({
	name: 'Proclaimer',
	dependsOn: ['Listener'],
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
	const proclaimer = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(ProclaimerService, DarconBuilderStrategy)
	const listener = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(ListenerService, DarconBuilderStrategy)
	await listener.start()
	await proclaimer.start()
}

start().catch(console.error)
