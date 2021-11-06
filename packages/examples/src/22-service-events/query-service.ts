import { ILogger, LoggerFactory, PostInit, Service, ExternalService, ExternalServiceTemplate, ExternalServiceEvent, serviceEventPlaceholder, IExternalServiceEmit } from '@chalupajs/interface'
import { Order } from './pizza-service'

@ExternalService({
    name: 'PizzaService'
})
class PizzaExternalService extends ExternalServiceTemplate {
    @ExternalServiceEvent()
    orderReceived: (order: Order) => IExternalServiceEmit = serviceEventPlaceholder
}

@Service({
    inject: [PizzaExternalService]  
})
export class QueryService {
    private readonly logger: ILogger
    private readonly pizzaService: PizzaExternalService

	constructor(loggerFactory: LoggerFactory, pizzaService: PizzaExternalService) {
		this.logger = loggerFactory.getLogger(QueryService)
        this.pizzaService = pizzaService
	}

    @PostInit()
    async postInit() {
        const order = {
            customer: 'Bob',
            flavor: 'Hawaii'
        }

        await this.pizzaService.emit('orderReceived', [order])
        await this.pizzaService.orderReceived(order).send()

        this.logger.info(`Order received events sent`)
    }
}
