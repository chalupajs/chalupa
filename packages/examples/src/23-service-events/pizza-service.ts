import { ILogger, LoggerFactory, Service, ServiceEvent } from '@chalupajs/interface'

export interface Order {
	customer: string
	flavor: string
}

@Service()
export class PizzaService {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(PizzaService)
	}

	@ServiceEvent()
    async orderReceived(order: Order) {
        this.logger.info('Received a new pizza order', order)
    }
}
