import {
	Service,
	ExternalServiceTemplate,
	serviceMethodPlaceholder,
	ExternalService,
	ExternalServiceMethod,
	ILogger,
	LoggerFactory,
	IExternalServiceCall, ServiceMethod
} from '@chalupajs/interface'
import {PinoLogProvider} from '@chalupajs/logger-pino'
import {Chalupa, InMemoryStrategy, LogProvider} from "@chalupajs/service";

@ExternalService()
export class DateTimeService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	hours: () => IExternalServiceCall<number> = serviceMethodPlaceholder
}

@Service({
	inject: [DateTimeService],
})
export class GreetingService {
	private readonly logger: ILogger
	private readonly dateTime: DateTimeService

	constructor(
		loggerFactory: LoggerFactory,
		dateTime: DateTimeService
	) {
		this.logger = loggerFactory.getLogger(GreetingService)
		this.dateTime = dateTime
	}

	@ServiceMethod()
	async greet(who: string): Promise<string> {
		this.logger.info('Greeting requested.', who)

		const hours = await this.dateTime.hours().send()

		return hours < 12 ? `Good morning, ${who}!` : `Good evening, ${who}!`
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(GreetingService, InMemoryStrategy)
	await service.start()
}

if (require.main === module) {
	start().catch(console.error)
}
