import { ErrorHandler, Service, ServiceMethod } from '@chalupajs/interface'

class UnknownPizzaFlavorError extends Error {
	constructor(readonly flavor: string) {
		super(`Unknown flavor: ${flavor}`)
	}
}

@Service()
export class PizzaService {
	@ServiceMethod()
  	async orderPizza(flavor: string): Promise<string> {
    	this.guardPizzaFlavor(flavor)

    	return 'enjoy your pizza!'
  	}

	@ErrorHandler(UnknownPizzaFlavorError)
	// @ts-ignore
	private async onUnknownPizzaFlavor(error: UnknownPizzaFlavorError): Promise<String> {
		return error.message
	}

	private guardPizzaFlavor(flavor: string) {
		if (!['margherita', 'hawaii'].includes(flavor)) {
			throw new UnknownPizzaFlavorError(flavor)
		}
	}
}
