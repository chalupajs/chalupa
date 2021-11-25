import { ILogger, LoggerFactory, Service, ServiceMethod } from '@chalupajs/interface'

@Service()
export class PizzaService {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(PizzaService)
	}

	@ServiceMethod()
    async getNumberOfOrdersSince(since: number): Promise<number> {
        this.logger.info(`Getting the number of orders since ${since}`)

        return 69
    }
}
