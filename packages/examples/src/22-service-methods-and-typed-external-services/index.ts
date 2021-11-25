/*
 * 22. Service Methods and Typed External Services
 *
 * 
 * Topic: Service Communication
 */
import 'reflect-metadata'

import { Chalupa, InMemoryStrategy } from '@chalupajs/service'
import { PizzaService } from './pizza-service'
import { QueryService } from './query-service'

async function start() {
	const pizzaService = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

    const queryService = await Chalupa
		.builder()
		.createServiceWithStrategy(QueryService, InMemoryStrategy)

	await Promise.all([pizzaService.start(), queryService.start()])
}

start().catch(console.error)
