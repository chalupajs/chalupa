import { ILogger, LoggerFactory, PostInit, Service, ExternalService, ExternalServiceTemplate } from '@chalupajs/interface'

@ExternalService({
    name: 'PizzaService'
})
class PizzaExternalService extends ExternalServiceTemplate {}

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
        const orders = await this.pizzaService.request('getNumberOfOrdersSince', [420])

        this.logger.info(`Order count ${orders}`)
    }
}
