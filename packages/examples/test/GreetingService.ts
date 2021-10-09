import {
	Catamaran,
	DarconBuilderStrategy,
} from '@catamaranjs/service'
import {Service,
	ExternalServiceTemplate,
	serviceMethodPlaceholder,
	ExternalService,
	ExternalServiceMethod,
	ILogger,
	LoggerFactory,
	Inject,
	IExternalServiceCall} from '@catamaranjs/interface'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@ExternalService()
export class DateTimeService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	hours: () => IExternalServiceCall<number> = serviceMethodPlaceholder
}

@Service({
	externalServices: [DateTimeService],
	logProvider: PinoLogProvider
})
export class GreetingService {
	private readonly logger: ILogger
	private readonly dateTime: DateTimeService

	constructor(
		@Inject(LoggerFactory) loggerFactory: LoggerFactory,
		@Inject(DateTimeService) dateTime: DateTimeService
	) {
		this.logger = loggerFactory.getLogger(GreetingService)
		this.dateTime = dateTime
	}

	async greet(who: string): Promise<string> {
		this.logger.info('Greeting requested.', who)

		const hours = await this.dateTime.hours().send()

		return hours < 12 ? `Good morning, ${who}!` : `Good evening, ${who}!`
	}
}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(GreetingService, DarconBuilderStrategy)
	await service.start()
}

if (require.main === module) {
	start().catch(console.error)
}
