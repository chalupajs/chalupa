import { ILogger, LoggerFactory, PostInit, Service, ExternalService, ExternalServiceTemplate, ExternalServiceMethod, serviceMethodPlaceholder, IExternalServiceCall } from '@chalupajs/interface'

@ExternalService({
    name: 'PizzaService'
})
class PizzaExternalService extends ExternalServiceTemplate {
    @ExternalServiceMethod()
    getNumberOfOrdersSince: (since: number) => IExternalServiceCall<number> = serviceMethodPlaceholder
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
        const orders = await this.pizzaService.getNumberOfOrdersSince(420).send()

        this.logger.info(`Order count ${orders}`)
    }
}
