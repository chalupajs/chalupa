import { ErrorHandler, Service, ServiceMethod } from '@chalupajs/interface'

class UnknownPizzaFlavorError extends Error {
	constructor(readonly flavor: string) {
		super(`Unknown flavor: ${flavor}`)
	}
}

class OutOfPineappleError extends Error {
	constructor() {
		super('We are out of pineapple, unfortunately :(')
	}
}

@Service()
export class PizzaService {
	@ServiceMethod()
  	async orderPizza(flavor: string): Promise<string> {
    	this.guardPizzaFlavor(flavor)

		if (flavor === 'hawaii') {
			throw new OutOfPineappleError()
		}

    	return 'enjoy your pizza!'
  	}

	@ErrorHandler(UnknownPizzaFlavorError)
	// @ts-ignore
	private async onUnknownPizzaFlavor(error: UnknownPizzaFlavorError): Promise<String> {
		return error.message
	}

	@ErrorHandler(Error)
	// @ts-ignore
	private async onError(error: Error): Promise<string> {
		return `Ooops, an unknown error occurred: ${error}`
	}

	private guardPizzaFlavor(flavor: string) {
		if (!['margherita', 'hawaii'].includes(flavor)) {
			throw new UnknownPizzaFlavorError(flavor)
		}
	}
}
