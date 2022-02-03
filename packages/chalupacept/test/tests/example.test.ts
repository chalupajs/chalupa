// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PizzaExternalService } from '../services/chalupaServices/Pizza.service'

Feature('@first Example test')

Scenario('Pizza service should return with pong when ping is called', async ({ I }) => {
	// @ts-ignore
	const pizzaService = await I.getExternalService(PizzaExternalService)
	console.log(await pizzaService.ping().send())
})
