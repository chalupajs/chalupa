import { ILogger, LoggerFactory, Service, ServiceMethod, TermsObject } from '@chalupajs/interface'

interface NumberOfOrderSinceTerms {
	kek?: string
}

@Service()
export class PizzaService {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(PizzaService)
	}

	@ServiceMethod()
    async getNumberOfOrdersSince(since: number, @TermsObject() _terms: NumberOfOrderSinceTerms): Promise<number> { // NOTE: TermsObject is a Record<string, any>, but you can change it to anything.
        this.logger.info(`Getting the number of orders since ${since}`)
		this.logger.info(`Terms object contains the following:`)
		this.logger.info(`${JSON.stringify(_terms, null, 4)}`)
        return 69
    }
}
