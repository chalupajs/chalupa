import { ILogger, LoggerFactory, PostInit, Service, ExternalService, ExternalServiceTemplate, ExternalServiceMethod, IExternalServiceCall } from '@chalupajs/interface'

@ExternalService({
    name: 'PizzaService'
})
class PizzaExternalService extends ExternalServiceTemplate {
    @ExternalServiceMethod()
    declare orderPizza: (flavor: string) => IExternalServiceCall<string>
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
        this.logger.info('Ordering flavor hawaii')
        this.logger.info(await this.pizzaService.orderPizza('hawaii').send())

        this.logger.info('Ordering flavor mexican')
        this.logger.info(await this.pizzaService.orderPizza('mexican').send())
    }
}
