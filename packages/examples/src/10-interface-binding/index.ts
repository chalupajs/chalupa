/*
 * 10. Interface Binding
 *
 * 
 * In most cases, we want to depend on interfaces and not concrete implementations.
 * Chalupa supports this principle by allowing you to bind implementations in the context
 * and then inject them based on the interface they implement.
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * @Injectable, @Inject.
 *   * bindInterface.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Injectable, Inject } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

// This is the interface that we will make use of. Interfaces do not
// need to be decorated, you can just use them as they are.
interface IPizzaRepository {}

// The actual implementation we want to inject. Because we want to
// inject this class, we need to use the @Injectable decorator.
@Injectable()
class MongoPizzaRepository implements IPizzaRepository {}

// Since interfaces have no runtime representation in TypeScript, we have to
// use a so-called type key to tell Chalupa the type we want to bind and then
// inject.
// Although, we could use plain literal strings, it is best to use named constants
// to prevent typos.
const Types = {
    IPizzaRepository: 'IPizzaRepository'
}

@Service({
    // As we're dealing with an interface and a corresponding implementation,
    // now we use the bindInterface() method. This expects the type key
    // (identifying the interface) and the actual class that we're binding to
    // this key.
    // In this case, you can only use the function form of inject, the array shorthand
    // is not available. 
    inject(context) {
        context.bindInterface(Types.IPizzaRepository, MongoPizzaRepository)
    }
})
class PizzaService {
    // While in the case of concrete classes, we can just use ordinary constructor
    // parameters (thanks to the runtime type information provided by TypeScript),
    // for interface bindings we cannot do so.
    // As you can see, we have to use the @Inject decorator, parameterized with the
    // same type key we supplied to the bindInterface() call. That's how me make the
    // connection between the binding and this parameter (the dependency site). Then,
    // we can freely use the interface as the type of the parameter. 
	constructor(loggerFactory: LoggerFactory, @Inject(Types.IPizzaRepository) pizzas: IPizzaRepository) {
		const logger = loggerFactory.getLogger(PizzaService)

        logger.info(`Pizzas: ${pizzas}`)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
