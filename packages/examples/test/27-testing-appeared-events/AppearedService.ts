import {
	Service,
	ILogger,
	LoggerFactory,
	ServiceAppeared,
	ServiceDisappeared
} from '@chalupajs/interface'
import {PinoLogProvider} from '@chalupajs/logger-pino'
import {Chalupa, InMemoryStrategy, LogProvider} from "@chalupajs/service";

@Service()
export class AppearedService {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(AppearedService)
	}

	@ServiceAppeared()
	async onServiceAppeared(name: string) {
		this.logger.info("Service appeared", name)
	}

	@ServiceDisappeared()
	async onServiceDisappeared(name: string) {
		this.logger.info("Service disappeared", name)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(AppearedService, InMemoryStrategy)
	await service.start()
}

if (require.main === module) {
	start().catch(console.error)
}
